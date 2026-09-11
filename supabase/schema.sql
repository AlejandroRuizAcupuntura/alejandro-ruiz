-- ============================================================
--  Agenda de citas — Alejandro Ruiz
--  Base de datos: Supabase (PostgreSQL), plan gratuito, región UE
--
--  Pega este archivo entero en: Supabase > SQL Editor > Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
--  1. CITAS
-- ============================================================
create table if not exists public.citas (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre     text not null,
  telefono   text not null,
  email      text,
  servicio   text not null,
  slot_date  date not null,
  slot_time  time not null,
  notas      text,          -- lo que escribe el paciente
  nota_admin text,          -- anotaciones privadas de Alejandro
  estado     text not null default 'pendiente'
             check (estado in ('pendiente','confirmada','cancelada')),
  origen     text not null default 'web'
             check (origen in ('web','consulta')),
  consent    boolean not null default false
);

alter table public.citas add column if not exists updated_at timestamptz not null default now();
alter table public.citas add column if not exists nota_admin text;

-- Cuándo se avisó al paciente desde la agenda (WhatsApp o email).
-- Sirve para marcar en la lista quién ya está avisado y no repetir.
alter table public.citas add column if not exists aviso_enviado_at       timestamptz;
alter table public.citas add column if not exists recordatorio_enviado_at timestamptz;

-- Una sola cita por franja (las anuladas liberan la hora)
create unique index if not exists citas_franja_unica
  on public.citas (slot_date, slot_time)
  where estado <> 'cancelada';

create index if not exists citas_fecha_idx on public.citas (slot_date);

-- ============================================================
--  2. BLOQUEOS  (vacaciones, día libre, hora ocupada por otra cosa)
--     hora NULL  = día entero bloqueado
--     hora fijada = solo esa franja
-- ============================================================
create table if not exists public.bloqueos (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha      date not null,
  hora       time,
  motivo     text
);

create unique index if not exists bloqueos_dia_unico
  on public.bloqueos (fecha) where hora is null;
create unique index if not exists bloqueos_hora_unica
  on public.bloqueos (fecha, hora) where hora is not null;

-- ============================================================
--  2.b FRANJAS VÁLIDAS
--      Qué horas se pueden pedir cada día de la semana
--      (0 = domingo, 1 = lunes … 6 = sábado).
--      DEBE COINCIDIR con "franjas" de js/config.js: si cambias
--      el horario allí, vuelve a ejecutar este archivo.
-- ============================================================
create table if not exists public.franjas (
  dow  smallint not null check (dow between 0 and 6),
  hora time     not null,
  primary key (dow, hora)
);

delete from public.franjas;
insert into public.franjas (dow, hora)
select d, h::time
from   generate_series(1,5) d,
       unnest(array['10:00','11:15','12:30','15:00','16:15','17:30','18:45']) h
union all
select 6, h::time
from   unnest(array['10:00','11:15','12:30']) h;

alter table public.franjas enable row level security;
drop policy if exists "profesional gestiona franjas" on public.franjas;
create policy "profesional gestiona franjas"
  on public.franjas for all to authenticated
  using (true) with check (true);

-- ============================================================
--  3. HISTORIAL DE CAMBIOS  ("datos de modificación")
-- ============================================================
create table if not exists public.citas_log (
  id        bigserial primary key,
  cita_id   uuid,
  cuando    timestamptz not null default now(),
  quien     uuid,          -- usuario autenticado que hizo el cambio
  accion    text not null, -- creada | modificada | borrada
  antes     jsonb,
  despues   jsonb
);

create index if not exists citas_log_cita_idx on public.citas_log (cita_id, cuando desc);

create or replace function public.citas_auditar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.citas_log (cita_id, quien, accion, despues)
    values (new.id, auth.uid(), 'creada', to_jsonb(new));
    return new;

  elsif (tg_op = 'UPDATE') then
    new.updated_at := now();
    -- solo se registra si cambia algo relevante
    -- Marcar un aviso no es un cambio de la cita: no ensucia el historial.
    if (to_jsonb(old) - 'updated_at' - 'aviso_enviado_at' - 'recordatorio_enviado_at')
       is distinct from
       (to_jsonb(new) - 'updated_at' - 'aviso_enviado_at' - 'recordatorio_enviado_at') then
      insert into public.citas_log (cita_id, quien, accion, antes, despues)
      values (new.id, auth.uid(), 'modificada', to_jsonb(old), to_jsonb(new));
    end if;
    return new;

  else
    insert into public.citas_log (cita_id, quien, accion, antes)
    values (old.id, auth.uid(), 'borrada', to_jsonb(old));
    return old;
  end if;
end;
$$;

drop trigger if exists citas_auditoria on public.citas;
create trigger citas_auditoria
  before insert or update or delete on public.citas
  for each row execute function public.citas_auditar();

-- ============================================================
--  4. SEGURIDAD A NIVEL DE FILA
--     El público NO tiene ninguna política sobre estas tablas:
--     no puede leer ni escribir directamente. Solo actúa a
--     través de las dos funciones públicas del punto 5.
-- ============================================================
alter table public.citas     enable row level security;
alter table public.bloqueos  enable row level security;
alter table public.citas_log enable row level security;

drop policy if exists "profesional gestiona citas" on public.citas;
create policy "profesional gestiona citas"
  on public.citas for all to authenticated
  using (true) with check (true);

drop policy if exists "profesional gestiona bloqueos" on public.bloqueos;
create policy "profesional gestiona bloqueos"
  on public.bloqueos for all to authenticated
  using (true) with check (true);

drop policy if exists "profesional lee historial" on public.citas_log;
create policy "profesional lee historial"
  on public.citas_log for select to authenticated
  using (true);

-- ============================================================
--  5. FUNCIONES PÚBLICAS
--     Es lo ÚNICO que puede tocar un visitante de la web.
-- ============================================================

-- 5.1 Disponibilidad de un día.
--     Devuelve si el día está cerrado y qué horas NO están libres.
--     No revela ningún dato personal: solo horas.
create or replace function public.disponibilidad(p_fecha date)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cerrado boolean;
  v_horas   json;
begin
  if p_fecha < current_date - 1 or p_fecha > current_date + interval '180 days' then
    return json_build_object('cerrado', true, 'ocupadas', '[]'::json);
  end if;

  select exists (
    select 1 from public.bloqueos b where b.fecha = p_fecha and b.hora is null
  ) into v_cerrado;

  select coalesce(json_agg(to_char(h, 'HH24:MI')), '[]'::json) into v_horas
  from (
    select c.slot_time as h from public.citas c
      where c.slot_date = p_fecha and c.estado <> 'cancelada'
    union
    select b.hora from public.bloqueos b
      where b.fecha = p_fecha and b.hora is not null
  ) t;

  return json_build_object('cerrado', v_cerrado, 'ocupadas', v_horas);
end;
$$;

-- 5.2 Solicitar cita.
create or replace function public.solicitar_cita(
  p_nombre   text,
  p_telefono text,
  p_email    text,
  p_servicio text,
  p_fecha    date,
  p_hora     time,
  p_notas    text,
  p_consent  boolean
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_pendientes int;
  v_separacion constant int := 75;   -- 60 min de sesión + 15 de descanso
begin
  if p_consent is not true then
    return json_build_object('ok', false, 'mensaje', 'Falta aceptar la política de privacidad.');
  end if;
  if coalesce(length(trim(p_nombre)),0) < 2 or coalesce(length(trim(p_telefono)),0) < 6 then
    return json_build_object('ok', false, 'mensaje', 'Nombre o teléfono no válidos.');
  end if;
  if p_fecha < current_date or p_fecha > current_date + interval '120 days' then
    return json_build_object('ok', false, 'mensaje', 'La fecha solicitada no es válida.');
  end if;
  if length(coalesce(p_notas,'')) > 500 or length(p_nombre) > 80 or length(p_telefono) > 25
     or length(coalesce(p_email,'')) > 120 or length(coalesce(p_servicio,'')) > 120 then
    return json_build_object('ok', false, 'mensaje', 'Alguno de los campos es demasiado largo.');
  end if;

  -- La hora pedida tiene que ser una franja real de ese día de la semana.
  -- Sin esto se podría reservar por API un domingo a las 03:00.
  if not exists (select 1 from public.franjas f
                 where f.dow = extract(dow from p_fecha)::smallint
                   and f.hora = p_hora) then
    return json_build_object('ok', false, 'mensaje', 'Esa hora no está disponible. Elige una de las que muestra el calendario.');
  end if;

  -- ¿día o franja bloqueada por Alejandro?
  -- Se aplica la misma separación mínima que entre citas.
  if exists (select 1 from public.bloqueos b
             where b.fecha = p_fecha
               and (b.hora is null
                    or abs(extract(epoch from (b.hora - p_hora))) < v_separacion * 60)) then
    return json_build_object('ok', false, 'mensaje', 'Esa hora ya no está disponible. Elige otra, por favor.');
  end if;

  -- Separación mínima entre pacientes: 60 min de sesión + 15 de descanso.
  -- Impide solapes aunque la petición no venga del formulario de la web.
  if exists (select 1 from public.citas c
             where c.slot_date = p_fecha
               and c.estado <> 'cancelada'
               and abs(extract(epoch from (c.slot_time - p_hora))) < v_separacion * 60) then
    return json_build_object('ok', false,
      'mensaje', 'Esa hora acaba de ocuparse. Elige otra, por favor.');
  end if;

  -- límite simple anti-spam
  select count(*) into v_pendientes
  from public.citas
  where telefono = trim(p_telefono) and estado = 'pendiente';
  if v_pendientes >= 3 then
    return json_build_object('ok', false,
      'mensaje', 'Ya tienes varias solicitudes pendientes. Te contactaré en breve.');
  end if;

  insert into public.citas (nombre, telefono, email, servicio, slot_date, slot_time, notas, consent, origen)
  values (trim(p_nombre), trim(p_telefono), nullif(trim(coalesce(p_email,'')),''),
          p_servicio, p_fecha, p_hora, nullif(trim(coalesce(p_notas,'')),''), true, 'web')
  returning id into v_id;

  return json_build_object('ok', true, 'id', v_id);

exception
  when unique_violation then
    return json_build_object('ok', false,
      'mensaje', 'Esa hora acaba de ocuparse. Elige otra, por favor.');
end;
$$;

-- ---------- Permisos de las funciones ----------
revoke all on function public.disponibilidad(date) from public;
revoke all on function public.solicitar_cita(text,text,text,text,date,time,text,boolean) from public;

grant execute on function public.disponibilidad(date) to anon, authenticated;
grant execute on function public.solicitar_cita(text,text,text,text,date,time,text,boolean) to anon, authenticated;

-- ============================================================
--  DESPUÉS DE EJECUTAR ESTO:
--  1. Authentication > Users > Add user  -> crea el usuario de
--     Alejandro con email y contraseña (es quien entra en agenda.html).
--  2. Authentication > Providers > Email -> desactiva "Enable signup"
--     para que nadie más pueda registrarse.
--  3. Project Settings > API -> copia Project URL y la clave
--     "anon public" en js/config.js.
-- ============================================================

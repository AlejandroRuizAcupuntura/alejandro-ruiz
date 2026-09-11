/* ============================================================
   Agenda privada — requiere sesión de Supabase
   Acceso total: crear, mover, anular, borrar citas y bloquear
   días u horas del calendario público.
   ============================================================ */
(function () {
  const S = window.SITE;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const vSinBd = $('#vista-sin-bd'), vLogin = $('#vista-login'), vPanel = $('#vista-panel');
  const btnSalir = $('#btn-salir');
  const tbody = $('#tbody');
  const boxCita = $('#box-cita'), boxBloqueo = $('#box-bloqueo');
  let filtro = 'proximas';
  let citasCache = [];

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const hoyISO = iso(new Date());
  const masDias = n => iso(new Date(Date.now() + n * 864e5));

  const escapar = t => String(t ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const hhmm = t => String(t ?? '').slice(0, 5);
  const fechaCorta = f => new Date(f + 'T12:00:00')
    .toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  const fechaLarga = f => {
    const t = new Date(f + 'T12:00:00')
      .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return t.charAt(0).toUpperCase() + t.slice(1);   // solo la primera letra
  };
  const momento = ts => new Date(ts).toLocaleString('es-ES',
    { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  function mostrar(el) {
    [vSinBd, vLogin, vPanel].forEach(v => v.hidden = true);
    el.hidden = false;
  }
  function aviso(el, texto, tipo) { el.className = 'msg is-' + tipo; el.innerHTML = texto; }
  function limpiar(el) { el.className = 'msg'; el.textContent = ''; }

  /* ---------- Arranque ---------- */
  if (!DB.activo) { mostrar(vSinBd); return; }
  DB.sesion().then(s => { s ? abrirPanel() : mostrar(vLogin); });

  /* ---------- Login ---------- */
  $('#form-login').addEventListener('submit', async ev => {
    ev.preventDefault();
    const m = $('#login-msg');
    aviso(m, 'Comprobando…', 'info');
    try {
      await DB.login($('#l-email').value.trim(), $('#l-pass').value);
      abrirPanel();
    } catch (e) {
      aviso(m, 'No he podido entrar. Revisa el email y la contraseña.', 'err');
    }
  });
  btnSalir.addEventListener('click', async () => { await DB.logout(); location.reload(); });

  /* ---------- Puesta en marcha del panel ---------- */
  function abrirPanel() {
    mostrar(vPanel);
    btnSalir.hidden = false;

    const opciones = S.servicios.map(s => `<option>${escapar(s.titulo)}</option>`).join('');
    $('#c-servicio').innerHTML = '<option value="" disabled selected>Servicio…</option>' + opciones;

    // Horas habituales como sugerencia en los campos de hora
    const todas = [...new Set(Object.values(S.franjas).flat())].sort();
    $('#horas-sugeridas').innerHTML = todas.map(h => `<option value="${h}">`).join('');

    $('#c-fecha').value = hoyISO;
    $('#b-fecha').value = hoyISO;
    cargar();
  }

  /* ---------- Filtros ---------- */
  /* En móvil la lista de filtros vive en una hoja que se abre desde
     un botón; en escritorio sigue siendo una fila de chips normal. */
  const cajaFiltros = $('#filtros-caja'), btnFiltros = $('#abrir-filtros');
  function abrirFiltros(abrir) {
    cajaFiltros.classList.toggle('is-open', abrir);
    btnFiltros.setAttribute('aria-expanded', String(abrir));
  }
  btnFiltros.addEventListener('click', () =>
    abrirFiltros(!cajaFiltros.classList.contains('is-open')));
  cajaFiltros.addEventListener('click', e => { if (e.target === cajaFiltros) abrirFiltros(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') abrirFiltros(false); });

  $$('#filtros .chip[data-f]').forEach(b => b.addEventListener('click', () => {
    $$('#filtros .chip[data-f]').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on');
    filtro = b.dataset.f;
    $('#filtro-actual').textContent = b.textContent.replace(/\(\d+\)/, '').trim();
    abrirFiltros(false);
    cargar();
  }));
  $('#chip-refrescar').addEventListener('click', cargar);

  function rango() {
    // "Sin confirmar": cualquier fecha, incluidas las ya pasadas que se
    // quedaron sin responder. El filtrado por estado va después.
    if (filtro === 'pendientes') return { desde: '2000-01-01', hasta: '2100-01-01' };
    if (filtro === 'hoy')     return { desde: hoyISO, hasta: hoyISO };
    if (filtro === 'manana')  return { desde: masDias(1), hasta: masDias(1) };
    if (filtro === 'semana')  return { desde: hoyISO, hasta: masDias(7) };
    if (filtro === 'mes')     return { desde: hoyISO, hasta: masDias(30) };
    if (filtro === 'pasadas') return { desde: '2000-01-01', hasta: masDias(-1) };
    if (filtro === 'todas')   return { desde: '2000-01-01', hasta: '2100-01-01' };
    return { desde: hoyISO, hasta: masDias(365) };   // próximas
  }

  /* ---------- Listado ---------- */
  async function cargar() {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">Cargando…</td></tr>';
    try {
      citasCache = await DB.listarCitas(rango());
      if (filtro === 'pendientes') citasCache = citasCache.filter(c => c.estado === 'pendiente');
      if (filtro === 'manana')     citasCache = citasCache.filter(c => c.estado !== 'cancelada');
      if (filtro === 'pasadas') citasCache.reverse();

      if (!citasCache.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="muted">' +
          (filtro === 'pendientes'
            ? 'Nada pendiente: todas las citas están confirmadas o anuladas.'
            : filtro === 'manana'
            ? 'Mañana no hay citas.'
            : 'No hay citas en este periodo.') + '</td></tr>';
      } else {
        let ultimaFecha = null;
        tbody.innerHTML = citasCache.map(c => {
          let cabecera = '';
          if (c.slot_date !== ultimaFecha) {
            ultimaFecha = c.slot_date;
            cabecera = `<tr class="tbl__dia"><td colspan="7">${escapar(fechaLarga(c.slot_date))}</td></tr>`;
          }
          const esManana = c.slot_date === masDias(1);
          const modificada = c.updated_at && c.created_at &&
            new Date(c.updated_at) - new Date(c.created_at) > 2000;
          return cabecera + `
        <tr data-id="${c.id}">
          <td data-l="Fecha">${escapar(fechaCorta(c.slot_date))}</td>
          <td data-l="Hora"><b>${escapar(hhmm(c.slot_time))}</b></td>
          <td data-l="Paciente">
            ${escapar(c.nombre)}<br>
            <a class="muted" href="tel:${escapar(c.telefono)}" style="font-size:.82rem">${escapar(c.telefono)}</a>
            ${c.email ? `<br><span class="muted" style="font-size:.78rem">${escapar(c.email)}</span>` : ''}
          </td>
          <td data-l="Servicio">${escapar(c.servicio)}
            <br><span class="muted" style="font-size:.75rem">${c.origen === 'consulta' ? 'alta manual' : 'web'}</span>
          </td>
          <td data-l="Notas" style="max-width:230px">
            ${c.notas ? escapar(c.notas) : '<span class="muted">—</span>'}
            ${c.nota_admin ? `<br><span class="nota-priv">🔒 ${escapar(c.nota_admin)}</span>` : ''}
          </td>
          <td data-l="Estado">
            <span class="badge ${escapar(c.estado)}">${escapar(c.estado)}</span>
            ${modificada ? `<br><span class="muted" style="font-size:.7rem">modificada ${escapar(momento(c.updated_at))}</span>` : ''}
            ${c.aviso_enviado_at ? '<br><span class="marca-aviso">avisado</span>' : ''}
            ${c.recordatorio_enviado_at ? '<br><span class="marca-aviso">recordado</span>' : ''}
          </td>
          <td data-l="Acciones">
            ${esManana && c.estado === 'confirmada'
              ? `<button class="chip mini ${c.recordatorio_enviado_at ? '' : 'chip--accion'}" data-a="recordar">${
                  c.recordatorio_enviado_at ? 'Recordar otra vez' : 'Recordar'}</button>` : ''}
            ${c.estado === 'confirmada' && !esManana
              ? '<button class="chip mini" data-a="avisar">Avisar</button>' : ''}
            <button class="chip mini" data-a="editar">Editar</button>
            <button class="chip mini" data-a="confirmada">Confirmar</button>
            <button class="chip mini" data-a="cancelada">Anular</button>
            <button class="chip mini" data-a="historial">Historial</button>
            <button class="chip mini" data-a="borrar">Borrar</button>
          </td>
        </tr>`;
        }).join('');
        conectarAcciones();
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" class="muted">Error al cargar: ${escapar(e.message)}</td></tr>`;
    }
    if (!boxBloqueo.hidden) cargarBloqueos();
    actualizarContador();
  }

  /* Número de citas sin confirmar, visible siempre en el chip */
  async function actualizarContador() {
    const el = $('#cuenta-pendientes');
    try {
      const n = await DB.contarPendientes();
      el.textContent = n ? `(${n})` : '';
      el.closest('.chip').classList.toggle('tiene-pendientes', n > 0);
      const badge = $('#badge-filtros');      // se ve sin abrir la hoja
      if (badge) { badge.textContent = n; badge.hidden = !n; }
    } catch (e) { el.textContent = ''; }

    /* Recordatorios de mañana que todavía están sin enviar */
    const elM = $('#cuenta-manana');
    if (!elM) return;
    try {
      const n = await DB.contarRecordatorios(masDias(1));
      elM.textContent = n ? `(${n})` : '';
      elM.closest('.chip').classList.toggle('tiene-pendientes', n > 0);
    } catch (e) { elM.textContent = ''; }
  }

  function conectarAcciones() {
    $$('#tbody .chip').forEach(b => b.addEventListener('click', async () => {
      const tr = b.closest('tr'), id = tr.dataset.id, a = b.dataset.a;
      const cita = citasCache.find(c => c.id === id);

      if (a === 'editar')    return abrirFormularioCita(cita);
      if (a === 'historial') return verHistorial(cita);
      if (a === 'recordar')  return abrirAviso(cita, 'recordatorio');
      if (a === 'avisar')    return abrirAviso(cita, 'confirmacion');
      if (a === 'borrar' && !confirm('¿Borrar esta cita definitivamente? No se puede deshacer.')) return;

      /* Confirmar pregunta ANTES de guardar: si se cierra el aviso,
         la cita se queda como estaba. Antes se guardaba primero y
         "Cancelar" dejaba la cita confirmada sin quererlo. */
      if (a === 'confirmada' && cita.estado !== 'confirmada') {
        return abrirAviso(cita, 'confirmacion', { estado: 'confirmada' });
      }

      b.disabled = true;
      try {
        if (a === 'borrar') await DB.borrarCita(id);
        else                await DB.actualizarCita(id, { estado: a });
        await cargar();
      } catch (e) {
        alert('No se pudo actualizar: ' + e.message);
        b.disabled = false;
      }
    }));
  }

  /* ============================================================
     Alta y edición de citas
     ============================================================ */
  const fCita = $('#form-cita-admin');
  let citaMovida = null;   // cita cuyo día u hora acaba de cambiar

  function abrirFormularioCita(cita) {
    limpiar($('#cita-msg'));
    boxCita.hidden = false;
    $('#titulo-cita').textContent = cita ? 'Editar cita' : 'Nueva cita';
    $('#c-id').value        = cita ? cita.id : '';
    $('#c-nombre').value    = cita ? cita.nombre : '';
    $('#c-tel').value       = cita ? cita.telefono : '';
    $('#c-email').value     = cita && cita.email ? cita.email : '';
    $('#c-servicio').value  = cita ? cita.servicio : '';
    $('#c-fecha').value     = cita ? cita.slot_date : hoyISO;
    $('#c-hora').value      = cita ? hhmm(cita.slot_time) : '';
    $('#c-estado').value    = cita ? cita.estado : 'confirmada';
    $('#c-notas').value     = cita && cita.notas ? cita.notas : '';
    $('#c-nota-admin').value= cita && cita.nota_admin ? cita.nota_admin : '';
    boxCita.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('#chip-nueva').addEventListener('click', () => {
    if (boxCita.hidden) abrirFormularioCita(null); else boxCita.hidden = true;
  });
  $('#c-cancelar').addEventListener('click', () => { boxCita.hidden = true; });

  fCita.addEventListener('submit', async ev => {
    ev.preventDefault();
    const m = $('#cita-msg');
    const id = $('#c-id').value;
    const datos = {
      nombre:   $('#c-nombre').value.trim(),
      telefono: $('#c-tel').value.trim(),
      email:    $('#c-email').value.trim() || null,
      servicio: $('#c-servicio').value,
      fecha:    $('#c-fecha').value,
      hora:     $('#c-hora').value,
      estado:   $('#c-estado').value,
      notas:    $('#c-notas').value.trim() || null,
      notaAdmin:$('#c-nota-admin').value.trim() || null
    };
    aviso(m, 'Guardando…', 'info');
    try {
      if (id) {
        const antes = citasCache.find(c => c.id === id);
        const seMueve = antes && (antes.slot_date !== datos.fecha ||
                                  hhmm(antes.slot_time) !== hhmm(datos.hora));
        await DB.actualizarCita(id, {
          nombre: datos.nombre, telefono: datos.telefono, email: datos.email,
          servicio: datos.servicio, slot_date: datos.fecha, slot_time: datos.hora,
          estado: datos.estado, notas: datos.notas, nota_admin: datos.notaAdmin
        });
        aviso(m, 'Cita actualizada.', 'ok');
        if (seMueve && datos.estado !== 'cancelada') {
          citaMovida = { ...antes, ...datos, slot_date: datos.fecha, slot_time: datos.hora };
        }
      } else {
        await DB.crearCita(datos);
        aviso(m, 'Cita creada.', 'ok');
        fCita.reset();
        $('#c-fecha').value = hoyISO;
      }
      await cargar();
      setTimeout(() => {
        boxCita.hidden = true;
        if (citaMovida) { abrirAviso(citaMovida, 'cambio'); citaMovida = null; }
      }, 900);
    } catch (e) {
      const dup = e.code === '23505' || /duplicate|unique/i.test(e.message || '');
      aviso(m, dup ? 'Ya hay otra cita activa a esa hora. Elige otra hora o anula la anterior.'
                   : 'No se pudo guardar: ' + escapar(e.message), 'err');
    }
  });

  /* ============================================================
     Bloqueos
     ============================================================ */
  $('#chip-bloqueo').addEventListener('click', () => {
    boxBloqueo.hidden = !boxBloqueo.hidden;
    if (!boxBloqueo.hidden) {
      cargarBloqueos();
      boxBloqueo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  $('#form-bloqueo').addEventListener('submit', async ev => {
    ev.preventDefault();
    const m = $('#bloqueo-msg');
    aviso(m, 'Guardando…', 'info');
    try {
      await DB.crearBloqueo({
        fecha:  $('#b-fecha').value,
        hora:   $('#b-hora').value || null,
        motivo: $('#b-motivo').value.trim() || null
      });
      aviso(m, 'Bloqueo creado. Esa franja ya no aparece en la web.', 'ok');
      $('#b-hora').value = ''; $('#b-motivo').value = '';
      cargarBloqueos();
    } catch (e) {
      const dup = e.code === '23505' || /duplicate|unique/i.test(e.message || '');
      aviso(m, dup ? 'Ese día u hora ya estaba bloqueado.'
                   : 'No se pudo bloquear: ' + escapar(e.message), 'err');
    }
  });

  async function cargarBloqueos() {
    const caja = $('#lista-bloqueos');
    caja.textContent = 'Cargando…';
    try {
      const lista = await DB.listarBloqueos({ desde: masDias(-1), hasta: masDias(365) });
      if (!lista.length) { caja.textContent = 'No hay bloqueos activos.'; return; }
      caja.innerHTML = lista.map(b => `
        <div class="bloqueo" data-id="${b.id}">
          <span>
            <b>${escapar(fechaCorta(b.fecha))}</b>
            ${b.hora ? escapar(hhmm(b.hora)) : '<em>día entero</em>'}
            ${b.motivo ? `<span class="muted"> · ${escapar(b.motivo)}</span>` : ''}
          </span>
          <button class="chip mini" data-quitar="${b.id}">Quitar</button>
        </div>`).join('');
      $$('#lista-bloqueos [data-quitar]').forEach(btn =>
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try { await DB.borrarBloqueo(btn.dataset.quitar); cargarBloqueos(); }
          catch (e) { alert('No se pudo quitar: ' + e.message); btn.disabled = false; }
        }));
    } catch (e) {
      caja.textContent = 'Error al cargar los bloqueos: ' + e.message;
    }
  }

  /* ============================================================
     Avisar al paciente  (WhatsApp o email, con el texto ya escrito)
     ============================================================ */

  /* Los pacientes escriben el teléfono como quieren: "664 49 38 38",
     "+34 664493838", "0034-664 49 38 38"… WhatsApp necesita solo
     dígitos con prefijo de país. Si no hay prefijo y quedan 9 cifras,
     se asume España. Devuelve null si no hay nada aprovechable, para
     no abrir por error la conversación de otra persona. */
  function telefonoWa(bruto) {
    let t = String(bruto || '').replace(/[^\d+]/g, '');
    if (t.startsWith('00')) t = '+' + t.slice(2);
    if (t.startsWith('+'))  return t.slice(1).length >= 8 ? t.slice(1) : null;
    if (t.length === 9)     return (S.prefijoPais || '34') + t;   // número nacional
    return t.length >= 10 ? t : null;                             // ya trae prefijo
  }

  /* Muestra el número tal como se va a usar, para que se vea de un
     vistazo si la conversión ha salido mal. */
  function telefonoVisible(n) {
    if (!n) return '';
    const p = S.prefijoPais || '34';
    return n.startsWith(p) ? `+${p} ${n.slice(p.length)}` : `+${n}`;
  }

  /* Dentro de una frase la fecha va en minúscula y sin año:
     "el lunes 14 de septiembre a las 11:15" se lee mejor que
     "el Lunes, 14 de septiembre de 2026 a las 11:15". */
  const fechaMensaje = f => new Date(f + 'T12:00:00')
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(',', '');

  function rellenar(plantilla, cita) {
    const dir = [S.direccion, S.codigoPostal].filter(Boolean).join(', ');
    return String(plantilla || '')
      .replace(/\{nombre\}/g,    (cita.nombre || '').split(' ')[0])
      .replace(/\{fecha\}/g,     fechaMensaje(cita.slot_date))
      .replace(/\{hora\}/g,      hhmm(cita.slot_time))
      .replace(/\{servicio\}/g,  cita.servicio || '')
      .replace(/\{direccion\}/g, dir)
      .replace(/\{telefono\}/g,  S.telefono || '');
  }

  const mAviso = $('#modal-aviso');
  let avisoActual = null;          // { cita, tipo }

  function cerrarAviso() { mAviso.hidden = true; avisoActual = null; }
  $('#cerrar-aviso').addEventListener('click', cerrarAviso);
  mAviso.addEventListener('click', e => { if (e.target === mAviso) cerrarAviso(); });

  const TITULOS = {
    confirmacion: 'Confirmar al paciente',
    cambio:       'Avisar del cambio',
    recordatorio: 'Recordar la cita de mañana'
  };

  /* `aplicar` son los cambios que solo se guardan si el usuario elige
     una opción. Con null, la cita ya está guardada y esto es solo el
     aviso (cambio de hora, recordatorio). */
  function abrirAviso(cita, tipo, aplicar = null) {
    const plantilla = (S.mensajes || {})[tipo];
    if (!plantilla) {                             // sin texto configurado
      if (aplicar) guardarYRecargar(cita.id, aplicar);
      return;
    }
    avisoActual = { cita, tipo, aplicar };
    $('#cerrar-aviso').textContent = aplicar ? 'Cancelar' : 'Ahora no';
    $('#aviso-sin').hidden = !aplicar;

    $('#aviso-titulo').textContent = TITULOS[tipo] || 'Avisar al paciente';
    $('#aviso-cita').innerHTML =
      `<b>${escapar(cita.nombre)}</b><br>${escapar(fechaLarga(cita.slot_date))} · ` +
      `${escapar(hhmm(cita.slot_time))}<br>` +
      `<span class="muted">${escapar(cita.servicio || '')}</span>`;

    const texto = rellenar(plantilla.texto, cita);
    const tel   = telefonoWa(cita.telefono);
    const wa    = $('#aviso-wa');
    if (tel) {
      wa.href = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
      wa.hidden = false;
      $('#aviso-tel').textContent = telefonoVisible(tel);
    } else {
      wa.hidden = true;                           // número ilegible: mejor no arriesgar
    }

    const mail = $('#aviso-mail'), sinMail = $('#aviso-sinmail');
    if (cita.email) {
      mail.href = 'https://mail.google.com/mail/?view=cm&fs=1'
        + '&to=' + encodeURIComponent(cita.email)
        + '&su=' + encodeURIComponent(rellenar(plantilla.asunto, cita))
        + '&body=' + encodeURIComponent(texto);
      mail.hidden = false; sinMail.hidden = true;
      $('#aviso-email').textContent = cita.email;
    } else {
      mail.hidden = true; sinMail.hidden = false;
    }

    mAviso.hidden = false;
  }

  /* Al pulsar WhatsApp o email se apunta la fecha del aviso, para que
     la lista muestre quién ya está avisado. No podemos saber si de
     verdad ha pulsado "Enviar": siempre se puede volver a abrir. */
  async function guardarYRecargar(id, cambios) {
    try {
      await DB.actualizarCita(id, cambios);
      await cargar();
    } catch (e) { alert('No se pudo guardar: ' + e.message); }
  }

  /* Se deja que el enlace navegue solo (no se hace preventDefault):
     si esperásemos al guardado, el navegador bloquearía la pestaña
     por abrirse fuera del gesto del usuario. */
  function marcarAviso() {
    if (!avisoActual) return;
    const { cita, tipo, aplicar } = avisoActual;
    const campo = tipo === 'recordatorio' ? 'recordatorio_enviado_at' : 'aviso_enviado_at';
    cerrarAviso();
    guardarYRecargar(cita.id, { ...(aplicar || {}), [campo]: new Date().toISOString() });
  }
  $('#aviso-wa').addEventListener('click', marcarAviso);
  $('#aviso-mail').addEventListener('click', marcarAviso);

  /* Confirmar pero sin mandar nada al paciente */
  $('#aviso-sin').addEventListener('click', () => {
    if (!avisoActual || !avisoActual.aplicar) return;
    const { cita, aplicar } = avisoActual;
    cerrarAviso();
    guardarYRecargar(cita.id, aplicar);
  });

  /* ============================================================
     Historial de cambios
     ============================================================ */
  const modal = $('#modal-historial');
  $('#cerrar-historial').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') modal.hidden = true; });

  const ETIQUETAS = {
    slot_date: 'Día', slot_time: 'Hora', estado: 'Estado', servicio: 'Servicio',
    nombre: 'Nombre', telefono: 'Teléfono', email: 'Email',
    notas: 'Notas', nota_admin: 'Nota privada'
  };

  async function verHistorial(cita) {
    modal.hidden = false;
    const cuerpo = $('#cuerpo-historial');
    cuerpo.textContent = 'Cargando…';
    try {
      const log = await DB.historial(cita.id);
      if (!log.length) { cuerpo.textContent = 'Sin cambios registrados.'; return; }

      cuerpo.innerHTML = log.map(l => {
        let detalle = '';
        if (l.accion === 'modificada' && l.antes && l.despues) {
          const fmt = (k, v) => {
            if (v === null || v === undefined || v === '') return '—';
            if (k === 'slot_time') return hhmm(v);
            if (k === 'slot_date') return fechaCorta(v);
            return v;
          };
          const cambios = Object.keys(ETIQUETAS)
            .filter(k => String(l.antes[k] ?? '') !== String(l.despues[k] ?? ''))
            .map(k => `<li><b>${ETIQUETAS[k]}:</b> ${escapar(fmt(k, l.antes[k]))} → ${escapar(fmt(k, l.despues[k]))}</li>`);
          detalle = cambios.length ? `<ul class="hist__cambios">${cambios.join('')}</ul>` : '';
        }
        return `<div class="hist__item">
          <div class="hist__cab">
            <span class="badge ${l.accion === 'borrada' ? 'cancelada' : 'confirmada'}">${escapar(l.accion)}</span>
            <span class="muted">${escapar(momento(l.cuando))}</span>
          </div>${detalle}
        </div>`;
      }).join('');
    } catch (e) {
      cuerpo.textContent = 'No se pudo leer el historial: ' + e.message;
    }
  }
})();

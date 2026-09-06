/* ============================================================
   Capa de datos — Supabase (opcional)
   Si SITE.supabase.url / anonKey están vacíos, DB.activo = false
   y el sitio funciona en "modo WhatsApp".
   ============================================================ */

window.DB = (function () {
  const cfg = (window.SITE && window.SITE.supabase) || {};
  const activo = !!(cfg.url && cfg.anonKey && window.supabase);
  const client = activo ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;

  /* ==========================================================
     PÚBLICO  (lo único accesible sin iniciar sesión)
     ========================================================== */

  /* Devuelve { cerrado: bool, ocupadas: ["10:00", ...] }.
     Nunca expone nombres, teléfonos ni ningún dato del paciente. */
  async function disponibilidad(fechaISO) {
    if (!activo) return { cerrado: false, ocupadas: [] };
    const { data, error } = await client.rpc('disponibilidad', { p_fecha: fechaISO });
    if (error) throw error;
    return {
      cerrado: !!(data && data.cerrado),
      ocupadas: ((data && data.ocupadas) || []).map(h => String(h).slice(0, 5))
    };
  }

  async function solicitarCita(c) {
    if (!activo) throw new Error('sin-bd');
    const { data, error } = await client.rpc('solicitar_cita', {
      p_nombre:   c.nombre,
      p_telefono: c.telefono,
      p_email:    c.email || null,
      p_servicio: c.servicio,
      p_fecha:    c.fecha,
      p_hora:     c.hora,
      p_notas:    c.notas || null,
      p_consent:  !!c.consent
    });
    if (error) throw error;
    return data;
  }

  /* ==========================================================
     PRIVADO  (requiere sesión iniciada — solo Alejandro)
     ========================================================== */
  async function login(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function logout() { await client.auth.signOut(); }
  async function sesion()  { const { data } = await client.auth.getSession(); return data.session; }

  /* --- Citas --- */
  async function listarCitas({ desde, hasta }) {
    const { data, error } = await client
      .from('citas').select('*')
      .gte('slot_date', desde).lte('slot_date', hasta)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function crearCita(c) {
    const { error } = await client.from('citas').insert({
      nombre: c.nombre, telefono: c.telefono, email: c.email || null,
      servicio: c.servicio, slot_date: c.fecha, slot_time: c.hora,
      notas: c.notas || null, nota_admin: c.notaAdmin || null,
      estado: c.estado || 'confirmada', origen: 'consulta', consent: true
    });
    if (error) throw error;
  }

  /* Modificar cualquier campo: día, hora, servicio, estado, notas… */
  async function actualizarCita(id, cambios) {
    const { error } = await client.from('citas').update(cambios).eq('id', id);
    if (error) throw error;
  }

  async function borrarCita(id) {
    const { error } = await client.from('citas').delete().eq('id', id);
    if (error) throw error;
  }

  /* --- Historial de cambios de una cita --- */
  async function historial(citaId) {
    const { data, error } = await client
      .from('citas_log').select('*')
      .eq('cita_id', citaId)
      .order('cuando', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /* --- Bloqueos (días libres, vacaciones, horas no disponibles) --- */
  async function listarBloqueos({ desde, hasta }) {
    const { data, error } = await client
      .from('bloqueos').select('*')
      .gte('fecha', desde).lte('fecha', hasta)
      .order('fecha', { ascending: true })
      .order('hora',  { ascending: true, nullsFirst: true });
    if (error) throw error;
    return data || [];
  }

  async function crearBloqueo({ fecha, hora, motivo }) {
    const { error } = await client.from('bloqueos')
      .insert({ fecha, hora: hora || null, motivo: motivo || null });
    if (error) throw error;
  }

  async function borrarBloqueo(id) {
    const { error } = await client.from('bloqueos').delete().eq('id', id);
    if (error) throw error;
  }

  return {
    activo, client,
    disponibilidad, solicitarCita,
    login, logout, sesion,
    listarCitas, crearCita, actualizarCita, borrarCita, historial,
    listarBloqueos, crearBloqueo, borrarBloqueo
  };
})();

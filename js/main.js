/* ============================================================
   Lógica de la página pública
   ============================================================ */
(function () {
  const S = window.SITE;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- 1. Datos de contacto en el HTML ---------- */
  const waBase = 'https://wa.me/' + S.whatsapp;
  const set = {
    ciudad:    el => el.textContent = S.ciudad,
    telefono:  el => el.textContent = S.telefono,
    email:     el => el.textContent = S.email,
    direccion: el => el.textContent = S.direccion,
    cp:        el => el.textContent = S.codigoPostal,
    telLink:   el => el.href = 'tel:' + S.telefonoLink,
    mailLink:  el => el.href = 'mailto:' + S.email,
    waLink:    el => el.href = waBase,
    mapsLink:  el => el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(S.mapsQuery),
    igLink:    el => { if (S.instagram) { el.href = 'https://instagram.com/' + S.instagram; el.hidden = false; } }
  };
  $$('[data-site]').forEach(el => (set[el.dataset.site] || (() => {}))(el));
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
  const fab = $('#fab-wa'); if (fab) fab.href = waBase;

  /* ---------- 2. Cabecera y menú ---------- */
  const hdr = $('#hdr'), nav = $('#nav'), burger = $('#burger');
  addEventListener('scroll', () => hdr.classList.toggle('is-stuck', scrollY > 12), { passive: true });
  if (burger) {
    const abrirMenu = estado => {
      nav.classList.toggle('is-open', estado);
      burger.classList.toggle('is-open', estado);
      burger.setAttribute('aria-expanded', estado);
      document.body.classList.toggle('no-scroll', estado);
    };
    burger.addEventListener('click', () => abrirMenu(!nav.classList.contains('is-open')));
    $$('#nav a').forEach(a => a.addEventListener('click', () => abrirMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') abrirMenu(false); });
    document.addEventListener('click', e => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target))
        abrirMenu(false);
    });
    // Al girar el móvil o volver a escritorio, cierra el menú
    addEventListener('resize', () => { if (innerWidth > 760) abrirMenu(false); });
  }

  /* ---------- 3. Marquee de motivos ---------- */
  const mq = $('#marquee');
  if (mq) {
    const linea = S.motivos.map(m => `<span>${m}</span>`).join('');
    mq.innerHTML = linea + linea;   // duplicado para el bucle infinito
  }

  /* ---------- 4. Servicios ---------- */
  const grid = $('#grid-servicios');
  if (grid) {
    grid.innerHTML = S.servicios.map(s => `
      <article class="card">
        <div class="card__top">
          <h3>${s.titulo}</h3>
          <span class="card__price">${s.precio}</span>
        </div>
        <span class="card__dur">${s.duracion}</span>
        ${s.id === 'sesion' && S.precioSabado
          ? `<span class="card__sab">Sábados por la mañana, ${S.precioSabado}</span>` : ''}
        <p>${s.resumen}</p>
        <ul>${s.detalle.map(d => `<li>${d}</li>`).join('')}</ul>
        ${s.video ? `<a class="card__video" href="${s.video}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
          ${s.videoTexto || 'Ver vídeo explicativo'}</a>` : ''}
        <a class="card__link" href="#reserva" data-servicio="${s.id}">Reservar esta sesión →</a>
      </article>`).join('');
  }

  /* ---------- 5. Salud ginecológica ---------- */
  const gine = S.ginecologia;
  if (gine && $('#gine-titulo')) {
    $('#gine-titulo').textContent = gine.titulo;
    /* Solo el primer párrafo queda a la vista: el resto se despliega.
       La sección se menciona, pero no ocupa media portada. */
    $('#gine-intro').innerHTML        = `<p class="lead">${gine.intro[0]}</p>`;
    $('#gine-entradilla').textContent = gine.entradilla;
    $('#gine-cierre').textContent     = gine.cierre;
    if (gine.nota) $('#gine-nota').textContent = gine.nota;
    $('#gine-items').innerHTML = gine.items.map(i => `
      <article class="gine__item">
        <svg class="gine__hoja" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1 4 .6-4.6 3.4-8.4 8-10.4-3.4 2.4-5.6 5.8-6.2 10.4 1 .6 2.3 1 3.7 1 7 0 12-6 12-16 0-.6-1-1.4-2.5-1.4Z"/>
        </svg>
        <div>
          <h3>${i.titulo}</h3>
          <p>${i.texto}</p>
        </div>
      </article>`).join('');

    /* Los párrafos restantes de la introducción van dentro del desplegable */
    const resto = gine.intro.slice(1);
    if (resto.length) {
      $('#gine-mas').insertAdjacentHTML('afterbegin',
        resto.map(t => `<p class="lead gine__resto">${t}</p>`).join(''));
    }

    /* Botón "Ver más detalles" */
    const tgl = $('#gine-toggle'), mas = $('#gine-mas'), txt = $('.gine__toggle-txt', tgl);
    tgl.addEventListener('click', () => {
      const abierto = tgl.getAttribute('aria-expanded') === 'true';
      tgl.setAttribute('aria-expanded', String(!abierto));
      mas.hidden = abierto;
      txt.textContent = abierto ? 'Ver más detalles' : 'Ver menos';
      if (abierto) tgl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- 6. Sobre mí ---------- */
  const sm = S.sobreMi;
  if (sm && document.querySelector('#sm-titulo')) {
    const bloque = (b) => `
      <div class="cierre__bloque">
        <h3>${b.titulo}</h3>
        ${b.parrafos.map(t => `<p>${t}</p>`).join('')}
      </div>`;
    document.querySelector('#sm-titulo').textContent = sm.titulo;
    document.querySelector('#sm-intro').innerHTML = sm.intro.map(t => `<p class="lead">${t}</p>`).join('');
    document.querySelector('#sm-formacion').innerHTML = sm.formacion.map(f => `
      <li class="linea__item">
        <span class="linea__anios">${f.anios}</span>
        <div class="linea__cuerpo">
          <h4>${f.titulo}</h4>
          <span class="linea__centro">${f.centro}</span>
          ${f.texto ? `<p>${f.texto}</p>` : ''}
        </div>
      </li>`).join('');
    document.querySelector('#sm-continua').innerHTML = bloque(sm.continua);
    document.querySelector('#sm-objetivo').innerHTML = bloque(sm.objetivo);
  }

  /* ---------- 7. Testimonios ---------- */
  const q = $('#quotes');
  if (q) {
    const lista = S.testimonios || [];
    if (!lista.length) {
      // Sin reseñas reales no se muestra nada inventado
      q.closest('section').hidden = true;
    } else {
      q.innerHTML = lista.map(t => `
        <figure class="quote" style="margin:0">
          <p>“${t.texto}”</p>
          <cite>${t.autor}</cite>
        </figure>`).join('');
    }
  }

  /* ---------- 8. Horario ---------- */
  const hl = $('#horario-list');
  if (hl) hl.innerHTML = S.horario.map(h => `${h.dias}: ${h.horas}`).join('<br>');

  /* ---------- 9. Reveal al hacer scroll ---------- */
  $$('.section-head, .card, .step, .quote, .form, .about__card, .hero__art, .gine__cab, .gine__item, .about__intro, .linea__item, .cierre__bloque')
    .forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));

  /* ============================================================
     10. FORMULARIO DE CITA
     ============================================================ */
  const form = $('#form-cita');
  if (!form) return;

  const selServicio = $('#f-servicio');
  const inpFecha    = $('#f-fecha');
  const boxSlots    = $('#slots');
  const msg         = $('#form-msg');
  const btnEnviar   = $('#btn-enviar');
  const btnWa       = $('#btn-wa');
  const chkConsent  = $('#f-consent');
  let horaElegida = '';

  /* La solicitud no se puede enviar sin aceptar la política de privacidad.
     El botón queda bloqueado hasta que se marca la casilla (y el servidor
     lo vuelve a comprobar, así que no se puede saltar desde el navegador). */
  function aplicarConsentimiento() {
    btnEnviar.disabled = !chkConsent.checked;
    btnEnviar.title = chkConsent.checked
      ? ''
      : 'Marca la casilla de política de privacidad para poder enviar la solicitud';
  }
  chkConsent.addEventListener('change', aplicarConsentimiento);
  aplicarConsentimiento();

  selServicio.innerHTML = '<option value="" disabled selected>Elige un servicio…</option>' +
    S.servicios.map(s =>
      `<option value="${s.titulo}" data-wa="${s.soloWhatsapp ? '1' : ''}">` +
      `${s.titulo} · ${s.duracion} · ${s.precio}</option>`).join('');

  /* Algunos servicios (p.ej. la sesión a distancia) no se reservan por
     calendario: se coordinan por WhatsApp. Al elegirlos, se oculta la
     parte de día y hora y se explica cómo seguir. */
  const campoFecha = inpFecha.closest('.field');
  const campoHora  = boxSlots.closest('.field');
  function servicioActual() {
    return S.servicios.find(x => x.titulo === selServicio.value);
  }
  function aplicarModoServicio() {
    const sv = servicioActual();
    const soloWa = !!(sv && sv.soloWhatsapp);
    campoFecha.hidden = soloWa;
    campoHora.hidden  = soloWa;
    btnEnviar.hidden  = soloWa;
    if (soloWa) {
      inpFecha.value = '';
      horaElegida = '';
      aviso('Este servicio se coordina directamente por WhatsApp. Pulsa <b>Enviar por WhatsApp</b> y acordamos día y hora.', 'info');
    } else if (msg.classList.contains('is-info')) {
      limpiarAviso();
    }
    actualizarWa();
  }
  selServicio.addEventListener('change', aplicarModoServicio);

  /* Enlaces "Reservar esta sesión" de las tarjetas */
  $$('[data-servicio]').forEach(a => a.addEventListener('click', () => {
    const s = S.servicios.find(x => x.id === a.dataset.servicio);
    if (s) { selServicio.value = s.titulo; aplicarModoServicio(); }
  }));

  /* Rango de fechas */
  const hoy = new Date();
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const max = new Date(hoy.getTime() + S.diasReservables * 864e5);
  inpFecha.min = iso(hoy);
  inpFecha.max = iso(max);

  function aviso(texto, tipo) {
    msg.className = 'msg is-' + tipo;
    msg.innerHTML = texto;
    // En móvil el mensaje puede quedar fuera de pantalla
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function limpiarAviso() { msg.className = 'msg'; msg.textContent = ''; }

  /* --- Pintar franjas horarias --- */
  async function pintarSlots() {
    horaElegida = '';
    const f = inpFecha.value;
    if (!f) { boxSlots.innerHTML = '<span class="slots__empty">Elige primero un día.</span>'; return; }

    if (S.cerrado.includes(f)) {
      boxSlots.innerHTML = '<span class="slots__empty">Ese día la consulta está cerrada.</span>';
      return;
    }
    const dow = new Date(f + 'T12:00:00').getDay();
    const franjas = S.franjas[dow] || [];
    if (!franjas.length) {
      boxSlots.innerHTML = '<span class="slots__empty">Ese día no hay consulta. Prueba otro.</span>';
      return;
    }

    boxSlots.innerHTML = '<span class="slots__empty">Comprobando disponibilidad…</span>';
    let ocupadas = [];
    if (DB.activo) {
      try {
        const d = await DB.disponibilidad(f);
        if (d.cerrado) {
          boxSlots.innerHTML = '<span class="slots__empty">Ese día la consulta está cerrada. Prueba otro.</span>';
          return;
        }
        ocupadas = d.ocupadas;
      } catch (e) { console.warn('No se pudo leer la disponibilidad:', e.message); }
    }

    /* Si es hoy, oculta las horas ya pasadas */
    const ahora = new Date();
    const esHoy = f === iso(ahora);

    /* Separación mínima entre citas: la sesión más el descanso.
       Una hora no se ofrece si choca con otra cita ya existente,
       aunque esa cita esté a una hora "rara" (alta manual de la agenda). */
    const separacion = (S.duracionMin || 60) + (S.separacionMin || 0);
    const enMinutos = h => { const [x, y] = h.split(':').map(Number); return x * 60 + y; };
    const chocaCon = h => ocupadas.some(o =>
      Math.abs(enMinutos(h) - enMinutos(o)) < separacion);

    const notaSab = (dow === 6 && S.precioSabado)
      ? `<span class="slots__nota">Los sábados la sesión cuesta ${S.precioSabado}.</span>` : '';

    boxSlots.innerHTML = notaSab + franjas.map(h => {
      const pasada = esHoy && h <= ahora.toTimeString().slice(0, 5);
      const libre  = !chocaCon(h) && !pasada;
      return `<button type="button" class="slot" data-h="${h}" ${libre ? '' : 'disabled'}>${h}</button>`;
    }).join('');

    if (!$$('.slot:not([disabled])', boxSlots).length) {
      boxSlots.insertAdjacentHTML('beforeend',
        '<span class="slots__empty">No quedan horas libres ese día.</span>');
    }

    $$('.slot', boxSlots).forEach(b => b.addEventListener('click', () => {
      $$('.slot', boxSlots).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      horaElegida = b.dataset.h;
      actualizarWa();
    }));

    // En móvil, acerca las horas recién cargadas
    if (innerWidth <= 760) boxSlots.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  inpFecha.addEventListener('change', pintarSlots);

  /* --- Datos del formulario --- */
  function datos() {
    return {
      nombre:   $('#f-nombre').value.trim(),
      telefono: $('#f-tel').value.trim(),
      email:    $('#f-email').value.trim(),
      servicio: selServicio.value,
      fecha:    inpFecha.value,
      hora:     horaElegida,
      notas:    $('#f-notas').value.trim(),
      consent:  $('#f-consent').checked
    };
  }

  function textoWa(d) {
    const partes = [
      'Hola Alejandro, me gustaría pedir cita.',
      d.nombre   ? `Nombre: ${d.nombre}`            : '',
      d.telefono ? `Teléfono: ${d.telefono}`        : '',
      d.servicio ? `Servicio: ${d.servicio}`        : '',
      d.fecha    ? `Día: ${fechaLarga(d.fecha)}`    : '',
      d.hora     ? `Hora: ${d.hora}`                : '',
      d.notas    ? `Motivo: ${d.notas}`             : ''
    ].filter(Boolean);
    return partes.join('\n');
  }
  function actualizarWa() {
    btnWa.href = waBase + '?text=' + encodeURIComponent(textoWa(datos()));
  }
  form.addEventListener('input', actualizarWa);
  actualizarWa();

  function fechaLarga(f) {
    return new Date(f + 'T12:00:00')
      .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* --- Envío --- */
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    limpiarAviso();
    const d = datos();

    if (!d.nombre || !d.telefono)  return aviso('Necesito tu nombre y un teléfono de contacto.', 'err');
    if (!d.servicio)               return aviso('Elige el servicio que quieres reservar.', 'err');
    if (!d.fecha || !d.hora)       return aviso('Selecciona un día y una hora disponible.', 'err');
    if (!d.consent)                return aviso('Marca la casilla de política de privacidad para enviar la solicitud.', 'err');

    if (!DB.activo) {
      aviso('Este sitio aún no tiene la agenda online conectada. Pulsa <b>Enviar por WhatsApp</b> y me llega tu solicitud al instante.', 'info');
      actualizarWa();
      return;
    }

    btnEnviar.disabled = true;
    const textoOriginal = btnEnviar.textContent;
    btnEnviar.textContent = 'Enviando…';
    try {
      const r = await DB.solicitarCita(d);
      if (r && r.ok === false) {
        aviso(r.mensaje || 'Esa hora acaba de ocuparse. Elige otra, por favor.', 'err');
        pintarSlots();
      } else {
        aviso(`¡Solicitud recibida! Te escribiré para confirmar la cita del <b>${fechaLarga(d.fecha)} a las ${d.hora}</b>.`, 'ok');
        form.reset();
        aplicarConsentimiento();
        boxSlots.innerHTML = '<span class="slots__empty">Elige primero un día.</span>';
        horaElegida = '';
      }
    } catch (e) {
      console.error(e);
      aviso('No he podido guardar la solicitud. Inténtalo de nuevo o escríbeme por WhatsApp.', 'err');
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = textoOriginal;
    }
  });
})();

/* ============================================================
   CONFIGURACIÓN DEL SITIO  —  edita SOLO este archivo
   ------------------------------------------------------------
   Todos los datos de contacto, horarios, servicios y precios
   se leen desde aquí. No hace falta tocar el HTML.
   ============================================================ */

window.SITE = {
  /* --- Identidad ------------------------------------------- */
  nombre: "Alejandro Ruiz",
  claim: "Acupuntura y Osteopatía",
  ciudad: "Irún",

  /* --- Contacto -------------------------------------------- */
  telefono: "+34 664 49 38 38",
  telefonoLink: "+34664493838",          // sin espacios, para tel:
  whatsapp: "34664493838",               // solo dígitos con prefijo país
  email: "Ruiz.alexdominguez@gmail.com",
  direccion: "Calle Juan Arana nº 8, bajo 8",
  codigoPostal: "20302 Irún (Gipuzkoa)",
  mapsQuery: "Calle Juan Arana 8, Irún, Gipuzkoa",
  instagram: "",                         // p.ej. "alejandroruiz.salud" ("" = oculto)

  /* --- Horario --------------------------------------------- */
  horario: [
    { dias: "Lunes a viernes", horas: "10:00 – 13:30 · 15:00 – 19:30" },
    { dias: "Sábado",          horas: "Consultar en clínica" },
    { dias: "Domingo",         horas: "Cerrado" }
  ],

  /* Franjas reservables online por día de la semana (0 = domingo).
     Sesiones de 1 hora. Los sábados se consultan directamente en
     clínica, por eso no se ofrecen horas online.                */
  franjas: {
    1: ["10:00","11:00","12:00","15:00","16:00","17:00","18:00"],
    2: ["10:00","11:00","12:00","15:00","16:00","17:00","18:00"],
    3: ["10:00","11:00","12:00","15:00","16:00","17:00","18:00"],
    4: ["10:00","11:00","12:00","15:00","16:00","17:00","18:00"],
    5: ["10:00","11:00","12:00","15:00","16:00","17:00","18:00"],
    6: [],
    0: []
  },

  /* Días cerrados fijos (vacaciones, festivos) YYYY-MM-DD.
     Para cierres puntuales usa el panel "Bloqueos" de la agenda. */
  cerrado: ["2026-12-25", "2027-01-01"],

  /* Cuántos días vista se pueden reservar */
  diasReservables: 45,

  /* --- Servicios ------------------------------------------- */
  servicios: [
    {
      id: "sesion",
      titulo: "Sesión de acupuntura y osteopatía",
      duracion: "1 hora",
      precio: "45 €",
      resumen: "Una sola tarifa para todo. En consulta decidimos juntos qué necesitas ese día.",
      detalle: [
        "Acupuntura, osteopatía, terapia manual",
        "Se combinan según lo que pida el cuerpo ese día",
        "Incluye valoración y pautas para casa"
      ]
    },
    {
      id: "presoterapia",
      titulo: "Presoterapia",
      duracion: "Sesión suelta",
      precio: "15 €",
      resumen: "Compresión secuencial en piernas para aligerar la sensación de pesadez, la retención de líquidos y la fatiga muscular.",
      detalle: [
        "Se puede añadir a una sesión o reservarse sola",
        "Muy indicada después del deporte",
        "También disponible en bono de 10 sesiones"
      ]
    },
    {
      id: "presoterapia-bono",
      titulo: "Bono de 10 sesiones de presoterapia",
      duracion: "10 sesiones",
      precio: "130 €",
      resumen: "El bono completo de presoterapia, con un ahorro de 20 € sobre el precio por sesión suelta.",
      detalle: [
        "Sin caducidad marcada: se usan a tu ritmo",
        "Se abona en la primera sesión del bono",
        "Reserva cada sesión como cualquier otra cita"
      ]
    },
    {
      id: "distancia",
      titulo: "Acupuntura bioenergética a distancia",
      duracion: "15 – 20 min",
      precio: "30 €",
      resumen: "Sesión a distancia, sin desplazarte. Se coordina y se realiza previo contacto por WhatsApp.",
      detalle: [
        "No requiere presencia en la clínica",
        "Se acuerda día y hora directamente por WhatsApp",
        "Indicada para seguimiento entre sesiones presenciales"
      ],
      /* Este servicio no se reserva por el calendario: abre WhatsApp */
      soloWhatsapp: true
    }
  ],

  /* --- Motivos de consulta frecuentes ---------------------- */
  motivos: [
    "Dolor de espalda y cuello", "Ciática y lumbalgia", "Migrañas y cefaleas",
    "Ansiedad y estrés", "Insomnio", "Bruxismo", "Mareos y vértigos",
    "Salud ginecológica", "Lesiones deportivas", "Digestiones lentas",
    "Dolor articular", "Recuperación postparto"
  ],

  /* --- Salud ginecológica ---------------------------------- */
  /* Texto redactado por Alejandro. Se incluye dentro de la sesión
     habitual de 45 €: no es un servicio con tarifa aparte.        */
  ginecologia: {
    titulo: "Un acompañamiento respetuoso en cada etapa de la vida de la mujer",
    intro: [
      "El cuerpo femenino atraviesa numerosos cambios a lo largo de la vida. El ciclo menstrual, la fertilidad, el embarazo, el posparto, la perimenopausia y la menopausia pueden venir acompañados de molestias y desequilibrios que afectan al bienestar físico y emocional.",
      "Desde la acupuntura y la osteopatía, ofrecemos un acompañamiento individualizado orientado a mejorar el bienestar y favorecer una mayor conexión con el propio cuerpo."
    ],
    entradilla: "Podemos acompañarte, entre otros, en procesos relacionados con:",
    items: [
      { titulo: "Ciclo menstrual",
        texto: "Dolor, tensión y molestias asociadas al ciclo." },
      { titulo: "Síndrome premenstrual",
        texto: "Acompañamiento de síntomas físicos y emocionales." },
      { titulo: "Dolor y tensión pélvica",
        texto: "Valoración y trabajo corporal adaptado a cada caso." },
      { titulo: "Fertilidad",
        texto: "Acompañamiento y cuidado durante los procesos de búsqueda de embarazo, como complemento al seguimiento médico." },
      { titulo: "Perimenopausia y menopausia",
        texto: "Acompañamiento de los cambios y síntomas que pueden aparecer durante esta transición." },
      { titulo: "Endometriosis",
        texto: "Como acompañamiento del dolor, la tensión pélvica y el bienestar general, junto con el seguimiento médico correspondiente." }
    ],
    cierre: "Nuestro objetivo es ofrecerte un espacio donde puedas sentirte escuchada, comprendida y acompañada. Combinamos diferentes técnicas según tus necesidades, respetando siempre tu momento vital."
  },

  /* --- Testimonios ----------------------------------------- */
  /* PENDIENTE: sustituir por reseñas reales. Mientras la lista
     esté vacía, la sección no se muestra.                      */
  testimonios: [],

  /* --- Política de cancelación ----------------------------- */
  cancelacion: {
    horasMinimas: 24,
    penalizacion: "20 €"
  },

  /* --- Base de datos de citas (Supabase) -------------------- */
  /* Déjalo vacío y el formulario enviará la solicitud por
     WhatsApp. Rellénalo y las citas se guardarán en la agenda.
     Instrucciones completas en README.md                       */
  supabase: {
    url: "https://wiunehtdowqeygphwwjs.supabase.co",
    /* Clave PUBLICABLE. Es pública por diseño: solo dice "soy un visitante
       anónimo". Lo que puede hacer un visitante lo deciden las políticas RLS
       de supabase/schema.sql, no esta clave.
       NUNCA pongas aquí la clave secreta (sb_secret_... / service_role). */
    anonKey: "sb_publishable_WqcY6q43qQBn47AggGHIlw_2L_SqxgE"
  }
};

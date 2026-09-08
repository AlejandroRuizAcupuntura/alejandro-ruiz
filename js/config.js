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
    { dias: "Lunes a viernes", horas: "10:00 – 13:30 · 15:00 – 19:45" },
    { dias: "Sábado",          horas: "10:00 – 13:30" },
    { dias: "Domingo",         horas: "Cerrado" }
  ],

  /* Duración de la sesión y descanso entre pacientes.
     60 + 15 = 75 min de separación entre dos citas: si una es de
     10:00 a 11:00, la siguiente empieza a las 11:15.             */
  duracionMin: 60,
  separacionMin: 15,

  /* Franjas reservables online por día de la semana (0 = domingo).
     Van de 75 en 75 minutos para respetar el descanso.
     Mañana  10:00 → 13:30 · Tarde 15:00 → 19:45
     La última sesión empieza a las 18:45 y termina a las 19:45.
     Sábados: solo mañana, 10:00 → 13:30 (tarifa distinta).       */
  franjas: {
    1: ["10:00","11:15","12:30","15:00","16:15","17:30","18:45"],
    2: ["10:00","11:15","12:30","15:00","16:15","17:30","18:45"],
    3: ["10:00","11:15","12:30","15:00","16:15","17:30","18:45"],
    4: ["10:00","11:15","12:30","15:00","16:15","17:30","18:45"],
    5: ["10:00","11:15","12:30","15:00","16:15","17:30","18:45"],
    6: ["10:00","11:15","12:30"],
    0: []
  },

  /* Días cerrados fijos (vacaciones, festivos) YYYY-MM-DD.
     Para cierres puntuales usa el panel "Bloqueos" de la agenda. */
  cerrado: ["2026-12-25", "2027-01-01"],

  /* Cuántos días vista se pueden reservar */
  diasReservables: 45,

  /* Recargo de sábado: la sesión tiene otro precio ese día.
     Pon "" para que no aparezca ningún aviso de sábado.          */
  precioSabado: "55 €",

  /* --- Servicios ------------------------------------------- */
  servicios: [
    {
      id: "sesion",
      titulo: "Sesión de acupuntura y osteopatía",
      duracion: "1 hora",
      precio: "45 €",
      resumen: "Una sola tarifa para todo. En consulta decidimos juntos qué necesitas ese día.",
      detalle: [
        "Acupuntura, osteopatía",
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

  /* --- Sobre mí -------------------------------------------- */
  /* Texto y formación redactados por Alejandro. */
  sobreMi: {
    titulo: "Un camino de formación, aprendizaje y dedicación al cuidado del cuerpo",
    intro: [
      "Mi trayectoria profesional nace de la inquietud por comprender el cuerpo de una manera global y por seguir aprendiendo constantemente nuevas herramientas que puedan ayudar a mejorar el bienestar, la movilidad y la recuperación.",
      "A lo largo de los años he ido complementando mi formación en diferentes disciplinas, comenzando por el masaje y avanzando hacia la osteopatía, la Medicina Tradicional China y distintas especializaciones dentro de la acupuntura.",
      "Esta evolución me permite disponer de diferentes recursos y adaptar cada sesión a las necesidades particulares de cada persona."
    ],
    formacion: [
      { anios: "2019 – 2020", titulo: "Quiromasaje",
        centro: "Escuela de Masaje Lukai, San Sebastián", texto: "" },
      { anios: "2020 – 2021", titulo: "Masaje Superior y del Deporte",
        centro: "Escuela de Masaje Lukai, San Sebastián",
        texto: "Formación especializada en masaje aplicado al ámbito deportivo, profundizando en el trabajo de la musculatura y en las necesidades de las personas físicamente activas." },
      { anios: "2021 – 2023", titulo: "Osteopatía Estructural y Periférica",
        centro: "Escuela de Masaje Lukai, San Sebastián",
        texto: "Formación en osteopatía estructural y periférica, ampliando mis conocimientos sobre el sistema musculoesquelético y el abordaje manual del cuerpo desde una perspectiva global." },
      { anios: "2024 – 2026", titulo: "Medicina Tradicional China",
        centro: "Jason Smith MTC, Madrid",
        texto: "Formación de dos años en el ámbito de la Medicina Tradicional China. Formación avalada por COFENAT." },
      { anios: "2025", titulo: "Acupuntura para el Dolor",
        centro: "La danza de la sabiduría, Madrid",
        texto: "Especialización en acupuntura orientada al abordaje del dolor, incorporando nuevas herramientas dentro de mi práctica." },
      { anios: "2025", titulo: "Neuromodulación Percutánea",
        centro: "La danza de la sabiduría, Madrid",
        texto: "Formación específica en neuromodulación percutánea." },
      { anios: "2026", titulo: "Acupuntura Umbilical",
        centro: "La danza de la sabiduría, Madrid",
        texto: "Formación especializada en acupuntura umbilical." },
      { anios: "2026", titulo: "Acupuntura de Muñecas y Tobillos",
        centro: "La danza de la sabiduría, Madrid",
        texto: "Formación específica en esta técnica de acupuntura." },
      { anios: "2026", titulo: "Acupuntura Tung",
        centro: "La danza de la sabiduría, Madrid",
        texto: "Formación especializada en Acupuntura Tung, ampliando mis conocimientos dentro de las técnicas de acupuntura." },
      { anios: "2026", titulo: "Acupuntura Bioenergética",
        centro: "La danza de la sabiduría, Madrid", texto: "" }
    ],
    continua: {
      titulo: "Una formación que continúa",
      parrafos: [
        "Para mí, la formación no termina con un título o un certificado. Seguir aprendiendo es una parte esencial de mi profesión.",
        "Cada nueva formación me permite ampliar conocimientos, descubrir diferentes enfoques y disponer de más herramientas para valorar y acompañar a cada persona de manera individualizada.",
        "Mi forma de trabajar busca combinar la experiencia adquirida en quiromasaje, masaje deportivo, osteopatía, Medicina Tradicional China y acupuntura, siempre desde una atención cercana, profesional y adaptada a cada caso."
      ]
    },
    objetivo: {
      titulo: "Mi objetivo",
      parrafos: [
        "Crear un espacio en el que puedas sentirte escuchado, comprendido y acompañado, dedicando a cada persona el tiempo necesario para conocer sus necesidades y encontrar el enfoque más adecuado.",
        "Porque cada cuerpo es diferente y cada persona necesita ser tratada como tal."
      ]
    }
  },

  /* --- Salud ginecológica ---------------------------------- */
  /* Texto redactado por Alejandro. Se incluye dentro de la sesión
     habitual de 45 €: no es un servicio con tarifa aparte.        */
  ginecologia: {
    titulo: "Un acompañamiento respetuoso en cada etapa de la vida de la mujer",
    intro: [
      "El cuerpo femenino atraviesa numerosos cambios a lo largo de la vida. El ciclo menstrual, la fertilidad, el embarazo, el posparto, la perimenopausia y la menopausia pueden venir acompañados de molestias y desequilibrios que afectan al bienestar físico y emocional.",
      "Desde la acupuntura y la osteopatía, ofrezco un acompañamiento individualizado orientado a mejorar el bienestar y favorecer una mayor conexión con el propio cuerpo."
    ],
    entradilla: "Puedo acompañarte, entre otros, en procesos relacionados con:",
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
    cierre: "Mi objetivo es ofrecerte un espacio donde puedas sentirte escuchada, comprendida y acompañada. Combino diferentes técnicas según tus necesidades, respetando siempre tu momento vital.",
    /* No es un servicio aparte: entra en la sesión habitual. */
    nota: "Todo ello dentro de la sesión habitual de 1 hora."
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

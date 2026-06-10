/* ============================================================
   content.js — guion del juego, organizado como mapa de escenas.
   ============================================================ */

const Content = (() => {

  // ---- helpers ----
  const speaker = (name, line) =>
    `<span class="speaker">${name}:</span> «${line}»`;
  const em = (s) => `<span class="em">${s}</span>`;

  // Audio logs de Voss en la sala de servidores. Se eligen sin repetir
  // hasta agotarlos; luego pueden volver con menor impacto en cordura.
  const AUDIO_LOGS = [
    { id: 11, text:
      "—Log once. Día veinticuatro. Los sujetos colaboran. Comen lo que se les da. Responden a sus nombres. La presunción inicial de que se les podría llamar por número desde el ingreso ha sido un error operativo: los nombres facilitan el cumplimiento. Continuamos.—" },
    { id: 18, text:
      "—Log dieciocho. Día cincuenta y dos. Sujeto siete ha mostrado un episodio agresivo durante la sesión de medición de la mañana. Fue contenido en cuarenta segundos. El equipo registra el evento como aislado. Yo lo registro como predicho. El compuesto está empezando a abrir un hueco en el sistema límbico. Continuamos.—" },
    { id: 27, text:
      "—Log veintisiete. Día sesenta y ocho. Solicité a Ginebra un equipo de contención completa. Solicitud denegada. Argumentan costo. Argumentan visibilidad. Argumentan que el cronograma con los tres clientes es inamovible. Continuamos sin red de seguridad.—" },
    { id: 32, text:
      "—Log treinta y dos. Día setenta y cuatro. Sujeto cuatro ha desarrollado tolerancia significativa al dolor. Esta mañana, durante la sesión de evaluación, perdió tres dedos sin alterar su patrón respiratorio. El equipo médico aplaude. Yo no aplaudo porque sé que la tolerancia al dolor es solo la primera señal de que el sistema límbico está colapsando, no la prueba de que el compuesto funciona. Continuamos.—" },
    { id: 33, text:
      "—Log treinta y tres. Sujeto cuatro ha matado al sujeto seis durante el descanso de la noche. Sin provocación registrada. El sujeto seis no era amenaza. El sujeto seis estaba dormido. Anotación para Ginebra: el compuesto está produciendo agresión espontánea por encima del umbral previsible. Tres clientes preguntan por avances. Respondemos avances.—" },
    { id: 38, text:
      "—Log treinta y ocho. Día ochenta y nueve. El jefe de mantenimiento del nivel cuatro solicitó evacuar a sus catorce subordinados. Dijo que los sujetos están aprendiendo a abrir cerraduras electromecánicas. Le respondí que iba a evaluar el riesgo y comunicar mi decisión en setenta y dos horas. Setenta y dos horas son cuatro turnos completos. Que conste.—" },
    { id: 42, text:
      "—Log cuarenta y dos. Día noventa y siete. Sujeto siete presenta cambios físicos profundos. La piel se ha oscurecido en patrones que no son consistentes con melanización. La estatura aparente ha aumentado entre cinco y siete centímetros. La fuerza es estimable, no medible: rompió un barrote de jaula al apoyarse. No estaba intentando salir. Continuamos.—" },
    { id: 45, text:
      "—Log cuarenta y cinco. Día ciento dos. Anoche evacué. Tomé el ascensor de carga con el disco de respaldo y dos botellas de agua. Los sujetos están sueltos. Algunos técnicos están con ellos, en estado de no-respuesta similar. Cierro la estación detrás de mí. Voy a recomendar a NEXUM que la isla quede registrada como pérdida total. La investigación seguirá. La investigación tiene que seguir. Es lo que justifica.—" },
  ];

  // Decide qué final aplicar en función del estado completo de Daniel.
  function decideEnding(s) {
    // forzados ya cubiertos en otra parte (death_health, ending_bad_1)
    if (s.flags.walkedAway) return "bad_2";
    if (s.flags.signaledRescue) {
      if (s.flags.hasArchives) {
        if (s.infected) {
          return s.flags.antidoteTaken ? "rare" : "bad_2";
        }
        if (s.resources.sanity >= 15) return "good";
        return "neutral";
      }
      return "neutral";
    }
    return "neutral";
  }

  // ---------------- ESCENAS ----------------
  const scenes = {

    // ============================================================
    // PRÓLOGO — El crucero Arca Dorada
    // ============================================================
    "prologo_apertura": {
      act: 0,
      audio: { stop: true, rain: 0.25 },
      text: [
        "La lluvia golpea el cristal del bar como si quisiera entrar. No el aguacero ruidoso del trópico, sino esa lluvia fina y obstinada que cuela a través de cualquier ropa y se queda.",
        "Daniel Mora está sentado en la barra del Arca Dorada, frente a su segundo ron del día y una nota arrugada en el bolsillo derecho. La nota dice " + em("para que vengas") + ". La letra es de Héctor, su padre. El viejo está muerto desde hace tres semanas y, sin embargo, sigue sin saber explicarse.",
        "El bar huele a madera vieja, a cuero, y al perfume caro de gente que viaja a Manila por razones que cualquiera consideraría legítimas. Daniel sabe que él no es esa clase de gente.",
        "Afuera, el Pacífico está negro."
      ],
      choices: [
        { text: "Pedir otro ron.", goto: "prologo_otro_ron",
          apply: (s) => { s.flags.bebioDeMas = true; },
          diary: "Otro ron. No por sed. Por el ruido en la cabeza." },
        { text: "Quedarse con el vaso a medio terminar y mirar la lluvia.",
          goto: "prologo_otro_ron",
          diary: "El segundo ron sabe a desperdicio. Hace tres semanas no he tenido un día sin tomar." },
      ],
    },

    "prologo_otro_ron": {
      act: 0,
      text: [
        "Un golpe seco en el banco de al lado. Una mujer se sienta sin pedir permiso, deja una cámara pesada sobre la barra y se aparta el pelo mojado de la cara como si el gesto le costara más esfuerzo del que admite.",
        speaker("Mujer", "¿Te importa? Todos los demás banquetas están ocupadas por hombres que claramente quieren hablar conmigo."),
        "Daniel encoge un hombro. No es una respuesta. Ella la acepta como una.",
        speaker("Mujer", "Sofía. Sofía Reyes. Y antes de que preguntes, sí, la cámara es analógica y sí, sigo cargando rollos como si el siglo XXI no hubiera pasado."),
        "Pide un whisky. El cantinero se lo sirve sin preguntar la marca, como si ya supiera la respuesta. Sofía gira la cámara hacia Daniel un segundo, como midiéndolo, y la baja sin disparar.",
      ],
      next: "prologo_sofia",
    },

    "prologo_sofia": {
      act: 0,
      text: [
        speaker("Sofía", "Tú no estás de vacaciones. No tienes esa cara."),
        speaker("Daniel", "Estoy yendo a Filipinas. Mi padre vivió allá."),
        speaker("Sofía", "¿Vivió?"),
        speaker("Daniel", "Hace tres semanas."),
        "Ella asiente. No dice " + em("lo siento") + " porque ya supone que Daniel ha escuchado " + em("lo siento") + " demasiadas veces y de gente que ni lo conocía.",
        speaker("Sofía", "Yo estoy aquí porque cancelé estas vacaciones cuatro veces. Me prometí que la quinta no. Llevo veinte minutos arriba del barco y ya estoy pensando en qué tengo que hacer cuando vuelva."),
        "Levanta el whisky, golpea suave el de Daniel.",
        speaker("Sofía", "Por las cosas que no podemos terminar."),
      ],
      choices: [
        { text: "Brindar.",
          goto: "prologo_andres",
          apply: (s) => { s.resources.sanity = Math.min(100, s.resources.sanity + 2); },
          diary: "Brindé con una desconocida. La primera vez en tres meses que sostengo un vaso por una razón que no es solo el vaso." },
        { text: "Quedarse en silencio.",
          goto: "prologo_andres",
          apply: (s) => { s.flags.frioConSofia = true; },
          diary: "No brindé. Ni sé por qué. Algo en mí se cerró otra vez." },
      ],
    },

    "prologo_andres": {
      act: 0,
      text: [
        "Otro pasajero se acerca, demasiado alegre para la hora y para el clima. Veintiocho años. Camisa todavía bien planchada de alguien que sí cree en plancharse para tomar un avión y un crucero.",
        speaker("Hombre joven", "¡Maestro! ¡Disculpe! ¿Esta es la línea para el bar o para presentarse a sí mismo a desconocidos? Porque yo necesito ambas cosas."),
        "Se ríe de su propio chiste. Sofía sonríe sin mirarlo. Daniel no sonríe pero tampoco le incomoda. El chico extiende la mano.",
        speaker("Andrés", "Andrés Campos. Mañana cierro el contrato más grande de mi empresa allá en Manila. O mañana me hago caca encima. Una de las dos."),
        "Andrés tiene en la muñeca izquierda una pulsera de cuero trenzado, gastada, que claramente lleva años puesta. La toca un par de veces sin darse cuenta, como quien revisa que algo importante sigue en su sitio.",
        speaker("Andrés", "Mi hermana me la regaló cuando la empresa tuvo su primer cliente. Valeria. Le dije que iba a usar este viaje para descansar. No le dije que aún estaba estresado."),
      ],
      choices: [
        { text: "Preguntarle por la empresa.",
          goto: "prologo_camila",
          apply: (s) => { s.flags.recuerdaPulsera = true; },
          diary: "Andrés tiene la energía de alguien que todavía cree que las cosas se pueden construir. Le envidio un poco. La pulsera de su hermana parece importante para él." },
        { text: "Asentir y mirar el vaso.",
          goto: "prologo_camila",
          diary: "El chico habla mucho. No quise interrumpirlo. Tampoco escuché lo que decía." },
      ],
    },

    "prologo_camila": {
      act: 0,
      text: [
        "Una mujer joven, de unos veintidós, deja un libro de medicina sobre la mesa contigua y pide un café. Lleva el pelo recogido con un lápiz. Andrés le ofrece silla con un gesto demasiado teatral.",
        speaker("Camila", "Gracias, prefiero estar sola un rato."),
        "Lo dice sin hostilidad. Es de las personas que pueden decir " + em("no") + " sin que duela. Daniel piensa, sin quererlo, que ojalá Elena hubiera podido decir las cosas así.",
        "Camila abre el libro: " + em("Manejo de urgencias en el adulto crítico") + ". Pasa páginas como si las hubiera leído ya cuatro veces. Cuando levanta la vista, mira a Daniel a los ojos un segundo y vuelve al libro.",
        "Más tarde, sin que Daniel se dé cuenta de cuándo se acercó, está parada al lado suyo.",
        speaker("Camila", "Perdón. Es feo lo que voy a preguntar. ¿Hace cuánto que perdiste a alguien?"),
      ],
      choices: [
        { text: "«Mi padre. Hace tres semanas.»",
          goto: "prologo_camila_2",
          diary: "Camila preguntó como si supiera. Le dije lo de mi padre. No pensé en Elena. No pensé en Mateo. Algo se aflojó." },
        { text: "«No quiero hablar de eso.»",
          goto: "prologo_camila_2",
          apply: (s) => { s.flags.cerradoCamila = true; s.resources.sanity = Math.max(0, s.resources.sanity - 2); },
          diary: "No quise hablar. Ella asintió. No insistió. Y por dentro algo se cerró más fuerte de lo que pensaba." },
      ],
    },

    "prologo_camila_2": {
      act: 0,
      text: [
        "Camila no consuela. No dice " + em("estará en un lugar mejor") + ", ni " + em("el tiempo lo cura") + ". Le pregunta qué recuerda de él. Le pregunta si lo extraña, o si extraña la idea de extrañarlo, que no es lo mismo.",
        "Daniel se queda mudo un momento. Es el único momento del viaje, hasta entonces, en que alguien le ha hecho una pregunta a la que no sabe responder rápido.",
        speaker("Camila", "Voy a ver a mis abuelos en Manila. Mi abuelo tiene Alzheimer. Cada vez que voy hay un poco menos de él. Aprendí a no esperar que me reconozca. Pero todavía espero que me mire."),
        "Vuelve a su mesa. No vuelve a hablar con Daniel esa noche.",
      ],
      next: "prologo_ernesto",
    },

    "prologo_ernesto": {
      act: 0,
      text: [
        "El bar se va vaciando. Solo queda un viejo en una mesa del rincón, con un café delante y un sobre cerrado a su lado que no ha abierto en toda la noche. Cuando Daniel pasa hacia el baño, el viejo lo detiene con la mano.",
        speaker("Hombre mayor", "Hijo. Si esto se mueve mucho, los chalecos están en los compartimentos amarillos del nivel cuatro. La radio de emergencia opera en la frecuencia ciento cincuenta y seis ocho. Por las dudas."),
        "Daniel lo mira. El viejo se ríe de su propia cara.",
        speaker("Don Ernesto", "Treinta y dos años en barcos. Disculpa la manía. Don Ernesto Fuentes, ingeniero naval, retirado. Voy a un funeral. No es el mío."),
        "Daniel se sienta sin pedir permiso. El viejo habla del Pacífico como otros hablan de un perro al que conocen mal: con cariño y desconfianza. Le explica, sin que nadie le pida nada, cómo se lee la dirección del viento por la espuma, cómo se distingue una tormenta tropical de un frente normal, dónde están los botes salvavidas en este crucero específicamente.",
        speaker("Don Ernesto", "No te lo digo porque vaya a pasar nada. Te lo digo porque toda mi vida fue saber dónde están las cosas por si acaso. Es lo único que sé hacer."),
      ],
      choices: [
        { text: "Memorizar lo que le dice.",
          goto: "prologo_beto",
          apply: (s) => { s.flags.aprendioErnesto = true; s.resources.sanity = Math.min(100, s.resources.sanity + 3); },
          diary: "Don Ernesto sabe del mar como mi padre nunca supo de mí. Le presté atención. Frecuencia ciento cincuenta y seis ocho. Compartimentos amarillos en el nivel cuatro." },
        { text: "Asentir sin escuchar de verdad.",
          goto: "prologo_beto",
          diary: "El viejo me habló de barcos. Yo pensaba en otra cosa. No recuerdo qué dijo exactamente." },
      ],
    },

    "prologo_beto": {
      act: 0,
      text: [
        "Cuando Daniel vuelve a la barra, hay un quinto desconocido haciendo amistad con el cantinero, dos meseros, y una pareja en luna de miel que no había hablado con nadie hasta ese momento. Cuarenta y cinco años, panza honesta, voz alta, esa risa de quien no tiene miedo a sonar feo cuando se ríe.",
        speaker("Hombre", "¡Daniel! Eso me dijo el cantinero. Daniel, mira, yo soy Roberto Sandoval, dime Beto. Vendedor. Vendo material de construcción. ¿Sabes la diferencia entre un ladrillo bueno y uno malo?"),
        "No espera la respuesta. Saca de una bolsa de tela una botella de ron de reserva, etiqueta de un sello que Daniel no reconoce, y la pone en la barra como quien deja un trofeo.",
        speaker("Beto", "Esta la abrí para venderme a mí mismo a los proveedores de Manila. Pero esta noche está lloviendo y tú tienes cara de necesitarla más que ellos."),
        "Sirve dos vasos antes de que nadie le diga que sí. Le pone uno delante a Daniel.",
        speaker("Beto", "Por los que no estamos donde queremos estar."),
      ],
      choices: [
        { text: "Aceptar el trago de Beto.",
          goto: "prologo_brindis",
          apply: (s) => { s.flags.brindóConBeto = true; s.resources.sanity = Math.min(100, s.resources.sanity + 3); },
          diary: "Brindé con Beto. No conozco a este hombre y sin embargo brindé. Hay algo en su forma de invitar que no permite el no." },
        { text: "Rechazar el trago educadamente.",
          goto: "prologo_brindis",
          apply: (s) => { s.flags.rechazoBeto = true; },
          diary: "Le dije que no. Beto se rio y dijo que respetaba. Pero por dentro yo me sentí más solo que antes." },
      ],
    },

    "prologo_brindis": {
      act: 0,
      text: [
        "Más tarde, Daniel no va a estar seguro de cuándo empezó a llover más fuerte ni cuándo el bar quedó vacío de los demás. Se acuerda de Sofía levantándose y diciendo " + em("voy a fotografiar la tormenta") + ". Se acuerda de Andrés explicando un truco con cartas. De Camila volviendo a su libro. De Don Ernesto mirando por la ventana como si esperara algo.",
        "Y se acuerda del momento en que el barco se inclinó por primera vez de una manera que no era la habitual.",
        "No fue un golpe brusco. Fue un… cambio. Como si el mar hubiera decidido algo.",
        em("Y por debajo del casco, algo se movió.")
      ],
      audio: { rain: 0.5, wind: 0.3 },
      next: "prologo_naufragio",
    },

    "prologo_naufragio": {
      act: 0,
      audio: { rain: 0.7, wind: 0.5 },
      text: [
        "Lo siguiente que Daniel registra con claridad es una alarma que no termina de empezar bien: chilla, se corta, vuelve. Las luces parpadean. El bar se vacía. Alguien grita una palabra que él no entiende.",
        "Una grieta enorme cruza el suelo bajo sus pies sin que la pueda explicar. El agua sube por los pasillos no como una ola, sino como si el barco mismo estuviera respirando hacia adentro.",
        "Hay una mano que lo agarra del brazo. No sabe si es Sofía, Beto o un completo extraño. Lo arrastra hacia la cubierta. Hay luces blancas en el agua moviéndose en patrones que no son los de un crucero.",
        "Daniel se acuerda de un solo pensamiento claro antes del golpe que lo apaga:",
        em("Mateo nunca va a saber qué pasó esta noche."),
      ],
      choices: [
        { text: "[oscuridad]",
          goto: "act1_despertar",
          apply: (s) => {
            s.resources.sanity = Math.max(0, s.resources.sanity - 8);
            s.resources.health = Math.max(0, s.resources.health - 15);
          },
          diary: "El barco se hundió. No me ahogué. No sé si quería no ahogarme. Mateo. Mateo. Mateo." },
      ],
    },

    // ============================================================
    // ACTO 1 — La Orilla
    // ============================================================
    "act1_despertar": {
      act: 1,
      audio: { stop: true, wind: 0.35 },
      text: [
        "Lo primero es el frío del agua llegando hasta las rodillas. Lo segundo es la luz, gris azulada, demasiado limpia para ser real. Lo tercero es el sabor de la sal en los dientes.",
        "Daniel está boca arriba sobre la arena de una playa que no reconoce. Las nubes corren rápido. Una gaviota chilla y la gaviota suena demasiado real para todo esto.",
        "Tiene la ropa hecha pegote, las manos peladas, un dolor sordo en el costado izquierdo. Le falta un zapato. El reloj se le paró.",
        "Se incorpora despacio. La playa es larga y cerrada al fondo por una pared de vegetación tan espesa que parece pintada. Aquí y allá hay restos del Arca Dorada: una butaca de salón, una tabla con el logo, un chaleco salvavidas sin nadie dentro.",
        em("Y a tres metros de él, boca abajo sobre la arena mojada, hay un cuerpo.")
      ],
      next: "act1_sofia",
    },

    "act1_sofia": {
      act: 1,
      text: [
        "Es Sofía.",
        "Daniel lo sabe antes de acercarse. La camisa todavía con el cuello hacia arriba, el pelo todavía mojado pero ya no por la lluvia. La cámara analógica colgada al cuello, sucia de arena, intacta.",
        "Se arrodilla a su lado. La gira con cuidado, como si pudiera doler. La cara de Sofía está tranquila. No hay marcas. Es la peor parte: parece que solo está dormida y que va a abrir los ojos y a quejarse de la arena en el oído.",
        "No abre los ojos.",
        em("La cámara cuelga de su cuello como si ella todavía la sostuviera.")
      ],
      choices: [
        { text: "Tomar la cámara.",
          goto: "act1_post_sofia",
          apply: (s, E) => {
            E.addItem({
              id: "camara",
              name: "Cámara de Sofía",
              desc: "Analógica, sucia de arena, intacta. Tiene un rollo dentro.",
              removable: true,
            });
          },
          diary: "Tomé la cámara de Sofía. No sé si por culpa o por costumbre. La cargo como si la cargara ella." },
        { text: "Dejarla con Sofía y cubrirla con su chaqueta.",
          goto: "act1_post_sofia",
          apply: (s) => { s.flags.dejoCamara = true; s.resources.sanity = Math.max(0, s.resources.sanity - 4); },
          diary: "Dejé la cámara. La cubrí con su propia chaqueta. Pesa una decisión por nada. Pesa de todos modos." },
      ],
    },

    "act1_post_sofia": {
      act: 1,
      text: [
        "Daniel mira hacia el mar. El horizonte está limpio. No hay otro barco, no hay otra señal. La marea está bajando.",
        "Mira hacia la jungla. Es demasiado densa para entrar sin pensar. Algo se mueve adentro pero podría ser viento.",
        "Mira a lo largo de la playa: hacia el norte hay más restos del naufragio acumulándose contra unas rocas. Hacia el sur, lejos, hay una columna delgada de humo subiendo entre los árboles. Demasiado delgada para ser un incendio. Una fogata, quizás.",
        em("Y entonces, desde el borde de la jungla, alguien grita su nombre.")
      ],
      next: "act1_voz_beto",
    },

    "act1_voz_beto": {
      act: 1,
      audio: { wind: 0.4 },
      text: [
        "—¡Daniel! ¡Daniel, carajo, dime que eres tú!",
        "Es la voz de Beto. Más cansada que en el bar, pero es él. Viene del borde de la jungla, a unos cincuenta metros, donde un árbol caído parece haberle bloqueado el paso. Daniel no lo ve. Solo escucha.",
        "—¡Daniel! ¡Me jodí la pierna! No puedo caminar bien. ¡Si me escuchas, vente!",
        em("Y por un segundo, antes de decidir, Daniel se acuerda de que ayer brindó con este hombre por los que no estamos donde queremos estar.")
      ],
      choices: [
        { text: "Ir hacia la voz de Beto.",
          goto: "act1_con_beto",
          diary: "Voy hacia Beto. Es lo único que se parece a una decisión moral que voy a tomar en mucho tiempo." },
        { text: "Quedarse quieto y esperar a estar seguro.",
          goto: "act1_dudar_beto",
          apply: (s) => { s.flags.dudo = true; },
          diary: "Dudé. No fui inmediatamente. Por un momento pensé en qué pasa si no es él, si es una trampa, si es alguien herido que me va a hundir a mí también." },
        { text: "Ignorar la voz y caminar hacia el humo del sur.",
          goto: "act1_ignora_beto",
          apply: (s) => { s.flags.ignoroBeto = true; s.resources.sanity = Math.max(0, s.resources.sanity - 6); },
          diary: "No fui. Le di la espalda a la voz de un hombre que ayer me invitó a un trago. Me dije que no era él. Sé que era él." },
      ],
    },

    "act1_dudar_beto": {
      act: 1,
      text: [
        "La voz se repite, más débil.",
        "—¡Daniel! Estoy aquí, por favor.",
        "Daniel se pone de pie. La duda dura un segundo más de lo que debería durar. Por dentro escucha la voz de Elena diciendo lo que decía siempre cuando lo veía dudar: " + em("siempre te demoras un segundo de más en hacer lo correcto") + ".",
        "Camina hacia la voz.",
      ],
      next: "act1_con_beto",
    },

    "act1_con_beto": {
      act: 1,
      text: [
        "Beto está apoyado contra un tronco caído, con la pierna derecha torcida en un ángulo que no es natural. Está pálido pero entero. Cuando ve a Daniel, suelta una risa rota.",
        speaker("Beto", "Hijo de la… pensé que me iba a morir hablando solo en este bosque."),
        "Tiene un corte feo en la frente y la pierna claramente fracturada. No tiene chance de caminar rápido. Daniel se sienta a su lado. El silencio entre ellos es el silencio cómodo de dos personas que ayer brindaron sin conocerse.",
        speaker("Beto", "Sofía está muerta. La vi. Y a Andrés no lo encontré. ¿Tú la viste?"),
        speaker("Daniel", "La vi."),
        speaker("Beto", "Mierda."),
        "Beto cierra los ojos un momento.",
        speaker("Beto", "Daniel, escucha. Lo de mi pierna no es algo de un rato. Voy a tener que esperar a que pase la inflamación, o voy a tener que aceptar que esto es lo que es. Lo que no podemos hacer es quedarnos los dos sentados aquí esperando a que alguien venga, porque… no creo que venga nadie."),
      ],
      choices: [
        { text: "Quedarse con Beto hasta que se sienta capaz de moverse.",
          goto: "act1_quedarse_beto",
          diary: "Decido quedarme con Beto. No puedo dejar a otra persona sola hoy. Hoy no." },
        { text: "Seguir adelante, buscar ayuda, prometerle volver.",
          goto: "act1_dejar_beto",
          diary: "Le prometí a Beto que volvería. No sé si es una promesa que voy a poder cumplir. No sé si él me cree." },
      ],
    },

    "act1_quedarse_beto": {
      act: 1,
      audio: { wind: 0.35 },
      text: [
        "Pasan horas. Hablan poco. Beto le pregunta por Mateo. Daniel le habla de Mateo más de lo que le ha hablado a nadie en meses. Beto se ríe en los momentos correctos. Es bueno escuchando, este hombre.",
        "La luz empieza a cambiar. El bosque se llena de un ruido que no es viento.",
        "Daniel ve, entre los árboles, formas humanas que no se mueven como humanos. Tres, quizás cuatro. Beto las ve un segundo después que él. No dice nada. Toma a Daniel del brazo con la fuerza de alguien que sabe que solo va a poder hacer un gesto importante más en su vida.",
        speaker("Beto", "Daniel. Corre. No discutas. Corre. Y si llegas a alguna parte, acuérdate de mí cuando estés tomando ron."),
        em("Lo empuja. Daniel corre. Detrás suyo escucha la primera vez en su vida un grito humano que no termina como debería terminar.")
      ],
      choices: [
        { text: "(seguir corriendo)",
          goto: "act2_entrada",
          apply: (s) => {
            s.resources.health = Math.max(0, s.resources.health - 10);
            s.resources.sanity = Math.max(0, s.resources.sanity - 12);
            s.flags.betoMurióPorMí = true;
          },
          diary: "Beto está muerto. Me empujó para que corriera. No miré atrás. Voy a tener que vivir con que no miré atrás." },
      ],
    },

    "act1_dejar_beto": {
      act: 1,
      audio: { wind: 0.35 },
      text: [
        "Daniel se levanta. Beto asiente sin mirarlo.",
        speaker("Beto", "Vas con todo. Si no vuelves, está bien. De verdad."),
        speaker("Daniel", "Voy a volver."),
        speaker("Beto", "Sí, sí. Vete."),
        "Daniel se aleja. A los diez minutos escucha, lejos, un grito de Beto que no se parece a nada que haya escuchado antes. Se detiene. Se queda quieto. Vuelve a caminar.",
        em("No mira hacia atrás.")
      ],
      choices: [
        { text: "(seguir caminando)",
          goto: "act2_entrada",
          apply: (s) => {
            s.resources.sanity = Math.max(0, s.resources.sanity - 18);
            s.flags.dejóMorirBeto = true;
          },
          diary: "Lo escuché morir. Seguí caminando. No sé qué clase de persona soy hoy. No sé qué clase de persona era ayer tampoco." },
      ],
    },

    "act1_ignora_beto": {
      act: 1,
      audio: { wind: 0.4 },
      text: [
        "Daniel le da la espalda al sonido de su nombre. Camina hacia el sur, hacia la columna de humo. Cada paso es una decisión que repite la decisión anterior.",
        "El humo del sur no es lo que pensaba. Cuando se acerca, lo que arde es ropa amontonada y huesos. Una fogata que no fue hecha para cocinar comida.",
        em("Y por dentro Daniel ya sabe en qué clase de isla está antes de saberlo.")
      ],
      choices: [
        { text: "Entrar en la jungla.",
          goto: "act2_entrada",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 10); },
          diary: "No fui por Beto. Encontré algo peor por mi cuenta. Quizás esa es la justicia que me toca." },
      ],
    },

    // ============================================================
    // ACTO 2 — La Jungla
    // ============================================================
    "act2_entrada": {
      act: 2,
      audio: { stop: true, tension: 0.14, wind: 0.18 },
      text: [
        "La jungla se cierra detrás de Daniel antes de que tome la decisión de internarse. La luz se vuelve verde. No el verde de un parque: el verde de algo que come luz.",
        "El suelo es lodo blando entrelazado con raíces que no se ven hasta que se las pisa. El aire huele a tierra húmeda y a algo dulce que él no quiere identificar.",
        "Camina sin rumbo claro, guiándose por dónde se filtra más luz. A los veinte minutos encuentra un sendero. No es de animal. Las pisadas son largas, irregulares, demasiado profundas en algunos puntos. Alguien camina por aquí, descalzo o casi.",
        em("Sigue el sendero porque no tiene mejor opción.")
      ],
      next: "act2_canibal_aislado",
    },

    "act2_canibal_aislado": {
      act: 2,
      audio: { tension: 0.22 },
      text: [
        "El sendero se ensancha en un claro pequeño. Daniel oye antes de ver: un masticar lento, pegajoso, demasiado humano para ser de un animal.",
        "Se agacha detrás de un arbusto. A diez metros, de espaldas a él, hay una figura humana arrodillada sobre algo en el suelo. La piel está manchada de oscuro en patrones que no son tatuajes, que no son de luz ni de sombra. Se mueve raro, como si el aire pesara más para él.",
        "Está solo. Está distraído.",
        em("Y entre él y el sendero que sigue hacia el norte solo hay un trecho corto de hierba seca.")
      ],
      choices: [
        { text: "Esperar inmóvil hasta que se vaya.",
          goto: "act2_canibal_pasa",
          apply: (s) => {
            s.resources.sanity = Math.max(0, s.resources.sanity - 3);
            s.resources.food = Math.max(0, s.resources.food - 8);
          },
          diary: "Me quedé pegado al suelo durante un tiempo que no sé medir. Lo vi terminar lo que comía, levantarse, irse. Lo que comía era lo que yo no quiero pensar." },
        { text: "Rodearlo por la maleza, despacio.",
          goto: "act2_canibal_rodea",
          apply: (s) => { s.resources.food = Math.max(0, s.resources.food - 4); },
          diary: "Lo rodeé. No me vio. No giró la cabeza. No giró la cabeza, y sin embargo siento que sabía que yo estaba." },
        { text: "Cruzar el claro rápido, apostar a la velocidad.",
          goto: "act2_canibal_carrera",
          apply: (s) => {
            s.resources.health = Math.max(0, s.resources.health - 8);
            s.resources.sanity = Math.max(0, s.resources.sanity - 4);
          },
          diary: "Corrí. Me vio. Me persiguió un trecho corto. Perdió interés cuando me metí entre los árboles. O perdió interés. O me dejó ir." },
      ],
    },

    "act2_canibal_pasa": {
      act: 2,
      text: [
        "Cuando termina, se incorpora. Es alto. Más alto que un hombre. Se mueve hacia el norte sin prisa, como si el bosque fuera suyo. Daniel se queda quieto cinco minutos más. Las piernas le tiemblan no por miedo: por la postura.",
        em("Sale del arbusto despacio. El cielo se está poniendo color metálico.")
      ],
      next: "act2_camp_canibal",
    },

    "act2_canibal_rodea": {
      act: 2,
      text: [
        "Daniel se mueve agachado por la maleza. Cada rama que pisa suena más fuerte de lo que debería. Cuando finalmente sale al sendero, el corazón se le acomoda con esfuerzo.",
        em("Sigue el sendero hacia el norte.")
      ],
      next: "act2_camp_canibal",
    },

    "act2_canibal_carrera": {
      act: 2,
      text: [
        "Cruza el claro a toda velocidad. La cosa levanta la cabeza con un movimiento demasiado rápido para su tamaño. Lo persigue un trecho. Daniel se mete entre los árboles más densos. La cosa pierde interés a los veinte metros, o decide que no vale la pena, o sabe algo que él no.",
        em("Cuando puede mirar atrás, no hay nadie.")
      ],
      next: "act2_camp_canibal",
    },

    "act2_camp_canibal": {
      act: 2,
      audio: { tension: 0.22 },
      text: [
        "El sendero se abre en un claro. En el centro hay un círculo de piedras quemadas. Junto al fuego, todavía con brasas, hay un palo largo clavado en la tierra. Y en el palo hay cosas que Daniel registra una por una antes de entender que son una sola cosa.",
        "Costillas. Una mandíbula. Un mechón de pelo todavía sucio de espuma de mar. Y en el suelo, a un par de metros, separado del resto, un antebrazo humano. No es lo peor que ve.",
        "Lo peor es la pulsera.",
        em("Cuero trenzado, gastado, atado con un nudo que Daniel reconoce de hace dos noches.")
      ],
      choices: [
        {
          text: "Acercarse a la pulsera.",
          goto: "act2_pulsera_recogida",
          show: (s) => s.flags.recuerdaPulsera === true,
          apply: (s) => {
            s.resources.sanity = Math.max(0, s.resources.sanity - 18);
            s.flags.identificoAndres = true;
          },
          diary: "Es la pulsera de Andrés. La de Valeria. La que él decía que nunca se quitaba. Andrés está muerto. No, peor que muerto. Cocinado." ,
        },
        {
          text: "Mirar la pulsera y no saber por qué te golpea.",
          goto: "act2_pulsera_sin_memoria",
          show: (s) => s.flags.recuerdaPulsera !== true,
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 10); },
          diary: "Hay una pulsera de cuero en el suelo, junto a un brazo. La miro y siento algo que no sé nombrar. Como si la hubiera visto. Como si tuviera que reconocerla.",
        },
        { text: "Salir corriendo del claro sin mirar más.",
          goto: "act2_post_camp",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 8); s.flags.huyoCamp = true; },
          diary: "No me dejé mirar más. Hay cosas que uno no necesita confirmar para saber que son ciertas." },
      ],
    },

    "act2_pulsera_recogida": {
      act: 2,
      text: [
        "Daniel se arrodilla. No hace ruido. Desata la pulsera del antebrazo con cuidado, como si su gentileza ahora pudiera importarle todavía a alguien.",
        "Se la pone en el bolsillo del pantalón. Le pide perdón a Andrés sin decirlo en voz alta. Le pide perdón a una hermana que no conoce y que se llama Valeria.",
        em("La jungla se queda muy callada un instante.")
      ],
      onEnter: (s, E) => {
        if (!E.hasItem("pulsera")) {
          E.addItem({
            id: "pulsera",
            name: "Pulsera de Andrés",
            desc: "Cuero trenzado, gastada. Un nudo que él hizo hace años.",
            removable: true,
          });
        }
      },
      next: "act2_post_camp",
    },

    "act2_pulsera_sin_memoria": {
      act: 2,
      text: [
        "Daniel se queda parado un momento mirando la pulsera. La memoria se le hace agua en las manos. Está casi seguro de que alguien la mencionó la noche del bar. Pero cuando intenta agarrar el recuerdo, no está.",
        em("Sigue caminando. La isla se queda con un nombre menos.")
      ],
      next: "act2_post_camp",
    },

    "act2_post_camp": {
      act: 2,
      audio: { tension: 0.16, wind: 0.18 },
      text: [
        "Una hora más adelante el sendero se bifurca. A la izquierda, el terreno baja hacia un olor a piedra mojada que sugiere una cueva. A la derecha, el sendero sube y se hace más estrecho, con árboles más altos que sostienen un silencio espeso.",
        em("Daniel se queda parado, oyendo lo que la isla decide dejarle escuchar.")
      ],
      choices: [
        { text: "Tomar el camino izquierdo, hacia la cueva.",
          goto: "act2_voz_camila",
          diary: "Bajo hacia el olor a piedra. Algo me dice que si camino lo suficiente, voy a encontrar a alguien." },
        { text: "Tomar el camino derecho, subir entre los árboles altos.",
          goto: "act2_caleta_naufragio",
          diary: "Subo. El silencio de allí arriba me llama más que cualquier otra cosa esta tarde." },
      ],
    },

    "act2_caleta_naufragio": {
      act: 2,
      audio: { wind: 0.28 },
      text: [
        "El sendero alto baja, inesperado, hacia una caleta pequeña escondida entre rocas. Daniel no la habría encontrado si no hubiera tomado este camino. Dentro de la caleta, atascados contra los acantilados, están los restos del Arca Dorada que el mar empujó hacia adentro: una balsa rota, dos contenedores plásticos del salón comedor, una butaca arrancada de cuajo.",
        "Es lo más cercano a un milagro que ha tenido en dos días.",
        "Uno de los contenedores tiene comida sellada: galletas, frutos secos, una botella de agua que sigue cerrada. Otro tiene utensilios. En la butaca, encajada en la tapicería, hay una billetera que se quedó. Adentro: una foto de dos niños con uniformes escolares y una nota a mano: " + em("te amamos papá") + ".",
        em("No hay nombre. No la reconoce. Da igual.")
      ],
      choices: [
        { text: "Tomar la comida y el agua. Dejar la billetera donde está.",
          goto: "act2_caleta_post",
          apply: (s) => {
            s.resources.food = Math.min(100, s.resources.food + 32);
            s.resources.sanity = Math.min(100, s.resources.sanity + 5);
          },
          diary: "Comida sellada. Agua. La primera comida real desde el bar. Comí en silencio, sentado en la arena, mirando la billetera que dejé donde estaba. Si alguien viene a buscarla, va a estar." },
        { text: "Tomar también la billetera.",
          goto: "act2_caleta_post",
          require: (s) => s.inventory.length < 5,
          apply: (s, E) => {
            s.resources.food = Math.min(100, s.resources.food + 32);
            s.resources.sanity = Math.min(100, s.resources.sanity + 2);
            if (!E.hasItem("billetera")) {
              E.addItem({
                id: "billetera",
                name: "Billetera ajena",
                desc: "Foto de dos niños con uniforme. Una nota: «te amamos papá». Sin nombre.",
                removable: true,
              });
            }
          },
          diary: "Me llevé la billetera. No sé por qué. Quizás porque si la dejo ahí, los dos niños de la foto se quedan flotando en la caleta para siempre, y eso no tiene cómo." },
        { text: "Tomar solo el agua. Seguir.",
          goto: "act2_caleta_post",
          apply: (s) => {
            s.resources.food = Math.min(100, s.resources.food + 12);
          },
          diary: "Tomé el agua. Dejé la comida. Una parte de mí piensa que pertenece a otra persona que también la va a necesitar. Es estúpido. Lo sé." },
      ],
    },

    "act2_caleta_post": {
      act: 2,
      text: [
        "Daniel sube de vuelta al sendero alto. El cielo ya se está oscureciendo del lado del este. La luz se está yendo más rápido de lo que pensó.",
        em("El árbol viejo del claro se ve a lo lejos. Algo cuelga de él.")
      ],
      next: "act2_arbol_ernesto",
    },

    "act2_voz_camila": {
      act: 2,
      audio: { tension: 0.22 },
      text: [
        "La cueva no es grande. Es una boca de piedra negra en la pared del terreno, baja, con un goteo que se escucha desde fuera. Cuando Daniel se acerca, el aire de adentro le sopla en la cara: frío, mineral, equivocado.",
        "Y entonces escucha la voz.",
        "—Daniel… Daniel, por favor…",
        "Es una voz de mujer. Cansada. Cerca, pero no demasiado. Conoce esa voz. La escuchó preguntarle por su padre.",
        "—Daniel, estoy aquí. No puedo… no puedo salir sola…",
        em("Es Camila. O algo que sabe usar su voz.")
      ],
      choices: [
        { text: "Entrar en la cueva hacia la voz.",
          goto: "act2_camila_dentro",
          diary: "Entré. Si era ella y yo dudaba, no quería ser otra vez la persona que se demora un segundo de más en hacer lo correcto." },
        { text: "Retroceder. Llamarla desde la entrada.",
          goto: "act2_camila_retroceso",
          apply: (s) => { s.flags.noEntroPorCamila = true; },
          diary: "No entré. La llamé. No respondió. Algo dentro de la cueva se quedó muy callado, como esperando." },
      ],
    },

    "act2_camila_dentro": {
      act: 2,
      audio: { tension: 0.3 },
      text: [
        "Daniel avanza pegado a la pared. La cueva se estrecha. El sonido del goteo se vuelve más grande de lo que debería. La voz no vuelve a sonar.",
        "Diez metros adentro, encuentra señales de lucha reciente. Sangre todavía húmeda sobre la piedra. Un libro de medicina pisoteado: " + em("Manejo de urgencias en el adulto crítico") + ". Y entre las piedras, una credencial universitaria con la cara de Camila sonriendo en una foto institucional que no le hace justicia.",
        em("No hay cuerpo. Solo lo que ella dejó atrás luchando.")
      ],
      choices: [
        { text: "Tomar la credencial.",
          goto: "act2_camila_post",
          apply: (s, E) => {
            E.addItem({
              id: "credencial",
              name: "Credencial de Camila",
              desc: "Estudiante de medicina. Foto institucional. Manchada.",
              removable: true,
            });
            s.resources.sanity = Math.max(0, s.resources.sanity - 12);
          },
          diary: "Tomé su credencial. Pesa más de lo que pesa una tarjeta de plástico." },
        { text: "Dejarla. Salir.",
          goto: "act2_camila_post",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 14); },
          diary: "La dejé donde estaba. No quería cargar otra cara sonriente en el bolsillo." },
      ],
    },

    "act2_camila_retroceso": {
      act: 2,
      audio: { wind: 0.2 },
      text: [
        "Daniel retrocede tres pasos. La voz no vuelve. Da otros tres pasos hacia atrás. Cuando llega al sol, se da cuenta de que estaba conteniendo la respiración.",
        "Una hora después, dando un rodeo, vuelve a pasar cerca del claro caníbal. Esta vez hay algo nuevo entre las piedras quemadas: ropa de mujer, un libro abierto, un lápiz con el que un pelo recogido se sostenía hace dos noches.",
        em("La isla termina las frases que uno deja a la mitad.")
      ],
      onEnter: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 14); },
      next: "act2_camila_post",
    },

    "act2_camila_post": {
      act: 2,
      text: [
        "Daniel sale al sol. El sol es el mismo sol de antes y eso es lo peor.",
        em("Sube por el sendero derecho, hacia los árboles altos. Tiene una sensación que no puede explicarse de que necesita ver lo que hay arriba.")
      ],
      next: "act2_arbol_ernesto",
    },

    "act2_arbol_ernesto": {
      act: 2,
      audio: { tension: 0.22, wind: 0.18 },
      text: [
        "El sendero termina en una claro alto. En el centro del claro hay un árbol viejo, ancho, con ramas a una altura que requirió esfuerzo subir. Y de la rama más baja, a unos cinco metros del suelo, cuelga un cuerpo.",
        "Don Ernesto.",
        "Está atado con cuerdas hechas de enredaderas retorcidas. No es un nudo de prisa. Es un nudo trabajado. Tiene una técnica.",
      ],
      next: (s) => s.flags.aprendioErnesto ? "act2_ernesto_reconoce" : "act2_ernesto_simple",
    },

    "act2_ernesto_reconoce": {
      act: 2,
      text: [
        "Daniel se queda mirando el nudo. Don Ernesto le habló de nudos. Le explicó, en el bar, cómo se distingue un nudo improvisado de uno de marinero. Le dijo que un buen nudo, hecho bien, no se desata por accidente.",
        "El nudo del que cuelga Don Ernesto está hecho bien.",
        "Eso significa que quien lo subió ahí no lo hizo a las apuradas. Lo hizo con tiempo. Con propósito. Como una ofrenda.",
        "Al lado del árbol, en el suelo, hay otros dos cuerpos que Daniel no reconoce. Tampoco son cuerpos de gente del crucero. Visten ropa industrial vieja, un logo borroso en el bolsillo: " + em("NEXUM") + ".",
        em("Daniel siente, por primera vez desde que llegó a la isla, que algo aquí no es solo locura. Es metódico.")
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 14);
        s.flags.viNexum = true;
        s.diary.push({ act: 2, scene: "act2_ernesto_reconoce", text: "Don Ernesto colgado de un árbol. El nudo es deliberado. Los otros dos cuerpos llevan ropa con un logo: NEXUM. No estoy en una isla de salvajes. Estoy en una isla de algo que alguien hizo." });
        UI.renderDiary(s);
      },
      next: "act2_post_arbol",
    },

    "act2_ernesto_simple": {
      act: 2,
      text: [
        "Daniel mira hacia arriba. Lo único que su cabeza registra son cosas sueltas: " + em("viejo") + ", " + em("cuerda") + ", " + em("alto") + ". No alcanza a pensar más. Algo dentro de él decide no pensar más.",
        "Al lado del árbol hay otros dos cuerpos vestidos con un uniforme industrial sucio. No los reconoce. Tampoco se acerca."
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 10);
        s.diary.push({ act: 2, scene: "act2_ernesto_simple", text: "Don Ernesto está muerto. Colgado. No sé qué pensar. No sé qué pensar." });
        UI.renderDiary(s);
      },
      next: "act2_post_arbol",
    },

    "act2_post_arbol": {
      act: 2,
      text: [
        "Daniel se aleja del árbol. Camina sin rumbo claro durante un rato largo. La luz empieza a bajar. Sabe que no quiere pasar la noche en la jungla.",
        "Encuentra, al borde de un claro pequeño, un cuarto cuerpo. Este sí tiene puesto el uniforme industrial completo. Lleva años caído ahí — los huesos están limpios, la tela ya casi al hueso. En el cinturón, todavía, hay una linterna táctica y una tarjeta de identificación con un cordón.",
        em("Es lo más parecido a una bendición que Daniel ha encontrado en mucho tiempo.")
      ],
      choices: [
        { text: "Tomar la linterna y la tarjeta.",
          goto: "act2_entrada_cuevas",
          apply: (s, E) => {
            if (!E.hasItem("linterna")) {
              E.addItem({
                id: "linterna",
                name: "Linterna",
                desc: "Linterna táctica antigua. Funcional. La batería no es eterna. «Usar» para encender o apagar.",
                removable: false,
                use: (st, En) => En.toggleFlashlight(),
              });
              s.hasFlashlight = true;
            }
            if (!E.hasItem("tarjeta")) {
              E.addItem({
                id: "tarjeta",
                name: "Tarjeta NEXUM",
                desc: "Tarjeta de acceso magnetizada. Logo de NEXUM. Aún sirve.",
                removable: false,
              });
            }
          },
          diary: "Linterna. Tarjeta NEXUM. Este hombre fue un técnico. Murió huyendo de algo. Las herramientas que necesito vienen del lado equivocado de la historia, otra vez." },
      ],
    },

    "act2_entrada_cuevas": {
      act: 2,
      audio: { tension: 0.28 },
      text: [
        "Cuando Daniel sigue el sendero un poco más allá, encuentra lo que la tarjeta sirve para abrir.",
        "En la base de una pared de roca, casi escondida por la vegetación, hay una compuerta metálica. Vieja, oxidada, con un lector electrónico todavía con una luz roja parpadeando. Sobre la compuerta, una pintura descolorida pero todavía legible: " + em("NEXUM — Acceso restringido — Estación 7") + ".",
        em("Daniel pasa la tarjeta. La luz se vuelve verde. La compuerta gime y se abre hacia adentro, hacia la oscuridad.")
      ],
      choices: [
        { text: "Bajar.",
          goto: "act3_entrada",
          apply: (s) => { s.flags.entróCuevas = true; },
          diary: "Bajo. No porque sea valiente. Porque arriba ya no hay nada que reconozca como mundo." },
      ],
    },

    // ============================================================
    // ACTO 3 — Las Cuevas
    // ============================================================
    "act3_entrada": {
      act: 3,
      audio: { stop: true, tension: 0.32 },
      text: [
        "La compuerta se cierra detrás de Daniel con un golpe sordo. Adentro, la oscuridad no es ausencia de luz: es algo activo. Algo que devuelve los sonidos antes de que terminen de salir.",
        "El olor es mineral, frío, con un fondo dulce que Daniel ya conoce.",
        em("Si no enciendes la linterna ahora, el mundo se vuelve un susurro de paredes que no ves.")
      ],
      choices: [
        { text: "Encender la linterna.",
          goto: "act3_galeria",
          require: (s) => s.hasFlashlight && s.resources.battery > 0,
          apply: (s, E) => { if (!s.flashlightOn) E.toggleFlashlight(); },
          diary: "Enciendo la linterna. El haz es estrecho. La oscuridad alrededor parece más grande por contraste." },
        { text: "Avanzar a tientas, sin encender.",
          goto: "act3_galeria_oscuro",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 10); s.flags.avanzoOscuro = true; },
          diary: "Avanzo en lo oscuro. No sé por qué. Quizás porque encender la luz también es enseñar dónde estoy." },
      ],
    },

    "act3_galeria": {
      act: 3,
      audio: { tension: 0.32 },
      text: [
        "El haz revela una galería natural alta. El suelo está parcialmente civilizado: pasarelas de metal viejas, un cable corriendo por la pared, marcas pintadas con números: " + em("S7-04, S7-05") + ".",
        "Pero el techo y las paredes están vivos de marcas más viejas: garras, rasguños, signos rasgados en la piedra que parecen un alfabeto sin gramática. Algo lleva años aquí dentro practicando lo que sea que practica.",
        em("Algo se mueve a unos veinte metros, fuera del haz. Daniel apaga la linterna por reflejo. La oscuridad lo abraza otra vez.")
      ],
      next: "act3_mutante",
    },

    "act3_galeria_oscuro": {
      act: 3,
      audio: { tension: 0.32 },
      text: [
        "Daniel camina con una mano contra la pared. La piedra está fría y húmeda. La otra mano, adelante. Tropieza con algo metálico: una pasarela vieja, un cable que cruje. La pared cambia de textura: se vuelve rasgada, como si alguien la hubiera arañado por dentro durante años.",
        "El olor cambia. Más fuerte. Más dulce.",
        em("Y en algún punto, Daniel se da cuenta de que no está solo en esta oscuridad.")
      ],
      next: "act3_mutante",
    },

    "act3_mutante": {
      act: 3,
      audio: { tension: 0.42 },
      text: [
        "Una respiración cerca. No humana. Más profunda. Más lenta. Pega contra Daniel un olor a hierro y a algo más antiguo.",
        "El ruido de algo grande arrastrándose sobre piedra mojada.",
        em("No tiene tiempo de elegir bien. Tiene tiempo de elegir.")
      ],
      choices: [
        { text: "Plantarse y atacar con lo que tenga a mano.",
          goto: "act3_mutante_pelea",
          diary: "Decido pelear. No tengo arma. Tengo miedo, lo cual a veces es lo mismo." },
        { text: "Esconderse contra la pared y dejar de respirar.",
          goto: "act3_mutante_esconde",
          require: (s) => s.resources.sanity > 20,
          diary: "Me pego a la pared. Hago el cuerpo pequeño. Le pido a mi cuerpo que sea más silencioso de lo que es." },
        { text: "Correr a ciegas hacia adelante.",
          goto: "act3_mutante_correr",
          diary: "Corro. No miro. La oscuridad ayuda, en algún sentido cruel: ya no estoy seguro de qué corre detrás de mí." },
      ],
    },

    "act3_mutante_pelea": {
      act: 3,
      text: [
        "Daniel agarra una piedra del tamaño de su puño. Golpea hacia donde escucha respirar. Acierta algo: hay un chillido que es casi humano y no lo es. Vuelve a golpear. Y vuelve. Y vuelve.",
        "Cuando algo se detiene, Daniel se da cuenta de que está cubierto de un líquido caliente que no es solo suyo. Hay un corte en el antebrazo. Un mordisco profundo en el hombro.",
        em("Algo entró por ahí. Algo más pequeño que un mordisco. Algo que no se ve.")
      ],
      onEnter: (s) => {
        s.resources.health = Math.max(0, s.resources.health - 28);
        s.resources.sanity = Math.max(0, s.resources.sanity - 8);
        s.infected = true;
      },
      next: "act3_post_mutante",
    },

    "act3_mutante_esconde": {
      act: 3,
      text: [
        "Daniel se pega contra la piedra. Cierra los ojos como si eso ayudara. Algo enorme pasa a un metro de él, arrastrando algo blando contra el piso.",
        "Cuando vuelve a respirar, descubre que estuvo conteniendo el aire tanto tiempo que la cabeza le da vueltas. El olor se aleja.",
        em("Sigue.")
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 6);
        s.resources.battery = Math.max(0, s.resources.battery - 10);
      },
      next: "act3_post_mutante",
    },

    "act3_mutante_correr": {
      act: 3,
      text: [
        "Daniel corre con una mano hacia adelante. Se golpea con piedras y con cosas que no son piedras. Algo lo agarra del costado y rasga la camisa, abre un surco caliente sobre la piel. Pero suelta.",
        "Suelta porque a Daniel le importa más correr que cualquier otra cosa.",
        em("Cuando para, está empapado en sudor y en algo que no es sudor.")
      ],
      onEnter: (s) => {
        s.resources.health = Math.max(0, s.resources.health - 18);
        s.resources.food = Math.max(0, s.resources.food - 14);
      },
      next: "act3_post_mutante",
    },

    "act3_post_mutante": {
      act: 3,
      audio: { tension: 0.26 },
      text: [
        "Después de un rato largo en el que Daniel deja de oír cosas que respiran, encuentra una cámara natural. Una mesa metálica vieja, con papeles. Un farol electrónico que todavía da una luz amarilla intermitente.",
        "Los papeles tienen el membrete de NEXUM. La letra de un tal " + em("Dr. H. Voss") + ". Daniel lee algunas líneas porque ya no puede no leerlas:",
        em("«…sujetos 4, 7 y 11 han colapsado los inhibidores. Conservan motricidad fina. Han dejado de responder al nombre con el que ingresaron. Continuamos observación a 96h…»"),
        em("«…sujeto 7 muestra cambios físicos que no estaban en el protocolo. Solicitar a Ginebra un equipo de contención completa. Solicitud denegada — continuamos.»")
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 5);
        s.flags.leyoVoss = true;
      },
      choices: [
        { text: "Seguir leyendo.",
          goto: "act3_voss_mas",
          diary: "El que firmó esto ya sabía que sus sujetos no eran personas a los noventa y seis horas. Y siguió. Y siguió." },
        { text: "Dejar los papeles. Avanzar.",
          goto: "act3_puerta_lab",
          diary: "No puedo leer más. La letra es demasiado tranquila para lo que dice." },
      ],
    },

    "act3_voss_mas": {
      act: 3,
      text: [
        em("«…dieciséis investigadores y personal de apoyo no alcanzaron a evacuar. El protocolo de contención no fue activado en el momento óptimo por decisión personal del director del proyecto, con el fin de obtener datos sobre la fase de transición. Las muertes son lamentables pero los datos son irrepetibles…»"),
        em("«…la fase 2 — cambios físicos profundos en sujetos con compatibilidad biológica — está documentada en los archivos S-LAB. Recomiendo extrema precaución a cualquier equipo de recuperación. Sin embargo, NEXUM tiene contractuales pendientes con tres clientes que no pueden esperar otra década.»"),
        em("Voss firma cada nota con una H y una V trabajadas, casi caligráficas.")
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 10);
        s.flags.leyoVossCompleto = true;
      },
      next: "act3_puerta_lab",
    },

    "act3_puerta_lab": {
      act: 3,
      audio: { tension: 0.28 },
      text: [
        "El túnel termina en una compuerta blindada. Esta no está oxidada. Tiene la pulcritud arrogante de algo que se mantuvo durante años aunque ya nadie viniera a usarlo.",
        "Hay un lector de tarjetas igual al de la entrada. Y, encima, un sello: " + em("NEXUM — S-LAB — Restringido") + ".",
      ],
      choices: [
        { text: "Pasar la tarjeta.",
          goto: "act4_corredor",
          show: (s) => Engine.hasItem("tarjeta"),
          apply: (s) => { s.flags.entróLab = true; },
          diary: "La luz se vuelve verde. La compuerta se abre con un suspiro que parece pertenecer a otra época." },
        { text: "Empujar la compuerta a la fuerza.",
          show: (s) => !Engine.hasItem("tarjeta"),
          goto: "act3_sin_tarjeta",
          diary: "Empujo. La compuerta no cede. No iba a ceder." },
      ],
    },

    "act3_sin_tarjeta": {
      act: 3,
      text: [
        "La compuerta no se mueve. No tiene cómo. Daniel se sienta contra ella y se queda mirando el túnel del que vino. La oscuridad espera a paciencia.",
        em("[Sin la tarjeta de acceso no se puede avanzar al laboratorio. Vuelve atrás y revisa los cuerpos.]")
      ],
      next: "act3_puerta_lab",
    },

    // ============================================================
    // ACTO 4 — El Laboratorio
    // ============================================================
    "act4_corredor": {
      act: 4,
      audio: { stop: true, tension: 0.16, static: 0.12 },
      text: [
        "Al otro lado de la compuerta, la oscuridad termina de golpe. Una luz fluorescente parpadea en el techo, lenta como un latido cansado. Las paredes son baldosa blanca, pulcra, manchada en algún punto por una salpicadura marrón vieja que nadie limpió nunca.",
        "El corredor es largo. Hay puertas con números: S-101, S-102. En el suelo, a mitad de pasillo, hay un cuerpo. Lleva una bata de laboratorio. Lleva muerto mucho tiempo. La bata todavía tiene un bolígrafo prendido al bolsillo.",
        em("Las luces parpadean al ritmo de la pulsación de Daniel.")
      ],
      onEnter: (s) => {
        // Callbacks emocionales: el cuerpo en el corredor activa memorias del prólogo.
        const callbacks = [];
        if (s.flags.frioConSofia) {
          callbacks.push("Sofía levantó el whisky para brindar y yo no respondí. Lleva tres días muerta en una playa que no era suya. Ese brindis que no di pesa una cosa pequeña ahora, pero pesa.");
        }
        if (s.flags.rechazoBeto) {
          callbacks.push("Beto me sirvió un ron sin preguntar y yo le dije que no. Ahora estoy parado en un pasillo de Voss y lo único que me acuerdo es de su cara cuando dijo «respeto». La respetó. Yo no se la respeté.");
        }
        if (s.flags.cerradoCamila) {
          callbacks.push("Camila me preguntó por mi padre y le dije que no quería hablar. Tenía veintidós años y era mejor escuchando que cualquier persona que conozco. La cerré yo. Hoy no me la puedo volver a abrir.");
        }
        for (const t of callbacks) s.diary.push({ act: 4, scene: "act4_corredor", text: t });
        if (callbacks.length) UI.renderDiary(s);
      },
      choices: [
        { text: "Avanzar hacia la sala de servidores.",
          goto: "act4_servidores",
          diary: "El laboratorio está intacto. Como un museo que se le olvidó a alguien. Once años. Once años." },
      ],
    },

    "act4_servidores": {
      act: 4,
      audio: { static: 0.2, tension: 0.18 },
      text: [
        "La sala de servidores es una caja blanca llena de torres negras todavía encendidas. El sonido de los ventiladores es sordo, constante. Una de las pantallas muestra una sesión activa: usuario " + em("hvoss") + ", conectado " + em("hace 4011 días") + ".",
        "Hay un terminal abierto con menús de archivos. Voss ordenaba todo. Había carpetas tituladas " + em("AUDIO_LOGS_1-47") + ", " + em("DIARIOS_2003-2014") + ", " + em("FOTOS_SUJETOS") + ", " + em("VIDEO_FINAL") + ".",
        em("En la pantalla, parpadeando, también hay un programa de transferencia listo para copiar todo a un dispositivo externo. Solo necesita uno.")
      ],
      choices: [
        { text: "Escuchar un audio log al azar.",
          goto: "act4_audio_log",
          diary: "Pongo a sonar un audio. Necesito escuchar la voz del que hizo esto." },
        { text: "Ver el video final.",
          goto: "act4_video_voss",
          diary: "Hay un video que se llama VIDEO_FINAL. Si voy a tener que llevar esta historia, tengo que mirarla a la cara." },
        { text: "Salir de la sala. Buscar más adelante.",
          goto: "act4_pasillo_segundo",
          diary: "No quiero escuchar todavía. No tengo cuerpo para eso ahora." },
      ],
    },

    "act4_audio_log": {
      act: 4,
      audio: { static: 0.3 },
      onEnter: (s) => {
        s.heardLogs = s.heardLogs || [];
        const unheard = AUDIO_LOGS.filter(l => !s.heardLogs.includes(l.id));
        const isNew = unheard.length > 0;
        const pool = isNew ? unheard : AUDIO_LOGS;
        const log = pool[Math.floor(Math.random() * pool.length)];
        s._currentLog = log.id;
        s._currentLogText = log.text;
        if (isNew) s.heardLogs.push(log.id);
        // Logs nuevos pegan más; repetir uno ya escuchado, menos.
        s.resources.sanity = Math.max(0, s.resources.sanity - (isNew ? 6 : 2));
        s.flags.escuchoLog = true;
      },
      text: (s) => [
        "El altavoz cruje. La voz que sale es suave, didáctica, con un acento alemán muy controlado. Voss habla como un profesor que ha repetido la misma clase muchas veces.",
        em(s._currentLogText || "—Log archivo corrompido—"),
      ],
      choices: (s) => {
        const remaining = AUDIO_LOGS.length - (s.heardLogs ? s.heardLogs.length : 0);
        const opts = [
          { text: "Detener el audio.", goto: "act4_servidores",
            diary: "Detuve el audio. La voz se queda en el altavoz un segundo de más, como si no estuviera de acuerdo." },
        ];
        if (remaining > 0) {
          opts.unshift({
            text: `Escuchar otro log (${remaining} sin escuchar).`,
            goto: "act4_audio_log",
            diary: "Doy clic en el siguiente. Voss vuelve, suave, didáctico, sin pedir perdón." });
        } else {
          opts.unshift({
            text: "Volver a poner uno (los ocho ya están escuchados).",
            goto: "act4_audio_log",
            diary: "Los he escuchado todos. Pongo uno otra vez. La segunda vez no duele lo mismo. Eso me preocupa más que la primera." });
        }
        return opts;
      },
    },

    "act4_video_voss": {
      act: 4,
      audio: { static: 0.18, tension: 0.2 },
      text: [
        "La pantalla cambia. Aparece Voss sentado en una silla cómoda, en un apartamento ordinario de Ginebra. Tiene setenta y un años, una camisa azul, una taza de café a su lado. Mira directamente a la cámara con la tranquilidad de alguien que ya sabe que no va a haber consecuencias.",
        em("—Mi nombre es Heinrich Voss. Si están viendo esto, fue porque eligieron verlo. Lo que voy a decir lo he dicho ya en papel. Lo digo en voz alta porque a veces la voz convence donde el papel no.—"),
        em("—El Proyecto Genesis fue mío de principio a fin. Diseñé el compuesto. Elegí la isla. Elegí a los sujetos. Tres gobiernos lo pagaron y NEXUM Corporation lo administró. Cuando los sujetos colapsaron, yo decidí esperar cuatro semanas antes de activar la contención. Las dieciséis muertes que ocurrieron en esas cuatro semanas son responsabilidad mía. No me arrepiento porque los datos que obtuve en esas cuatro semanas no se obtienen de otra forma.—"),
        em("—Si están viendo esto desde el laboratorio, asumo que llegaron por accidente. Asumo que sobrevivieron a la fauna que dejamos atrás. No sé cómo se llaman. No me importa. Esta isla nunca va a estar en ningún juicio. Yo nunca voy a estar en ningún juicio. Que duerman bien.—"),
        em("Voss apaga la cámara. La pantalla se queda en negro durante mucho tiempo.")
      ],
      onEnter: (s) => {
        s.resources.sanity = Math.max(0, s.resources.sanity - 14);
        s.flags.vioVideoVoss = true;
        // Callbacks: el video conecta con las preguntas sin respuesta del prólogo.
        const callbacks = [];
        if (s.flags.cerradoCamila) {
          callbacks.push("Camila me preguntó si extrañaba a mi padre o si extrañaba la idea de extrañarlo. Le dije que no quería hablar. Acabo de ver a un hombre que decidió no llamar a sus sujetos por su nombre. Camila habría escuchado este video conmigo y lo habría destrozado mejor que yo.");
        }
        if (!s.flags.aprendioErnesto) {
          callbacks.push("Don Ernesto me explicó cosas que no escuché. Habría sabido qué hacer con esto. Habría sabido si este hombre estaba mintiendo en alguna pausa. Yo no sé.");
        }
        for (const t of callbacks) s.diary.push({ act: 4, scene: "act4_video_voss", text: t });
        if (callbacks.length) UI.renderDiary(s);
      },
      choices: [
        { text: "Copiar todo. Llevarse los archivos.",
          goto: "act4_archivos",
          require: (s) => s.inventory.length < 5,
          diary: "Voy a sacar esto de aquí. La cara de este hombre tiene que estar en mil pantallas." },
        { text: "Apagar la pantalla. Salir.",
          goto: "act4_pasillo_segundo",
          diary: "No copié nada. La cara de Voss me la voy a llevar de todas formas, sin disco." },
      ],
    },

    "act4_archivos": {
      act: 4,
      audio: { static: 0.16 },
      text: [
        "Daniel encuentra, entre los cajones del escritorio, un disco portátil viejo pero compatible. Lo conecta. El programa de transferencia se acelera. Los audios, los diarios, las fotos, el video. Todo lo que Voss ordenó como quien archiva una cocina.",
        em("Cuando el disco se llena, Daniel lo desconecta. Lo guarda contra el cuerpo, debajo de la camisa.")
      ],
      onEnter: (s, E) => {
        if (!E.hasItem("archivo")) {
          E.addItem({
            id: "archivo",
            name: "Disco con archivos de Voss",
            desc: "Toda la operación de NEXUM, ordenada como quien archiva una cocina.",
            removable: true,
          });
        }
        s.flags.hasArchives = true;
        // Tener un propósito concreto en la mano devuelve algo.
        s.resources.sanity = Math.min(100, s.resources.sanity + 8);
      },
      next: "act4_pasillo_segundo",
    },

    "act4_pasillo_segundo": {
      act: 4,
      audio: { tension: 0.18 },
      text: [
        "Daniel sigue por el corredor. Pasa una sala con camillas. Pasa una sala con jaulas vacías que no quiere mirar de cerca. Pasa una sala con escritorios donde alguien dejó un sándwich a medio comer, hace once años, en un envoltorio plástico que todavía no se ha podrido del todo.",
        "Llega a una habitación pequeña con una nevera médica. La nevera, milagrosamente, todavía zumba. Adentro hay viales etiquetados con letra apresurada: " + em("GN-7 / antídoto parcial / Voss") + ".",
        em("Solo quedan dos viales.")
      ],
      choices: [
        {
          text: "Tomar un vial.",
          goto: "act4_sala_jaulas",
          require: (s) => s.inventory.length < 5,
          apply: (s, E) => {
            if (!E.hasItem("antidoto")) {
              E.addItem({
                id: "antidoto",
                name: "Antídoto parcial (vial)",
                desc: "Letra apresurada: GN-7 / antídoto parcial / Voss. Ralentiza la infección. No la cura.",
                removable: true,
                use: (st, En) => {
                  st.flags.antidoteTaken = true;
                  En.removeItem("antidoto");
                  UI.toast("Te inyectaste el antídoto. Algo dentro de ti pierde velocidad.");
                  st.resources.sanity = Math.min(100, st.resources.sanity + 8);
                }
              });
            }
            // Recoger algo útil con intención propia devuelve un pedazo pequeño.
            s.resources.sanity = Math.min(100, s.resources.sanity + 6);
          },
          diary: "Me llevo un vial. Si lo necesito, sabré por qué. Tener algo en la mano que no es de Voss me sirve, hoy." },
        { text: "Dejarlos. Seguir.",
          goto: "act4_sala_jaulas",
          diary: "No los toco. Si funcionan, sería más justo que los use alguien que ya los necesite. Yo me siento bien. Creo." },
      ],
    },

    "act4_sala_jaulas": {
      act: 4,
      audio: { static: 0.14, tension: 0.22 },
      text: [
        "El siguiente pasillo da a una sala dividida en jaulas individuales. Doce, contadas por Daniel sin querer. Cada una con un colchón de espuma reventado, un retrete químico oxidado, una pared de barrotes que llega hasta el techo.",
        "Las paredes interiores de cada jaula están marcadas. Garras. Y, en algunas, palabras grabadas a uña, repetidas hasta perder forma: nombres, fechas, una sílaba sola escrita doscientas veces.",
        "En el centro de la sala, una pizarra blanca con anotaciones del último día de uso. En la esquina inferior derecha, alguien escribió con marcador azul, sin el orden técnico del resto del muro:",
        em("«Sujeto 7. Día 96. Pide que lo llamen por su nombre. No lo hacemos.»")
      ],
      choices: [
        { text: "Leer las pizarras de cada jaula, una por una.",
          goto: "act4_jaulas_lee",
          apply: (s) => {
            s.resources.sanity = Math.max(0, s.resources.sanity - 4);
            s.flags.leyoJaulas = true;
          },
          diary: "Antoine, Mariko, Soledad, Pavel, Elena (no esta Elena), Jorge, Aurelio, Reza, Marta, Lin, Suresh, Andrés (no este Andrés). Tenían nombres. Los voy a saber por orden alfabético el resto de mi vida." },
        { text: "Pasar sin leer.",
          goto: "act4_oficina_voss",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 4); },
          diary: "No leí. No quería saber los nombres. Sé que mañana voy a desear haber sabido los nombres." },
      ],
    },

    "act4_jaulas_lee": {
      act: 4,
      text: [
        "Daniel lee las doce pizarras. Cada una con una foto institucional grapada al cartón. Cada una con un día de ingreso, hecho con una caligrafía cuidadosa que no debería existir en este sitio. Cada una con una nota técnica con la fecha en que dejó de responder al nombre.",
        em("Saberlos no es una herida. Saberlos es lo opuesto a la herida. Es lo único de este lugar que Daniel se va a llevar con respeto.")
      ],
      onEnter: (s) => {
        // Engagement con el dolor real paga un pedazo de cordura.
        s.resources.sanity = Math.min(100, s.resources.sanity + 2);
      },
      next: "act4_oficina_voss",
    },

    "act4_oficina_voss": {
      act: 4,
      audio: { static: 0.1, tension: 0.18 },
      text: [
        "Una puerta lateral, abierta a medias. Adentro: una oficina pequeña, austera, con un sofá viejo, una taza de café cristalizada en el fondo, una silla giratoria con la espuma rota. Voss trabajaba aquí.",
        "Sobre el escritorio, una libreta abierta. Cuadernillo de bolsillo, papel grueso. Dibujos a lápiz cuidadosos. Caras humanas. No bocetos rápidos: estudios de retrato con el detalle de alguien que se tomó horas en cada uno.",
        "Bajo cada dibujo, una palabra escrita con letra pequeña: el nombre del sujeto. Y debajo, tachado con una línea recta, reemplazado por un número: " + em("Antoine") + ", tachado, " + em("S-4") + ". " + em("Mariko") + ", tachado, " + em("S-7") + ". " + em("Soledad") + ", tachado, " + em("S-11") + ".",
        em("Voss no podía dejar de llamarlos por su nombre cuando los dibujaba. Tachaba después.")
      ],
      choices: [
        { text: "Tomar la libreta.",
          goto: "act4_camara_revelar",
          require: (s) => s.inventory.length < 5,
          apply: (s, E) => {
            if (!E.hasItem("libreta")) {
              E.addItem({
                id: "libreta",
                name: "Libreta de Voss",
                desc: "Retratos a lápiz de los sujetos del experimento, con sus nombres tachados.",
                removable: true,
              });
            }
            s.flags.hasArchives = true;
            // Llevarse esto: tomar la responsabilidad. Apenas neto.
            s.resources.sanity = Math.max(0, s.resources.sanity - 2);
            s.resources.sanity = Math.min(100, s.resources.sanity + 2);
          },
          diary: "Me llevo la libreta. Si algún día se acaban los archivos digitales, queda esto. Voss los dibujó. Una parte de él los vio. Esa parte fue la primera en tachar." },
        { text: "Dejarla. Seguir.",
          goto: "act4_camara_revelar",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 3); },
          diary: "Cerré la libreta. La dejé donde estaba. No quería ser yo quien la sacara de su escritorio." },
      ],
    },

    "act4_camara_revelar": {
      act: 4,
      audio: { tension: 0.14 },
      text: (s) =>
        Engine.hasItem("camara")
          ? [
              "En una sala lateral hay un cuarto oscuro de revelado de fotos analógicas. Voss usaba film para algunas cosas — la electrónica no se podía hackear como las grabaciones digitales, le habían enseñado los suyos.",
              "Daniel pone el rollo de Sofía en la cubeta. Espera. Las imágenes salen una a una, en negativo, después en positivo. Sofía fotografió la tormenta antes del hundimiento. Fotografió a Andrés haciendo su truco de cartas. Fotografió a Daniel mirando el ron.",
              "Y fotografió, en las dos últimas tomas, algo enorme moviéndose bajo el casco. Algo con un patrón de luces que no era el patrón de un crucero.",
              em("Sofía lo vio venir. Lo vio venir y lo fotografió en lugar de gritar.")
            ]
          : [
              "Hay una sala lateral con un cuarto oscuro. Pude haberlo usado. No traigo nada que revelar.",
              em("Daniel pasa de largo. Se promete, sin saber por qué, perdonarse algún día por la cámara que no cargó.")
            ],
      onEnter: (s) => {
        if (Engine.hasItem("camara")) {
          // Revelar las fotos duele, pero también da pruebas: el costo es contenido.
          s.resources.sanity = Math.max(0, s.resources.sanity - 2);
          s.flags.viFotos = true;
          s.flags.hasArchives = true;
        } else if (s.flags.dejoCamara) {
          // Arrepentimiento estructural: la cámara que dejó habría sido el cierre del caso.
          s.diary.push({ act: 4, scene: "act4_camara_revelar", text: "Hay un cuarto oscuro de revelado. Sofía traía un rollo. Yo la cubrí con su chaqueta y dejé la cámara con ella. Era lo que parecía digno. No iba a saber que el cuarto oscuro existía. Pero existía. Y lo que ella fotografió antes de ahogarse era esto, y se quedó en la arena conmigo encima diciéndome que era digno." });
          UI.renderDiary(s);
          s.resources.sanity = Math.max(0, s.resources.sanity - 3);
        }
      },
      next: "act4_decision",
    },

    "act4_decision": {
      act: 4,
      audio: { tension: 0.2 },
      text: [
        "El corredor termina en un ascensor de carga. La luz del botón está roja, pero el ascensor zumba apenas Daniel se acerca. Voss diseñó este lugar para que nadie quedara atrapado abajo.",
        "Daniel entra. Las puertas se cierran. Sube. Sube durante mucho rato. Cuando se abren, hay luz natural por primera vez en horas.",
        em("Y al fondo del galpón al que da el ascensor, una puerta abierta hacia la playa.")
      ],
      next: "act5_salida",
    },

    // ============================================================
    // ACTO 5 — La Salida
    // ============================================================
    "act5_salida": {
      act: 5,
      audio: { stop: true, wind: 0.3 },
      text: [
        "Es de madrugada. El cielo está limpio. La playa de este lado de la isla es distinta a la del Acto 1: piedras planas, agua tranquila, un muelle viejo de NEXUM medio podrido entrando en el mar.",
        "En el horizonte, sobre el agua, hay un barco. No es un crucero. Es un pesquero, pequeño, con luces amarillas. Está lo suficientemente cerca para ver una silueta humana en cubierta.",
        em("Daniel encuentra en el muelle una bengala vieja en una caja de plástico naranja. Funciona. La probó con el pulgar y siente la rugosidad seca de la mecha.")
      ],
      onEnter: (s) => {
        // Callbacks finales: la bengala convoca lo que Daniel hizo y no hizo en el Acto 1.
        const callbacks = [];
        if (s.flags.betoMurióPorMí) {
          callbacks.push("Beto me dijo que me acordara de él cuando estuviera tomando ron. La bengala es lo más parecido a un trago seco que voy a tener hoy. Beto. Beto. Beto.");
        } else if (s.flags.dejóMorirBeto) {
          callbacks.push("Le prometí a Beto que volvía. La bengala arde si la enciendo. Es lo único que tengo para cumplir esa promesa de la peor forma posible: viviendo.");
        } else if (s.flags.ignoroBeto) {
          callbacks.push("Le di la espalda a un grito que sabía que era él. Hoy tengo una bengala en la mano. No me la merezco. Pero el barco la va a ver igual.");
        }
        if (s.flags.aprendioErnesto) {
          callbacks.push("Don Ernesto me explicó cómo se lee la dirección del viento. El viento ahora viene del oeste. El barco está al este. Si enciendo la bengala, el humo va hacia donde tiene que ir. Es la última cosa que su clase me enseñó.");
        }
        for (const t of callbacks) s.diary.push({ act: 5, scene: "act5_salida", text: t });
        if (callbacks.length) UI.renderDiary(s);
      },
      choices: [
        { text: "Encender la bengala. Pedir que lo vean.",
          goto: "act5_rescate",
          apply: (s) => { s.flags.signaledRescue = true; },
          diary: "Encendí la bengala. La levanté. Mateo. Que esto signifique que vuelvo a Mateo." },
        { text: "Quedarse sentado. Dejar que el barco se aleje.",
          goto: "act5_no_rescate",
          apply: (s) => { s.resources.sanity = Math.max(0, s.resources.sanity - 12); },
          diary: "No la encendí. Vi el barco. Vi cómo se alejaba. No sé qué clase de hombre hace eso. Sé que hoy yo era ese hombre." },
        { text: "Bajar la bengala. Caminar de vuelta hacia la jungla.",
          goto: "act5_camino_jungla",
          apply: (s) => { s.flags.walkedAway = true; },
          diary: "Volví hacia adentro. No por valor. Por algo más viejo." },
      ],
    },

    "act5_rescate": {
      act: 5,
      audio: { wind: 0.18 },
      text: (s) => {
        const lines = [
          "La bengala silba hacia el cielo. La luz roja queda colgada un momento que parece demasiado largo. En el pesquero, la silueta se mueve. Se enciende una linterna. El barco gira hacia la isla.",
          "Cuando llegan al muelle, son tres hombres. Pescadores filipinos. Hablan un inglés roto. Uno mira a Daniel a los ojos, ve algo ahí, y deja de hacer preguntas.",
        ];
        if (s.flags.hasArchives) {
          lines.push("Daniel saca el disco de debajo de la camisa. Lo levanta como si pesara más de lo que pesa.");
          if (s.flags.viFotos) lines.push("Saca también, con cuidado, las copias de las fotos de Sofía. La última, la del barco, la mira el más joven de los pescadores y se persigna sin teatro.");
        }
        lines.push(em("El motor del pesquero empieza a tirar hacia el horizonte. Daniel mira atrás una sola vez."));
        return lines;
      },
      choices: [
        { text: "(cerrar los ojos)",
          ending: null,
          apply: (s, E) => {
            const id = decideEnding(s);
            E.endGame(id);
          } },
      ],
    },

    "act5_no_rescate": {
      act: 5,
      text: [
        "El pesquero pasa de largo. Las luces amarillas se hacen más pequeñas. El sol empieza a salir y el cielo se pone color manchado de durazno y de algo más viejo.",
        "Daniel se queda sentado en el muelle. No piensa nada importante. No le da tiempo a pensar nada importante.",
        em("Mucho más tarde, la marea sube. Daniel no se mueve.")
      ],
      choices: [
        { text: "(fin)",
          apply: (s, E) => { E.endGame("neutral"); } },
      ],
    },

    "act5_camino_jungla": {
      act: 5,
      audio: { wind: 0.2, tension: 0.18 },
      text: [
        "Daniel le da la espalda al barco. Empieza a caminar hacia los árboles. Cada paso pesa menos que el anterior. Algo dentro de él ha dejado de discutirle.",
        em("La jungla lo recibe sin alboroto. Como si lo estuviera esperando desde hace mucho.")
      ],
      choices: [
        { text: "(adentro)",
          apply: (s, E) => { E.endGame("bad_2"); } },
      ],
    },

    // ============================================================
    // Escenas especiales (muerte, finales forzados)
    // ============================================================
    "death_health": {
      act: -1,
      text: [
        em("La sangre se enfría más rápido que el cuerpo. Daniel no piensa nada importante. No le da tiempo.")
      ],
      choices: [
        { text: "FIN", ending: "death" },
      ],
    },

    "ending_bad_1": {
      act: -1,
      text: [
        em("Algo en Daniel cede sin avisar. Lo que toma esa decisión no es él, aunque tenga su cara.")
      ],
      choices: [
        { text: "…", ending: "bad_1" },
      ],
    },
  };

  // ---------------- FINALES ----------------
  const endings = {
    good: {
      title: "FIN — La luz",
      palette: "end-good",
      text:
"Daniel sale de la isla con los archivos de Voss en la mano y se sienta delante de tres periodistas que no entienden lo que están viendo. NEXUM Corporation es destruida en seis meses. Tres gobiernos se hunden con ella. \n\nMateo lo abraza en un aeropuerto. Daniel no llora. Llora después, solo, en un cuarto de hotel, durante dos horas seguidas, por todos los nombres que ya no puede pronunciar."
    },
    bad_1: {
      title: "FIN — El silencio",
      palette: "end-bad-1",
      text:
"Daniel ya no toma decisiones. Algo más adentro las toma por él. Lo último que ve antes del corte es su propia mano haciendo lo que no quería hacer. \n\nMateo va a crecer sin saber qué pasó. Eso, también, es una manera de morir."
    },
    bad_2: {
      title: "FIN — Sin nombre",
      palette: "end-bad-2",
      text:
"La isla se queda con Daniel sin necesidad de matarlo. Lo que vuelve a casa, si vuelve, no es él. Pasa el resto de su vida en una habitación blanca, mirando una ventana, repitiendo una palabra que nadie entiende: Mateo."
    },
    neutral: {
      title: "FIN — El rescate",
      palette: "end-neutral",
      text:
"Un pesquero filipino lo recoge a la deriva. Le ofrecen agua. Daniel no habla durante doce días. Cuando habla, no menciona la isla. \n\nVuelve a la oficina de logística. Vuelve a contar números. Mateo aprende a vivir con un padre callado. La isla nunca aparece en ningún titular."
    },
    rare: {
      title: "FIN — Lo que queda dentro",
      palette: "end-rare",
      text:
"Daniel vuelve. Daniel abraza a Mateo. Mateo le dice que tiene la piel fría y Daniel se ríe y le dice que está cansado del viaje. \n\nDos semanas después, en el baño de su casa, Daniel se mira la mano y no la reconoce del todo. Algo dentro de él está cambiando despacio. No le duele. Eso es lo peor. \n\nNEXUM, en Ginebra, recibe una alerta automatizada. Un compuesto está activo otra vez. En un lugar que no es la isla."
    },
    death: {
      title: "FIN",
      palette: "end-bad-1",
      text:
"Daniel muere en la isla. Mateo nunca va a saber qué pasó esa noche."
    },
  };

  return {
    scenes,
    endings,
    startScene: "prologo_apertura",
    decideEnding,
  };
})();

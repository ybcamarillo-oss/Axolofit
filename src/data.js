// Datos y cálculos copiados TAL CUAL de la PWA (AxoloFit-source.html) para que la app nativa
// calcule y muestre exactamente lo mismo. Se genera con un script: no editar a mano a la ligera.

export const rango = (v) => { const lo = Math.round(v * 0.85 / 5) * 5; const hi = Math.round(v * 1.15 / 5) * 5; return lo + "–" + hi; };
export const FOODS = [
  { id: "pastor", n: "Taco al pastor", u: "1 pza", kcal: 140, p: 8, c: 16, g: 5 },
  { id: "ques", n: "Quesadilla de queso", u: "1 pza", kcal: 280, p: 12, c: 28, g: 14 },
  { id: "tamal", n: "Tamal verde", u: "1 pza", kcal: 230, p: 5, c: 30, g: 10 },
  { id: "pozole", n: "Pozole rojo", u: "1 tazón", kcal: 300, p: 22, c: 28, g: 10 },
  { id: "chila", n: "Chilaquiles verdes", u: "1 plato", kcal: 450, p: 15, c: 45, g: 22 },
  { id: "tortilla", n: "Tortilla de maíz", u: "1 pza", kcal: 50, p: 1, c: 11, g: 1 },
  { id: "frijol", n: "Frijoles de la olla", u: "1 taza", kcal: 220, p: 14, c: 40, g: 1 },
  { id: "mole", n: "Pollo con mole", u: "1 plato", kcal: 480, p: 30, c: 25, g: 28 },
  { id: "concha", n: "Concha (pan dulce)", u: "1 pza", kcal: 290, p: 6, c: 46, g: 10 },
  { id: "sope", n: "Sope", u: "1 pza", kcal: 200, p: 7, c: 24, g: 9 },
  { id: "horchata", n: "Agua de horchata", u: "1 vaso", kcal: 150, p: 1, c: 30, g: 3 },
  { id: "coca0", n: "Coca sin azúcar", u: "1 lata", kcal: 0, p: 0, c: 0, g: 0 },
  { id: "huevo", n: "Huevo", u: "1 pza", kcal: 70, p: 6, c: 1, g: 5 },
  { id: "agua", n: "Aguacate", u: "1/2 pza", kcal: 120, p: 1, c: 6, g: 11 },
  { id: "pechuga", n: "Pechuga a la plancha", u: "100 g", kcal: 165, p: 31, c: 0, g: 4 },
  { id: "cafe", n: "Café con leche", u: "1 taza", kcal: 80, p: 4, c: 8, g: 3 },
];
export const PALETTES = {
  durazno: { body: "#F0C3AC", gill: "#DD9E83", blush: "#EE9A86", label: "Durazno", premium: false },
  rosa: { body: "#F4B7C6", gill: "#E388A0", blush: "#EE8FA5", label: "Rosa", premium: false },
  menta: { body: "#A9E3D0", gill: "#4FBFA0", blush: "#7FD9BD", label: "Menta", premium: false },
  cielo: { body: "#B4D4FB", gill: "#6FA3F0", blush: "#8FBDF5", label: "Cielo", premium: false },
  morado: { body: "#C9A7F0", gill: "#8E5BD0", blush: "#BC8FE6", label: "Morado", premium: false },
  dorado: { body: "#FFE08A", gill: "#F2B705", blush: "#FFD15C", label: "Dorado", premium: true },
  galaxia: { body: "#C9B6FF", gill: "#7C5CFF", blush: "#A98FFF", label: "Galaxia", premium: true },
  leucistico: { body: "#FBE7EA", gill: "#FF7088", blush: "#F6C9D2", label: "Leucístico", premium: true },
  albino: { body: "#F7E6A0", gill: "#EFC850", blush: "#F2DA8A", label: "Albino", premium: true },
  melanico: { body: "#5E5E6B", gill: "#3F3F4A", blush: "#73737F", label: "Melánico", premium: true },
  salvaje: { body: "#9C8B63", gill: "#6E5E3C", blush: "#8A7A52", label: "Salvaje", premium: true },
  cobre: { body: "#C98E63", gill: "#A8693F", blush: "#BE8055", label: "Cobre", premium: true },
  axantico: { body: "#BAC5D2", gill: "#7F8EA3", blush: "#E3A9B8", label: "Axántico", premium: true },
  mosaico: { body: "#F4E7D6", gill: "#B9825E", blush: "#EE9A86", label: "Mosaico", premium: true },
  luciernaga: { body: "#CFF5B8", gill: "#2FCB6A", blush: "#8FE3A0", label: "Luciérnaga", premium: true },
  perla: { body: "#FBFCFF", gill: "#81E6D9", blush: "#F6AD55", label: "Perla", premium: true },
  arcoiris: { body: "#C9A7F0", gill: "#8E5BD0", blush: "#FFB3D9", label: "Arcoíris", premium: true },
};
// Skins que se regalan al cumplir metas (1ra vez y cada 7 días)
export const SKINS_REGALO = ["dorado", "leucistico", "galaxia", "albino", "cobre", "melanico", "salvaje", "arcoiris", "axantico", "mosaico", "luciernaga", "perla"];
export const ACCESSORIES = { ninguno: { label: "Ninguno", premium: false }, flor: { label: "Florecita", premium: false }, monito: { label: "Moñito", premium: false }, gorra: { label: "Gorra", premium: false }, fiesta: { label: "Gorro", premium: false }, conejo: { label: "Gorro conejo", premium: true }, gato: { label: "Gorro gato", premium: true }, mariposa: { label: "Alas mariposa", premium: true }, corona: { label: "Corona", premium: true } };
export const ESTILOS = { clasico: { label: "Clásico", premium: false }, galan: { label: "Galán", premium: true } };
// Vestido: el lila es gratis (contrasta con todos los colores de Axo); los demás colores se desbloquean viendo un anuncio o comprándolos ($18 MXN)
export const VESTIDOS = {
  rosa: { label: "Rosa", base: "#F6A5C0", dark: "#E07A9E" },
  lila: { label: "Lila", base: "#C9B3F2", dark: "#9C80DB", gratis: true },
  menta: { label: "Menta", base: "#9FDCC8", dark: "#5FB79A" },
  celeste: { label: "Celeste", base: "#A9D4F5", dark: "#6AAEE3" },
  amarillo: { label: "Amarillo", base: "#FBE08A", dark: "#E3B93E" },
  coral: { label: "Coral", base: "#FBA68F", dark: "#E57A5E" },
};
export const PRECIO_COLOR = "$18 MXN";

export const OUTFITS = { ninguno: { label: "Ninguno", premium: false }, vestido_lila: { label: "Vestido", premium: false }, jersey: { label: "Jersey verde", premium: false }, sarape: { label: "Sarape", premium: false }, hoodieRojo: { label: "Hoodie rojo", premium: false }, hoodieAzul: { label: "Hoodie azul", premium: false }, playeraRaya: { label: "Playera rayada", premium: false }, poloRosa: { label: "Polo rosa", premium: true }, chivas: { label: "Rojiblanca", premium: true }, azulDiag: { label: "Azul diagonal", premium: true }, pumas: { label: "Felino azul y oro", premium: true } };
export const BACKGROUNDS = { agua: { label: "Agua", from: "#E7F7F4", to: "#CDEFE9", premium: false }, lavanda: { label: "Lavanda", from: "#F0EBFF", to: "#E2D8FF", premium: false }, atardecer: { label: "Atardecer", from: "#FFE9D6", to: "#FFD3C0", premium: false }, noche: { label: "Noche", from: "#4E5180", to: "#3A3D63", premium: true } };
export const PHRASES = ["¡Lo lograste! Estoy orgulloso de ti 💗", "Hoy te cuidaste increíble. Gracias por cuidarme a mí también.", "Pequeños pasos, gran corazón. ¡Mua!", "Cada día contigo soy más fuerte 🥹"];
// Lo que dice Axo cuando está tranquilo (no pide nada) y cómo reacciona si lo tocan
export const AXO_IDLE = ["Aquí estoy contigo 💗", "¿Cómo vamos hoy?", "Me gusta estar contigo ✨", "Hoy es un buen día 🌿", "Estoy de tu lado", "¡Qué bonito verte! 💗"];
export const AXO_REACCIONES = ["¡Jiji, cosquillas! 😄", "¡Hola, hola! 💗", "¡Me encanta que estés aquí! ✨", "¡Mua! 💗", "¡Qué bien se siente! 🥰", "¡Otra vez, otra vez! 😄"];
export const COACH_QA = {
  "¿Qué pido en una taquería?": "Pide al pastor o de pollo asado, con cebolla, cilantro y limón. Tortilla de maíz (no harina), salsa al gusto y evita 'volcanes' con mucho queso. 3–4 tacos rondan 400–500 kcal con buena proteína. 🌮",
  "Tengo antojo de algo dulce": "El antojo es normal, no lo resistas. Una concha pequeña entra perfecto si cabe en tus macros del día; o fruta con yogur griego y canela. Disfrútalo sin culpa: un gusto planeado sostiene el hábito. 🍓",
  "Voy a una fiesta": "Llega comido (un snack con proteína evita el hambre voraz). Plato: mitad verduras/proteína, el resto lo que disfrutes. Alterna cada bebida con un vaso de agua. Un día social no borra tu progreso. 🎉",
};

// Tips con respaldo. "tipo": ensayo = estudio controlado; observacional = muestra asociación, no prueba causa; guia = recomendación oficial.
export const TIPS_CATS = { mov: "🚶 Movimiento", comer: "🥗 Comer mejor", habitos: "🌙 Hábitos", mente: "💗 Mente" };
export const TIPS = [
  { c: "habitos", e: "🔁", t: "Constancia sobre perfección", d: "Lo que cuenta es lo que haces la mayoría de los días. Si algo se salió del plan, vuelves en la siguiente comida, no el lunes. ¡Cada comida es una nueva oportunidad!", f: "Consejo de hábito" },
  { c: "mov", e: "👟", t: "Con 7,000 pasos ya ganas mucho", d: "Caminar unos 7,000 pasos al día le hace mucho bien a tu corazón y a tu ánimo. Lo bueno se nota sobre todo entre 5,000 y 7,000 pasos, y desde 4,000 ya cuenta. No necesitas llegar a 10,000, ¡cada pasito suma!", f: "Lancet Public Health 2025 · observacional" },
  { c: "mov", e: "🏃", t: "Tu cuerpo ama moverse", d: "Con 20 a 40 minutos de movimiento al día llegas a lo que recomienda la OMS: entre 150 y 300 minutos a la semana. Caminar, bailar, andar en bici o subir escaleras, ¡lo que más disfrutes!", f: "OMS 2020 · guía oficial", tipo: "guia" },
  { c: "mov", e: "💪", t: "Fuerza 2 días a la semana", d: "La OMS recomienda hacer ejercicios de fuerza al menos 2 días a la semana. Te ayudan a no perder músculo mientras bajas de peso y a sentirte con más fuerza.", f: "OMS 2020 · guía oficial", tipo: "guia" },
  { c: "mov", e: "⏱️", t: "Cualquier movimiento suma", d: "Los ratitos cortos también cuentan. Caminar 10 minutos después de comer, estirarte cada hora o subir escaleras se va sumando en tu semana. Lo mejor es lo que sí vas a hacer.", f: "OMS 2020 · guía oficial", tipo: "guia" },
  { c: "mov", e: "🪑", t: "Un respiro de movimiento", d: "La OMS recomienda cambiar los ratos de estar sentado por algo de movimiento, aunque sea suave. Si llevas rato en la silla o frente a la pantalla, levántate, estírate y camina un poco.", f: "OMS 2020 · guía oficial", tipo: "guia" },
  { c: "comer", e: "🍱", t: "Prepara tus alimentos con anticipación", d: "Tener la comida lista te lo pone más fácil. En un estudio, quienes más siguieron su plan de comidas bajaron 6.4 kg en 12 semanas, un 24% más que quienes casi no lo usaron. Y en otro estudio, el 74% de quienes tenían sus comidas ya porcionadas bajó 5% o más de su peso, contra el 53% del otro grupo.", f: "CSIRO 2026 (observacional) · Rock 2016 (ensayo)", tipo: "mixto" },
  { c: "comer", e: "📝", t: "Apuntar lo que comes funciona", d: "En un estudio con unas 1,700 personas, quienes apuntaron lo que comían todos los días bajaron casi el doble de peso. Ojo: solo se observó a la gente (quizá quien apunta ya venía muy motivado), pero anotar te ayuda a ver cómo comes, sin obsesionarte.", f: "Kaiser Permanente · observacional" },
  { c: "comer", e: "💧", t: "Un vaso de agua antes de comer", d: "Tomar un vaso grande de agua (unos 500 ml) antes de comer ayudó en estudios a bajar entre 1.3 y 2 kg más en 12 semanas, junto con una alimentación para bajar de peso. Es un empujoncito pequeño y fácil de hacer.", f: "Parretti 2015 · Dennis 2010 (ensayos)", tipo: "ensayo" },
  { c: "comer", e: "🥑", t: "Come más comida de verdad", d: "En un estudio pequeño del NIH (20 adultos), con comida poco procesada comieron unas 500 kcal menos al día que con ultraprocesados, y bajaron cerca de 0.9 kg en 2 semanas. Elegir comida que reconoces te ayuda a comer justo lo que necesitas.", f: "Hall 2019 · NIH · ensayo (n=20)", tipo: "ensayo" },
  { c: "comer", e: "🍗", t: "Proteína en cada comida", d: "La proteína te quita el hambre por más tiempo y te ayuda a cuidar tu músculo mientras bajas de peso. Huevo, pollo, pescado, frijoles, lentejas, queso fresco y yogur griego son opciones fáciles.", f: "Consenso general de nutrición" },
  { c: "comer", e: "🥦", t: "Fibra para aguantar sin hambre", d: "Las verduras, frutas, leguminosas y granos enteros llenan con pocas calorías y te dan una energía más estable. Acompaña con ellas tus carbohidratos.", f: "Consenso general de nutrición" },
  { c: "comer", e: "🍽️", t: "Come con calma y sin pantallas", d: "Comer con calma te ayuda a notar cuándo ya tuviste suficiente y a disfrutar más. Si puedes, deja el celular a un lado al menos en una comida al día.", f: "Consejo de hábito" },
  { c: "comer", e: "🛒", t: "Haz lista antes de ir al súper", d: "Ir con una lista basada en tu plan te ayuda a llevar solo lo que necesitas. Con la alacena bien surtida, comer bien es más fácil.", f: "Consejo de hábito" },
  { c: "habitos", e: "😴", t: "Dormir bien te ayuda a elegir mejor", d: "Lo ideal es dormir 7 horas o más, dice la Academia Americana de Medicina del Sueño. Cuando descansas, es más fácil elegir bien: en un estudio que juntó muchos más, dormir poco hacía comer unas 385 kcal de más al día.", f: "AASM 2015 (guía) · King's College (metaanálisis)", tipo: "guia" },
  { c: "habitos", e: "⚖️", t: "Tu peso sube y baja, y es normal", d: "De un día a otro tu peso cambia por el agua, la sal, el sueño y hasta el ciclo menstrual. Mejor fíjate en cómo va a lo largo de varias semanas. Tus medidas y cómo te queda la ropa también cuentan.", f: "Consejo de hábito" },
  { c: "habitos", e: "🎯", t: "Metas pequeñas y concretas", d: "Elige una o dos metas a la vez, como «tomar 6 vasos de agua» o «caminar 20 min después de comer». Cuando una ya sea un hábito, suma otra. ¡Poquito a poquito se llega lejos!", f: "Consejo de hábito" },
  { c: "mente", e: "🌿", t: "Disfruta sin culpa", d: "Comer algo que te gusta también es parte de vivir sano. Un gusto planeado te ayuda a seguir mucho más que prohibirte todo.", f: "Consejo de hábito" },
  { c: "mente", e: "🤝", t: "Pide apoyo", d: "Cuéntale a alguien tu meta: con compañía es más ligero. Si tienes alguna condición de salud, hay embarazo o tomas medicamentos, consulta a tu médico o nutriólogo antes de cambiar tu alimentación o ejercicio.", f: "Recomendación de seguridad" },
];

export const RECETAS = [
  { n: "Tacos de pollo a la plancha", kcal: 420, p: 38, c: 32, g: 14, ing: ["3 tortillas de maíz", "150 g pechuga de pollo", "Cebolla y cilantro", "Salsa verde", "Limón"], prep: "Asa la pechuga sazonada y pícala. Calienta las tortillas y arma los tacos con cebolla, cilantro, salsa y limón." },
  { n: "Bowl de frijol y aguacate", kcal: 380, p: 16, c: 46, g: 16, ing: ["1 taza de frijoles de la olla", "1/2 taza de arroz integral", "1/2 aguacate", "Pico de gallo", "Queso fresco al gusto"], prep: "Sirve arroz y frijoles, agrega aguacate en cubos, pico de gallo y un poco de queso fresco." },
  { n: "Huevos a la mexicana con nopal", kcal: 300, p: 20, c: 14, g: 18, ing: ["2 huevos", "1 nopal asado", "Jitomate, cebolla y chile", "1 tortilla de maíz"], prep: "Sofríe jitomate, cebolla y chile, agrega los huevos batidos y el nopal en tiras. Acompaña con una tortilla." },
  { n: "Pescado a la veracruzana ligero", kcal: 350, p: 34, c: 18, g: 12, ing: ["150 g filete de pescado blanco", "Jitomate, aceituna y alcaparra", "Cebolla y ajo", "1/2 taza de arroz"], prep: "Cuece el pescado en salsa de jitomate con cebolla, ajo, aceitunas y alcaparras. Sirve con poco arroz." },
];

export const GAME_ITEMS = [
  { n: "Pechuga a la plancha", sano: true }, { n: "Refresco azucarado", sano: false },
  { n: "Ensalada de nopales", sano: true }, { n: "Frituras de bolsa", sano: false },
  { n: "Fruta picada", sano: true }, { n: "Pan dulce de relleno", sano: false },
  { n: "Huevo cocido", sano: true }, { n: "Hot dog con todo", sano: false },
  { n: "Avena con fruta", sano: true }, { n: "Jugo industrial", sano: false },
  { n: "Frijoles de la olla", sano: true }, { n: "Papas a la francesa", sano: false },
  { n: "Yogur griego natural", sano: true }, { n: "Galletas rellenas", sano: false },
  { n: "Pescado al vapor", sano: true }, { n: "Chicharrón de harina", sano: false },
  { n: "Verduras al vapor", sano: true }, { n: "Pastel de chocolate", sano: false },
  { n: "Tacos al pastor (3+)", sano: false }, { n: "Jícama con limón", sano: true },
];

export const MENU_DB = {
  desayuno: [
    { n: "Huevos a la mexicana", d: "3 huevos · jitomate, cebolla y chile · 1 tortilla de maíz", kcal: 340, p: 26, c: 18, g: 18, veg: true, con: ["huevo"], main: "huevo" },
    { n: "Omelette de claras y panela", d: "5 claras + 1 huevo · 50 g de panela · espinacas · 1 tortilla de maíz", kcal: 320, p: 34, c: 18, g: 12, veg: true, con: ["huevo", "lacteo"], main: "huevo" },
    { n: "Queso cottage con fresas y nuez", d: "200 g de queso cottage · 1 taza de fresas · 15 g de nuez", kcal: 290, p: 28, c: 18, g: 12, veg: true, con: ["lacteo", "nuez"], main: "cottage" },
    { n: "Huevos con aguacate y espinaca", d: "3 huevos · ½ aguacate · espinacas salteadas", kcal: 330, p: 21, c: 8, g: 24, veg: true, con: ["huevo"], lc: true, main: "huevo" },
    { n: "Chilaquiles verdes con pollo y huevo", d: "Totopos horneados · salsa verde · 1 huevo · 80 g de pollo deshebrado", kcal: 410, p: 34, c: 24, g: 18, veg: false, con: ["huevo"], main: "pollo" },
    { n: "Yogur griego con avena", d: "250 g de yogur griego · 30 g de avena · canela", kcal: 320, p: 30, c: 28, g: 8, veg: true, con: ["lacteo"], main: "yogur" },
    { n: "Omelette de panela y champiñones", d: "1 huevo + 4 claras · 60 g de panela · ½ taza de champiñones", kcal: 300, p: 32, c: 12, g: 14, veg: true, con: ["huevo", "lacteo"], main: "huevo" },
    { n: "Molletes proteicos de frijol", d: "1 bolillo integral chico · ½ taza de frijol · 60 g de panela gratinada", kcal: 380, p: 24, c: 38, g: 12, veg: true, con: ["gluten", "lacteo"], main: "frijol" },
    { n: "Quesadillas de panela con champiñones", d: "2 tortillas de maíz · 60 g de panela · ½ taza de champiñones al comal", kcal: 290, p: 16, c: 26, g: 10, veg: true, con: ["lacteo"], main: "panela" },
    { n: "Champiñones guisados con panela", d: "1 taza de champiñones con jitomate, cebolla y chile · 60 g de panela · 1 tortilla", kcal: 240, p: 15, c: 18, g: 9, veg: true, con: ["lacteo"], main: "champiñon" },
    { n: "Tostadas Salmas con frijol y nopales", d: "3 tostadas Salmas · ½ taza de frijoles · 1 taza de nopales · 40 g de panela · ¼ aguacate", kcal: 285, p: 12, c: 36, g: 11, veg: true, con: ["lacteo"], main: "frijol" },
    { n: "Huevo revuelto con nopales", d: "2 huevos + 2 claras · 1 taza de nopales cocidos · 1 tortilla de maíz", kcal: 220, p: 21, c: 15, g: 10, veg: true, con: ["huevo"], main: "huevo" },
    { n: "Avena trasnochada con chía y cottage", d: "40 g de avena · 1 cdita de chía · 4 cdas de queso cottage · endulzante", kcal: 265, p: 16, c: 35, g: 5, veg: true, con: ["lacteo"], main: "avena" },
    { n: "Licuado proteico de plátano y yogur", d: "200 g de yogur griego · ½ plátano · 1 taza de leche descremada", kcal: 295, p: 24, c: 38, g: 2, veg: true, con: ["lacteo"], main: "yogur" },
    { n: "Huevos divorciados ligeros", d: "2 huevos estrellados · 2 tortillas al comal · salsa verde y roja naturales", kcal: 260, p: 14, c: 24, g: 10, veg: true, con: ["huevo"], main: "huevo" },
    { n: "Pan tostado con aguacate y requesón", d: "1 rebanada de pan integral tostado · 40 g de requesón · ¼ aguacate", kcal: 210, p: 10, c: 20, g: 10, veg: true, con: ["gluten", "lacteo"], main: "requesón" },
    { n: "Claras con champiñones al ajillo", d: "5 claras · champiñones con ajo y chile guajillo · 1 tortilla de maíz", kcal: 195, p: 21, c: 14, g: 1, veg: true, con: ["huevo"], main: "huevo" },
    { n: "Sincronizada de pavo y panela", d: "2 tortillas de maíz · 2 rebanadas de pavo · 40 g de panela · salsa verde", kcal: 255, p: 16, c: 24, g: 7, veg: false, con: ["lacteo"], main: "pavo" },
    { n: "Huevos con jamón de pavo y ejotes", d: "2 huevos · ½ taza de ejotes cocidos · 2 rebanadas de jamón de pavo", kcal: 215, p: 18, c: 8, g: 11, veg: false, con: ["huevo"], lc: true, main: "huevo" },
    { n: "Gordita de maíz con requesón y nopales", d: "1 gordita de maíz asada · 50 g de requesón · 1 taza de ensalada de nopales", kcal: 245, p: 12, c: 30, g: 5, veg: true, con: ["lacteo"], main: "requesón" },
    { n: "Yogur griego con manzana y almendras", d: "200 g de yogur griego · 1 manzana picada · 10 almendras", kcal: 310, p: 22, c: 32, g: 10, veg: true, con: ["lacteo", "nuez"], main: "yogur" },
    { n: "Huevos con calabacitas y elote", d: "2 huevos · ½ taza de calabacita · 2 cdas de granos de elote natural", kcal: 205, p: 14, c: 12, g: 11, veg: true, con: ["huevo"], lc: true, main: "huevo" },
    { n: "Ensalada de frutas proteica", d: "1 taza de papaya y melón · 150 g de requesón · 1 cda de semillas de girasol", kcal: 260, p: 18, c: 28, g: 9, veg: true, con: ["lacteo"], main: "requesón" },
    { n: "Claras con espinacas y salsa pasilla", d: "5 claras · espinacas libres · salsa pasilla casera · 1 tortilla de maíz", kcal: 165, p: 21, c: 14, g: 1, veg: true, con: ["huevo"], main: "huevo" },
    { n: "Enchiladas de panela ligeras", d: "3 tortillas de maíz · 60 g de panela · salsa verde hervida · lechuga picada", kcal: 315, p: 16, c: 36, g: 9, veg: true, con: ["lacteo"], main: "panela" },
  ],
  comida: [
    { n: "Pollo a la plancha con ensalada y aguacate", d: "180 g de pechuga · ensalada verde grande · ½ aguacate · limón", kcal: 410, p: 48, c: 12, g: 20, veg: false, con: [], lc: true, main: "pollo" },
    { n: "Pescado a la plancha con verduras", d: "180 g de pescado blanco · verduras al vapor · ½ aguacate", kcal: 420, p: 42, c: 14, g: 22, veg: false, con: ["pescado"], main: "pescado" },
    { n: "Fajitas de res magra", d: "160 g de res en tiras · pimientos y cebolla · 1 tortilla de maíz", kcal: 430, p: 42, c: 20, g: 20, veg: false, con: [], main: "res" },
    { n: "Tinga de pollo en tostadas", d: "160 g de pollo en tinga · 2 tostadas horneadas · ½ aguacate · lechuga", kcal: 440, p: 40, c: 26, g: 20, veg: false, con: [], main: "pollo" },
    { n: "Pollo con mole y arroz integral", d: "160 g de pollo bañado en mole · ⅓ taza de arroz integral · 1 tortilla", kcal: 490, p: 42, c: 30, g: 22, veg: false, con: ["nuez"], main: "pollo" },
    { n: "Picadillo de res con verduras", d: "170 g de picadillo de res · papa, zanahoria y chícharo · 1 tortilla", kcal: 450, p: 40, c: 28, g: 20, veg: false, con: [], main: "res" },
    { n: "Calabazas guisadas con pollo", d: "170 g de pollo deshebrado · calabacitas con jitomate y elote · 1 tortilla", kcal: 400, p: 40, c: 22, g: 14, veg: false, con: [], main: "pollo" },
    { n: "Pechuga con camote al horno", d: "190 g de pechuga · 150 g de camote al horno · ensalada verde libre", kcal: 470, p: 46, c: 34, g: 12, veg: false, con: [], main: "pollo" },
    { n: "Bowl de pollo, quinoa y aguacate", d: "150 g de pollo · ½ taza de quinoa · ½ aguacate · verduras", kcal: 480, p: 42, c: 30, g: 20, veg: false, con: [], main: "pollo" },
    { n: "Tinga de zanahoria en tostadas", d: "1½ tazas de zanahoria rallada guisada con chipotle · 2 tostadas · ¼ aguacate · lechuga", kcal: 260, p: 5, c: 32, g: 9, veg: true, con: [], main: "zanahoria" },
    { n: "Ceviche de hongos", d: "1½ tazas de champiñones y setas marinados con limón, jitomate y pepino · ¼ aguacate · 2 tostadas", kcal: 250, p: 6, c: 30, g: 9, veg: true, con: [], main: "champiñon" },
    { n: "Pescado a la veracruzana", d: "150 g de pescado blanco · salsa de jitomate con aceitunas y alcaparras · ½ taza de arroz", kcal: 350, p: 34, c: 18, g: 12, veg: false, con: ["pescado"], main: "pescado" },
    { n: "Bistec con nopales en salsa verde", d: "160 g de falda de res en tiras · 1 taza de nopales · salsa verde asada · 1 tortilla", kcal: 320, p: 34, c: 16, g: 14, veg: false, con: [], main: "res" },
    { n: "Salpicón de pollo ligero", d: "160 g de pollo deshebrado · lechuga, jitomate, cebolla, vinagre · ¼ aguacate · 2 tostadas", kcal: 345, p: 36, c: 20, g: 13, veg: false, con: [], main: "pollo" },
    { n: "Caldo tlalpeño de pollo", d: "150 g de pechuga · garbanzos, ejotes, calabacitas y chipotle · ¼ aguacate", kcal: 360, p: 38, c: 24, g: 12, veg: false, con: [], main: "pollo" },
    { n: "Pechuga rellena de espinacas", d: "160 g de pechuga rellena de espinacas y 30 g de panela · ensalada mixta", kcal: 310, p: 42, c: 6, g: 13, veg: false, con: ["lacteo"], lc: true, main: "pollo" },
    { n: "Brochetas de res y vegetales", d: "160 g de res magra en cubos · cebolla, pimiento y champiñones · ½ taza de arroz integral", kcal: 390, p: 36, c: 32, g: 12, veg: false, con: [], main: "res" },
    { n: "Pescado al vapor en papillote", d: "160 g de pescado · calabacita, zanahoria y epazote en papel aluminio · ¼ aguacate", kcal: 270, p: 32, c: 10, g: 11, veg: false, con: ["pescado"], lc: true, main: "pescado" },
    { n: "Ensalada de atún con pasta integral", d: "1 lata de atún · ½ taza de pasta integral · zanahoria, chícharo y elote · yogur como aderezo", kcal: 290, p: 28, c: 34, g: 4, veg: false, con: ["pescado", "lacteo", "gluten"], main: "atun" },
    { n: "Pollo en salsa de tomatillo", d: "170 g de pollo sin piel en salsa verde con cilantro · ½ taza de frijoles de la olla", kcal: 365, p: 38, c: 22, g: 13, veg: false, con: [], main: "pollo" },
    { n: "Bistec a la mexicana", d: "160 g de bistec de res · jitomate, cebolla y chile verde · 1 tortilla de maíz", kcal: 310, p: 34, c: 14, g: 12, veg: false, con: [], lc: true, main: "res" },
    { n: "Chiles rellenos de atún (sin capear)", d: "2 chiles poblanos asados · 1 lata de atún guisado con jitomate y cebolla", kcal: 230, p: 28, c: 16, g: 4, veg: false, con: ["pescado"], lc: true, main: "atun" },
    { n: "Pechuga al pesto de aguacate", d: "160 g de pechuga · ¼ aguacate licuado con albahaca y ajo · ensalada de espinacas", kcal: 330, p: 38, c: 8, g: 16, veg: false, con: [], lc: true, main: "pollo" },
    { n: "Pescado al mojo de ajo con ejotes", d: "160 g de pescado blanco · ajo dorado al comal · 1½ tazas de ejotes con limón", kcal: 240, p: 32, c: 12, g: 6, veg: false, con: ["pescado"], lc: true, main: "pescado" },
    { n: "Albóndigas de res en caldillo", d: "160 g de albóndigas de res magra · caldillo de jitomate hervido · 1 tortilla", kcal: 340, p: 34, c: 18, g: 14, veg: false, con: [], main: "res" },
  ],
  cena: [
    { n: "Caldo de pollo con verduras", d: "160 g de pollo · calabaza, zanahoria y chayote · 1 tortilla de maíz", kcal: 320, p: 36, c: 18, g: 10, veg: false, con: [], main: "pollo" },
    { n: "Ensalada de atún con aguacate", d: "1½ latas de atún en agua · ½ aguacate · 1 tostada horneada · ensalada grande", kcal: 340, p: 38, c: 12, g: 16, veg: false, con: ["pescado"], lc: true, main: "atun" },
    { n: "Omelette de claras con espinaca y panela", d: "5 claras + 1 huevo · espinacas libres · 50 g de panela", kcal: 300, p: 36, c: 10, g: 12, veg: true, con: ["huevo", "lacteo"], lc: true, main: "huevo" },
    { n: "Calabazas guisadas con pollo y queso cottage", d: "150 g de pollo · calabacitas con jitomate · 80 g de queso cottage", kcal: 350, p: 38, c: 16, g: 14, veg: false, con: ["lacteo"], main: "pollo" },
    { n: "Picadillo de res con ensalada", d: "160 g de picadillo de res · ensalada grande · ¼ aguacate", kcal: 350, p: 36, c: 14, g: 16, veg: false, con: [], lc: true, main: "res" },
    { n: "Tacos de tinga de pollo", d: "150 g de pollo en tinga · 2 tostadas horneadas · lechuga picada", kcal: 380, p: 36, c: 26, g: 14, veg: false, con: [], main: "pollo" },
    { n: "Pescado al mojo de ajo con verduras", d: "170 g de pescado blanco · ejotes y zanahoria salteados al comal", kcal: 330, p: 40, c: 12, g: 14, veg: false, con: ["pescado"], lc: true, main: "pescado" },
    { n: "Sopa de lentejas", d: "1 taza de lentejas · zanahoria, apio, jitomate y cilantro fresco", kcal: 280, p: 18, c: 40, g: 4, veg: true, con: [], main: "lenteja" },
    { n: "Pechuga asada con ensalada", d: "180 g de pechuga asada · ensalada verde grande · ½ aguacate · limón", kcal: 390, p: 46, c: 10, g: 18, veg: false, con: [], lc: true, main: "pollo" },
    { n: "Tacos de requesón y nopales", d: "2 tortillas de maíz · 80 g de requesón · 1 taza de nopales asados al comal", kcal: 220, p: 14, c: 26, g: 4, veg: true, con: ["lacteo"], main: "requesón" },
    { n: "Panela asada con salsa de tomate", d: "100 g de panela asada al comal · salsa de jitomate con orégano · ¼ aguacate", kcal: 280, p: 18, c: 8, g: 20, veg: true, con: ["lacteo"], lc: true, main: "panela" },
    { n: "Atún a la mexicana rápido", d: "1 lata de atún · jitomate, cebolla y cilantro picados · limón · 3 tostadas Salmas", kcal: 200, p: 25, c: 16, g: 3, veg: false, con: ["pescado"], lc: true, main: "atun" },
    { n: "Pechuga deshebrada con salsa verde", d: "140 g de pechuga deshebrada en salsa verde tibia · ensalada de pepino y jícama", kcal: 245, p: 34, c: 12, g: 5, veg: false, con: [], lc: true, main: "pollo" },
    { n: "Sopa de verduras con pollo", d: "Caldo de verduras con calabacita, chayote y apio · 120 g de pollo en cubos", kcal: 210, p: 28, c: 14, g: 4, veg: false, con: [], lc: true, main: "pollo" },
    { n: "Crema de calabacita ligera", d: "Calabacitas licuadas con leche descremada o caldo · 40 g de panela desmoronada encima", kcal: 160, p: 12, c: 14, g: 6, veg: true, con: ["lacteo"], lc: true, main: "calabacita" },
    { n: "Tostadas de queso cottage", d: "2 tostadas horneadas · 100 g de queso cottage · rebanadas de jitomate", kcal: 175, p: 15, c: 20, g: 3, veg: true, con: ["lacteo"], main: "cottage" },
    { n: "Ensalada César con pollo ligera", d: "140 g de pechuga · lechuga romana · yogur con limón y parmesano como aderezo", kcal: 255, p: 36, c: 6, g: 9, veg: false, con: ["lacteo"], lc: true, main: "pollo" },
    { n: "Rollitos de pavo y panela", d: "4 rebanadas de pavo enrolladas con 15 g de panela c/u · ensalada de nopales fría", kcal: 190, p: 22, c: 6, g: 8, veg: false, con: ["lacteo"], lc: true, main: "pavo" },
    { n: "Ceviche de atún", d: "1 lata de atún · pepino, jitomate y cilantro picados · jugo de limón · ¼ aguacate", kcal: 215, p: 24, c: 8, g: 10, veg: false, con: ["pescado"], lc: true, main: "atun" },
    { n: "Pescado con finas hierbas al comal", d: "150 g de pescado blanco con tomillo y romero · 1 taza de nopales asados", kcal: 160, p: 28, c: 8, g: 2, veg: false, con: ["pescado"], lc: true, main: "pescado" },
    { n: "Alambres de pollo nocturnos", d: "140 g de pollo asado con pimientos y cebolla · 30 g de panela gratinada", kcal: 275, p: 36, c: 10, g: 10, veg: false, con: ["lacteo"], lc: true, main: "pollo" },
    { n: "Setas guisadas al guajillo", d: "1½ tazas de setas completas con ajo, cebolla y chile guajillo en tiras", kcal: 120, p: 5, c: 18, g: 2, veg: true, con: [], main: "seta" },
    { n: "Huevo en salsa roja", d: "2 huevos pochados en salsa de jitomate caliente · 1 tortilla de maíz", kcal: 200, p: 13, c: 12, g: 10, veg: true, con: ["huevo"], lc: true, main: "huevo" },
    { n: "Ensalada verde proteica nocturna", d: "Espinacas y lechuga libres · 120 g de pechuga · 30 g de panela · 10 almendras", kcal: 320, p: 36, c: 6, g: 16, veg: false, con: ["lacteo", "nuez"], lc: true, main: "pollo" },
    { n: "Brochetas de pollo y verduras", d: "140 g de pollo en cubos asado con cebolla y pimiento morrón · ensalada verde libre", kcal: 210, p: 32, c: 10, g: 4, veg: false, con: [], lc: true, main: "pollo" },
  ],
  snack: [
    { n: "Yogur griego con nuez", d: "200 g de yogur griego natural · 10 g de nuez de Castilla", kcal: 200, p: 22, c: 10, g: 8, veg: true, con: ["lacteo", "nuez"], main: "yogur" },
    { n: "Queso cottage con fresas", d: "120 g de queso cottage · 1 taza de fresas frescas", kcal: 120, p: 14, c: 8, g: 2, veg: true, con: ["lacteo"], main: "cottage" },
    { n: "Ensalada de pepino con yogur y ajonjolí", d: "150 g de yogur griego · pepino libre · 10 g de ajonjolí tostado · limón", kcal: 140, p: 17, c: 8, g: 7, veg: true, con: ["lacteo"], main: "yogur" },
    { n: "Huevos cocidos con pepino", d: "2 huevos cocidos · pepino con limón y chile en polvo", kcal: 170, p: 13, c: 4, g: 11, veg: true, con: ["huevo"], lc: true, main: "huevo" },
    { n: "Puño de almendras", d: "20 g de almendras naturales (~15 piezas)", kcal: 140, p: 5, c: 5, g: 12, veg: true, con: ["nuez"], lc: true, main: "almendra" },
    { n: "Rollitos de pavo con aguacate", d: "60 g de pechuga de pavo · ¼ aguacate · bastones de pepino", kcal: 160, p: 16, c: 6, g: 9, veg: false, con: [], lc: true, main: "pavo" },
    { n: "Edamames con sal", d: "1 taza de edamames al vapor con su vaina · sal de grano", kcal: 150, p: 14, c: 12, g: 6, veg: true, con: [], main: "edamame" },
    { n: "Jícama con limón y chile", d: "1 taza (130 g) de jícama en bastones · limón · chile en polvo", kcal: 60, p: 1, c: 14, g: 0, veg: true, con: [], main: "jicama" },
    { n: "Camote cocido con canela", d: "120 g de camote al vapor · canela molida pura", kcal: 100, p: 2, c: 24, g: 0, veg: true, con: [], main: "camote" },
    { n: "Fruta de mano con almendras", d: "1 manzana o pera mediana · 10 almendras completas", kcal: 150, p: 3, c: 20, g: 6, veg: true, con: ["nuez"], main: "fruta" },
    { n: "Tostadas Salmas con requesón", d: "3 tostadas Salmas · 50 g de requesón · orégano o chile quebrado", kcal: 140, p: 7, c: 18, g: 4, veg: true, con: ["lacteo"], main: "requesón" },
    { n: "Gelatina de dieta con yogur", d: "1 taza de gelatina sin azúcar en cubos · 3 cdas de yogur griego natural", kcal: 65, p: 6, c: 4, g: 2, veg: true, con: ["lacteo"], lc: true, main: "yogur" },
    { n: "Zanahoria rallada con limón", d: "1 taza de zanahoria rallada fresca · limón · chile picante libre", kcal: 45, p: 1, c: 10, g: 0, veg: true, con: [], main: "zanahoria" },
    { n: "Panela en cubos con orégano", d: "60 g de queso panela · ½ cdita de aceite de oliva · orégano seco", kcal: 175, p: 11, c: 2, g: 14, veg: true, con: ["lacteo"], lc: true, main: "panela" },
    { n: "Pechuga de pavo y jícama", d: "3 rebanadas de jamón de pavo · ½ taza de jícama en cubos", kcal: 90, p: 10, c: 8, g: 2, veg: false, con: [], lc: true, main: "pavo" },
    { n: "Apio con queso crema light", d: "4 bastones grandes de apio fresco · 2 cdas de queso crema light", kcal: 75, p: 3, c: 6, g: 5, veg: true, con: ["lacteo"], lc: true, main: "apio" },
    { n: "Pepitas tostadas", d: "20 g de semillas de calabaza naturales tostadas al comal con sal", kcal: 115, p: 6, c: 3, g: 10, veg: true, con: [], lc: true, main: "pepita" },
    { n: "Yogur griego de vainilla helado", d: "150 g de yogur griego · endulzante · esencia de vainilla · congelado tipo paleta", kcal: 95, p: 15, c: 6, g: 1, veg: true, con: ["lacteo"], lc: true, main: "yogur" },
    { n: "Champiñones en escabeche", d: "1 taza de champiñones en salmuera con vinagre, cebolla y zanahoria", kcal: 50, p: 3, c: 9, g: 0, veg: true, con: [], main: "champiñon" },
    { n: "Agua de horchata de avena AxoloFit", d: "1 vaso de avena con leche de almendras sin azúcar, endulzante y canela", kcal: 40, p: 1, c: 8, g: 1, veg: true, con: [], main: "avena" },
  ],
};
// Frutas para acompañar el desayuno cuando el día queda corto en calorías
export const FRUTAS = [
  { n: "Plátano", d: "1 pieza mediana", kcal: 105, p: 1, c: 27, g: 0, con: [] },
  { n: "Manzana", d: "1 pieza mediana", kcal: 95, p: 0, c: 25, g: 0, con: [] },
  { n: "Pera", d: "1 pieza mediana", kcal: 100, p: 1, c: 27, g: 0, con: [] },
  { n: "Plato de papaya", d: "1 taza en cubos", kcal: 62, p: 1, c: 16, g: 0, con: [] },
  { n: "Tazón de fresas", d: "1 taza de fresas frescas", kcal: 50, p: 1, c: 12, g: 0, con: [] },
  { n: "Mango", d: "1 taza en cubos", kcal: 99, p: 1, c: 25, g: 0, con: [] },
  { n: "Plato de melón", d: "1 taza en cubos", kcal: 54, p: 1, c: 13, g: 0, con: [] },
  { n: "Uvas", d: "1 taza", kcal: 104, p: 1, c: 27, g: 0, con: [] },
];
export const ALERGENOS = [["lacteo", "Lácteos"], ["gluten", "Gluten"], ["huevo", "Huevo"], ["pescado", "Pescado / mariscos"], ["cerdo", "Cerdo"], ["nuez", "Frutos secos"], ["otros", "Otros"]];
export const MEAL_SPLIT = [["desayuno", "Desayuno", 0.25], ["comida", "Comida", 0.35], ["cena", "Cena", 0.30], ["snack", "Snack", 0.10]];

export function computeProfile(p) {
  const { sexo, edad, pesoKg, estaturaCm, actividad, cuelloCm, cinturaCm, caderaCm, munecaCm, objetivo } = p;
  const h = estaturaCm / 100;
  const imc = pesoKg / (h * h);
  const base = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad;
  const bmr = sexo === "M" ? base + 5 : sexo === "F" ? base - 161 : base - 78;
  const factores = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, intenso: 1.9 };
  const tdee = bmr * (factores[actividad] || 1.375);

  // % Grasa US Navy
  let bf = null;
  try {
    if (sexo === "M" && cinturaCm && cuelloCm && cinturaCm > cuelloCm) bf = 495 / (1.0324 - 0.19077 * Math.log10(cinturaCm - cuelloCm) + 0.15456 * Math.log10(estaturaCm)) - 450;
    else if (sexo === "F" && cinturaCm && cuelloCm && caderaCm && (cinturaCm + caderaCm) > cuelloCm) bf = 495 / (1.29579 - 0.35004 * Math.log10(cinturaCm + caderaCm - cuelloCm) + 0.22100 * Math.log10(estaturaCm)) - 450;
  } catch (e) {}
  if (bf != null && !isFinite(bf)) bf = null;
  if (bf != null) bf = Math.max(3, Math.min(60, bf));
  const masaMagra = bf != null ? pesoKg * (1 - bf / 100) : null;

  // Estructura ósea (frame size) — estatura / circunferencia muñeca
  let frameSize = null, pesoIdeal = null;
  if (munecaCm && munecaCm > 0) {
    const r = estaturaCm / munecaCm;
    if (sexo === "F")      frameSize = r > 11   ? "pequeña" : r >= 10.1 ? "mediana" : "grande";
    else if (sexo === "M") frameSize = r > 10.4 ? "pequeña" : r >= 9.6  ? "mediana" : "grande";
    else                   frameSize = r > 10.7 ? "pequeña" : r >= 9.85 ? "mediana" : "grande";
    // Peso ideal Hamwi ajustado por estructura
    const inchesOver5ft = Math.max(0, (estaturaCm - 152.4) / 2.54);
    let piw = sexo === "M" ? 48.1 + 2.7 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;
    if (frameSize === "pequeña") piw *= 0.9;
    if (frameSize === "grande")  piw *= 1.1;
    pesoIdeal = +piw.toFixed(1);
  }

  // ICM — Índice Cintura-Muñeca (distribución de grasa y riesgo cardiometabólico)
  let icm = null, icmRiesgo = null;
  if (cinturaCm && munecaCm && munecaCm > 0) {
    icm = +(cinturaCm / munecaCm).toFixed(2);
    if (sexo === "F")      icmRiesgo = icm < 11   ? "bajo" : icm < 12   ? "moderado" : "alto";
    else if (sexo === "M") icmRiesgo = icm < 10.4 ? "bajo" : icm < 11.3 ? "moderado" : "alto";
    else                   icmRiesgo = icm < 10.7 ? "bajo" : icm < 11.6 ? "moderado" : "alto";
  }

  const floor = sexo === "M" ? 1500 : 1200;
  const obj = p.objetivo || "perder";
  const kcalMult = obj === "ganar" ? 1.15 : obj === "mantener" ? 1.0 : 0.8;
  const objetivoDeficit = Math.max(Math.round(tdee * kcalMult), floor);
  const prote = Math.round(masaMagra ? masaMagra * 2.2 : pesoKg * 1.8);
  const grasa = Math.round(pesoKg * 0.9);
  const kcalRest = objetivoDeficit - (prote * 4 + grasa * 9);
  const carbs = Math.max(0, Math.round(kcalRest / 4));
  const aguaMl = Math.round(pesoKg * 35);
  return { imc: +imc.toFixed(1), bmr: Math.round(bmr), tdee: Math.round(tdee), bf: bf != null ? +bf.toFixed(1) : null, masaMagra: masaMagra ? +masaMagra.toFixed(1) : null, objetivoDeficit, prote, grasa, carbs, aguaMl, vasos: Math.max(6, Math.round(aguaMl / 250)), frameSize, pesoIdeal, icm, icmRiesgo };
}
export const DEMO = { sexo: "F", edad: 30, pesoKg: 68, estaturaCm: 165, actividad: "moderado", cuelloCm: 32, cinturaCm: 78, caderaCm: 98, munecaCm: 15, objetivo: "perder" };

export const KCAL_PAIRS = [
  { a:"Taco al pastor", ak:140, b:"Concha (pan dulce)", bk:290 },
  { a:"Aguacate ½ pieza", ak:120, b:"Jícama chica", bk:25 },
  { a:"Pozole rojo tazón", ak:300, b:"Chilaquiles plato", bk:450 },
  { a:"Pechuga 100g", ak:165, b:"Quesadilla", bk:280 },
  { a:"Agua de horchata", ak:150, b:"Coca sin azúcar", bk:0 },
  { a:"Frijoles 1 taza", ak:220, b:"Tortilla de maíz", bk:50 },
  { a:"Plátano", ak:105, b:"Manzana", bk:80 },
  { a:"Tamal de rajas", ak:230, b:"Mango pieza", bk:135 },
  { a:"Torta de jamón", ak:520, b:"Sándwich integral", bk:300 },
  { a:"Elote con mayonesa", ak:280, b:"Elote cocido solo", bk:120 },
  { a:"Café con leche y azúcar", ak:130, b:"Café americano", bk:5 },
  { a:"Pan de caja (2 reb)", ak:160, b:"Tostada horneada", bk:60 },
];

export const EJEMPLOS_COMIDA = ["Pide en una taquería: 3 tacos de pastor con salsa","Tengo antojo de algo dulce: un mango con chile","Desayuné: huevos revueltos con jamón y tostadas","Almorcé en la calle: torta de milanesa con refresco","Cené ligero: sopa de verduras y un yogurt","Me comí media pizza de pepperoni","Comí en la lonchería: pollo a la plancha con arroz","Antojo de snack: papas y un jugo","Comí en casa de mi mamá: mole con arroz y frijoles","Una concha del súper de camino al trabajo"];
export const promptDescribir = (descripcion) => "Eres un nutriólogo mexicano. El usuario dice que comió: \"" + descripcion + "\".\n\nEstima los macronutrientes de forma precisa. Responde SOLO con JSON válido, sin texto adicional, sin backticks:\n{\n  \"nombre\": \"nombre descriptivo del platillo\",\n  \"kcal\": número,\n  \"proteina\": número en gramos,\n  \"carbos\": número en gramos,\n  \"grasa\": número en gramos,\n  \"porcion\": \"descripción de la porción estimada\",\n  \"pregunta_extras\": \"pregunta corta sobre si hubo extras relevantes (aceite, azúcar, extras, etc.) que puedan cambiar los macros. Si no aplica, pon null\"\n}";
export const promptExtras = (texto, resultado, extras) => "El usuario comió: \"" + texto + "\". Los macros base son: " + resultado.kcal + " kcal, " + resultado.proteina + "g proteína, " + resultado.carbos + "g carbos, " + resultado.grasa + "g grasa.\nAhora dice que además tuvo: \"" + extras + "\".\nAjusta los macros sumando los extras. Responde SOLO con JSON válido:\n{\n  \"kcal\": número total,\n  \"proteina\": número total,\n  \"carbos\": número total,\n  \"grasa\": número total\n}";
export const PROMPT_FOTO = "Eres un nutriólogo mexicano. Analiza la foto de este plato de comida. Identifica los alimentos y estima los macronutrientes totales del plato. Responde SOLO con JSON válido, sin texto adicional, sin backticks:\n{\n  \"nombre\": \"descripción de lo que ves en el plato\",\n  \"kcal\": número,\n  \"proteina\": número en gramos,\n  \"carbos\": número en gramos,\n  \"grasa\": número en gramos,\n  \"porcion\": \"descripción de la porción estimada\"\n}";

import { MENU_DB, MEAL_SPLIT, FRUTAS } from './data';

// Lógica del plan semanal y del menú del día, pasada tal cual de la PWA.
// La única diferencia: aquí las funciones reciben las preferencias y las metas como parámetros.

export const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const DIAS_LABEL = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
export const DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const PISO_SEGURO = 1100; // el plan base nunca baja de aquí; el resto se completa con antojos del día

export const hoyLocal = (d = new Date()) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const fmtFecha = (f) => {
  const [, m, dd] = f.split('-').map(Number);
  return dd + ' de ' + MESES_CORTO[m - 1];
};

// Lunes de la semana de una fecha, y los 7 días de esa semana
export function lunesDe(d = new Date()) {
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const l = new Date(d);
  l.setDate(d.getDate() + diff);
  return l;
}
export function semanaDe(d = new Date()) {
  const l = lunesDe(d);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(l);
    x.setDate(l.getDate() + i);
    return x;
  });
}
// Letra del día de hoy en el plan (L, M, X…)
export const diaDeHoy = () => DIAS[(new Date().getDay() + 6) % 7];

export const allowedIdx = (prefs, k) => {
  const arr = MENU_DB[k]
    .map((it, idx) => ({ it, idx }))
    .filter(({ it }) => (!prefs.veg || it.veg) && (prefs.lowcarb ? it.c <= 16 : !it.lc) && !it.con.some((c) => prefs.evitar.includes(c)))
    .map((o) => o.idx);
  return arr.length ? arr : MENU_DB[k].map((_, i) => i);
};
export const pickIdx = (prefs, k) => {
  const al = allowedIdx(prefs, k);
  return al[Math.floor(Math.random() * al.length)];
};
export const dayKcal = (d) =>
  MEAL_SPLIT.reduce((sum, [k]) => sum + (MENU_DB[k][d[k]]?.kcal || 0), 0) +
  (d.fruta != null ? FRUTAS[d.fruta].kcal : 0) +
  (d.snack2 != null ? MENU_DB.snack[d.snack2].kcal : 0);

// factor de escala del día para cuadrar con el objetivo (limitado 0.8x–1.4x para que siga siendo realista)
export const dayFactor = (targets, d) => {
  const base = dayKcal(d);
  if (!base) return 1;
  return Math.max(0.8, Math.min(1.4, targets.objetivoDeficit / base));
};
export const scaleMeal = (dish, f) => ({
  ...dish,
  kcal: Math.round(dish.kcal * f),
  p: Math.round(dish.p * f),
  c: Math.round(dish.c * f),
  g: Math.round(dish.g * f),
});

// frutas permitidas según alergias
const frutasOk = (prefs) => {
  const arr = FRUTAS.map((f, i) => ({ f, i }))
    .filter(({ f }) => !f.con.some((c) => prefs.evitar.includes(c)))
    .map((o) => o.i);
  return arr.length ? arr : FRUTAS.map((_, i) => i);
};

// agrega fruta al desayuno y/o 2o snack si el día base queda corto del objetivo
const addExtras = (prefs, targets, d) => {
  const obj = targets.objetivoDeficit;
  delete d.fruta;
  delete d.snack2;
  let falta = obj - dayKcal(d);
  if (falta > 60) {
    const fo = frutasOk(prefs);
    d.fruta = fo[Math.floor(Math.random() * fo.length)];
  }
  falta = obj - dayKcal(d);
  if (falta > 120) {
    const usados = [d.snack];
    const al = allowedIdx(prefs, 'snack').filter((i) => !usados.includes(i));
    if (al.length) d.snack2 = al[Math.floor(Math.random() * al.length)];
  }
  return d;
};

export const genDay = (prefs, targets) => {
  let d = {};
  let best = null;
  let bestK = 0;
  let tries = 0;
  do {
    d = {};
    MEAL_SPLIT.forEach(([k]) => {
      d[k] = pickIdx(prefs, k);
    });
    const kc = dayKcal(d);
    if (kc > bestK) {
      bestK = kc;
      best = { ...d };
    }
    tries++;
  } while (dayKcal(d) < PISO_SEGURO && tries < 30);
  return addExtras(prefs, targets, dayKcal(d) >= PISO_SEGURO ? d : best);
};

export const genWeek = (prefs, targets) => {
  const pools = {};
  MEAL_SPLIT.forEach(([k]) => {
    const al = [...allowedIdx(prefs, k)];
    for (let i = al.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [al[i], al[j]] = [al[j], al[i]];
    }
    pools[k] = al;
  });
  const cursor = {};
  MEAL_SPLIT.forEach(([k]) => (cursor[k] = 0));
  const w = {};
  DIAS.forEach((day) => {
    let d = {};
    let best = null;
    let bestK = 0;
    let tries = 0;
    do {
      d = {};
      const usedMains = [];
      MEAL_SPLIT.forEach(([k]) => {
        const pool = pools[k];
        if (!pool.length) {
          d[k] = pickIdx(prefs, k);
          return;
        }
        let chosen = null;
        for (let off = 0; off < pool.length; off++) {
          const idx = pool[(cursor[k] + off) % pool.length];
          const mn = MENU_DB[k][idx].main;
          if (!mn || !usedMains.includes(mn)) {
            chosen = idx;
            cursor[k] = (cursor[k] + off + 1) % pool.length;
            break;
          }
        }
        if (chosen === null) {
          chosen = pool[cursor[k] % pool.length];
          cursor[k] = (cursor[k] + 1) % pool.length;
        }
        d[k] = chosen;
        const mn = MENU_DB[k][chosen].main;
        if (mn) usedMains.push(mn);
      });
      const kc = dayKcal(d);
      if (kc > bestK) {
        bestK = kc;
        best = { ...d };
      }
      tries++;
    } while (dayKcal(d) < PISO_SEGURO && tries < 30);
    w[day] = addExtras(prefs, targets, dayKcal(d) >= PISO_SEGURO ? d : best);
  });
  return w;
};

// Elige un platillo parecido en calorías (de los 3 más cercanos, uno al azar)
export const cambioParecido = (prefs, meal, cur) => {
  const al = allowedIdx(prefs, meal);
  if (al.length <= 1) return null;
  const curKcal = MENU_DB[meal][cur].kcal;
  const opts = al.filter((i) => i !== cur);
  opts.sort((a, b) => Math.abs(MENU_DB[meal][a].kcal - curKcal) - Math.abs(MENU_DB[meal][b].kcal - curKcal));
  const pool = opts.slice(0, 3);
  return pool[Math.floor(Math.random() * pool.length)];
};

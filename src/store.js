import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { sb } from './supabase';
import { DEMO, computeProfile, BACKGROUNDS, SKINS_REGALO, MENU_DB, MEAL_SPLIT, PHRASES, AXO_REACCIONES } from './data';
import { hoyLocal, genWeek, genDay, cambioParecido, lunesDe } from './plan';
import { estadoAvisos, pedirAvisos, programarAvisos, cancelarAvisos } from './notifications';

// "Cerebro" de la app: todo el estado y las acciones, pasado de la PWA.
// Las pantallas solo leen de aquí con useApp() y llaman a estas funciones.

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const PET0 = { palette: 'durazno', accessory: 'ninguno', bg: 'lavanda', estilo: 'clasico', outfit: 'ninguno' };
const PREFS0 = { veg: false, evitar: [], lowcarb: false };
const evoDe = (s) => (s >= 60 ? 'mistico' : s >= 21 ? 'adulto' : s >= 7 ? 'joven' : 'cria');
const vibra = (fn) => {
  try {
    fn().catch(() => {});
  } catch (e) {}
};

// PRUEBA TEMPORAL: colores nuevos visibles ya para probarlos (no se guardan). Para quitarlo, dejar la lista vacía: []
const PRUEBA_SKINS = ['axantico', 'mosaico', 'luciernaga', 'obsidiana', 'perla'];

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [phase, setPhase] = useState('cargando'); // 'cargando' | 'auth' | 'onboarding' | 'app'
  const [screen, setScreen] = useState('home');
  const [overlay, setOverlay] = useState(null);
  const [toast, setToast] = useState(null);
  const toastT = useRef(null);
  const showToast = (t) => {
    setToast(t);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2400);
  };

  const [profile, setProfile] = useState({ ...DEMO });
  const [petName, setPetName] = useState('Axo');
  const [pet, setPet] = useState(PET0);
  const [tieneAxo, setTieneAxo] = useState(false); // ya existía su Axo en la base (para "Rehacer mi perfil")
  const targets = useMemo(() => {
    try {
      return computeProfile(profile);
    } catch (e) {
      return computeProfile({ ...DEMO });
    }
  }, [profile]);

  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ultimoDia, setUltimoDia] = useState(null);
  const [rachaMax, setRachaMax] = useState(0); // récord personal: se queda guardado aunque la racha se rompa
  const [escudos, setEscudos] = useState(0); // escudos de racha (máx. 2): cubren un día fallado
  const [skinsUnlocked, setSkinsUnlocked] = useState([]);
  const [regaloSkin, setRegaloSkin] = useState(null);
  const [evoNueva, setEvoNueva] = useState(null);
  const [best, setBest] = useState({});
  const [log, setLog] = useState([]);
  const [vasos, setVasos] = useState(0);
  const [viewDate, setViewDateRaw] = useState(() => hoyLocal());
  const [pesoActual, setPesoActual] = useState(null);
  const [pesoHist, setPesoHist] = useState([]);
  const [composicion, setComposicion] = useState([]);
  const [totalComidas, setTotalComidas] = useState(0);
  const [prefs, setPrefs] = useState(PREFS0);
  const [weekPlan, setWeekPlan] = useState(() => genWeek(PREFS0, computeProfile({ ...DEMO })));
  const [weekEaten, setWeekEaten] = useState({});
  const [celebrated, setCelebrated] = useState(false);
  const [kissing, setKissing] = useState(false);
  const [eating, setEating] = useState(false);
  const [naciendo, setNaciendo] = useState(false);
  const [avisos, setAvisos] = useState(null); // 'activados' | 'sin-pedir' | 'bloqueados'
  const uidSeq = useRef(1);
  const localListo = useRef(false);
  const timers = useRef([]);
  const luego = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const phrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], [overlay]);

  /* ---------- Sesión ---------- */
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        cargarDatos(session.user.id);
      } else setPhase('auth');
    });
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null);
        setPhase('auth');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Si la app vuelve a primer plano y ya cambió el día, recarga los datos de hoy
  const diaAbierto = useRef(hoyLocal());
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st !== 'active') return;
      const hoy = hoyLocal();
      if (hoy !== diaAbierto.current) {
        diaAbierto.current = hoy;
        if (userId) cargarDatos(userId);
      }
    });
    return () => sub.remove();
  }, [userId]);

  /* ---------- Guardado local (lo que la PWA no guardaba) ---------- */
  // Perfil completo, preferencias, plan semanal y palomitas se guardan en el teléfono.
  const claveLocal = (uid) => 'axo_local_' + uid;
  useEffect(() => {
    if (!userId || !localListo.current) return;
    const semana = hoyLocal(lunesDe());
    AsyncStorage.setItem(claveLocal(userId), JSON.stringify({ profile, prefs, weekPlan, weekEaten, semana, bg: pet.bg, estilo: pet.estilo })).catch(() => {});
  }, [userId, profile, prefs, weekPlan, weekEaten, pet.bg, pet.estilo]);

  /* ---------- Cargar todo desde Supabase ---------- */
  const cargarDatos = async (uid) => {
    try {
      const hoy = hoyLocal();
      diaAbierto.current = hoy;
      const [{ data: perfil }, { data: axo }, { data: comidas }, { data: pesos }, { count: totComidas }, { data: scores }, localRaw] = await Promise.all([
        sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
        sb.from('axo_state').select('*').eq('id', uid).maybeSingle(),
        sb.from('food_log').select('*').eq('user_id', uid).eq('fecha', hoy).order('created_at'),
        sb.from('peso_log').select('*').eq('user_id', uid).order('fecha'),
        sb.from('food_log').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        sb.from('game_scores').select('*').eq('user_id', uid),
        AsyncStorage.getItem(claveLocal(uid)).catch(() => null),
      ]);
      let local = null;
      try {
        local = localRaw ? JSON.parse(localRaw) : null;
      } catch (e) {}

      if (scores && scores.length > 0) setBest(Object.fromEntries(scores.map((sc) => [sc.game_key, sc.score])));
      setTotalComidas(totComidas || 0);
      // Mediciones de báscula inteligente (si la tabla aún no existe, simplemente queda vacía)
      sb.from('composicion_log').select('*').eq('user_id', uid).order('fecha').then(({ data, error }) => {
        setComposicion(!error && data ? data.map((r) => ({ fecha: r.fecha, grasa: r.grasa_pct, musculo: r.musculo_kg, agua: r.agua_pct, edadMet: r.edad_metabolica, bmr: r.bmr_kcal })) : []);
      });
      if (pesos && pesos.length > 0) {
        setPesoHist(pesos.map((r) => ({ fecha: r.fecha, peso: parseFloat(r.peso) })));
        setPesoActual(parseFloat(pesos[pesos.length - 1].peso));
      } else {
        setPesoHist([]);
        setPesoActual(null);
      }

      if (!(perfil && perfil.nombre)) {
        localListo.current = true;
        setPhase('onboarding');
        return;
      }

      setPetName(perfil.nombre || 'Axo');
      const prof = {
        ...DEMO,
        ...(local?.profile || {}),
        objetivo: perfil.objetivo || local?.profile?.objetivo || DEMO.objetivo,
        edad: perfil.edad || local?.profile?.edad || DEMO.edad,
        pesoKg: perfil.peso || local?.profile?.pesoKg || DEMO.pesoKg,
        estaturaCm: perfil.altura || local?.profile?.estaturaCm || DEMO.estaturaCm,
      };
      setProfile(prof);
      const pf = { ...PREFS0, ...(local?.prefs || {}) };
      setPrefs(pf);
      // Plan semanal: se conserva durante la semana; el lunes se genera uno nuevo
      const semana = hoyLocal(lunesDe());
      if (local?.weekPlan && local.semana === semana) {
        setWeekPlan(local.weekPlan);
        setWeekEaten(local.weekEaten || {});
      } else {
        setWeekPlan(genWeek(pf, computeProfile(prof)));
        setWeekEaten({});
      }

      let ultDia = null;
      if (axo) {
        setTieneAxo(true);
        setPet({
          ...PET0,
          bg: local?.bg && BACKGROUNDS[local.bg] ? local.bg : PET0.bg,
          estilo: local?.estilo || PET0.estilo,
          palette: axo.variedad || PET0.palette,
          accessory: axo.accesorio || PET0.accessory,
          outfit: axo.outfit || PET0.outfit,
        });
        setLevel(axo.nivel != null ? axo.nivel : 1);
        setXp(axo.xp != null ? axo.xp : 0);
        const rachaGuardada = axo.racha != null ? axo.racha : 0;
        const maxGuardado = Math.max(axo.racha_max || 0, rachaGuardada);
        let escudosHoy = axo.escudos || 0;
        setRachaMax(maxGuardado);
        ultDia = axo.ultimo_dia || null;
        if (rachaGuardada > 0 && ultDia) {
          const hd = new Date();
          const [yy, mm, dd] = ultDia.split('-').map(Number);
          const dif = Math.floor((new Date(hd.getFullYear(), hd.getMonth(), hd.getDate()) - new Date(yy, mm - 1, dd)) / 86400000);
          const nom = perfil.nombre || 'Axo';
          if (dif === 2 && escudosHoy > 0) {
            // Falló un solo día: el escudo cubre ese día y la racha sigue
            const ayerD = new Date(hd.getFullYear(), hd.getMonth(), hd.getDate() - 1);
            const ayerS = hoyLocal(ayerD);
            escudosHoy -= 1;
            setStreak(rachaGuardada);
            setUltimoDia(ayerS);
            ultDia = ayerS;
            luego(() => showToast('🛡️ Ayer no pudimos, pero mi escudo te cubrió. ¡Tu racha de ' + rachaGuardada + ' días sigue intacta!'), 1200);
            sb.from('axo_state').update({ ultimo_dia: ayerS, escudos: escudosHoy, racha_max: maxGuardado }).eq('id', uid).then(() => {});
          } else if (dif >= 2) {
            setStreak(0);
            setUltimoDia(null);
            ultDia = null;
            luego(() => showToast('🌱 ' + nom + ' guardó tu récord de ' + maxGuardado + ' días. ¡Empezamos otra vez cuando quieras!'), 1200);
            sb.from('axo_state').update({ racha: 0, ultimo_dia: null, racha_max: maxGuardado }).eq('id', uid).then(() => {});
          } else {
            setStreak(rachaGuardada);
            setUltimoDia(ultDia);
          }
        } else {
          setStreak(rachaGuardada);
          setUltimoDia(ultDia);
        }
        setEscudos(escudosHoy);
        setSkinsUnlocked(axo.skins ? axo.skins.split(',').filter(Boolean) : []);
        setVasos(axo.vasos_fecha === hoy && axo.vasos_hoy ? axo.vasos_hoy : 0);
      }
      // Si la meta de hoy ya se celebró, no se vuelve a celebrar
      setCelebrated(ultDia === hoy);
      setViewDateRaw(hoy);
      setLog((comidas || []).map(filaAItem));
      localListo.current = true;
      setPhase('app');

      // Axo nace solo una vez por cuenta. Si la cuenta ya tiene a su Axo guardado
      // (por ejemplo al reinstalar la app), ya nació y no se repite.
      if (axo) {
        AsyncStorage.setItem('axo_nacido_' + uid, '1').catch(() => {});
      } else {
        AsyncStorage.getItem('axo_nacido_' + uid).then((v) => {
          if (!v) setNaciendo(true);
        });
      }
      // Avisos: si ya hay permiso, se reprograman en cada visita
      estadoAvisos().then((est) => {
        setAvisos(est);
        if (est === 'activados') programarAvisos(perfil.nombre || 'Axo').catch(() => {});
      });
    } catch (e) {
      localListo.current = true;
      setPhase('onboarding');
    }
  };

  const filaAItem = (c) => ({ dbId: c.id, id: 'db' + c.id, n: c.nombre, kcal: c.kcal, p: c.proteina, c: c.carbos, g: c.grasa, qty: 1, uid: 'db' + c.id });

  /* ---------- Guardar ---------- */
  const guardarPerfil = async (uid, p, name) => {
    const { error } = await sb.from('profiles').upsert({ id: uid, nombre: name, objetivo: p.objetivo, edad: p.edad, peso: p.pesoKg, altura: p.estaturaCm });
    if (error) showToast('⚠️ No se guardó tu perfil, revisa tu conexión');
  };
  const guardarAxo = async (uid, axoData) => {
    const { error } = await sb.from('axo_state').upsert({ id: uid, ...axoData });
    if (error) console.warn('axo_state', error.message);
  };
  // Desbloquear un extra (por ejemplo un color del vestido). Se guarda en la cuenta junto con las skins,
  // así no se pierde al reinstalar la app.
  const desbloquear = (k) => {
    if (skinsUnlocked.includes(k)) return;
    const nuevas = [...skinsUnlocked, k];
    setSkinsUnlocked(nuevas);
    if (userId) sb.from('axo_state').update({ skins: nuevas.join(',') }).eq('id', userId).then(() => {});
  };

  const updatePet = (newPet) => {
    setPet(newPet);
    if (userId) guardarAxo(userId, { variedad: newPet.palette, accesorio: newPet.accessory, outfit: newPet.outfit, nivel: level, xp, racha: streak });
  };

  // XP ganada en juegos y en la reflexión: tope de 99, como en la PWA (el nivel sube al cumplir la meta del día)
  const addXp = (n) => {
    const nx = Math.min(99, xp + n);
    setXp(nx);
    if (userId) sb.from('axo_state').update({ xp: nx }).eq('id', userId).then(() => {});
  };

  const renombrarAxo = async (nuevoNombre) => {
    const nombre = (nuevoNombre || '').trim();
    if (!nombre) {
      showToast('Escribe un nombre 🥺');
      return false;
    }
    setPetName(nombre);
    if (userId) {
      const [r1, r2] = await Promise.all([sb.from('profiles').update({ nombre }).eq('id', userId), sb.from('axo_state').update({ nombre_axo: nombre }).eq('id', userId)]);
      if (r1.error || r2.error) {
        showToast('⚠️ No se guardó el nombre, revisa tu conexión');
        return false;
      }
    }
    if (avisos === 'activados') programarAvisos(nombre).catch(() => {});
    showToast('¡Listo! Ahora se llama ' + nombre + ' 💗');
    return true;
  };

  /* ---------- Comidas ---------- */
  const totals = useMemo(
    () => log.reduce((a, f) => ({ kcal: a.kcal + f.kcal * f.qty, p: a.p + f.p * f.qty, c: a.c + f.c * f.qty, g: a.g + f.g * f.qty }), { kcal: 0, p: 0, c: 0, g: 0 }),
    [log]
  );

  const setViewDate = async (fecha) => {
    setViewDateRaw(fecha);
    if (!userId) return;
    const { data } = await sb.from('food_log').select('*').eq('user_id', userId).eq('fecha', fecha).order('created_at');
    setLog((data || []).map(filaAItem));
  };

  const checkGoals = (nl) => {
    const t = nl.reduce((a, f) => a + f.kcal * f.qty, 0);
    if (t >= targets.objetivoDeficit * 0.8 && !celebrated) {
      setCelebrated(true);
      luego(() => setOverlay('celebrate'), 2700); // después de que Axo termine de comer
    }
  };

  // Agrega una comida al día que se está viendo. opts.quedarse = no brincar a Inicio.
  const addFood = (food, opts = {}) => {
    const uid = 'local' + uidSeq.current++;
    const item = { ...food, qty: 1, uid };
    const esHoy = viewDate === hoyLocal();
    setLog((l) => {
      const nl = [...l, item];
      if (esHoy) checkGoals(nl);
      return nl;
    });
    setTotalComidas((t) => t + 1);
    setEating(true);
    vibra(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    if (!opts.quedarse) setScreen('home');
    luego(() => setEating(false), 2600);
    if (userId) {
      sb.from('food_log')
        .insert({ user_id: userId, nombre: food.n, kcal: food.kcal, proteina: food.p, carbos: food.c, grasa: food.g, comida: 'libre', fecha: viewDate })
        .select('id')
        .single()
        .then(({ data, error }) => {
          if (error) {
            showToast('⚠️ No se guardó esa comida, revisa tu conexión');
            return;
          }
          // guardamos su número en la base para poder borrarla después
          setLog((l) => l.map((f) => (f.uid === uid ? { ...f, dbId: data.id } : f)));
        });
    }
    return uid;
  };

  const quitarItem = (item) => {
    if (!item) return;
    setLog((l) => l.filter((f) => f.uid !== item.uid));
    setTotalComidas((t) => Math.max(0, t - 1));
    if (userId && item.dbId != null) sb.from('food_log').delete().eq('id', item.dbId).then(() => {});
  };
  const removeFood = (uid) => quitarItem(log.find((f) => f.uid === uid));

  /* ---------- Agua ---------- */
  const guardarVasos = (nv) => {
    if (userId) guardarAxo(userId, { vasos_hoy: nv, vasos_fecha: hoyLocal() });
  };
  const addAgua = () => {
    const nv = Math.min(targets.vasos, vasos + 1);
    setVasos(nv);
    guardarVasos(nv);
  };
  const setWater = (i) => {
    const nv = i + 1 === vasos ? i : i + 1;
    setVasos(nv);
    guardarVasos(nv);
  };

  /* ---------- Meta del día: XP, racha, regalo y evolución ---------- */
  const closeCelebrate = () => {
    setOverlay(null);
    let nx = xp + 50;
    let nl = level;
    if (nx >= 100) {
      nl = level + 1;
      nx -= 100;
    }
    setXp(nx);
    setLevel(nl);
    // Racha por fecha real
    const hoy = new Date();
    const hoyStr = hoyLocal(hoy);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = hoyLocal(ayer);
    let nuevaRacha;
    if (ultimoDia === hoyStr) nuevaRacha = streak; // ya contó hoy, no duplica
    else if (ultimoDia === ayerStr) nuevaRacha = streak + 1; // día consecutivo
    else nuevaRacha = 1; // primer día o se rompió la racha
    setStreak(nuevaRacha);
    setUltimoDia(hoyStr);
    const subioEtapa = nuevaRacha > streak && evoDe(nuevaRacha) !== evoDe(streak);
    // Desbloqueo de color: primera vez (racha 1) y cada 7 días (7, 14, 21...)
    const esDiaDeRegalo = nuevaRacha === 1 || nuevaRacha % 7 === 0;
    let nuevaSkin = null;
    let skins = skinsUnlocked;
    if (esDiaDeRegalo && ultimoDia !== hoyStr) {
      const noDesbloqueadas = SKINS_REGALO.filter((sk) => !skinsUnlocked.includes(sk));
      if (noDesbloqueadas.length > 0) {
        nuevaSkin = noDesbloqueadas[0];
        skins = [...skinsUnlocked, nuevaSkin];
        setSkinsUnlocked(skins);
      }
    }
    if (userId) guardarAxo(userId, { variedad: pet.palette, accesorio: pet.accessory, outfit: pet.outfit, nivel: nl, xp: nx, racha: nuevaRacha, ultimo_dia: hoyStr, skins: skins.join(',') });
    // Récord y escudos (aparte, para que un fallo aquí nunca afecte el guardado de la racha)
    const nuevoMax = Math.max(rachaMax, nuevaRacha);
    let nuevosEscudos = escudos;
    let ganoEscudo = false;
    if (ultimoDia !== hoyStr && nuevaRacha % 7 === 0 && escudos < 2) {
      nuevosEscudos = escudos + 1;
      ganoEscudo = true;
    }
    setRachaMax(nuevoMax);
    setEscudos(nuevosEscudos);
    if (userId) sb.from('axo_state').update({ racha_max: nuevoMax, escudos: nuevosEscudos }).eq('id', userId).then(() => {});
    if (ganoEscudo) luego(() => showToast('🛡️ ¡Ganaste un escudo de racha! Cubre un día que no puedas'), 3500);
    vibra(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    if (subioEtapa) {
      setEvoNueva({ etapa: evoDe(nuevaRacha), dias: nuevaRacha, skin: nuevaSkin });
      setOverlay('evolucion');
    } else if (nuevaSkin) {
      setRegaloSkin(nuevaSkin);
      setOverlay('regalo');
    } else if (ultimoDia === hoyStr) showToast('¡Gracias por cuidarte hoy! 💗');
    else showToast('🔥 Día ' + nuevaRacha + ' cuidándote · ¡bien hecho!');
  };

  /* ---------- Peso ---------- */
  const registrarPeso = async (texto) => {
    const peso = parseFloat(String(texto).replace(',', '.'));
    if (!peso || peso < 30 || peso > 300) {
      showToast('Pon un peso válido (30–300 kg)');
      return false;
    }
    const fecha = hoyLocal();
    setPesoHist((h) => [...h.filter((r) => r.fecha !== fecha), { fecha, peso }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    setPesoActual(peso);
    if (userId) {
      const { error } = await sb.from('peso_log').upsert({ user_id: userId, fecha, peso }, { onConflict: 'user_id,fecha' });
      if (error) {
        showToast('⚠️ No se guardó tu peso, revisa tu conexión');
        return false;
      }
    }
    showToast('¡Peso registrado! 💪');
    return true;
  };

  /* ---------- Báscula inteligente ---------- */
  const registrarComposicion = async (v) => {
    const n = (x) => {
      const t = parseFloat(String(x ?? '').replace(',', '.'));
      return Number.isFinite(t) ? t : null;
    };
    const m = { grasa: n(v.grasa), musculo: n(v.musculo), agua: n(v.agua), edadMet: n(v.edadMet), bmr: n(v.bmr) };
    if (Object.values(m).every((x) => x == null)) {
      showToast('Escribe al menos un dato');
      return false;
    }
    const rangos = { grasa: [3, 70, 'Grasa (3–70 %)'], musculo: [10, 120, 'Masa muscular (10–120 kg)'], agua: [25, 80, 'Agua (25–80 %)'], edadMet: [10, 99, 'Edad metabólica (10–99)'], bmr: [800, 4000, 'Calorías basales (800–4000)'] };
    for (const k of Object.keys(m)) {
      if (m[k] != null && (m[k] < rangos[k][0] || m[k] > rangos[k][1])) {
        showToast('Revisa: ' + rangos[k][2]);
        return false;
      }
    }
    const fecha = hoyLocal();
    const fila = { fecha, ...m, edadMet: m.edadMet != null ? Math.round(m.edadMet) : null, bmr: m.bmr != null ? Math.round(m.bmr) : null };
    if (userId) {
      const { error } = await sb.from('composicion_log').upsert({ user_id: userId, fecha, grasa_pct: fila.grasa, musculo_kg: fila.musculo, agua_pct: fila.agua, edad_metabolica: fila.edadMet, bmr_kcal: fila.bmr }, { onConflict: 'user_id,fecha' });
      if (error) {
        showToast('⚠️ No se guardó, revisa tu conexión');
        return false;
      }
    }
    setComposicion((h) => [...h.filter((r) => r.fecha !== fecha), fila].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    showToast('¡Medición guardada! 💪');
    return true;
  };

  /* ---------- Juegos ---------- */
  const recordBest = (g, v) => {
    const anterior = best[g] || 0;
    if (v <= anterior) return;
    setBest((b) => ({ ...b, [g]: v }));
    if (userId) {
      sb.from('game_scores')
        .upsert({ user_id: userId, game_key: g, score: v, updated_at: new Date().toISOString() }, { onConflict: 'user_id,game_key' })
        .then(({ error }) => {
          if (error) showToast('⚠️ No se guardó tu récord, revisa tu conexión');
        });
    }
  };

  /* ---------- Plan semanal ---------- */
  const toggleEaten = (day, meal, dish) => {
    const k = day + '_' + meal;
    const yaEstaba = weekEaten[k];
    if (!dish) {
      setWeekEaten((e) => ({ ...e, [k]: !e[k] }));
      return;
    }
    if (!yaEstaba) {
      // palomear: agregar al conteo del día (y recordar cuál fue, para poder quitarlo)
      const uid = addFood({ id: 'plan_' + k, n: dish.n, u: '1 porción', kcal: dish.kcal, p: dish.p, c: dish.c, g: dish.g, planKey: k }, { quedarse: true });
      setWeekEaten((e) => ({ ...e, [k]: uid }));
    } else {
      // despalomear: quitar del conteo (también de la base)
      quitarItem(log.find((f) => f.planKey === k || f.uid === yaEstaba));
      setWeekEaten((e) => ({ ...e, [k]: false }));
    }
  };
  const swapMeal = (day, meal) => {
    const next = cambioParecido(prefs, meal, weekPlan[day][meal]);
    if (next == null) {
      showToast('No hay más opciones con tus preferencias 🤷');
      return;
    }
    showToast('Cambiado por: ' + MENU_DB[meal][next].n + ' ✅');
    setWeekPlan((w) => ({ ...w, [day]: { ...w[day], [meal]: next } }));
  };
  const regenDay = (day) => setWeekPlan((w) => ({ ...w, [day]: genDay(prefs, targets) }));
  const regenWeek = (p = prefs) => {
    setWeekPlan(genWeek(p, targets));
    setWeekEaten({});
  };
  const toggleEvitar = (key) => setPrefs((p) => ({ ...p, evitar: p.evitar.includes(key) ? p.evitar.filter((x) => x !== key) : [...p.evitar, key] }));

  /* ---------- Cuenta ---------- */
  const handleAuth = async (user, nombreNuevo) => {
    setUserId(user.id);
    if (nombreNuevo) {
      localListo.current = true;
      setPhase('onboarding');
    } else {
      setPhase('cargando');
      await cargarDatos(user.id);
    }
  };

  const onboardingDone = async (p, name, variedad) => {
    setProfile(p);
    setPetName(name);
    setWeekPlan(genWeek(prefs, computeProfile(p)));
    setCelebrated(ultimoDia === hoyLocal());
    setScreen('home');
    setPhase('app');
    if (!userId) return;
    AsyncStorage.setItem('axo_nacido_' + userId, '1').catch(() => {}); // ya nació en el cuestionario
    await guardarPerfil(userId, p, name);
    if (tieneAxo) {
      // "Rehacer mi perfil": conserva color, ropa, nivel y racha; solo cambia el nombre
      await sb.from('axo_state').update({ nombre_axo: name }).eq('id', userId);
    } else {
      setPet((prev) => ({ ...prev, palette: variedad || prev.palette }));
      setTieneAxo(true);
      await guardarAxo(userId, { nombre_axo: name, variedad: variedad || pet.palette, accesorio: 'ninguno', outfit: 'ninguno', nivel: level, xp, racha: streak });
    }
    estadoAvisos().then(setAvisos);
  };

  const cerrarSesion = async () => {
    await sb.auth.signOut();
    setUserId(null);
    setScreen('home');
    setOverlay(null);
    setLog([]);
    setTieneAxo(false);
    setPhase('auth');
  };

  // Borra la cuenta y todos sus datos en Supabase (función eliminar_mi_cuenta) y limpia el teléfono
  const eliminarCuenta = async () => {
    const uid = userId;
    const { error } = await sb.rpc('eliminar_mi_cuenta');
    if (error) return { ok: false, error: error.message };
    try {
      await AsyncStorage.multiRemove([claveLocal(uid), 'axo_nacido_' + uid]);
      await cancelarAvisos();
    } catch (e) {}
    await cerrarSesion();
    return { ok: true };
  };

  /* ---------- Avisos ---------- */
  const activarAvisos = async () => {
    const est = await pedirAvisos();
    setAvisos(est);
    if (est === 'activados') {
      await programarAvisos(petName);
      showToast('🔔 Avisos activados');
    } else showToast('No diste permiso de notificaciones');
    return est;
  };

  /* ---------- Axo: reacciones, nacimiento ---------- */
  const [reaccion, setReaccion] = useState(null);
  const blowKiss = () => {
    vibra(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    // Axo reacciona distinto cada vez que lo tocan
    setReaccion(AXO_REACCIONES[Math.floor(Math.random() * AXO_REACCIONES.length)]);
    setKissing(true);
    luego(() => setKissing(false), 1700);
  };
  // de vez en cuando manda un besito solo
  useEffect(() => {
    if (phase !== 'app') return;
    const iv = setInterval(() => {
      setReaccion(null);
      setKissing(true);
      setTimeout(() => setKissing(false), 1500);
    }, 13000);
    return () => clearInterval(iv);
  }, [phase]);
  const terminoDeNacer = () => {
    if (userId) AsyncStorage.setItem('axo_nacido_' + userId, '1').catch(() => {});
    vibra(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    luego(() => setNaciendo(false), 2400);
  };

  /* ---------- Botón "atrás" de Android ---------- */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase !== 'app') return false;
      if (overlay) {
        if (overlay === 'celebrate') closeCelebrate();
        else setOverlay(null);
        return true;
      }
      if (screen.startsWith('game_') || screen === 'leaderboard') {
        setScreen('arcade');
        return true;
      }
      if (screen !== 'home') {
        setScreen('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  });

  /* ---------- Valores calculados ---------- */
  const computedEvo = evoDe(streak);
  const bg = BACKGROUNDS[pet.bg] || BACKGROUNDS.lavanda;
  const darkBg = pet.bg === 'noche';
  const pesoIni = profile.pesoKg;
  const pesoMeta = Math.max(40, profile.pesoKg - 6);
  const pa = pesoActual == null ? pesoIni : pesoActual;
  const progresoPeso = Math.min(1, Math.max(0, (pesoIni - pa) / Math.max(1, pesoIni - pesoMeta)));
  const chub = Math.max(0.18, 1 - progresoPeso);
  const hungry = log.length === 0;
  const diasAbandono = (() => {
    if (!ultimoDia) return 0;
    const hoyD = new Date();
    const [y, m, d] = ultimoDia.split('-').map(Number);
    return Math.floor((new Date(hoyD.getFullYear(), hoyD.getMonth(), hoyD.getDate()) - new Date(y, m - 1, d)) / 86400000);
  })();
  const abandonado = diasAbandono >= 2 && streak === 0 && hungry;
  // Cara de Axo según lo que está pasando
  const mood = eating ? 'come' : kissing ? 'amor' : abandonado || hungry ? 'triste' : 'feliz';
  const axoProps = { paletteKey: pet.palette, accessory: pet.accessory, outfit: pet.outfit, estilo: pet.estilo, chub };

  const value = {
    userId, phase, setPhase, screen, setScreen, overlay, setOverlay, toast, showToast,
    profile, setProfile, petName, pet, updatePet, targets, tieneAxo,
    level, xp, addXp, streak, rachaMax, escudos, ultimoDia, reaccion, skinsUnlocked: [...skinsUnlocked, ...PRUEBA_SKINS.filter((k) => !skinsUnlocked.includes(k))], desbloquear, regaloSkin, setRegaloSkin, evoNueva, setEvoNueva,
    best, recordBest, log, totals, vasos, addAgua, setWater, viewDate, setViewDate,
    pesoActual, pesoHist, registrarPeso, composicion, registrarComposicion, totalComidas,
    prefs, setPrefs, toggleEvitar, weekPlan, weekEaten, toggleEaten, swapMeal, regenDay, regenWeek,
    celebrated, setCelebrated, kissing, eating, blowKiss, naciendo, setNaciendo, terminoDeNacer,
    avisos, activarAvisos, phrase,
    addFood, removeFood, closeCelebrate, renombrarAxo, handleAuth, onboardingDone, cerrarSesion, eliminarCuenta,
    computedEvo, bg, darkBg, pesoIni, pesoMeta, pa, chub, hungry, diasAbandono, abandonado, mood, axoProps,
    pKcal: totals.kcal / targets.objetivoDeficit,
    pProt: totals.p / targets.prote,
    pAgua: vasos / targets.vasos,
    pCarbs: targets.carbs > 0 ? totals.c / targets.carbs : 0,
    pGrasa: targets.grasa > 0 ? totals.g / targets.grasa : 0,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

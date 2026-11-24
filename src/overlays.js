import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Image, Dimensions, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useApp } from './store';
import { GEMINI_PROXY } from './supabase';
import { AvisoTexto } from './privacidad';
import { PALETTES, COACH_QA, RECETAS, MENU_DB, MEAL_SPLIT, ALERGENOS, EJEMPLOS_COMIDA, promptDescribir, promptExtras, PROMPT_FOTO, rango } from './data';
import { pickIdx, cambioParecido, hoyLocal } from './plan';
import { C, F } from './theme';
import { Btn, Card, CardH, Display, Muted, Semi, Sheet, Row, RowOpt, SectT, Tip, Macros, Input, Switch } from './ui';
import Axo, { AxoMini } from './components/Axo';

// Todas las ventanas que se abren encima de la app (hojas y celebraciones).

/* ---------- IA (mismo servicio de Gemini que la PWA) ---------- */
async function preguntarIA(body) {
  // Cada falla lleva un detalle corto para poder diagnosticar (se muestra junto al mensaje de error)
  let res;
  try {
    res = await fetch(GEMINI_PROXY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (e) {
    throw new Error('red: ' + (e && e.message));
  }
  const crudo = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + crudo.slice(0, 80));
  let data;
  try {
    data = JSON.parse(crudo);
  } catch (e) {
    throw new Error('respuesta rara: ' + crudo.slice(0, 80));
  }
  if (!data.text) throw new Error('la IA no respondió texto');
  const limpio = data.text.replace(/```json|```/g, '').trim();
  const m = limpio.match(/\{[\s\S]*\}/);
  try {
    return JSON.parse(m ? m[0] : limpio);
  } catch (e) {
    throw new Error('JSON: ' + limpio.slice(0, 80));
  }
}
const num = (v) => Math.round(Number(v) || 0);
// La racha que va a quedar al cerrar la celebración (misma regla que en store.js)
const rachaNueva = (a) => {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  return a.ultimoDia === hoyLocal(hoy) ? a.streak : a.ultimoDia === hoyLocal(ayer) ? a.streak + 1 : 1;
};

const Titulo = ({ children }) => <Text style={{ fontFamily: F.displaySemi, fontSize: 16, color: C.ink, marginBottom: 8, paddingRight: 40 }}>{children}</Text>;

function Resultado({ r }) {
  return (
    <View style={{ backgroundColor: '#f6f7fb', borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <Text style={{ fontFamily: F.bodyBold, fontSize: 16, color: C.ink, marginBottom: 3 }}>{r.nombre}</Text>
      {!!r.porcion && <Muted sm>{r.porcion}</Muted>}
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {[[rango(num(r.kcal)), 'kcal aprox.', '#E79FAE', 17], [num(r.proteina) + 'g', 'proteína', '#7C5CFF', 20], [num(r.carbos) + 'g', 'carbos', '#F2B705', 20], [num(r.grasa) + 'g', 'grasa', '#34BC97', 20]].map(([v, l, col, fs]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: F.display, fontSize: fs, color: col }}>{v}</Text>
            <Muted sm>{l}</Muted>
          </View>
        ))}
      </View>
    </View>
  );
}

const Pensando = ({ texto, a }) => (
  <View style={{ alignItems: 'center', paddingVertical: 28 }}>
    <Text style={{ fontSize: 30, marginBottom: -6 }}>💡</Text>
    <AxoMini paletteKey={a.pet.palette} size={96} />
    <Muted style={{ marginTop: 6 }}>{texto}</Muted>
  </View>
);

/* ---------- Describir lo que comiste ---------- */
function Voice({ a }) {
  const [texto, setTexto] = useState('');
  const [etapa, setEtapa] = useState('escribir');
  const [resultado, setResultado] = useState(null);
  const [extras, setExtras] = useState('');
  const [error, setError] = useState(null);
  const [ejIdx, setEjIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setEjIdx((i) => (i + 1) % EJEMPLOS_COMIDA.length), 4000);
    return () => clearInterval(t);
  }, []);

  const analizar = async () => {
    setEtapa('cargando');
    setError(null);
    try {
      const parsed = await preguntarIA({ prompt: promptDescribir(texto) });
      setResultado(parsed);
      setEtapa(parsed.pregunta_extras ? 'extras' : 'resultado');
    } catch (e) {
      setError('No pude analizar eso. Intenta describir diferente.\n(detalle: ' + e.message + ')');
      setEtapa('escribir');
    }
  };
  const analizarConExtras = async () => {
    if (!extras.trim()) return setEtapa('resultado');
    setEtapa('cargando');
    try {
      const ajuste = await preguntarIA({ prompt: promptExtras(texto, resultado, extras) });
      setResultado((r) => ({ ...r, ...ajuste }));
    } catch (e) {}
    setEtapa('resultado');
  };
  const confirmar = () => {
    if (!resultado) return;
    a.setOverlay(null);
    a.addFood({ id: 'ai_' + Date.now(), n: resultado.nombre, u: resultado.porcion, kcal: num(resultado.kcal), p: num(resultado.proteina), c: num(resultado.carbos), g: num(resultado.grasa) });
    a.showToast('✅ ' + resultado.nombre + ' registrado');
  };
  const area = { borderRadius: 12, borderWidth: 1.5, borderColor: '#e8eaf0', padding: 12, fontFamily: F.body, fontSize: 15, color: C.ink, textAlignVertical: 'top' };

  return (
    <Sheet onClose={() => a.setOverlay(null)}>
      {etapa === 'escribir' && (
        <>
          <Titulo>✨ ¿Qué comiste?</Titulo>
          <Muted sm style={{ marginBottom: 12 }}>Descríbelo como quieras: “una taza de papaya con yogurt”, “dos tacos de canasta con agua de jamaica”…</Muted>
          <TextInput value={texto} onChangeText={setTexto} placeholder={EJEMPLOS_COMIDA[ejIdx]} placeholderTextColor={C.gray} multiline autoFocus style={[area, { minHeight: 90 }]} />
          {error && <Text style={{ fontFamily: F.body, color: '#E05C5C', fontSize: 13, marginTop: 6 }}>{error}</Text>}
          <Btn big label="Analizar con IA ✨" onPress={analizar} disabled={!texto.trim()} style={{ marginTop: 10 }} />
        </>
      )}
      {etapa === 'cargando' && <Pensando a={a} texto="Calculando macros…" />}
      {etapa === 'extras' && resultado && (
        <>
          <Titulo>✨ Una pregunta</Titulo>
          <View style={{ backgroundColor: '#f6f7fb', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontFamily: F.bodyBold, fontSize: 15, color: C.ink }}>{resultado.nombre}</Text>
            <Muted sm style={{ marginTop: 3 }}>
              {num(resultado.kcal)} kcal · P {num(resultado.proteina)}g · C {num(resultado.carbos)}g · G {num(resultado.grasa)}g
            </Muted>
          </View>
          <Text style={{ fontFamily: F.body, fontSize: 14, color: '#4a4f6a', marginBottom: 8 }}>{resultado.pregunta_extras}</Text>
          <TextInput value={extras} onChangeText={setExtras} placeholder="Ej: sí, con una cucharada de aceite y salsa" placeholderTextColor={C.gray} multiline style={[area, { minHeight: 70, fontSize: 14 }]} />
          <Btn big label="Actualizar macros" onPress={analizarConExtras} style={{ marginTop: 10 }} />
          <Btn kind="ghost" label="No hubo extras" onPress={() => setEtapa('resultado')} style={{ marginTop: 4 }} />
        </>
      )}
      {etapa === 'resultado' && resultado && (
        <>
          <Titulo>✨ Esto es lo que detecté</Titulo>
          <Resultado r={resultado} />
          <Btn big label="✅ Confirmar y registrar" onPress={confirmar} />
          <Btn kind="ghost" label="Corregir descripción" onPress={() => { setEtapa('escribir'); setResultado(null); }} style={{ marginTop: 6 }} />
        </>
      )}
    </Sheet>
  );
}

/* ---------- Foto del plato ---------- */
function Photo({ a }) {
  const [etapa, setEtapa] = useState('inicial');
  const [img, setImg] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const analizarFoto = async (base64) => {
    setEtapa('cargando');
    setError(null);
    try {
      const parsed = await preguntarIA({ prompt: PROMPT_FOTO, image: base64 });
      setResultado(parsed);
      setEtapa('resultado');
    } catch (e) {
      setError('No pude analizar la foto. Intenta con otra o usa Describir.\n(detalle: ' + e.message + ' · foto ' + Math.round(base64.length / 1024) + ' KB)');
      setEtapa('inicial');
    }
  };
  const elegir = async (camara) => {
    setError(null);
    try {
      if (camara) {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return setError('Necesito permiso para usar la cámara. Actívalo en los ajustes del teléfono o elige una foto de tu galería.');
      }
      const opts = { mediaTypes: ['images'], quality: 0.5, base64: true };
      const r = camara ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (r.canceled || !r.assets?.[0]) return;
      const as = r.assets[0];
      if (!as.base64) return setError('No pude leer esa foto. Intenta con otra.');
      setImg(as.uri);
      analizarFoto(as.base64);
    } catch (e) {
      setError('No pude abrir la cámara o la galería.');
    }
  };
  const confirmar = () => {
    if (!resultado) return;
    a.setOverlay(null);
    a.addFood({ id: 'ai_' + Date.now(), n: resultado.nombre, u: resultado.porcion, kcal: num(resultado.kcal), p: num(resultado.proteina), c: num(resultado.carbos), g: num(resultado.grasa) });
    a.showToast('✅ ' + resultado.nombre + ' registrado');
  };

  return (
    <Sheet onClose={() => a.setOverlay(null)}>
      {etapa === 'inicial' && (
        <>
          <Titulo>✨ Foto de tu plato</Titulo>
          <Muted sm style={{ marginBottom: 12 }}>Toma o sube una foto de tu comida y la IA estima los macros.</Muted>
          <Btn big label="📷 Tomar foto" onPress={() => elegir(true)} />
          <Btn kind="feature" big label="🖼️ Elegir de mi galería" onPress={() => elegir(false)} style={{ marginTop: 8 }} />
          {error && <Text style={{ fontFamily: F.body, color: '#E05C5C', fontSize: 13, marginTop: 8 }}>{error}</Text>}
        </>
      )}
      {etapa === 'cargando' && (
        <View style={{ alignItems: 'center', paddingVertical: 28 }}>
          {img && <Image source={{ uri: img }} style={{ width: 120, height: 120, borderRadius: 16, marginBottom: 14 }} />}
          <Muted>Analizando tu plato…</Muted>
        </View>
      )}
      {etapa === 'resultado' && resultado && (
        <>
          {img && <Image source={{ uri: img }} style={{ width: '100%', height: 150, borderRadius: 14, marginBottom: 10 }} resizeMode="cover" />}
          <Titulo>✨ Esto detecté en tu plato</Titulo>
          <Resultado r={resultado} />
          <Btn big label="✅ Confirmar y registrar" onPress={confirmar} />
          <Btn kind="ghost" label="Tomar otra foto" onPress={() => { setEtapa('inicial'); setResultado(null); setImg(null); }} style={{ marginTop: 6 }} />
        </>
      )}
    </Sheet>
  );
}

/* ---------- Receta ---------- */
function Recipe({ a }) {
  const [item, setItem] = useState(null);
  const rem = Math.max(200, a.targets.objetivoDeficit - a.totals.kcal);
  const pickNew = (exclude) => {
    const pool = RECETAS.filter((x) => !exclude || x.n !== exclude);
    return pool.filter((x) => x.kcal <= rem + 120).sort((x, y) => y.kcal - x.kcal)[0] || [...pool].sort((x, y) => x.kcal - y.kcal)[0];
  };
  const r = item ?? pickNew();
  return (
    <Sheet tall onClose={() => a.setOverlay(null)}>
      <Titulo>✨ Receta para tus {Math.round(rem)} kcal restantes</Titulo>
      <Tip icon="🌮">
        <Text style={{ fontFamily: F.bodyBold }}>¡Come rico, come sano!</Text> Con buenos ingredientes, la comida mexicana nutre y sabe increíble.
      </Tip>
      <Display style={{ fontSize: 21, marginBottom: 6 }}>{r.n}</Display>
      <Macros style={{ marginBottom: 6 }} items={[[r.kcal + ' kcal', '#E79FAE'], ['P ' + r.p + 'g', '#7C5CFF'], ['G ' + r.g + 'g', '#F2B705'], ['C ' + r.c + 'g', '#34BC97']]} />
      <SectT>Ingredientes</SectT>
      {r.ing.map((x, i) => (
        <Row key={i}>
          <Text style={{ fontFamily: F.body, fontSize: 14.5, color: C.ink }}>• {x}</Text>
        </Row>
      ))}
      <SectT>Preparación</SectT>
      <Muted sm style={{ lineHeight: 20, marginBottom: 12 }}>{r.prep}</Muted>
      <Btn big label="Añadir a hoy" onPress={() => { a.setOverlay(null); a.addFood({ id: 'rec', n: r.n, u: '1 porción', kcal: r.kcal, p: r.p, c: r.c, g: r.g }); }} />
      <Btn kind="ghost" label="Generar otra receta" onPress={() => setItem(pickNew(r.n))} style={{ marginTop: 4 }} />
    </Sheet>
  );
}

/* ---------- Menú del día ---------- */
function Menu({ a }) {
  const [swaps, setSwaps] = useState({});
  const goal = a.targets.objetivoDeficit;
  const closest = (cat, t) => {
    let bi = 0;
    let bd = 1e9;
    MENU_DB[cat].forEach((x, i) => {
      const df = Math.abs(x.kcal - t);
      if (df < bd) {
        bd = df;
        bi = i;
      }
    });
    return bi;
  };
  const sel = {};
  MEAL_SPLIT.forEach(([k, , pct]) => (sel[k] = swaps[k] ?? closest(k, goal * pct)));
  const swap = (k) => {
    const next = cambioParecido(a.prefs, k, sel[k]);
    if (next == null) return a.showToast('No hay más opciones 🤷');
    setSwaps((m) => ({ ...m, [k]: next }));
  };
  const regen = () => {
    const s2 = {};
    MEAL_SPLIT.forEach(([k]) => (s2[k] = pickIdx(a.prefs, k)));
    setSwaps(s2);
  };
  const dishes = MEAL_SPLIT.map(([k, label]) => ({ k, label, d: MENU_DB[k][sel[k]] }));
  const tot = dishes.reduce((t, x) => ({ kcal: t.kcal + x.d.kcal, p: t.p + x.d.p, c: t.c + x.d.c, g: t.g + x.d.g }), { kcal: 0, p: 0, c: 0, g: 0 });
  const diff = tot.kcal - goal;
  const okColor = Math.abs(diff) <= goal * 0.1 ? '#34BC97' : '#E08A3C';
  return (
    <Sheet tall onClose={() => a.setOverlay(null)}>
      <Titulo>✨ Menú del día · meta {goal} kcal</Titulo>
      <Tip icon="🌮">
        <Text style={{ fontFamily: F.bodyBold }}>¡Come rico, come sano!</Text> La comida mexicana está llena de sabor y nutrientes cuando balanceamos los ingredientes. Comer bien no es comer aburrido.
      </Tip>
      {dishes.map((x) => (
        <View key={x.k} style={{ borderBottomWidth: 1, borderBottomColor: '#f4f5f9', paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: F.display, fontSize: 14, color: C.muted }}>{x.label}</Text>
            <Pressable onPress={() => swap(x.k)} hitSlop={8} style={sx.chipBtn}>
              <Text style={sx.chipTxt}>Cambiar</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: F.bodyBold, fontSize: 15, color: C.ink }}>{x.d.n}</Text>
          <Muted sm style={{ marginTop: 2 }}>{x.d.d}</Muted>
          <Text style={{ fontFamily: F.displaySemi, fontSize: 13, color: C.muted, marginTop: 3 }}>
            {x.d.kcal} kcal · P{x.d.p} · C{x.d.c} · G{x.d.g}
          </Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
        <Text style={{ fontFamily: F.display, fontSize: 15, color: C.ink }}>Total del día</Text>
        <Text style={{ fontFamily: F.display, fontSize: 15, color: okColor }}>{tot.kcal} kcal</Text>
      </View>
      <Macros style={{ marginBottom: 10 }} items={[['P ' + tot.p + 'g', '#7C5CFF'], ['G ' + tot.g + 'g', '#F2B705'], ['C ' + tot.c + 'g', '#34BC97'], [(diff >= 0 ? '+' : '') + diff + ' vs meta', okColor]]} />
      <Btn
        big
        label="✅ Agrégalo a tus alimentos ingeridos hoy"
        onPress={() => {
          a.setOverlay(null);
          dishes.forEach((x) => a.addFood({ id: 'menu_' + x.k, n: x.d.n, u: '1 porción', kcal: x.d.kcal, p: x.d.p, c: x.d.c, g: x.d.g }));
        }}
      />
      <Btn kind="ghost" label="Regenerar menú" onPress={regen} style={{ marginTop: 4 }} />
    </Sheet>
  );
}

/* ---------- Antes de dormir ---------- */
const OPCIONES = [
  { t: 'Comí de forma más consciente', m: 'Cuidaste lo que comiste, y yo lo sentí. Gracias por eso 💗' },
  { t: 'Me moví un poquito', m: 'Te moviste por ti. ¡Eso me llena de energía! 💗' },
  { t: 'Tomé suficiente agua', m: 'Bien hidratados los dos. Gracias por cuidarme también 💧' },
  { t: 'Disfruté algo sin culpa', m: 'Disfrutar también es cuidarse. Me encanta verte feliz 💗' },
  { t: 'Hoy hice lo que pude', m: 'Lo que pudiste es más que suficiente. Mañana seguimos juntos, sin prisa. Te quiero 💗' },
];
function Reflexion({ a }) {
  const [picked, setPicked] = useState(null);
  const wins = [];
  if (a.pKcal >= 0.8) wins.push('cuidaste lo que comiste');
  if (a.pProt >= 0.85) wins.push('llegaste a tu proteína');
  if (a.pAgua >= 0.8) wins.push('te hidrataste bien');
  return (
    <Sheet onClose={() => a.setOverlay(null)}>
      {!picked ? (
        <View>
          <View style={{ alignItems: 'center' }}>
            <Axo {...a.axoProps} evo={a.computedEvo} size={120} />
          </View>
          <Display style={{ fontSize: 23, textAlign: 'center', marginBottom: 8 }}>Antes de dormir…</Display>
          <Text style={sx.streakBig}>🔥 {a.streak} días seguidos</Text>
          <Muted style={{ textAlign: 'center', marginTop: 10 }}>{wins.length ? 'Hoy ' + wins.join(', ') + '. Me ayudaste a crecer.' : 'Hoy también crecimos un poquito juntos.'}</Muted>
          <SectT style={{ textAlign: 'center', marginTop: 14 }}>¿Cómo te fue hoy?</SectT>
          {OPCIONES.map((o) => (
            <RowOpt key={o.t} onPress={() => setPicked(o)} right={<Text />}>
              <Semi style={{ fontSize: 15 }}>{o.t}</Semi>
            </RowOpt>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <Axo {...a.axoProps} evo={a.computedEvo} mood="amor" size={150} />
          <Display style={{ fontSize: 18, color: C.pink, marginTop: 6 }}>{a.petName} te manda un beso 💗</Display>
          <Muted style={{ textAlign: 'center', marginHorizontal: 14, marginVertical: 8 }}>{picked.m}</Muted>
          <View style={sx.rewardRow}>
            {['+20 XP', '🔥 Racha ' + a.streak, '💗 Beso'].map((t) => (
              <Text key={t} style={sx.reward}>{t}</Text>
            ))}
          </View>
          <Btn big label="Buenas noches 🌙" onPress={() => { a.addXp(20); a.showToast('Buenas noches 🌙 Mañana seguimos 💗'); a.setOverlay(null); }} />
        </View>
      )}
    </Sheet>
  );
}

/* ---------- Confeti ---------- */
function Papelito({ i }) {
  const { width, height } = Dimensions.get('window');
  const y = useSharedValue(-30);
  useEffect(() => {
    y.value = withDelay((i % 5) * 200, withRepeat(withTiming(height + 30, { duration: 2400 + (i % 4) * 300, easing: Easing.linear }), -1, false));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${y.value * 0.8 + i * 30}deg` }] }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: (((i * 7) % 100) / 100) * width, width: 9, height: 14, borderRadius: 3, backgroundColor: ['#FF6F9C', '#7C5CFF', '#34BC97', '#FFD15C'][i % 4] }, st]} />;
}
function Fiesta({ onClose, children }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: '#2A2D4377', alignItems: 'center', justifyContent: 'center', padding: 22 }]} onPress={onClose}>
        {Array.from({ length: 14 }).map((_, i) => (
          <Papelito key={i} i={i} />
        ))}
        <Pressable onPress={() => {}} style={sx.fiestaCard}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- Preferencias y alergias ---------- */
function Prefs({ a }) {
  const { prefs, setPrefs } = a;
  return (
    <Sheet tall onClose={() => a.setOverlay(null)}>
      <Titulo>🥗 Preferencias y alergias</Titulo>
      <Muted sm style={{ marginBottom: 14 }}>Esto ajusta tu plan semanal y el menú del día. Lo que marques aquí, {a.petName} no te lo va a sugerir.</Muted>
      <RowOpt onPress={() => setPrefs((p) => ({ ...p, veg: !p.veg }))} right={<Switch on={prefs.veg} />}>
        <Semi style={{ fontSize: 16 }}>🌱 Vegetariano</Semi>
        <Muted sm>Solo platillos sin carne ni pescado</Muted>
      </RowOpt>
      <RowOpt onPress={() => setPrefs((p) => ({ ...p, lowcarb: !p.lowcarb }))} right={<Switch on={prefs.lowcarb} />}>
        <Semi style={{ fontSize: 16 }}>🥩 Bajo en carbohidratos</Semi>
        <Muted sm>Platillos con pocos o nada de carbos (≤16 g)</Muted>
      </RowOpt>
      <Semi style={{ fontSize: 15, marginTop: 6, marginBottom: 8 }}>Evitar (alergias o lo que no comes)</Semi>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {ALERGENOS.map(([key, label]) => {
          const on = prefs.evitar.includes(key);
          return (
            <Pressable key={key} onPress={() => a.toggleEvitar(key)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: on ? '#E0556E' : '#e6e9f2', backgroundColor: on ? '#FDECEA' : '#fff' }}>
              <Text style={{ fontFamily: F.displaySemi, fontSize: 14, color: on ? '#C2415A' : '#6a7088' }}>{on ? '✕ ' : ''}{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {prefs.evitar.includes('otros') && (
        <View style={{ marginBottom: 16 }}>
          <Input value={prefs.otrosTxt || ''} onChangeText={(t) => setPrefs((p) => ({ ...p, otrosTxt: t }))} placeholder="¿Qué más evitas? Ej: fresa, camarón, soya…" style={{ borderColor: '#FFD9D0', marginBottom: 6 }} />
          <Muted sm>Lo guardamos como recordatorio. Aún no filtra solo, así que revisa los ingredientes de cada platillo.</Muted>
        </View>
      )}
      <Btn big label="Aplicar y regenerar plan" onPress={() => { a.regenWeek(); a.showToast('Plan actualizado a tus preferencias ✅'); a.setOverlay(null); }} />
    </Sheet>
  );
}

function Rename({ a }) {
  const [nombre, setNombre] = useState(a.petName);
  return (
    <Sheet onClose={() => a.setOverlay(null)}>
      <Titulo>✏️ Cambiar nombre</Titulo>
      <Muted sm style={{ marginBottom: 14 }}>Ponle el nombre que quieras. No pierdes tu progreso ni tu racha.</Muted>
      <Input value={nombre} onChangeText={setNombre} maxLength={20} placeholder="Nombre de tu Axo" style={{ fontFamily: F.displaySemi, fontSize: 16, marginBottom: 16 }} />
      <Btn big label="Guardar nombre" onPress={async () => { const ok = await a.renombrarAxo(nombre); if (ok) a.setOverlay(null); }} />
    </Sheet>
  );
}

/* ---------- Selector: qué ventana mostrar ---------- */
export default function Overlays() {
  const a = useApp();
  const o = a.overlay;
  const [coachOpen, setCoachOpen] = useState({});
  if (!o) return null;
  const close = () => a.setOverlay(null);

  if (o === 'voice') return <Voice a={a} />;
  if (o === 'photo') return <Photo a={a} />;
  if (o === 'recipe') return <Recipe a={a} />;
  if (o === 'menu') return <Menu a={a} />;
  if (o === 'reflexion') return <Reflexion a={a} />;
  if (o === 'prefs') return <Prefs a={a} />;
  if (o === 'rename') return <Rename a={a} />;

  if (o === 'celebrate')
    return (
      <Fiesta onClose={a.closeCelebrate}>
        <Axo {...a.axoProps} evo={a.computedEvo} mood="amor" size={170} />
        <Display style={{ fontSize: 24, marginTop: 2, textAlign: 'center' }}>¡Meta del día cumplida!</Display>
        <Muted style={{ textAlign: 'center', marginTop: 4, marginBottom: 10 }}>{a.phrase}</Muted>
        <View style={sx.rewardRow}>
          <Text style={sx.reward}>+50 XP</Text>
          <Text style={sx.reward}>🔥 Racha {rachaNueva(a)}</Text>
        </View>
        <Btn big label={'¡Gracias, ' + a.petName + '!'} onPress={a.closeCelebrate} />
      </Fiesta>
    );

  if (o === 'evolucion' && a.evoNueva) {
    const cerrar = () => {
      const skin = a.evoNueva.skin;
      a.setEvoNueva(null);
      if (skin) {
        a.setRegaloSkin(skin);
        a.setOverlay('regalo');
      } else close();
    };
    return (
      <Fiesta onClose={cerrar}>
        <Text style={{ fontSize: 46 }}>🌟</Text>
        <Display style={{ fontSize: 23, marginBottom: 4 }}>¡{a.petName} creció!</Display>
        <Axo {...a.axoProps} evo={a.evoNueva.etapa} mood="amor" size={160} />
        <Display style={{ fontSize: 19, color: C.pink, marginTop: 2 }}>{{ joven: '¡Ya es Joven! 🦎', adulto: '¡Ya es Adulto! ⭐', mistico: '¡Forma Mística! ✨' }[a.evoNueva.etapa]}</Display>
        <Muted style={{ textAlign: 'center', marginHorizontal: 10, marginTop: 2, marginBottom: 12 }}>¡Felicidades! Gracias a tu constancia de {a.evoNueva.dias} días seguidos, {a.petName} ha crecido. 💪</Muted>
        <Btn big label="¡Genial!" onPress={cerrar} />
      </Fiesta>
    );
  }

  if (o === 'regalo' && a.regaloSkin) {
    const cerrar = () => {
      close();
      a.setRegaloSkin(null);
    };
    return (
      <Fiesta onClose={cerrar}>
        <Text style={{ fontSize: 46 }}>🎁</Text>
        <Display style={{ fontSize: 23, marginBottom: 4, textAlign: 'center' }}>¡Nuevo color desbloqueado!</Display>
        <Axo {...a.axoProps} paletteKey={a.regaloSkin} evo={a.computedEvo} mood="amor" size={160} />
        <Display style={{ fontSize: 19, color: C.pink, marginTop: 2 }}>{PALETTES[a.regaloSkin] ? PALETTES[a.regaloSkin].label : a.regaloSkin}</Display>
        <Muted style={{ textAlign: 'center', marginHorizontal: 10, marginTop: 2, marginBottom: 12 }}>Ya puedes vestir a {a.petName} con este color desde su perfil.</Muted>
        <Btn big label="Ponérselo ahora" onPress={() => { a.updatePet({ ...a.pet, palette: a.regaloSkin }); cerrar(); a.showToast('¡' + a.petName + ' estrena color! 🎨'); }} style={{ marginBottom: 6 }} />
        <Btn kind="ghost" label="Más tarde" onPress={cerrar} />
      </Fiesta>
    );
  }

  if (o === 'paywall')
    return (
      <Sheet onClose={close}>
        <View style={{ alignItems: 'center' }}>
          <AxoMini paletteKey="galaxia" accessory="corona" size={130} />
        </View>
        <Display style={{ fontSize: 24, textAlign: 'center', marginBottom: 10 }}>Hazte Premium</Display>
        <View style={[sx.plan, { borderColor: C.pink, backgroundColor: C.pinkSoft }]}>
          <Text style={sx.planT}>Anual<Text style={sx.planS}>  2 meses gratis</Text></Text>
          <Text style={sx.planT}>$799<Text style={sx.planS}>/año</Text></Text>
        </View>
        <View style={sx.plan}>
          <Text style={sx.planT}>Mensual</Text>
          <Text style={sx.planT}>$99<Text style={sx.planS}>/mes</Text></Text>
        </View>
        <View style={{ marginVertical: 10, gap: 6 }}>
          {['IA por foto ilimitada', 'Recetas mexicanas infinitas', 'Skins y especies raras', 'Informes y tendencias avanzadas', 'Minijuegos exclusivos'].map((t) => (
            <Text key={t} style={{ fontFamily: F.body, fontSize: 14.5, color: C.ink }}>
              <Text style={{ color: C.mint, fontFamily: F.display }}>✓ </Text>
              {t}
            </Text>
          ))}
        </View>
        <Btn big label="Probar 7 días gratis" onPress={() => { close(); a.showToast('Demo: aquí iría el checkout 🛒'); }} />
        <Muted sm style={{ textAlign: 'center', marginTop: 8 }}>Gratis siempre: registro de comida, ajolote básico y stats básicas.</Muted>
      </Sheet>
    );

  if (o === 'coach')
    return (
      <Sheet onClose={close}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingRight: 40 }}>
          <AxoMini {...a.axoProps} evo={a.computedEvo} size={74} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.displaySemi, fontSize: 16, color: C.ink }}>{a.petName}, tu coach</Text>
            <Muted sm>Nutrición con base en evidencia, sin culpa.</Muted>
          </View>
        </View>
        {Object.keys(COACH_QA).map((q) => (
          <Pressable key={q} onPress={() => setCoachOpen((m) => ({ ...m, [q]: !m[q] }))} style={[sx.coachQ, coachOpen[q] && { backgroundColor: C.pinkSoft, borderColor: C.pinkLight }]}>
            <Text style={{ fontFamily: F.bodyBold, fontSize: 15, color: C.ink }}>{q}</Text>
            {coachOpen[q] && <Muted sm style={{ marginTop: 6 }}>{COACH_QA[q]}</Muted>}
          </Pressable>
        ))}
      </Sheet>
    );

  if (o === 'porciones')
    return (
      <Sheet tall onClose={close}>
        <Titulo>🍽️ Guía por porciones</Titulo>
        <Muted sm style={{ marginBottom: 14 }}>Si no te laten los menús fijos, esta es una forma flexible que a mucha gente le funciona: armar el plato por porciones, priorizando proteína y verduras. Ayuda a mantener la glucosa estable y a no andar con hambre entre comidas.</Muted>
        {[
          ['☀️ Desayuno', 'Más proteína que fruta. Si es fruta de mano, 1 pieza. Puedes sumar 1 carbohidrato (1 tortilla o 1 pan).'],
          ['🍽️ Comida', 'Una porción de proteína + 2 tostadas + ½ aguacate + muchas verduras.'],
          ['🌙 Cena', 'Ligera: proteína + verduras. Si te da hambre, un snack con proteína (yogur griego, huevo cocido).'],
        ].map(([t, d]) => (
          <Card key={t} style={{ backgroundColor: '#f6f7fb', elevation: 0, shadowOpacity: 0 }}>
            <CardH>{t}</CardH>
            <Muted sm>{d}</Muted>
          </Card>
        ))}
        <Muted sm>La idea no es contar todo al gramo, sino la proporción del plato. Es una guía general, no un plan médico: si tienes una condición (diabetes, riñón, embarazo), confírmalo con tu nutriólogo.</Muted>
      </Sheet>
    );

  if (o === 'privacy') {
    return (
      <Sheet tall onClose={close}>
        <Display style={{ fontSize: 22, marginBottom: 8 }}>Aviso de privacidad</Display>
        <AvisoTexto />
        <Btn big label="Entendido" onPress={close} />
      </Sheet>
    );
  }
  return null;
}

const sx = StyleSheet.create({
  chipBtn: { backgroundColor: C.soft, borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 },
  chipTxt: { fontFamily: F.displaySemi, fontSize: 12.5, color: C.muted },
  streakBig: { alignSelf: 'center', fontFamily: F.display, fontSize: 16, color: '#E8763A', backgroundColor: '#FFF1E6', borderRadius: 16, paddingVertical: 7, paddingHorizontal: 16, overflow: 'hidden' },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 14 },
  reward: { fontFamily: F.displaySemi, fontSize: 13.5, color: '#7C5CFF', backgroundColor: '#EFEAFF', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12, overflow: 'hidden' },
  fiestaCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 28, padding: 22, alignItems: 'center' },
  plan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderColor: C.line, borderRadius: 16, padding: 14, marginBottom: 8 },
  planT: { fontFamily: F.display, fontSize: 16, color: C.ink },
  planS: { fontFamily: F.body, fontSize: 12.5, color: C.muted },
  coachQ: { borderWidth: 2, borderColor: C.line, borderRadius: 16, padding: 14, marginBottom: 9 },
});

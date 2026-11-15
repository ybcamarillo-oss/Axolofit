import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, AppState, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { sb, hoyLocal } from '../supabase';
import { C, F, evoPorRacha } from '../theme';
import Axo from '../components/Axo';
import Nacimiento from '../components/Nacimiento';
import { estadoAvisos, pedirAvisos, programarAvisos, avisoDePrueba } from '../notifications';

// Días entre una fecha "AAAA-MM-DD" y hoy (misma cuenta que la PWA)
function diasDesde(fecha) {
  if (!fecha) return null;
  const [y, m, d] = fecha.split('-').map(Number);
  const h = new Date();
  return Math.floor((new Date(h.getFullYear(), h.getMonth(), h.getDate()) - new Date(y, m - 1, d)) / 86400000);
}

const TAM = { cria: 200, joven: 230, adulto: 260, mistico: 260 };
const ETAPAS_DEMO = [null, 'cria', 'joven', 'adulto'];
const NOMBRE_ETAPA = { cria: 'bebé', joven: 'joven', adulto: 'adulto', mistico: 'místico' };

export default function HomeScreen({ userId }) {
  const insets = useSafeAreaInsets();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [refrescando, setRefrescando] = useState(false);
  const [amor, setAmor] = useState(false);
  const [naciendo, setNaciendo] = useState(false);
  const [avisos, setAvisos] = useState(null); // 'activados' | 'sin-pedir' | 'bloqueados'
  // Botones temporales para revisar las caras y etapas en el teléfono
  const [demoMood, setDemoMood] = useState(null);
  const [demoEvo, setDemoEvo] = useState(0);
  const timers = useRef([]);
  const luego = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Solo lectura en este bloque: no escribimos nada en Supabase todavía.
  const cargar = useCallback(async () => {
    setError(null);
    const [perfil, axo, comidas] = await Promise.all([
      sb.from('profiles').select('nombre').eq('id', userId).maybeSingle(),
      sb.from('axo_state').select('variedad, nivel, xp, racha, ultimo_dia').eq('id', userId).maybeSingle(),
      sb.from('food_log').select('kcal').eq('user_id', userId).eq('fecha', hoyLocal()),
    ]);
    const err = perfil.error || axo.error || comidas.error;
    if (err) {
      setError(err.message);
      return;
    }
    const a = axo.data || {};
    const dif = diasDesde(a.ultimo_dia);
    const racha = a.racha > 0 && dif != null && dif >= 2 ? 0 : a.racha || 0;
    const nombre = perfil.data?.nombre || 'Axo';
    setDatos({
      nombre,
      tienePerfil: !!perfil.data,
      paleta: a.variedad || 'durazno',
      nivel: a.nivel ?? 1,
      xp: a.xp ?? 0,
      racha,
      comidasHoy: comidas.data?.length || 0,
      kcalHoy: (comidas.data || []).reduce((t, c) => t + (Number(c.kcal) || 0), 0),
    });

    // Avisos: si ya hay permiso, se reprograman en cada visita.
    const est = await estadoAvisos();
    setAvisos(est);
    if (est === 'activados') programarAvisos(nombre).catch(() => {});
  }, [userId]);

  useEffect(() => {
    cargar();
    const sub = AppState.addEventListener('change', (st) => st === 'active' && cargar());
    return () => sub.remove();
  }, [cargar]);

  // La primera vez que se abre la app en este teléfono, Axo nace del huevo.
  useEffect(() => {
    AsyncStorage.getItem('axo_nacido_' + userId).then((v) => {
      if (!v) setNaciendo(true);
    });
  }, [userId]);

  const terminoDeNacer = () => {
    AsyncStorage.setItem('axo_nacido_' + userId, '1');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    luego(() => setNaciendo(false), 2600);
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const mimar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAmor(true);
    luego(() => setAmor(false), 1600);
  };

  const activarAvisos = async () => {
    const est = await pedirAvisos();
    setAvisos(est);
    if (est === 'activados') await programarAvisos(datos?.nombre);
  };

  const probarCara = (m) => {
    setDemoMood(m);
    luego(() => setDemoMood(null), 3500);
  };

  if (error) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.title}>Ups 🥺</Text>
        <Text style={s.muted}>No pude cargar tus datos: {error}</Text>
        <Pressable onPress={cargar} style={s.ghostBtn}>
          <Text style={s.ghostTxt}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!datos) {
    return (
      <LinearGradient colors={[C.bgFrom, C.bgTo]} style={s.center}>
        <Text style={s.muted}>Cargando a tu Axo…</Text>
      </LinearGradient>
    );
  }

  const hambriento = datos.comidasHoy === 0;
  const mood = demoMood || (amor ? 'amor' : hambriento ? 'triste' : 'feliz');
  const evo = ETAPAS_DEMO[demoEvo] || evoPorRacha(datos.racha);
  const frase = naciendo
    ? `¡${datos.nombre} está naciendo! ✨`
    : mood === 'come'
    ? '¡Ñam ñam! Qué rico 😋'
    : mood === 'amor'
    ? '¡Te quiero! 💗'
    : mood === 'triste'
    ? 'Tengo hambre… ¿registramos tu comida?'
    : '¡Hoy vamos muy bien!';

  return (
    <LinearGradient colors={[C.bgFrom, C.bgTo]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={C.pink} />}
      >
        <View style={s.header}>
          <View>
            <Text style={s.title}>{datos.nombre}</Text>
            <Text style={s.muted}>
              Nivel {datos.nivel} · {NOMBRE_ETAPA[evo]}
            </Text>
          </View>
          <View style={s.streak}>
            <Text style={s.streakNum}>🔥 {datos.racha}</Text>
            <Text style={s.streakLbl}>{datos.racha === 1 ? 'día' : 'días'}</Text>
          </View>
        </View>

        <View style={s.xpBar}>
          <LinearGradient
            colors={[C.pinkLight, C.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.xpFill, { width: `${Math.min(100, Math.max(4, datos.xp))}%` }]}
          />
        </View>

        <View style={s.stage}>
          {naciendo ? (
            <Nacimiento paletteKey={datos.paleta} size={TAM.cria} onListo={terminoDeNacer} />
          ) : (
            <Axo key={evo} paletteKey={datos.paleta} mood={mood} evo={evo} size={TAM[evo]} onPress={mimar} />
          )}
          <Text style={s.bubble}>{frase}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardLbl}>Hoy</Text>
          <Text style={s.cardNum}>{Math.round(datos.kcalHoy)} kcal</Text>
          <Text style={s.muted}>
            {datos.comidasHoy} {datos.comidasHoy === 1 ? 'comida registrada' : 'comidas registradas'}
          </Text>
        </View>

        {/* Avisos */}
        {avisos === 'sin-pedir' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🔔 Deja que {datos.nombre} te avise</Text>
            <Text style={s.muted}>Te recuerda tus comidas y te avisa cuando te extraña.</Text>
            <Pressable onPress={activarAvisos} style={({ pressed }) => [{ marginTop: 12, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <LinearGradient colors={[C.pinkLight, C.pink]} style={s.btn}>
                <Text style={s.btnTxt}>Activar avisos</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
        {avisos === 'bloqueados' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🔕 Los avisos están apagados</Text>
            <Text style={s.muted}>Actívalos en los ajustes del teléfono para que {datos.nombre} pueda avisarte.</Text>
            <Pressable onPress={() => Linking.openSettings()} style={s.chip}>
              <Text style={s.chipTxt}>Abrir ajustes</Text>
            </Pressable>
          </View>
        )}
        {avisos === 'activados' && (
          <View style={[s.card, s.row]}>
            <Text style={[s.muted, { flex: 1 }]}>🔔 Avisos activados</Text>
            <Pressable onPress={() => avisoDePrueba(datos.nombre)} style={[s.chip, { marginTop: 0 }]}>
              <Text style={s.chipTxt}>Probar aviso (5 s)</Text>
            </Pressable>
          </View>
        )}

        {/* TEMPORAL: para revisar caras y etapas. Se quita cuando conectemos el registro de comida. */}
        <View style={s.card}>
          <Text style={s.cardLbl}>Probar (temporal)</Text>
          <View style={s.chips}>
            <Pressable onPress={() => setNaciendo(true)} style={s.chip}>
              <Text style={s.chipTxt}>Nacer</Text>
            </Pressable>
            <Pressable onPress={() => probarCara('come')} style={s.chip}>
              <Text style={s.chipTxt}>Comer</Text>
            </Pressable>
            <Pressable onPress={() => probarCara('feliz')} style={s.chip}>
              <Text style={s.chipTxt}>Feliz</Text>
            </Pressable>
            <Pressable onPress={() => probarCara('triste')} style={s.chip}>
              <Text style={s.chipTxt}>Con hambre</Text>
            </Pressable>
            <Pressable onPress={() => setDemoEvo((i) => (i + 1) % ETAPAS_DEMO.length)} style={s.chip}>
              <Text style={s.chipTxt}>Etapa: {ETAPAS_DEMO[demoEvo] ? NOMBRE_ETAPA[ETAPAS_DEMO[demoEvo]] : 'real'}</Text>
            </Pressable>
          </View>
        </View>

        {!datos.tienePerfil && (
          <Text style={[s.muted, { textAlign: 'center', marginTop: 12 }]}>
            Aún no terminas tu perfil. Por ahora complétalo en axolofit.vercel.app
          </Text>
        )}

        <Pressable onPress={() => sb.auth.signOut()} style={s.ghostBtn}>
          <Text style={s.ghostTxt}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: F.display, fontSize: 28, color: C.ink },
  muted: { fontFamily: F.body, fontSize: 14, color: C.muted },
  streak: { backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  streakNum: { fontFamily: F.display, fontSize: 20, color: '#E8763A' },
  streakLbl: { fontFamily: F.body, fontSize: 11, color: C.muted },
  xpBar: { height: 12, backgroundColor: '#ffffff99', borderRadius: 8, overflow: 'hidden', marginTop: 12 },
  xpFill: { height: '100%', borderRadius: 8 },
  stage: { alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, marginBottom: 4, minHeight: 376 },
  bubble: {
    fontFamily: F.bodyBold,
    fontSize: 15,
    color: C.ink,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  card: { backgroundColor: C.card, borderRadius: 22, padding: 18, marginTop: 12 },
  cardLbl: { fontFamily: F.bodyBold, fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { fontFamily: F.displaySemi, fontSize: 17, color: C.ink, marginBottom: 4 },
  cardNum: { fontFamily: F.display, fontSize: 30, color: C.ink, marginVertical: 2 },
  btn: { borderRadius: 16, paddingVertical: 13, alignItems: 'center' },
  btnTxt: { fontFamily: F.displaySemi, fontSize: 17, color: C.brown },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { backgroundColor: C.pinkSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, marginTop: 8, alignSelf: 'flex-start' },
  chipTxt: { fontFamily: F.displaySemi, fontSize: 14, color: '#C96F84' },
  ghostBtn: { alignSelf: 'center', marginTop: 24, padding: 10 },
  ghostTxt: { fontFamily: F.displaySemi, fontSize: 15, color: C.muted },
});

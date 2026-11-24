import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './store';
import { TIPS } from './data';
import { hoyLocal } from './plan';
import { C, F } from './theme';
import Axo from './components/Axo';

const dif = (a, b) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000);

// Día de uso: 0 = el primer día que entra a la app; 1 = el segundo día, etc.
// El primer tip que se ve (el segundo día) es el de "Constancia sobre perfección", y de ahí siguen en orden.
export function useDiaDeUso() {
  const { userId } = useApp();
  const [dia, setDia] = useState(null);
  useEffect(() => {
    if (!userId) return;
    const clave = 'axo_primer_dia_' + userId;
    AsyncStorage.getItem(clave)
      .then((v) => {
        const hoy = hoyLocal();
        if (!v) {
          AsyncStorage.setItem(clave, hoy).catch(() => {});
          setDia(0);
        } else setDia(Math.max(0, dif(hoy, v)));
      })
      .catch(() => setDia(0));
  }, [userId]);
  return dia;
}
export const tipDeDia = (dia) => TIPS[Math.max(0, (dia || 1) - 1) % TIPS.length];

// Al abrir la app (una vez al día) Axo cuenta el tip del día en un globo
export default function TipDelDia() {
  const a = useApp();
  const insets = useSafeAreaInsets();
  const [ver, setVer] = useState(false);
  const revisado = useRef(false);
  const dia = useDiaDeUso();
  const tip = tipDeDia(dia);

  useEffect(() => {
    if (revisado.current || dia === null || a.phase !== 'app' || !a.userId || a.naciendo || a.overlay) return;
    revisado.current = true;
    if (dia < 1) return; // el primer día no sale tip
    const clave = 'axo_tip_dia_' + a.userId;
    AsyncStorage.getItem(clave)
      .then((v) => {
        if (v !== hoyLocal()) setTimeout(() => setVer(true), 900);
      })
      .catch(() => {});
  }, [dia, a.phase, a.userId, a.naciendo, a.overlay]);

  if (!ver) return null;
  const cerrar = () => {
    setVer(false);
    AsyncStorage.setItem('axo_tip_dia_' + a.userId, hoyLocal()).catch(() => {});
  };

  return (
    <View style={[s.fondo, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <View style={s.globoSombra}>
        <View style={s.globo}>
          <View style={s.cab}>
            <View style={s.foco}>
              <Text style={{ fontSize: 28 }}>💡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.chico}>AXO TE CUENTA</Text>
              <Text style={s.titulo}>Tip del día</Text>
            </View>
          </View>
          <Text style={s.tipTit}>{tip.e} {tip.t}</Text>
          <Text style={s.texto}>{tip.d}</Text>
          <View style={s.pie}>
            <Text style={s.fuente} numberOfLines={2}>{tip.f}</Text>
            <Pressable onPress={cerrar} style={s.btn}>
              <Text style={s.btnTxt}>¡Gracias!</Text>
            </Pressable>
          </View>
        </View>
        <Svg width={56} height={34} viewBox="0 0 56 34" style={{ alignSelf: 'center', marginTop: -2 }}>
          <Path d="M0 0 Q 8 18 28 34 Q 44 16 56 0 Z" fill="#fff" />
        </Svg>
      </View>
      <Axo {...a.axoProps} evo={a.computedEvo} mood="feliz" size={210} />
    </View>
  );
}

const s = StyleSheet.create({
  fondo: { ...StyleSheet.absoluteFillObject, backgroundColor: '#2B1E3A99', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, zIndex: 50, elevation: 50 },
  globoSombra: { width: '100%', maxWidth: 420 },
  globo: { backgroundColor: '#fff', borderRadius: 40, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 18, elevation: 10, shadowColor: '#2B1E3A', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  cab: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  foco: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFF1B8', alignItems: 'center', justifyContent: 'center' },
  chico: { fontFamily: F.bodyBold, fontSize: 11.5, letterSpacing: 1.2, color: '#9A8A96' },
  titulo: { fontFamily: F.display, fontSize: 24, color: C.ink },
  tipTit: { fontFamily: F.displaySemi, fontSize: 17, color: C.ink, marginBottom: 6 },
  texto: { fontFamily: F.body, fontSize: 15.5, lineHeight: 23, color: '#5A4650' },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 },
  fuente: { flex: 1, fontFamily: F.body, fontSize: 11, color: '#A89AA4' },
  btn: { backgroundColor: '#FF7FA6', borderRadius: 22, paddingVertical: 11, paddingHorizontal: 24 },
  btnTxt: { fontFamily: F.bodyBold, fontSize: 15, color: '#fff' },
});

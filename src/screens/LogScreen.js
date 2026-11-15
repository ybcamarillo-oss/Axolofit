import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useApp } from '../store';
import { FOODS } from '../data';
import { hoyLocal, fmtFecha } from '../plan';
import { C, F } from '../theme';
import { Screen, Muted, Row, sombra } from '../ui';
import Axo from '../components/Axo';

const Method = ({ icon, t, dsc, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [s.method, { opacity: pressed ? 0.8 : 1 }]}>
    <View style={s.mIc}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: F.displaySemi, fontSize: 15, color: C.ink }}>{t}</Text>
      <Text style={{ fontFamily: F.body, fontSize: 12, color: C.gray }}>{dsc}</Text>
    </View>
  </Pressable>
);

// Registrar comida: por foto (IA), describiéndola (IA) o buscando en la lista.
export default function LogScreen() {
  const a = useApp();
  const [q, setQ] = useState('');
  const results = q.trim() ? FOODS.filter((f) => f.n.toLowerCase().includes(q.toLowerCase())) : FOODS.slice(0, 6);
  return (
    <Screen title="Registrar comida" back={() => a.setScreen('home')} contentStyle={{ paddingBottom: 100 }}>
      {a.viewDate !== hoyLocal() && (
        <Muted sm style={{ textAlign: 'center', backgroundColor: '#FFF4E0', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 8, overflow: 'hidden' }}>
          📅 Registrando para el {fmtFecha(a.viewDate)}
        </Muted>
      )}
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <Text style={s.line}>{a.eating ? '¡Miam, miam! 😋 (se soba la pancita)' : a.hungry ? '¡Tengo hambre! ¿me das de comer? 🥺' : '¿Qué vamos a comer?'}</Text>
        <Axo {...a.axoProps} evo={a.computedEvo} mood={a.eating ? 'come' : a.hungry ? 'triste' : 'feliz'} size={130} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <Method icon="📷" t="Foto" dsc="La IA detecta y estima" onPress={() => a.setOverlay('photo')} />
        <Method icon="✍️" t="Describir" dsc="Escribe lo que comiste" onPress={() => a.setOverlay('voice')} />
      </View>
      <View style={s.search}>
        <Text style={{ fontSize: 16 }}>🔎</Text>
        <TextInput placeholder="Busca: tacos, pozole, concha…" placeholderTextColor={C.gray} value={q} onChangeText={setQ} style={{ flex: 1, fontFamily: F.body, fontSize: 15, color: C.ink, padding: 0 }} />
      </View>
      {results.length === 0 && <Muted sm style={{ textAlign: 'center', marginTop: 10 }}>No lo encontré en la lista. Prueba con “Describir” y la IA lo calcula.</Muted>}
      {results.map((f) => (
        <Row key={f.id}>
          <Text style={{ flex: 1, fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink }}>
            {f.n}
            <Text style={{ fontFamily: F.body, color: C.muted, fontSize: 13 }}> · {f.u} · {f.kcal} kcal · P{f.p} C{f.c} G{f.g}</Text>
          </Text>
          <Pressable onPress={() => a.addFood(f)} style={s.addBtn} hitSlop={6}>
            <Text style={{ fontFamily: F.display, fontSize: 20, color: C.brown, marginTop: -2 }}>+</Text>
          </Pressable>
        </Row>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  line: { fontFamily: F.bodyBold, fontSize: 14, color: C.ink, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, overflow: 'hidden', marginBottom: 2 },
  method: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 18, padding: 12, ...sombra },
  mIc: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: C.line, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 6 },
  addBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.pinkLight, alignItems: 'center', justifyContent: 'center' },
});

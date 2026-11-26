import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useApp } from '../store';
import { C, F } from '../theme';
import { Screen, Card, CardH, Muted, sombra } from '../ui';
import { TIPS, TIPS_CATS } from '../data';
import { useDiaDeUso, tipDeDia } from '../TipDelDia';

// Tips: el del día y la biblioteca completa, con su fuente.
function Biblioteca() {
  const [cat, setCat] = useState('todos');
  const [abierto, setAbierto] = useState(null);
  const dia = useDiaDeUso();
  const delDia = tipDeDia(dia);
  const lista = cat === 'todos' ? TIPS : TIPS.filter((t) => t.c === cat);
  return (
    <>
      <Card>
        <CardH>🌟 Tip del día</CardH>
        <Text style={{ fontFamily: F.bodyBold, fontSize: 15, color: C.ink }}>{delDia.e} {delDia.t}</Text>
        <Muted sm style={{ marginTop: 6 }}>{delDia.d}</Muted>
        <Text style={{ fontFamily: F.body, fontSize: 11, color: C.gray, marginTop: 8 }}>Fuente: {delDia.f}</Text>
      </Card>
      <Card>
        <CardH>📚 Todos los tips</CardH>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {[['todos', 'Todos'], ...Object.entries(TIPS_CATS)].map(([k, l]) => (
            <Pressable key={k} onPress={() => setCat(k)} style={[s.cat, cat === k && s.catOn]}>
              <Text style={{ fontFamily: F.bodyBold, fontSize: 12.5, color: cat === k ? '#fff' : C.ink }}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {lista.map((t) => (
          <Pressable key={t.t} onPress={() => setAbierto(abierto === t.t ? null : t.t)} style={s.tipFila}>
            <Text style={{ fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink }}>{t.e} {t.t}</Text>
            {abierto === t.t && (
              <>
                <Muted sm style={{ marginTop: 6 }}>{t.d}</Muted>
                <Text style={{ fontFamily: F.body, fontSize: 11, color: C.gray, marginTop: 6 }}>Fuente: {t.f}</Text>
              </>
            )}
          </Pressable>
        ))}
        <Text style={{ fontFamily: F.body, fontSize: 11, color: C.gray, marginTop: 8 }}>Información general, no sustituye a tu médico o nutriólogo. Los estudios observacionales muestran asociación, no prueban causa.</Text>
      </Card>
    </>
  );
}

export default function TipsScreen() {
  const a = useApp();
  return (
    <Screen title="Tips" back={() => a.setScreen('stats')} contentStyle={{ paddingBottom: 100 }}>
      <Biblioteca />
    </Screen>
  );
}

const s = StyleSheet.create({
  cat: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: '#F1F2F7' },
  catOn: { backgroundColor: '#7C5CFF' },
  tipFila: { paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#EEF0F6' },
});

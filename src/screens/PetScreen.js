import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../store';
import { PALETTES, ESTILOS, ACCESSORIES, OUTFITS, BACKGROUNDS } from '../data';
import { C, F } from '../theme';
import { Screen, Muted, SectT, Btn, sombra } from '../ui';
import Axo, { AxoMini } from '../components/Axo';

const ETAPAS = [
  ['huevo', '🥚', 'Huevo', 0],
  ['cria', '🐣', 'Bebé', 0],
  ['joven', '🦎', 'Joven', 7],
  ['adulto', '⭐', 'Adulto', 21],
  ['mistico', '✨', 'Místico', 60],
];
const DESC = {
  cria: 'Pequeñín y juguetón.',
  joven: 'En plena forma.',
  adulto: 'Fuerte y maduro.',
  mistico: '¡Forma legendaria! Brilla con su aura.',
};

// Fila horizontal de opciones (colores, accesorios, outfits…)
function Swatches({ map, sel, onPick, render }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9, paddingVertical: 4, paddingRight: 8 }}>
      {Object.entries(map).map(([k, v]) => (
        <Pressable key={k} onPress={() => onPick(k)} style={[s.swatch, sel === k && { borderColor: C.pink, backgroundColor: C.pinkSoft }]}>
          {render(k, v)}
          {v.premium && (
            <View style={s.crown}>
              <Text style={{ fontSize: 10 }}>👑</Text>
            </View>
          )}
          <Text numberOfLines={1} style={{ fontFamily: F.displaySemi, fontSize: 11, color: C.muted, marginTop: 2 }}>{v.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Vestir a Axo: color, estilo, accesorio, outfit y fondo.
export default function PetScreen() {
  const a = useApp();
  const { pet, petName, computedEvo, darkBg, streak } = a;
  const curIdx = ETAPAS.findIndex((e) => e[0] === computedEvo);
  const sig = ETAPAS[curIdx + 1];
  const tStyle = darkBg ? { color: '#ffffffcc' } : null;

  return (
    <Screen title={petName} back={() => a.setScreen('home')} colors={[a.bg.from, a.bg.to]} dark={darkBg} contentStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', marginBottom: 4 }}>
        <Axo key={computedEvo} {...a.axoProps} evo={computedEvo} mood={a.kissing ? 'amor' : 'feliz'} size={200} onPress={a.blowKiss} />
      </View>

      <Text style={{ textAlign: 'center', fontFamily: F.displaySemi, fontSize: 13, color: darkBg ? '#ffffffcc' : C.gray, letterSpacing: 0.3, marginBottom: 6 }}>🌱 EVOLUCIÓN DE {petName.toUpperCase()}</Text>
      <View style={s.evoRow}>
        {ETAPAS.map(([k, em, e, dias], idx) => {
          const hecho = idx <= curIdx;
          const actual = idx === curIdx;
          return (
            <View key={k} style={{ flex: 1, alignItems: 'center', opacity: hecho ? 1 : 0.45 }}>
              <View style={[s.evoDot, actual && { borderColor: C.pink, backgroundColor: C.pinkSoft }]}>
                <Text style={{ fontSize: 18 }}>{em}</Text>
              </View>
              <Text style={{ fontFamily: F.displaySemi, fontSize: 11, color: C.ink, marginTop: 3 }}>{e}</Text>
              <Text style={{ fontFamily: F.body, fontSize: 10, color: C.gray }}>{idx < 2 ? 'inicio' : dias + ' días'}</Text>
            </View>
          );
        })}
      </View>
      <Muted sm style={{ textAlign: 'center', marginBottom: 10, color: darkBg ? '#ffffffcc' : C.muted }}>
        {DESC[computedEvo]}
        {sig ? ' Le faltan ' + Math.max(0, sig[3] - streak) + ' días de racha para ser ' + sig[2].toLowerCase() + '.' : ''}
      </Muted>
      <Muted sm style={{ marginBottom: 4, color: darkBg ? '#ffffffcc' : C.muted }}>
        🎨 <Text style={{ fontFamily: F.bodyBold }}>Color</Text> es el skin de {petName}. <Text style={{ fontFamily: F.bodyBold }}>Estilo</Text>, <Text style={{ fontFamily: F.bodyBold }}>Accesorio</Text> (cabeza) y <Text style={{ fontFamily: F.bodyBold }}>Outfit</Text> (cuerpo) se combinan entre sí. Los que tienen 👑 son premium.
      </Muted>

      <SectT style={tStyle}>Color / Skin</SectT>
      <Swatches map={PALETTES} sel={pet.palette} onPick={(k) => a.updatePet({ ...pet, palette: k })} render={(k) => <AxoMini paletteKey={k} estilo={pet.estilo} size={50} />} />
      <SectT style={tStyle}>Estilo</SectT>
      <Swatches map={ESTILOS} sel={pet.estilo} onPick={(k) => (ESTILOS[k].premium ? a.setOverlay('paywall') : a.updatePet({ ...pet, estilo: k }))} render={(k) => <AxoMini paletteKey={pet.palette} estilo={k} size={50} />} />
      <SectT style={tStyle}>Accesorio</SectT>
      <Swatches map={ACCESSORIES} sel={pet.accessory} onPick={(k) => (ACCESSORIES[k].premium ? a.setOverlay('paywall') : a.updatePet({ ...pet, accessory: k }))} render={(k) => <AxoMini paletteKey={pet.palette} accessory={k} estilo={pet.estilo} size={50} />} />
      <SectT style={tStyle}>Outfit</SectT>
      <Swatches map={OUTFITS} sel={pet.outfit} onPick={(k) => (OUTFITS[k].premium ? a.setOverlay('paywall') : a.updatePet({ ...pet, outfit: k }))} render={(k) => <AxoMini paletteKey={pet.palette} outfit={k} evo={computedEvo} size={50} />} />
      <SectT style={tStyle}>Fondo</SectT>
      <Swatches
        map={BACKGROUNDS}
        sel={pet.bg}
        onPick={(k) => (BACKGROUNDS[k].premium ? a.setOverlay('paywall') : a.updatePet({ ...pet, bg: k }))}
        render={(k, v) => <LinearGradient colors={[v.from, v.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 46, height: 46, borderRadius: 23, marginVertical: 4.5 }} />}
      />
      <Btn kind="soft" label="👑 Conoce AxoloFit Premium" onPress={() => a.setOverlay('paywall')} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const s = StyleSheet.create({
  swatch: { width: 74, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: 'transparent', paddingVertical: 6, paddingHorizontal: 4, ...sombra },
  crown: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFE9A6', alignItems: 'center', justifyContent: 'center' },
  evoRow: { flexDirection: 'row', backgroundColor: '#ffffffcc', borderRadius: 18, paddingVertical: 10, marginBottom: 8 },
  evoDot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});

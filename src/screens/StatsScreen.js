import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useApp } from '../store';
import { C, F } from '../theme';
import { Screen, Btn, Card, CardH, Muted, MiniChart, Tip, Row, Input, sombra } from '../ui';
import Axo, { AxoMini } from '../components/Axo';
import { TIPS, TIPS_CATS } from '../data';

// Progreso: peso, gráfica, IMC, informe del día y logros.
export default function StatsScreen() {
  const a = useApp();
  const { profile, pesoHist, pa, petName, totals, targets, vasos, streak, totalComidas } = a;
  const [pesoInput, setPesoInput] = useState('');
  const [info, setInfo] = useState(false);
  const estatura = (profile.estaturaCm || 0) / 100;
  const pesoReal = pesoHist.length > 0 ? pesoHist[pesoHist.length - 1].peso : pa;
  const imc = estatura > 0 ? pesoReal / (estatura * estatura) : 0;
  const imcCat = imc < 18.5 ? 'bajo peso' : imc < 25 ? 'saludable' : imc < 30 ? 'sobrepeso' : 'obesidad';
  const descenso = pesoHist.length >= 2 ? pesoHist[0].peso - pesoHist[pesoHist.length - 1].peso : 0;
  const chartData = pesoHist.map((r) => ({ d: r.fecha.slice(5).replace('-', '/'), peso: r.peso }));
  const pk = totals.p * 4;
  const ck = totals.c * 4;
  const gk = totals.g * 9;
  const tk = Math.max(1, pk + ck + gk);

  const registrar = async () => {
    const ok = await a.registrarPeso(pesoInput);
    if (ok) setPesoInput('');
  };

  return (
    <Screen title="Progreso" back={() => a.setScreen('home')} contentStyle={{ paddingBottom: 100 }}>
      <Card colors={['#FCEFF1', '#EEF7F4']}>
        <CardH>⚖️ Tu peso · {pesoReal.toFixed(1)} kg</CardH>
        <View style={{ alignItems: 'center' }}>
          <Axo {...a.axoProps} evo={a.computedEvo} size={150} />
        </View>
        <Muted sm style={{ textAlign: 'center' }}>Meta: {a.pesoMeta} kg · {petName} adelgaza contigo conforme bajas de peso.</Muted>
        {imc > 0 && (
          <Muted sm style={{ textAlign: 'center', marginTop: 2 }}>
            IMC: <Text style={{ fontFamily: F.bodyBold }}>{imc.toFixed(1)}</Text> · {imcCat}
          </Muted>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Input placeholder="Peso de hoy (kg)" keyboardType="decimal-pad" value={pesoInput} onChangeText={setPesoInput} style={{ flex: 1, marginBottom: 0, backgroundColor: '#fff' }} />
          <Btn label="Registrar" onPress={registrar} />
        </View>
        <Muted sm style={{ textAlign: 'center', marginTop: 8 }}>Registra tu peso una vez por semana para ver tu avance.</Muted>
      </Card>

      <Composicion a={a} />

      <Card>
        <CardH>Tu progreso de peso</CardH>
        {pesoHist.length === 0 && <Muted sm>Aún no registras tu peso. Pon tu peso de hoy arriba para empezar tu gráfica.</Muted>}
        {pesoHist.length === 1 && <Muted sm>¡Primer registro guardado! Registra de nuevo la próxima semana para ver tu línea de progreso.</Muted>}
        {pesoHist.length >= 2 && (
          <>
            <MiniChart data={chartData} />
            {descenso > 0 ? (
              <Text style={{ fontFamily: F.displaySemi, fontSize: 14, color: C.mint, textAlign: 'center' }}>▼ {descenso.toFixed(1)} kg desde que empezaste · ¡{petName} lo celebra contigo!</Text>
            ) : descenso < 0 ? (
              <Muted sm>Has subido {Math.abs(descenso).toFixed(1)} kg desde el inicio. Sigue, {petName} está contigo. 💗</Muted>
            ) : (
              <Muted sm>Tu peso se mantiene igual que al inicio. ¡Sigue registrando!</Muted>
            )}
          </>
        )}
      </Card>

      <Tip icon="💡">
        <Text style={{ fontFamily: F.bodyBold }}>No te obsesiones con la báscula.</Text> El peso sube y baja por agua o músculo. Lo ideal es <Text style={{ fontFamily: F.bodyBold }}>bajar de talla y perder grasa</Text> manteniendo tus músculos fuertes. ¡Tus centímetros nos dicen el progreso real!
      </Tip>
      <Tip icon="💪" colors={['#EEF0FF', '#F1ECFF']}>
        <Text style={{ fontFamily: F.bodyBold }}>El músculo es tu aliado.</Text> Al bajar de peso, conservar y ganar músculo mantiene tu metabolismo activo, te da fuerza y hace que la grasa se vaya sin recuperarla. Por eso priorizamos la <Text style={{ fontFamily: F.bodyBold }}>proteína</Text> y el movimiento, no solo comer menos.
      </Tip>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {[[streak, '', 'Racha (días)'], [Math.round(totals.p), 'g', 'Proteína hoy'], [Math.round(totals.kcal), '', 'Kcal hoy'], [vasos, '/' + targets.vasos, 'Vasos de agua']].map(([v, sfx, l]) => (
          <View key={l} style={s.chip}>
            <Text style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>
              {v}
              <Text style={{ fontSize: 13, fontFamily: F.body }}>{sfx}</Text>
            </Text>
            <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.gray }}>{l}</Text>
          </View>
        ))}
      </View>

      <Card>
        <CardH>✨ Informe avanzado · distribución de hoy</CardH>
        {[['Proteína', pk, '#7C5CFF'], ['Carbohidratos', ck, '#34BC97'], ['Grasa', gk, '#F2B705']].map(([l, v, col]) => (
          <View key={l} style={{ marginVertical: 7 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: F.bodyBold, fontSize: 13, color: C.ink }}>{l}</Text>
                {l === 'Carbohidratos' && (
                  <Pressable onPress={() => setInfo((v2) => !v2)} hitSlop={10} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#e7e3ff', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: F.display, fontSize: 12, color: '#7C5CFF' }}>?</Text>
                  </Pressable>
                )}
              </View>
              <Text style={{ fontFamily: F.bodyBold, fontSize: 13, color: col }}>{Math.round((v / tk) * 100)}%</Text>
            </View>
            <View style={{ height: 9, backgroundColor: '#eef0f6', borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ width: `${(v / tk) * 100}%`, height: '100%', backgroundColor: col }} />
            </View>
            {l === 'Carbohidratos' && info && <Muted sm style={{ marginTop: 6 }}>Combina tus carbohidratos con fibra o proteína para evitar picos de glucosa. Así mantienes la energía estable y el apetito bajo control todo el día.</Muted>}
          </View>
        ))}
      </Card>

      <View style={[s.tipAxo]}>
        <AxoMini paletteKey={a.pet.palette} size={46} />
        <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13.5, lineHeight: 19, color: '#3d6b5c' }}>
          <Text style={{ fontFamily: F.bodyBold }}>Tip de {petName}:</Text> combinar tus carbohidratos con fibra o proteína evita los picos de glucosa. ¡Así mantienes tu energía estable y el apetito bajo control toda la tarde!
        </Text>
      </View>

      <BibliotecaTips />

      <Card>
        <CardH>🏆 Logros recientes</CardH>
        {[
          ['🔥', 'Racha de 7 días', streak >= 7 ? '¡desbloqueado!' : streak + ' / 7 días'],
          ['🥗', '100 comidas registradas', Math.min(totalComidas, 100) + ' / 100'],
          ['⚖️', 'Primeros 5 kg', (descenso > 0 ? descenso.toFixed(1) : '0') + ' / 5 kg'],
        ].map(([e, t, st]) => (
          <Row key={t}>
            <Text style={{ fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink }}>{e} {t}</Text>
            <Muted sm>{st}</Muted>
          </Row>
        ))}
      </Card>
    </Screen>
  );
}

const CAMPOS_COMP = [
  ['grasa', 'Grasa corporal', '%', '🧈'],
  ['musculo', 'Masa muscular', 'kg', '💪'],
  ['agua', 'Agua corporal', '%', '💧'],
  ['edadMet', 'Edad metabólica', 'años', '🎂'],
  ['bmr', 'Calorías basales', 'kcal', '🔥'],
];

function Composicion({ a }) {
  const [abierto, setAbierto] = useState(false);
  const [v, setV] = useState({});
  const hist = a.composicion || [];
  const ult = hist.length ? hist[hist.length - 1] : null;
  const prev = hist.length > 1 ? hist[hist.length - 2] : null;
  const guardar = async () => {
    const ok = await a.registrarComposicion(v);
    if (ok) {
      setV({});
      setAbierto(false);
    }
  };
  const delta = (k) => {
    if (!ult || !prev || ult[k] == null || prev[k] == null) return null;
    const d = Math.round((ult[k] - prev[k]) * 10) / 10;
    return d === 0 ? '=' : (d > 0 ? '▲ ' : '▼ ') + Math.abs(d);
  };
  return (
    <Card>
      <CardH>🧬 Composición corporal (báscula inteligente)</CardH>
      {!ult && <Muted sm>Si tu báscula mide grasa, músculo, agua y más, anota aquí tus datos para ver cómo cambian con el tiempo. Todos son opcionales.</Muted>}
      {ult && (
        <>
          <Muted sm style={{ marginBottom: 6 }}>Última medición: {ult.fecha}</Muted>
          {CAMPOS_COMP.filter(([k]) => ult[k] != null).map(([k, l, u, e]) => (
            <Row key={k}>
              <Text style={{ fontFamily: F.bodyBold, fontSize: 14, color: C.ink }}>{e} {l}</Text>
              <Text style={{ fontFamily: F.bodyBold, fontSize: 14, color: C.ink }}>
                {ult[k]} {u}
                {delta(k) ? <Text style={{ fontFamily: F.body, fontSize: 12, color: C.gray }}>  {delta(k)}</Text> : null}
              </Text>
            </Row>
          ))}
        </>
      )}
      {abierto ? (
        <View style={{ marginTop: 10 }}>
          {CAMPOS_COMP.map(([k, l, u]) => (
            <Input key={k} placeholder={l + ' (' + u + ')'} keyboardType="decimal-pad" value={v[k] || ''} onChangeText={(t) => setV((x) => ({ ...x, [k]: t }))} style={{ marginBottom: 8, backgroundColor: '#fff' }} />
          ))}
          <Btn label="Guardar medición" onPress={guardar} />
          <Btn kind="ghost" label="Cancelar" onPress={() => setAbierto(false)} style={{ marginTop: 4 }} />
        </View>
      ) : (
        <Btn label={ult ? '➕ Nueva medición' : '➕ Anotar mis datos'} onPress={() => setAbierto(true)} style={{ marginTop: 10 }} />
      )}
      <Muted sm style={{ marginTop: 8, fontSize: 11.5 }}>Las básculas estiman estos valores y pueden variar entre marcas y según tu hidratación. Fíjate en la tendencia, no en un solo día.</Muted>
    </Card>
  );
}

function BibliotecaTips() {
  const [cat, setCat] = useState('todos');
  const [abierto, setAbierto] = useState(null);
  const dia = Math.floor(Date.now() / 86400000);
  const delDia = TIPS[dia % TIPS.length];
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

const s = StyleSheet.create({
  chip: { width: '48.5%', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 14, alignItems: 'center', marginBottom: 10, ...sombra },
  cat: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: '#F1F2F7' },
  catOn: { backgroundColor: '#7C5CFF' },
  tipFila: { paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#EEF0F6' },
  tipAxo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EAF7F2', borderRadius: 16, padding: 12, marginBottom: 12 },
});

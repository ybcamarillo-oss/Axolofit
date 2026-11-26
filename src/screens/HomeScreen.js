import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { FOODS, MEAL_SPLIT, AXO_IDLE } from '../data';
import { DIAS, DIAS_LABEL, hoyLocal, fmtFecha, semanaDe } from '../plan';
import { C, F } from '../theme';
import { Btn, Card, CardH, Muted, Ring, RingC, GlassIcon, Row, sombra } from '../ui';
import Axo from '../components/Axo';
import Nacimiento from '../components/Nacimiento';

const TAM = { cria: 250, joven: 285, adulto: 320, mistico: 320 };
const sombraFab = { elevation: 6, shadowColor: '#E79FAE', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } };

export default function HomeScreen() {
  const a = useApp();
  const insets = useSafeAreaInsets();
  const { petName, targets, totals, vasos, streak, level, xp, log, viewDate, celebrated, eating, kissing, hungry, abandonado, diasAbandono, weekEaten, darkBg, avisos } = a;
  const hoy = hoyLocal();
  // frase tranquila de Axo: cambia sola, sin pedirle nada a la persona
  const idle = useMemo(() => AXO_IDLE[Math.floor(Math.random() * AXO_IDLE.length)], [hoy, a.computedEvo]);
  const weekDates = semanaDe();

  const frase = a.naciendo
    ? '¡' + petName + ' está naciendo! ✨'
    : eating
    ? '¡Miam, miam! 😋 (se soba la pancita)'
    : kissing
    ? a.reaccion || '¡' + petName + ' te manda un beso! 💗'
    : celebrated
    ? '¡' + petName + ' está feliz! 💗'
    : abandonado
    ? '¿Me olvidaste? Llevo ' + diasAbandono + ' días esperándote… 🥺💔'
    : hungry && streak === 0
    ? '¡Acabo de nacer! Dame de comer 🥺'
    : hungry
    ? 'Tengo hambre… ¿me das de comer? 🥺'
    : idle;

  return (
    <LinearGradient colors={[a.bg.from, a.bg.to]} style={{ flex: 1, paddingTop: insets.top }}>
      <View style={s.top}>
        <View style={s.pill}>
          <Text style={s.pillTxt}>🔥 {streak} días</Text>
        </View>
        <View style={[s.pill, { gap: 8 }]}>
          <Text style={s.pillTxt}>Nivel {level}</Text>
          <View style={s.xpTrack}>
            <View style={[s.xpFill, { width: `${Math.min(100, Math.max(3, xp))}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* semana */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
          {weekDates.map((d, i) => {
            const dStr = hoyLocal(d);
            const sel = dStr === viewDate;
            const fut = dStr > hoy;
            return (
              <Pressable key={dStr} disabled={fut} onPress={() => a.setViewDate(dStr)} style={[s.day, sel && { backgroundColor: C.purple }]}>
                <Text style={{ fontFamily: F.displaySemi, fontSize: 11, color: sel ? '#fff' : fut ? '#c7cad6' : C.muted }}>{DIAS_LABEL[i]}</Text>
                <Text style={{ fontFamily: F.display, fontSize: 16, color: sel ? '#fff' : fut ? '#c7cad6' : C.ink }}>{d.getDate()}</Text>
              </Pressable>
            );
          })}
        </View>
        {viewDate !== hoy && (
          <Muted sm style={{ textAlign: 'center', marginBottom: 6, color: darkBg ? '#ffffffcc' : C.muted }}>
            📅 Viendo {fmtFecha(viewDate)} — puedes registrar lo que comiste ese día
          </Muted>
        )}

        {/* Axo */}
        <View style={s.stage}>
          <Text style={s.bubble}>{frase}</Text>
          {a.naciendo ? (
            <Nacimiento paletteKey={a.pet.palette} size={TAM.cria} onListo={a.terminoDeNacer} />
          ) : (
            <Axo key={a.computedEvo} {...a.axoProps} evo={a.computedEvo} mood={a.mood} size={TAM[a.computedEvo]} onPress={a.blowKiss} />
          )}
        </View>
        {streak === 0 && (
          <Text style={{ textAlign: 'center', fontFamily: F.body, fontSize: 11.5, color: darkBg ? '#ffffff99' : '#b0a8bb', marginTop: 2 }}>
            🔥 La racha sube al cumplir tu meta calórica del día
          </Text>
        )}
        <View style={{ alignItems: 'center', marginTop: 6, marginBottom: 12 }}>
          <Btn label={'✨ Vestir a ' + petName} onPress={() => a.setScreen('pet')} />
        </View>

        {(avisos === 'sin-pedir' || avisos === 'bloqueados') && (
          <Pressable onPress={a.activarAvisos} style={s.aviso}>
            <Text style={{ fontSize: 15 }}>🔔</Text>
            <Text style={{ flex: 1, fontFamily: F.displaySemi, fontSize: 13, color: '#8A6A2E' }}>Activa notificaciones para no perder tu racha</Text>
            <Text style={{ fontFamily: F.display, fontSize: 13, color: '#8A6A2E' }}>Activar</Text>
          </Pressable>
        )}

        {/* anillos */}
        <View style={s.rings}>
          <View style={s.ringItem}>
            <Ring progress={a.pKcal} color="#E79FAE">
              <RingC big={Math.round(totals.kcal)} small={'/' + targets.objetivoDeficit} />
            </Ring>
            <Text style={s.ringLbl}>🔥 Kcal</Text>
          </View>
          <View style={s.ringItem}>
            <Ring progress={a.pProt} color="#7C5CFF">
              <RingC big={Math.round(totals.p)} small={'/' + targets.prote + 'g'} />
            </Ring>
            <Text style={s.ringLbl}>Proteína</Text>
          </View>
          <View style={s.ringItem}>
            <Ring progress={a.pAgua} color="#3FA9F5">
              <RingC big={vasos} small={'/' + targets.vasos} />
            </Ring>
            <Text style={s.ringLbl}>💧 Agua</Text>
          </View>
        </View>
        <View style={[s.rings, { justifyContent: 'center', gap: 34 }]}>
          <View style={s.ringItem}>
            <Ring progress={a.pCarbs} color="#F2B705">
              <RingC big={Math.round(totals.c)} small={'/' + targets.carbs + 'g'} />
            </Ring>
            <Text style={s.ringLbl}>Carbos</Text>
          </View>
          <View style={s.ringItem}>
            <Ring progress={a.pGrasa} color="#34BC97">
              <RingC big={Math.round(totals.g)} small={'/' + targets.grasa + 'g'} />
            </Ring>
            <Text style={s.ringLbl}>Grasas</Text>
          </View>
        </View>

        {/* agua */}
        <Card>
          <CardH>💧 Agua de hoy · {vasos}/{targets.vasos} vasos</CardH>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {Array.from({ length: targets.vasos }).map((_, i) => (
              <Pressable key={i} onPress={() => a.setWater(i)} hitSlop={4}>
                <GlassIcon filled={i < vasos} />
              </Pressable>
            ))}
          </View>
          <Muted sm style={{ marginTop: 8 }}>Toca un vaso para marcar lo que ya tomaste.</Muted>
        </Card>

        <View style={s.quick}>
          <Btn kind="soft" label="💧 +1 vaso de agua" onPress={a.addAgua} style={{ flex: 1 }} />
          <Btn kind="soft" label={'💬 Pregúntale a ' + petName} onPress={() => a.setOverlay('coach')} style={{ flex: 1 }} />
        </View>
        <View style={s.quick}>
          <Btn kind="feature" label="✨ Generar receta" onPress={() => a.setOverlay('recipe')} style={{ flex: 1 }} />
          <Btn kind="soft" label="🎮 Juegos" onPress={() => a.setScreen('arcade')} style={{ flex: 1 }} />
        </View>
        <Btn kind="feature" label="🍽️ Menú del día · generar" onPress={() => a.setOverlay('menu')} style={{ marginBottom: 9 }} />
        <Btn kind="feature" label="📅 Ver plan semanal" onPress={() => a.setScreen('semana')} style={{ marginBottom: 12 }} />

        {!celebrated && (
          <Card>
            <CardH>✨ ¿Se te antoja algo más?</CardH>
            <Muted sm>Registra lo que comas fuera del plan — todo suma a tu conteo del día.</Muted>
            {['pozole', 'pechuga', 'frijol', 'pastor'].map((id) => {
              const f = FOODS.find((x) => x.id === id);
              return (
                <Row key={id}>
                  <Text style={s.rowTxt}>
                    {f.n}
                    <Text style={s.rowSub}> · {f.kcal} kcal · {f.p}g prot</Text>
                  </Text>
                  <Pressable onPress={() => a.addFood(f)} style={s.addBtn} hitSlop={6}>
                    <Text style={{ fontFamily: F.display, fontSize: 20, color: C.brown, marginTop: -2 }}>+</Text>
                  </Pressable>
                </Row>
              );
            })}
          </Card>
        )}

        <Card>
          <CardH>{viewDate === hoy ? 'Hoy comiste' : 'Comiste el ' + fmtFecha(viewDate)}</CardH>
          {log.length === 0 && <Muted sm>Aún nada. Toca el botón rosa para registrar.</Muted>}
          {log.map((f) => (
            <Row key={f.uid}>
              <Text style={s.rowTxt}>
                {f.n}
                <Text style={s.rowSub}> · {f.qty > 1 ? f.qty + '× ' : ''}{Math.round(f.kcal * f.qty)} kcal</Text>
              </Text>
              <Pressable onPress={() => a.removeFood(f.uid)} hitSlop={10} style={s.xBtn}>
                <Text style={{ fontFamily: F.display, fontSize: 14, color: C.gray }}>✕</Text>
              </Pressable>
            </Row>
          ))}
        </Card>

        <Btn kind="ghost" label="⚖️ Actualizar mi peso" onPress={() => a.setScreen('stats')} style={{ marginBottom: 10 }} />

        <Card colors={['#FFF0E8', '#FDE7EC']}>
          <CardH>📅 Plan semanal</CardH>
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
            {DIAS.map((d, di) => {
              const eaten = MEAL_SPLIT.filter(([k]) => weekEaten[d + '_' + k]).length;
              return (
                <View key={d} style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: F.displaySemi, fontSize: 12, color: '#4a4f6a' }}>{DIAS_LABEL[di]}</Text>
                  <View style={{ flexDirection: 'row', gap: 1.5, marginTop: 3 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: i < eaten ? '#34BC97' : '#eef0f6' }} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
          <Btn label="Abrir planeación semanal" onPress={() => a.setScreen('semana')} />
        </Card>

        <Card colors={['#EEF0FF', '#F6EDFF']}>
          <CardH>🌙 Antes de dormir</CardH>
          <Muted sm>Un momento contigo y con {petName}. Cuéntale cómo te fue hoy.</Muted>
          <Btn label="¿Cómo te fue hoy?" onPress={() => a.setOverlay('reflexion')} style={{ marginTop: 10 }} />
        </Card>
      </ScrollView>

      <Pressable onPress={() => a.setScreen('log')} style={({ pressed }) => [s.fab, { bottom: 84 + insets.bottom, transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
        <LinearGradient colors={[C.pinkLight, C.pink]} style={s.fabIn}>
          <Text style={{ fontFamily: F.display, fontSize: 22, color: C.brown, marginTop: -2 }}>+</Text>
          <Text style={{ fontFamily: F.displaySemi, fontSize: 14, color: C.brown }}>Registrar</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffffd9', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7, ...sombra },
  pillTxt: { fontFamily: F.displaySemi, fontSize: 14, color: C.ink },
  xpTrack: { width: 54, height: 7, borderRadius: 4, backgroundColor: '#0000000f', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4, backgroundColor: C.pink },
  day: { flex: 1, alignItems: 'center', gap: 1, paddingVertical: 8, borderRadius: 14, backgroundColor: '#fff' },
  stage: { alignItems: 'center', justifyContent: 'flex-end', minHeight: 330, marginTop: 4 },
  bubble: { fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9, marginBottom: 6, overflow: 'hidden', textAlign: 'center', maxWidth: '92%' },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF4E0', borderWidth: 1, borderColor: '#F2D9A8', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
  rings: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 22, paddingTop: 12, paddingBottom: 12, marginBottom: 12, ...sombra },
  ringItem: { alignItems: 'center', gap: 5 },
  ringLbl: { fontFamily: F.displaySemi, fontSize: 12.5, color: C.muted },
  quick: { flexDirection: 'row', gap: 9, marginBottom: 9 },
  rowTxt: { flex: 1, fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink },
  rowSub: { fontFamily: F.body, color: C.muted, fontSize: 13 },
  addBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.pinkLight, alignItems: 'center', justifyContent: 'center' },
  xBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 84, borderRadius: 22, ...sombraFab },
  fabIn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 22 },
});

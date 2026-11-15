import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../store';
import { MENU_DB, MEAL_SPLIT, FRUTAS, ALERGENOS } from '../data';
import { DIAS, DIAS_LABEL, DIAS_FULL, dayKcal, dayFactor, scaleMeal, diaDeHoy } from '../plan';
import { C, F } from '../theme';
import { Screen, Btn, Card, Muted } from '../ui';

const ICONOS = { desayuno: '☀️', comida: '🍽️', cena: '🌙', snack: '🍎' };

const Chip = ({ on, label, onPress, small }) => (
  <Pressable onPress={onPress} hitSlop={6} style={{ backgroundColor: on ? '#EAF7F2' : C.soft, borderRadius: 10, paddingVertical: small ? 4 : 5, paddingHorizontal: small ? 9 : 10 }}>
    <Text style={{ fontFamily: F.displaySemi, fontSize: small ? 11.5 : 12.5, color: on ? '#34BC97' : C.gray }}>{label}</Text>
  </Pressable>
);


// Planeación semanal: un menú por día, ajustado a tu meta de calorías.
export default function SemanaScreen() {
  const a = useApp();
  const { weekPlan, weekEaten, prefs, targets } = a;
  const [selDay, setSelDay] = useState(diaDeHoy());
  const plan = weekPlan[selDay];
  const dayF = dayFactor(targets, plan);
  const dayTot = Math.round(dayKcal(plan) * dayF);
  const agregarTodo = () => {
    MEAL_SPLIT.forEach(([k]) => {
      if (!weekEaten[selDay + '_' + k]) a.toggleEaten(selDay, k, scaleMeal(MENU_DB[k][plan[k]], dayF));
    });
    if (plan.fruta != null && !weekEaten[selDay + '_desayuno_x2']) a.toggleEaten(selDay, 'desayuno_x2', scaleMeal(FRUTAS[plan.fruta], dayF));
    if (plan.snack2 != null && !weekEaten[selDay + '_snack_x2']) a.toggleEaten(selDay, 'snack_x2', scaleMeal(MENU_DB.snack[plan.snack2], dayF));
    a.showToast('Agregado a tus alimentos de hoy ✅');
    a.setScreen('home');
  };

  return (
    <Screen title="Planeación semanal" back={() => a.setScreen('home')} contentStyle={{ paddingBottom: 100 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Btn kind="feature" label="🍽️ Porciones" onPress={() => a.setOverlay('porciones')} style={{ flex: 1 }} />
        <Btn kind="feature" label="⚙️ Preferencias" onPress={() => a.setOverlay('prefs')} style={{ flex: 1 }} />
      </View>
      {(prefs.veg || prefs.lowcarb || prefs.evitar.length > 0) && (
        <Muted sm style={{ marginBottom: 10, backgroundColor: '#EAF7F2', padding: 9, borderRadius: 12, overflow: 'hidden' }}>
          Plan ajustado: {[prefs.veg ? 'vegetariano' : '', prefs.lowcarb ? 'bajo en carbos' : ''].filter(Boolean).join(' · ')}
          {(prefs.veg || prefs.lowcarb) && prefs.evitar.length ? ' · ' : ''}
          {prefs.evitar.length ? 'sin ' + prefs.evitar.map((e) => (ALERGENOS.find(([k]) => k === e) || [e, e])[1].toLowerCase()).join(', ') : ''}
        </Muted>
      )}

      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 12 }}>
        {DIAS.map((d, i) => {
          const eaten = MEAL_SPLIT.filter(([k]) => weekEaten[d + '_' + k]).length;
          const on = selDay === d;
          return (
            <Pressable key={d} onPress={() => setSelDay(d)} style={[s.day, on && { borderColor: C.pink, backgroundColor: C.pinkSoft }]}>
              <Text style={{ fontFamily: F.display, fontSize: 15, color: on ? C.pink : '#4a4f6a' }}>{DIAS_LABEL[i]}</Text>
              <Text style={{ fontFamily: F.body, fontSize: 10.5, color: C.gray }}>{eaten}/4</Text>
            </Pressable>
          );
        })}
      </View>

      <Card colors={['#FCEFF1', '#EEF7F4']} style={{ alignItems: 'center' }}>
        <Muted>{DIAS_FULL[DIAS.indexOf(selDay)]} · total del día</Muted>
        <Text style={{ fontFamily: F.display, fontSize: 40, color: C.ink }}>
          {dayTot}
          <Text style={{ fontSize: 17 }}> kcal</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {MEAL_SPLIT.map(([k]) => (
            <Text key={k} style={{ fontFamily: F.displaySemi, fontSize: 14, color: '#7C5CFF' }}>P{Math.round(MENU_DB[k][plan[k]].p * dayF)}g</Text>
          ))}
        </View>
        <Muted sm style={{ marginTop: 6, textAlign: 'center' }}>💡 Las calorías varían por día porque cada platillo tiene diferente aporte. Todos los menús están diseñados dentro de tu rango objetivo personalizado.</Muted>
      </Card>

      {MEAL_SPLIT.map(([k, label]) => {
        const dish = MENU_DB[k][plan[k]];
        const sd = scaleMeal(dish, dayF);
        const done = !!weekEaten[selDay + '_' + k];
        const doneExtra = !!weekEaten[selDay + '_' + k + '_x2'];
        const porcion = dayF >= 1.15 ? ' · porción x' + dayF.toFixed(1) : dayF <= 0.9 ? ' · porción reducida' : '';
        const fruta = k === 'desayuno' && plan.fruta != null ? scaleMeal(FRUTAS[plan.fruta], dayF) : null;
        const snackEx = k === 'snack' && plan.snack2 != null ? scaleMeal(MENU_DB.snack[plan.snack2], dayF) : null;
        return (
          <Card key={k} style={{ opacity: done ? 0.65 : 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontFamily: F.display, fontSize: 15, color: C.gray }}>{ICONOS[k]} {label}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label="Cambiar" onPress={() => a.swapMeal(selDay, k)} />
                <Chip on={done} label={done ? '✓ Comido' : 'Palomear'} onPress={() => a.toggleEaten(selDay, k, sd)} />
              </View>
            </View>
            <Text style={{ fontFamily: F.bodyBold, fontSize: 15, color: C.ink, textDecorationLine: done ? 'line-through' : 'none' }}>{dish.n}</Text>
            <Muted sm style={{ marginTop: 2 }}>
              {dish.d}
              {!!porcion && <Text style={{ color: C.pink, fontFamily: F.bodyBold }}>{porcion}</Text>}
            </Muted>
            <Text style={s.macros}>{sd.kcal} kcal · Prot {sd.p}g · Carbos {sd.c}g · Grasa {sd.g}g</Text>
            {fruta && (
              <View style={s.extra}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.extraT}>➕ Acompaña con una fruta</Text>
                  <Chip small on={doneExtra} label={doneExtra ? '✓' : 'Palomear'} onPress={() => a.toggleEaten(selDay, k + '_x2', fruta)} />
                </View>
                <Text style={{ fontFamily: F.bodyBold, fontSize: 14, color: C.ink, textDecorationLine: doneExtra ? 'line-through' : 'none' }}>
                  {FRUTAS[plan.fruta].n} <Text style={{ fontFamily: F.body, color: C.gray, fontSize: 12 }}>· {FRUTAS[plan.fruta].d}</Text>
                </Text>
                <Text style={s.macros}>{fruta.kcal} kcal · Carbos {fruta.c}g</Text>
              </View>
            )}
            {snackEx && (
              <View style={s.extra}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.extraT}>➕ Segundo snack del día</Text>
                  <Chip small on={doneExtra} label={doneExtra ? '✓' : 'Palomear'} onPress={() => a.toggleEaten(selDay, k + '_x2', snackEx)} />
                </View>
                <Text style={{ fontFamily: F.bodyBold, fontSize: 14, color: C.ink, textDecorationLine: doneExtra ? 'line-through' : 'none' }}>{MENU_DB.snack[plan.snack2].n}</Text>
                <Muted sm>{MENU_DB.snack[plan.snack2].d}</Muted>
                <Text style={s.macros}>{snackEx.kcal} kcal · Prot {snackEx.p}g · Carbos {snackEx.c}g · Grasa {snackEx.g}g</Text>
              </View>
            )}
          </Card>
        );
      })}

      <Btn big label="✅ Agrégalo a tus alimentos ingeridos hoy" onPress={agregarTodo} style={{ marginTop: 2 }} />
      <Btn big kind="feature" label={'🔄 Regenerar ' + DIAS_FULL[DIAS.indexOf(selDay)]} onPress={() => a.regenDay(selDay)} style={{ marginTop: 8 }} />

      <View style={{ marginTop: 12, backgroundColor: '#f6f7fb', borderRadius: 16, padding: 12 }}>
        <Text style={{ fontFamily: F.displaySemi, fontSize: 14, color: C.ink, marginBottom: 6 }}>Resumen semanal</Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {DIAS.map((d, i) => {
            const f = dayFactor(targets, weekPlan[d]);
            const tot = Math.round(dayKcal(weekPlan[d]) * f);
            const eaten = MEAL_SPLIT.filter(([k]) => weekEaten[d + '_' + k]).length;
            return (
              <View key={d} style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 6 }}>
                <Text style={{ fontFamily: F.display, fontSize: 13, color: C.ink }}>{DIAS_LABEL[i]}</Text>
                <Text style={{ fontFamily: F.body, fontSize: 10.5, color: C.gray }}>{tot}</Text>
                <View style={{ flexDirection: 'row', gap: 1.5, marginTop: 3 }}>
                  {[0, 1, 2, 3].map((j) => (
                    <View key={j} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: j < eaten ? '#34BC97' : '#eef0f6' }} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  day: { flex: 1, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 14, borderWidth: 2, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center' },
  macros: { fontFamily: F.displaySemi, fontSize: 13, color: C.muted, marginTop: 3 },
  extra: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0d9b8' },
  extraT: { fontFamily: F.displaySemi, fontSize: 13, color: '#C58A2E' },
});

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useApp } from '../store';
import { sb } from '../supabase';
import { C, F } from '../theme';
import { Screen, ListRow, Muted, s as ui } from '../ui';

const JUEGOS = [
  ['game_catch', '🍬', 'Atrapa la comida sana', 'catch', 'Mueve a Axo y atrapa lo sano'],
  ['game_memo', '🧠', 'Memorama de comida', 'memo', 'Encuentra los pares'],
  ['game_quiz', '🥗', '¿Saludable o antojo?', 'quiz', 'Toca lo sano, desliza el antojo'],
  ['game_cal', '🔥', '¿Más calorías?', 'cal', 'Adivina cuál tiene más'],
  ['game_simon', '🎵', 'Axo Dice', 'simon', 'Repite la secuencia'],
];

export function ArcadeScreen() {
  const a = useApp();
  return (
    <Screen title="🎮 Juegos" back={() => a.setScreen('home')} contentStyle={{ paddingBottom: 100 }}>
      {JUEGOS.map(([k, e, t, bk, d]) => {
        const rec = a.best[bk] || 0;
        return (
          <ListRow key={k} onPress={() => a.setScreen(k)}>
            <Text style={{ fontSize: 28 }}>{e}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.displaySemi, fontSize: 16, color: C.ink }}>{t}</Text>
              <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.gray }}>{rec > 0 ? '🏆 Tu récord: ' + rec : d}</Text>
            </View>
            <Text style={{ fontFamily: F.display, fontSize: 18, color: '#c7cad6' }}>›</Text>
          </ListRow>
        );
      })}
      <ListRow onPress={() => a.setScreen('leaderboard')} style={{ backgroundColor: '#FFF6DC' }}>
        <Text style={{ fontSize: 28 }}>🏅</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.displaySemi, fontSize: 16, color: C.ink }}>Tabla de récords</Text>
          <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.gray }}>Compara tu puntaje con otros ajolotes</Text>
        </View>
        <Text style={{ fontFamily: F.display, fontSize: 18, color: '#c7cad6' }}>›</Text>
      </ListRow>
      <Muted sm style={{ textAlign: 'center', marginTop: 8 }}>Jugar le da XP a {a.petName}.</Muted>
    </Screen>
  );
}

const LB = [['catch', '🍬', 'Atrapa'], ['memo', '🧠', 'Memorama'], ['quiz', '🥗', 'Antojo'], ['cal', '🔥', 'Calorías'], ['simon', '🎵', 'Axo Dice']];

export function LeaderboardScreen() {
  const a = useApp();
  const [game, setGame] = useState('catch');
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let vivo = true;
    setRows(null);
    sb.from('leaderboard')
      .select('*')
      .eq('game_key', game)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (vivo) setRows(error ? [] : data || []);
      });
    return () => {
      vivo = false;
    };
  }, [game]);
  return (
    <Screen title="🏅 Tabla de récords" back={() => a.setScreen('arcade')} contentStyle={{ paddingBottom: 100 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 10 }}>
        {LB.map(([k, e, t]) => (
          <Pressable key={k} onPress={() => setGame(k)} style={{ borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: game === k ? C.purple : '#fff' }}>
            <Text style={{ fontFamily: F.display, fontSize: 13, color: game === k ? '#fff' : C.muted }}>{e} {t}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {rows === null && <Muted sm style={{ textAlign: 'center', marginTop: 20 }}>Cargando…</Muted>}
      {rows && rows.length === 0 && <Muted sm style={{ textAlign: 'center', marginTop: 20 }}>Nadie tiene récord en este juego todavía. ¡Sé el primero!</Muted>}
      {rows &&
        rows.map((r, i) => (
          <View key={r.user_id} style={[ui.listRow, r.user_id === a.userId && { backgroundColor: '#EAF3FF' }]}>
            <Text style={{ fontFamily: F.display, fontSize: 18, width: 30, textAlign: 'center', color: C.ink }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</Text>
            <Text style={{ flex: 1, fontFamily: F.display, fontSize: 15, color: C.ink }}>
              {r.nombre_axo || 'Alguien'}
              {r.user_id === a.userId ? ' (tú)' : ''}
            </Text>
            <Text style={{ fontFamily: F.display, fontSize: 16, color: C.purple }}>{r.score}</Text>
          </View>
        ))}
    </Screen>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../store';
import { GAME_ITEMS, KCAL_PAIRS } from '../data';
import { C, F } from '../theme';
import { Screen, Btn, Display, Muted } from '../ui';
import Axo, { AxoMini } from '../components/Axo';

// Los 5 minijuegos, con las mismas reglas y puntajes que en la PWA.

const T = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.display, color: C.ink }, style]} />;

/* ============ 🥗 ¿Saludable o antojo? ============ */
export function QuizScreen() {
  const a = useApp();
  const best = a.best.quiz || 0;
  const durQ = (lv) => (lv <= 3 ? 30 : lv <= 7 ? 40 : 45);
  const targetQ = (lv) => lv * 60 + 40;
  const lifetimeFor = (lv) => Math.max(700, 1600 - (lv - 1) * 120);
  const gapFor = (lv) => Math.max(80, 250 - (lv - 1) * 20);
  const maxConcurrent = (lv) => (lv >= 8 ? 3 : lv >= 4 ? 2 : 1);
  const [level, setLevel] = useState(1);
  const [gameTimer, setGameTimer] = useState(durQ(1));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState([]);
  const [, setTick] = useState(0);
  const [flash, setFlash] = useState(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const levelRef = useRef(1);
  const timerRef = useRef(durQ(1));
  const itemsRef = useRef([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const startRef = useRef({});
  const overRef = useRef(false);
  const touts = useRef([]);
  const luego = (fn, ms) => touts.current.push(setTimeout(fn, ms));

  const setT = (v) => {
    timerRef.current = v;
    setGameTimer(v);
  };
  const endRound = () => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    itemsRef.current.forEach((x) => clearTimeout(x.timeoutId));
    itemsRef.current = [];
    setItems([]);
    a.recordBest('quiz', scoreRef.current);
  };
  const restar = (seg) => {
    const nt = Math.max(0, timerRef.current - seg);
    setT(nt);
    if (nt <= 0) endRound();
  };
  const checkLevelUp = () => {
    if (scoreRef.current >= targetQ(levelRef.current)) {
      levelRef.current += 1;
      setLevel(levelRef.current);
      setT(durQ(levelRef.current));
      setLevelUp(true);
      luego(() => setLevelUp(false), 1400);
    }
  };
  const removeItem = (id) => {
    itemsRef.current = itemsRef.current.filter((x) => x.id !== id);
    setItems(itemsRef.current);
  };
  const mostrar = (f) => {
    setFlash(f);
    luego(() => setFlash(null), 500);
  };
  const handleExpire = (id) => {
    const it = itemsRef.current.find((x) => x.id === id);
    if (!it || overRef.current) return;
    removeItem(id);
    if (it.sano) {
      comboRef.current = 0;
      setCombo(0);
      mostrar({ type: 'missed', text: '-2s' });
      restar(2);
    } else {
      scoreRef.current += 2;
      setScore(scoreRef.current);
      mostrar({ type: 'dodge', text: '+2' });
      checkLevelUp();
    }
  };
  const spawnOne = () => {
    if (overRef.current) return;
    const pick = GAME_ITEMS[Math.floor(Math.random() * GAME_ITEMS.length)];
    const id = ++idRef.current;
    const lifetime = lifetimeFor(levelRef.current);
    const timeoutId = setTimeout(() => handleExpire(id), lifetime);
    itemsRef.current = [...itemsRef.current, { id, ...pick, bornAt: Date.now(), lifetime, timeoutId }];
    setItems(itemsRef.current);
    lastSpawnRef.current = Date.now();
  };
  const resolveItem = (id, action) => {
    const it = itemsRef.current.find((x) => x.id === id);
    if (!it || overRef.current) return;
    clearTimeout(it.timeoutId);
    removeItem(id);
    const correcto = (action === 'tap' && it.sano) || (action === 'swipe' && !it.sano);
    if (correcto) {
      comboRef.current += 1;
      setCombo(comboRef.current);
      const mult = comboRef.current >= 8 ? 3 : comboRef.current >= 4 ? 2 : 1;
      const pts = 10 * mult;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      mostrar({ type: 'ok', text: '+' + pts });
      checkLevelUp();
    } else {
      comboRef.current = 0;
      setCombo(0);
      mostrar({ type: 'bad', text: '-3s' });
      restar(3);
    }
  };
  useEffect(() => {
    const tmr = setInterval(() => {
      if (overRef.current) return;
      if (timerRef.current <= 1) {
        setT(0);
        endRound();
      } else setT(timerRef.current - 1);
    }, 1000);
    const spawner = setInterval(() => {
      if (overRef.current) return;
      if (itemsRef.current.length < maxConcurrent(levelRef.current) && Date.now() - lastSpawnRef.current >= gapFor(levelRef.current)) spawnOne();
    }, 120);
    const prog = setInterval(() => {
      if (!overRef.current) setTick((t) => t + 1);
    }, 80);
    return () => {
      clearInterval(tmr);
      clearInterval(spawner);
      clearInterval(prog);
      itemsRef.current.forEach((x) => clearTimeout(x.timeoutId));
      touts.current.forEach(clearTimeout);
    };
  }, []);

  const xpGanada = Math.round(score / 2);
  return (
    <Screen title="🥗 ¿Saludable o antojo?" back={() => a.setScreen('arcade')} colors={['#FFF4EC', '#E7F7F4']} scroll={false}>
      {over ? (
        <View style={g.fin}>
          <Axo {...a.axoProps} evo={a.computedEvo} mood="amor" size={150} />
          <Display style={{ fontSize: 26, marginTop: 8 }}>¡{score} puntos!</Display>
          {score >= best && score > 0 && <T style={{ color: C.gold, fontSize: 15 }}>🏆 ¡Nuevo récord!</T>}
          {score < best && best - score <= 20 && <Muted sm style={{ color: C.pink, fontFamily: F.bodyBold }}>😬 ¡Te faltaron {best - score} puntos para tu récord!</Muted>}
          <Muted style={{ marginBottom: 16 }}>Ganaste +{xpGanada} XP · 🏆 {Math.max(best, score)}</Muted>
          <Btn big label="Reclamar y volver" onPress={() => { a.addXp(xpGanada); a.showToast('+' + xpGanada + ' XP 🥗'); a.setScreen('arcade'); }} />
        </View>
      ) : (
        <View style={{ flex: 1, paddingTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <T style={{ fontSize: 15, color: flash && (flash.type === 'bad' || flash.type === 'missed') ? '#E15B5B' : '#334' }}>⏱ {gameTimer}s</T>
            {combo >= 2 && <T style={{ fontSize: 15, color: C.gold }}>🔥 x{combo}{combo >= 8 ? ' (x3)' : combo >= 4 ? ' (x2)' : ''}</T>}
            <T style={{ fontSize: 15, color: C.mint }}>{score} pts</T>
          </View>
          <View style={g.barra}>
            <View style={{ width: `${(gameTimer / durQ(level)) * 100}%`, height: '100%', backgroundColor: '#FF6F9C', borderRadius: 4 }} />
          </View>
          <View style={{ gap: 10, minHeight: 120, marginTop: 22 }}>
            {items.map((it) => {
              const p = Math.max(0, 1 - (Date.now() - it.bornAt) / it.lifetime);
              return (
                <View
                  key={it.id}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={(e) => (startRef.current[it.id] = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                  onResponderRelease={(e) => {
                    const st = startRef.current[it.id];
                    if (!st) return;
                    delete startRef.current[it.id];
                    const dist = Math.hypot(e.nativeEvent.pageX - st.x, e.nativeEvent.pageY - st.y);
                    resolveItem(it.id, dist > 28 ? 'swipe' : 'tap');
                  }}
                  style={g.carta}
                >
                  <Display style={{ fontSize: 22, marginBottom: 14, textAlign: 'center' }}>{it.n}</Display>
                  <View style={[g.barra, { height: 8, marginBottom: 0 }]}>
                    <View style={{ width: `${p * 100}%`, height: '100%', backgroundColor: p < 0.3 ? '#E15B5B' : '#5FD0AE', borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
            {levelUp && (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffffdd', borderRadius: 20 }]}>
                <Display style={{ fontSize: 26, color: C.purple }}>¡Nivel {level}! 🎉</Display>
              </View>
            )}
          </View>
          {flash && <T style={{ textAlign: 'center', fontSize: flash.type === 'bad' || flash.type === 'missed' ? 22 : 16, marginTop: 10, color: flash.type === 'ok' || flash.type === 'dodge' ? C.mint : '#E15B5B' }}>{flash.text}</T>}
          <Muted sm style={{ marginTop: 18, textAlign: 'center' }}>Nivel {level} · 👆 Toca si es sano · 👉 Desliza si es antojo</Muted>
        </View>
      )}
    </Screen>
  );
}

/* ============ 🧠 Memorama ============ */
const POOL = ['🥑', '🌮', '🥗', '🍳', '🐟', '🫘', '🍓', '🥦', '🍅', '🥕', '🌽', '🍇'];
const build = (n) => {
  const es = POOL.slice(0, n);
  return [...es, ...es].map((e, i) => ({ id: i, e })).sort(() => Math.random() - 0.5);
};
export function MemoScreen() {
  const a = useApp();
  const best = a.best.memo || 0;
  const [pairs, setPairs] = useState(6);
  const [cards, setCards] = useState(() => build(6));
  const [flip, setFlip] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [react, setReact] = useState(false);
  const [racha, setRacha] = useState(0);
  const touts = useRef([]);
  const luego = (fn, ms) => touts.current.push(setTimeout(fn, ms));
  useEffect(() => () => touts.current.forEach(clearTimeout), []);
  const won = cards.length > 0 && matched.length === cards.length;
  const nivel = (pairs - 6) / 2 + 1;
  const reward = Math.max(20, pairs * 8);
  const click = (i) => {
    if (lock || won || flip.includes(i) || matched.includes(i)) return;
    const nf = [...flip, i];
    if (nf.length === 1) return setFlip(nf);
    setFlip(nf);
    setMoves((m) => m + 1);
    setLock(true);
    if (cards[nf[0]].e === cards[nf[1]].e) {
      setReact(true);
      luego(() => setReact(false), 800);
      setRacha((r) => r + 1);
      luego(() => {
        setMatched((m) => [...m, nf[0], nf[1]]);
        setFlip([]);
        setLock(false);
      }, 420);
    } else {
      setRacha(0);
      luego(() => {
        setFlip([]);
        setLock(false);
      }, 820);
    }
  };
  const nextLevel = () => {
    const np = Math.min(POOL.length, pairs + 2);
    a.recordBest('memo', nivel + 1);
    a.addXp(reward);
    a.showToast('+' + reward + ' XP 🧠 ¡Nivel ' + (nivel + 1) + '!');
    setPairs(np);
    setCards(build(np));
    setFlip([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
  };
  return (
    <Screen title="🧠 Memorama de comida" back={() => a.setScreen('arcade')} colors={['#F0EBFF', '#E2D8FF']} contentStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', marginVertical: 2 }}>
        <Axo {...a.axoProps} evo={a.computedEvo} mood={react || won ? 'amor' : 'feliz'} size={96} />
      </View>
      {won ? (
        <View style={{ alignItems: 'center', paddingTop: 4 }}>
          <Display style={{ fontSize: 21, textAlign: 'center', marginHorizontal: 12 }}>¡{a.petName} está feliz! {pairs} pares en {moves} movimientos</Display>
          <Muted sm>🏆 Mejor nivel: {Math.max(best, nivel)}</Muted>
          <Muted style={{ marginBottom: 14 }}>Ganaste +{reward} XP</Muted>
          {pairs < POOL.length && <Btn big label="🎉 Siguiente nivel (+2 pares)" onPress={nextLevel} style={{ marginBottom: 8 }} />}
          <Btn kind="ghost" label="Reclamar y salir" onPress={() => { a.recordBest('memo', nivel); a.addXp(reward); a.showToast('+' + reward + ' XP 🧠'); a.setScreen('arcade'); }} />
        </View>
      ) : (
        <View>
          <T style={{ textAlign: 'center', fontFamily: F.displaySemi, fontSize: 15, color: C.muted, marginVertical: 3 }}>Nivel {nivel} · {moves} mov · {matched.length / 2}/{pairs} pares</T>
          {racha >= 2 && <T style={{ textAlign: 'center', fontSize: 13, color: C.gold, marginBottom: 8 }}>🔥 Racha x{racha}</T>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9 }}>
            {cards.map((cd, i) => {
              const show = flip.includes(i) || matched.includes(i);
              return (
                <Pressable key={cd.id} onPress={() => click(i)} style={[g.memo, { backgroundColor: show ? '#fff' : C.purple, opacity: matched.includes(i) ? 0.5 : 1 }]}>
                  {show ? <Text style={{ fontSize: 30 }}>{cd.e}</Text> : <AxoMini paletteKey={a.pet.palette} size={40} />}
                </Pressable>
              );
            })}
          </View>
          <Muted sm style={{ textAlign: 'center', marginTop: 14 }}>Encuentra los pares. Al ganar, ¡{a.petName} pide más pares!</Muted>
        </View>
      )}
    </Screen>
  );
}

/* ============ 🎵 Axo Dice ============ */
const S_FOODS = ['🥑', '🌮', '🐟', '🍓'];
const S_COLS = ['#34BC97', '#FF9036', '#3FA9F5', '#E0556E'];
export function SimonScreen() {
  const a = useApp();
  const best = a.best.simon || 0;
  const [seq, setSeq] = useState([]);
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState(-1);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const touts = useRef([]);
  useEffect(() => () => touts.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (seq.length === 0) return;
    setShowing(true);
    setStep(0);
    const timers = [];
    let i = 0;
    const playNext = () => {
      setActive(seq[i]);
      timers.push(
        setTimeout(() => {
          setActive(-1);
          i++;
          if (i < seq.length) timers.push(setTimeout(playNext, 340));
          else timers.push(setTimeout(() => setShowing(false), 340));
        }, 560)
      );
    };
    timers.push(setTimeout(playNext, 650));
    return () => timers.forEach(clearTimeout);
  }, [seq]);
  const begin = () => {
    setOver(false);
    setStarted(true);
    setStep(0);
    setSeq([Math.floor(Math.random() * 4)]);
  };
  const tap = (i) => {
    if (showing || over || !started) return;
    setActive(i);
    touts.current.push(setTimeout(() => setActive((x) => (x === i ? -1 : x)), 220));
    if (i === seq[step]) {
      if (step + 1 === seq.length) {
        setStep(0);
        touts.current.push(setTimeout(() => setSeq((arr) => [...arr, Math.floor(Math.random() * 4)]), 560));
      } else setStep(step + 1);
    } else {
      setOver(true);
      setStarted(false);
      a.recordBest('simon', seq.length - 1);
    }
  };
  const score = Math.max(0, seq.length - (over ? 1 : 0));
  return (
    <Screen title="🎵 Axo Dice" back={() => a.setScreen('arcade')} colors={['#EAF6FF', '#E2D8FF']} contentStyle={{ alignItems: 'center', paddingBottom: 100 }}>
      <Axo {...a.axoProps} evo={a.computedEvo} mood={over ? 'triste' : showing ? 'amor' : 'feliz'} size={120} />
      <Display style={{ fontSize: 18, color: C.purple, marginTop: 4 }}>{!started && !over ? '¿Listo?' : over ? '¡Ups!' : showing ? a.petName + ' te muestra…' : '¡Tu turno!'}</Display>
      <Muted sm style={{ marginBottom: 14 }}>{started && !over ? 'Ronda ' + seq.length : 'Repite la secuencia que hace ' + a.petName}</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12 }}>
        {S_FOODS.map((fd, i) => (
          <Pressable key={i} onPress={() => tap(i)} style={[g.simon, { backgroundColor: S_COLS[i], opacity: active === i ? 1 : showing ? 0.4 : 0.82, transform: [{ scale: active === i ? 1.08 : 1 }] }]}>
            <Text style={{ fontSize: 40 }}>{fd}</Text>
          </Pressable>
        ))}
      </View>
      {(!started || over) && (
        <Btn
          big
          label={over ? 'Jugar otra vez' : 'Empezar'}
          onPress={() => {
            if (over && score > 0) {
              a.addXp(score * 8);
              a.showToast('+' + score * 8 + ' XP 🎵');
            }
            begin();
          }}
          style={{ marginTop: 20, alignSelf: 'stretch' }}
        />
      )}
      {over && score < best && best - score <= 1 && <Muted sm style={{ marginTop: 8, color: C.pink, fontFamily: F.bodyBold }}>😬 ¡Te faltó 1 ronda para tu récord!</Muted>}
      {over && <Muted style={{ marginTop: 10 }}>Llegaste a la ronda {score}.{score > 0 ? ' +' + score * 8 + ' XP' : ''} · 🏆 {Math.max(best, score)}</Muted>}
      {!started && !over && best > 0 && <Muted sm style={{ marginTop: 8 }}>🏆 Tu récord: ronda {best}</Muted>}
    </Screen>
  );
}

/* ============ 🔥 ¿Cuál tiene más calorías? ============ */
export function CalScreen() {
  const a = useApp();
  const best = a.best.cal || 0;
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [racha, setRacha] = useState(0);
  const tout = useRef(null);
  useEffect(() => () => clearTimeout(tout.current), []);
  const pair = KCAL_PAIRS[i];
  const correctIs = pair.ak > pair.bk ? 'a' : 'b';
  const answer = (pick) => {
    if (sel) return;
    setSel(pick);
    const acerto = pick === correctIs;
    const fin = acerto ? score + 1 : score;
    if (acerto) setScore(fin);
    setRacha(acerto ? racha + 1 : 0);
    tout.current = setTimeout(() => {
      setSel(null);
      if (i + 1 >= KCAL_PAIRS.length) {
        setDone(true);
        a.recordBest('cal', fin);
      } else setI((x) => x + 1);
    }, 1000);
  };
  return (
    <Screen title="🔥 ¿Cuál tiene más calorías?" back={() => a.setScreen('arcade')} colors={['#FFF6E6', '#FFE9C8']} contentStyle={{ paddingBottom: 100 }}>
      {done ? (
        <View style={{ alignItems: 'center', paddingTop: 20 }}>
          <Axo {...a.axoProps} evo={a.computedEvo} mood="amor" size={150} />
          <Display style={{ fontSize: 26, marginTop: 8 }}>¡{score}/{KCAL_PAIRS.length} correctas!</Display>
          {score >= best && score > 0 && <T style={{ color: C.gold, fontSize: 15 }}>🏆 ¡Nuevo récord!</T>}
          {score < best && best - score <= 2 && <Muted sm style={{ color: C.pink, fontFamily: F.bodyBold }}>😬 ¡Te faltó{best - score === 1 ? '' : 'n'} {best - score} para tu récord!</Muted>}
          <Muted style={{ marginBottom: 16 }}>Ganaste +{score * 12} XP · 🏆 {Math.max(best, score)}</Muted>
          <Btn big label="Reclamar y volver" onPress={() => { a.addXp(score * 12); a.showToast('+' + score * 12 + ' XP 🔥'); a.setScreen('arcade'); }} />
        </View>
      ) : (
        <View style={{ paddingTop: 8 }}>
          <T style={{ textAlign: 'center', fontFamily: F.displaySemi, color: C.gray, marginBottom: 8 }}>{i + 1} de {KCAL_PAIRS.length} · ¿cuál tiene MÁS calorías?</T>
          <T style={{ textAlign: 'center', color: C.mint, marginBottom: racha >= 2 ? 4 : 18 }}>Aciertos: {score}</T>
          {racha >= 2 && <T style={{ textAlign: 'center', fontSize: 13, color: C.gold, marginBottom: 14 }}>🔥 Racha x{racha}</T>}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[['a', pair.a, pair.ak], ['b', pair.b, pair.bk]].map(([k, name, kcal]) => {
              const ok = sel && k === correctIs;
              const mal = sel && k === sel && k !== correctIs;
              return (
                <Pressable key={k} onPress={() => answer(k)} style={[g.cal, { borderColor: ok ? '#34BC97' : mal ? '#E0556E' : C.line, backgroundColor: ok ? '#EAF7F2' : mal ? '#FDECEA' : '#fff' }]}>
                  <T style={{ fontSize: 17, marginBottom: 6, textAlign: 'center' }}>{name}</T>
                  {sel ? <T style={{ fontSize: 20, color: ok ? '#34BC97' : mal ? '#E0556E' : C.gray }}>{kcal} kcal</T> : <Muted sm>Toca para elegir</Muted>}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}

/* ============ 🍬 Atrapa lo sano ============ */
const HEALTHY = ['🥗', '🥑', '🍓', '🐟', '🥦'];
const JUNK = ['🍩', '🍟', '🥤', '🍰'];
const ESPECIALES = ['bomb', 'magnet', 'shield', 'freeze', 'hourglass'];
export function CatchScreen() {
  const a = useApp();
  const best = a.best.catch || 0;
  const [H, setH] = useState(340);
  const HRef = useRef(340);
  const WRef = useRef(320);
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);
  const [bx, setBx] = useState(0.5);
  const bxRef = useRef(0.5);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);
  const [time, setTime] = useState(30);
  const timeRef = useRef(30);
  const [over, setOver] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [fx, setFx] = useState([]);
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [magnetActive, setMagnetActive] = useState(false);
  const magnetActiveRef = useRef(false);
  const magnetUntilRef = useRef(0);
  const [hasShield, setHasShield] = useState(false);
  const hasShieldRef = useRef(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const freezeActiveRef = useRef(false);
  const freezeUntilRef = useRef(0);
  const [feverActive, setFeverActive] = useState(false);
  const comboBrokenRef = useRef(false);
  const suddenDeathUsedRef = useRef(false);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const nutrientesRef = useRef(0);
  const bestComboRef = useRef(0);
  const [runKey, setRunKey] = useState(0);
  const touts = useRef([]);
  const luego = (fn, ms) => touts.current.push(setTimeout(fn, ms));
  const target = (lv) => lv * 6 + 4;
  const dur = (lv) => (lv <= 3 ? 30 : lv <= 7 ? 40 : Math.min(60, 45 + (lv - 8) * 2));
  const setT = (v) => {
    timeRef.current = v;
    setTime(v);
  };

  useEffect(() => {
    let id = 0;
    let tick = 0;
    let lastX = 0.5;
    let fin = false;
    const endGame = () => {
      if (fin) return;
      fin = true;
      clearInterval(iv);
      clearInterval(tmr);
      setOver(true);
      setFeverActive(false);
      a.recordBest('catch', scoreRef.current);
    };
    const iv = setInterval(() => {
      tick++;
      const lv = levelRef.current;
      const speed = 3.2 + lv * 0.7;
      const spawnEvery = Math.max(7, 15 - lv);
      const magOn = magnetActiveRef.current;
      const freezeOn = freezeActiveRef.current;
      const next = itemsRef.current.map((it) => {
        if (it.kind === 'sano' && magOn) {
          const nx = Math.max(0.06, Math.min(0.94, it.x + (bxRef.current - it.x) * 0.18));
          return { ...it, y: it.y + it.sp * 2, x: nx };
        }
        return { ...it, y: it.y + it.sp * (freezeOn ? 0.4 : 1) };
      });
      if (tick % spawnEvery === 0) {
        let nx = 0.12 + Math.random() * 0.76;
        if (Math.abs(nx - lastX) < 0.3) {
          nx = nx < lastX ? nx - 0.32 : nx + 0.32;
          nx = Math.max(0.12, Math.min(0.88, nx));
        }
        lastX = nx;
        const sano = Math.random() < 0.64 - lv * 0.015;
        next.push({ id: ++id, x: nx, y: 0, kind: sano ? 'sano' : 'junk', sano, sp: speed + Math.random() * 1.6, e: sano ? HEALTHY[Math.floor(Math.random() * HEALTHY.length)] : JUNK[Math.floor(Math.random() * JUNK.length)] });
      }
      if (tick % 110 === 0) {
        const nx2 = 0.15 + Math.random() * 0.7;
        const r = Math.random();
        const kind = lv >= 4 ? (r < 0.18 ? 'bomb' : r < 0.4 ? 'magnet' : r < 0.62 ? 'shield' : r < 0.84 ? 'freeze' : 'hourglass') : r < 0.3 ? 'bomb' : r < 0.53 ? 'magnet' : r < 0.76 ? 'shield' : 'freeze';
        const emoji = { bomb: '💣', magnet: '🧲', shield: '🫧', freeze: '🧊', hourglass: '⏳' }[kind];
        next.push({ id: ++id, x: nx2, y: 0, kind, sp: speed * 0.85, e: emoji });
      }
      const catchY = HRef.current - 72;
      let delta = 0;
      const keep = [];
      const caughtNow = [];
      const missed = [];
      let comboRoto = false;
      let bombHit = false;
      let magnetCaught = false;
      let shieldCaught = false;
      let shieldBroke = false;
      let freezeCaught = false;
      let hourglassCaught = false;
      let junkHitReal = false;
      next.forEach((it) => {
        if (it.y >= catchY && it.y <= catchY + 42 && Math.abs(it.x - bxRef.current) < 0.13) caughtNow.push(it);
        else if (it.y < HRef.current + 24) keep.push(it);
        else missed.push(it);
      });
      const fxPts = [];
      const romperEscudo = (it) => {
        hasShieldRef.current = false;
        setHasShield(false);
        shieldBroke = true;
        fxPts.push({ fxId: 'fx' + it.id, x: it.x, sano: true, txt: '🫧💥', col: '#5BB8E0' });
      };
      caughtNow.forEach((it) => {
        if (it.kind === 'bomb') {
          if (hasShieldRef.current) romperEscudo(it);
          else {
            bombHit = true;
            if (comboRef.current >= 3) comboRoto = true;
            comboRef.current = 0;
            comboBrokenRef.current = true;
            delta -= 5;
            fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '-5 / -4s', col: '#E0556E' });
          }
        } else if (it.kind === 'magnet') {
          magnetCaught = true;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '🧲', col: '#5BB8E0' });
        } else if (it.kind === 'shield') {
          shieldCaught = true;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '🫧', col: '#5BB8E0' });
        } else if (it.kind === 'freeze') {
          freezeCaught = true;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '🧊', col: '#5BB8E0' });
        } else if (it.kind === 'hourglass') {
          hourglassCaught = true;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '+5s', col: '#9C6ADE' });
        } else if (it.sano) {
          comboRef.current += 1;
          nutrientesRef.current += 1;
          if (comboRef.current > bestComboRef.current) bestComboRef.current = comboRef.current;
          const pts = comboRef.current >= 8 ? 3 : comboRef.current >= 4 ? 2 : 1;
          delta += pts;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '+' + pts, col: '#34BC97' });
        } else if (hasShieldRef.current) romperEscudo(it);
        else {
          if (comboRef.current >= 3) comboRoto = true;
          comboRef.current = 0;
          comboBrokenRef.current = true;
          junkHitReal = true;
          delta -= 1;
          fxPts.push({ fxId: 'fx' + it.id, x: it.x, txt: '-1', col: '#E15B5B' });
        }
      });
      let finalKeep = keep;
      const pintar = () => {
        itemsRef.current = finalKeep;
        setItems(finalKeep);
      };
      if (bombHit && levelRef.current >= 4) {
        a.showToast('💥 ¡Bomba de azúcar! Fin del juego');
        pintar();
        endGame();
        return;
      }
      if (bombHit) {
        finalKeep = keep.filter((it) => it.kind !== 'sano');
        setT(Math.max(1, timeRef.current - 4));
      }
      if (magnetCaught) {
        magnetActiveRef.current = true;
        magnetUntilRef.current = Date.now() + 5000;
        setMagnetActive(true);
      }
      if (shieldCaught) {
        hasShieldRef.current = true;
        setHasShield(true);
      }
      if (freezeCaught) {
        freezeActiveRef.current = true;
        freezeUntilRef.current = Date.now() + 6000;
        setFreezeActive(true);
      }
      if (hourglassCaught) setT(timeRef.current + 5);
      if (levelRef.current >= 4) {
        const missedSano = missed.filter((it) => it.kind === 'sano').length;
        const lifeLoss = missedSano + (junkHitReal ? 1 : 0);
        if (lifeLoss > 0) {
          livesRef.current = Math.max(0, livesRef.current - lifeLoss);
          setLives(livesRef.current);
          if (missedSano > 0) a.showToast('💔 ¡Se te cayó un alimento sano!');
          else if (junkHitReal) a.showToast('💔 ¡Eso no era sano!');
          if (livesRef.current <= 0) {
            pintar();
            endGame();
            return;
          }
        }
      }
      if (caughtNow.length > 0) setCombo(comboRef.current);
      if (delta !== 0) {
        scoreRef.current = Math.max(0, scoreRef.current + delta);
        setScore(scoreRef.current);
      }
      if (caughtNow.length > 0) {
        setFx((f) => [...f, ...fxPts]);
        luego(() => setFx((f) => f.filter((x) => !fxPts.some((n) => n.fxId === x.fxId))), 480);
        if (comboRoto) a.showToast('💥 Combo roto');
        if (bombHit) a.showToast('💥 ¡Bomba de azúcar! -4s');
        if (magnetCaught) a.showToast('🧲 ¡Imán activado!');
        if (shieldCaught) a.showToast('🫧 ¡Escudo activado!');
        if (shieldBroke) a.showToast('🫧 El escudo absorbió el golpe');
        if (freezeCaught) a.showToast('🧊 ¡Todo más lento!');
        if (hourglassCaught) a.showToast('⏳ +5 segundos');
      }
      pintar();
    }, 55);
    const tmr = setInterval(() => {
      if (magnetActiveRef.current && Date.now() >= magnetUntilRef.current) {
        magnetActiveRef.current = false;
        setMagnetActive(false);
      }
      if (freezeActiveRef.current && Date.now() >= freezeUntilRef.current) {
        freezeActiveRef.current = false;
        setFreezeActive(false);
      }
      const t = timeRef.current;
      if (t <= 1) {
        if (scoreRef.current >= target(levelRef.current)) {
          levelRef.current += 1;
          setLevel(levelRef.current);
          setLevelUp(true);
          luego(() => setLevelUp(false), 1400);
          comboBrokenRef.current = false;
          suddenDeathUsedRef.current = false;
          setFeverActive(false);
          if (levelRef.current === 4) {
            livesRef.current = 3;
            setLives(3);
          }
          setT(dur(levelRef.current));
        } else if (!comboBrokenRef.current && !suddenDeathUsedRef.current && comboRef.current > 0) {
          suddenDeathUsedRef.current = true;
          setFeverActive(true);
          a.showToast('🌟 ¡Muerte Súbita! +5s de Fiebre Dorada');
          setT(5);
        } else {
          setT(0);
          endGame();
        }
      } else setT(t - 1);
    }, 1000);
    return () => {
      clearInterval(iv);
      clearInterval(tmr);
      touts.current.forEach(clearTimeout);
    };
  }, [runKey]);

  const move = (e) => {
    const ff = Math.max(0.06, Math.min(0.94, e.nativeEvent.locationX / WRef.current));
    bxRef.current = ff;
    setBx(ff);
  };
  const retry = () => {
    a.addXp(score * 5);
    scoreRef.current = 0;
    setScore(0);
    levelRef.current = 1;
    setLevel(1);
    comboRef.current = 0;
    setCombo(0);
    livesRef.current = 3;
    setLives(3);
    comboBrokenRef.current = false;
    suddenDeathUsedRef.current = false;
    magnetActiveRef.current = false;
    setMagnetActive(false);
    hasShieldRef.current = false;
    setHasShield(false);
    freezeActiveRef.current = false;
    setFreezeActive(false);
    setFeverActive(false);
    nutrientesRef.current = 0;
    bestComboRef.current = 0;
    itemsRef.current = [];
    setItems([]);
    setFx([]);
    setT(dur(1));
    setOver(false);
    setRunKey((k) => k + 1);
  };
  const tgt = target(level);

  return (
    <Screen title="🍬 Atrapa lo sano" back={() => a.setScreen('arcade')} colors={['#EAF6FF', '#D7ECFF']} scroll={false} pad={10} contentStyle={{ paddingBottom: 86 }}>
      {over ? (
        <View style={g.fin}>
          <Axo {...a.axoProps} evo={a.computedEvo} mood="amor" size={130} />
          <Display style={{ fontSize: 21, marginTop: 8, textAlign: 'center' }}>¡Buen intento! Tu cuerpo necesita una recarga de energía</Display>
          <Muted style={{ marginBottom: 10 }}>Llegaste al nivel {level}</Muted>
          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginBottom: 10 }}>
            {[[score, 'Puntos', '#34BC97'], [nutrientesRef.current, 'Nutrientes', '#5FA8E8'], ['🔥' + bestComboRef.current, 'Mejor racha', '#F2B705']].map(([v, l, col]) => (
              <View key={l} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}>
                <T style={{ fontSize: 20, color: col }}>{v}</T>
                <Muted sm>{l}</Muted>
              </View>
            ))}
          </View>
          {score >= best && score > 0 && <T style={{ color: C.gold, fontSize: 16, marginBottom: 6 }}>🏆 ¡Nuevo récord!</T>}
          {score < best && best - score <= 3 && <Muted sm style={{ marginBottom: 6, color: C.pink, fontFamily: F.bodyBold }}>😬 ¡Te faltó{best - score === 1 ? '' : 'n'} {best - score} para tu récord!</Muted>}
          {score < best && best - score > 3 && <Muted sm style={{ marginBottom: 6 }}>Récord: {best}</Muted>}
          <Btn big label="🔁 Intentar de nuevo" onPress={retry} style={{ marginBottom: 8 }} />
          <Btn kind="ghost" label="Reclamar y volver" onPress={() => { a.addXp(score * 5); a.showToast('+' + score * 5 + ' XP 🍬'); a.setScreen('arcade'); }} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 6 }}>
            <T style={{ color: C.purple }}>Nivel {level}</T>
            {level >= 4 && <Text style={{ fontSize: 15 }}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, 3 - lives))}</Text>}
            <T style={{ color: C.pink }}>⏱️ {time}s</T>
            <T style={{ color: C.mint }}>🍬 {score}/{tgt}</T>
          </View>
          <View style={{ minHeight: 20, alignItems: 'center' }}>
            {combo >= 2 ? <T style={{ fontSize: 14, color: C.gold }}>🔥 Combo x{combo}{combo >= 8 ? ' (¡x3 puntos!)' : combo >= 4 ? ' (x2 puntos)' : ''}</T> : null}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, minHeight: 18 }}>
            {magnetActive && <T style={{ fontSize: 12.5, color: C.mint }}>🧲 Imán</T>}
            {hasShield && <T style={{ fontSize: 12.5, color: '#5BB8E0' }}>🫧 Escudo</T>}
            {freezeActive && <T style={{ fontSize: 12.5, color: '#5BB8E0' }}>🧊 Lento</T>}
            {feverActive && <T style={{ fontSize: 12.5, color: '#B8860B' }}>🌟 ¡Fiebre Dorada!</T>}
          </View>
          <View style={[g.barra, { height: 5, backgroundColor: '#dfe9f5', marginBottom: 8 }]}>
            <View style={{ width: `${Math.min(100, (score / tgt) * 100)}%`, height: '100%', backgroundColor: C.mint, borderRadius: 3 }} />
          </View>
          <View
            onLayout={(e) => {
              const { height, width } = e.nativeEvent.layout;
              if (height > 0) {
                HRef.current = height;
                WRef.current = width;
                setH(height);
              }
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={move}
            onResponderMove={move}
            style={[g.caja, { backgroundColor: feverActive ? '#FFE08A' : freezeActive ? '#CFEBFF' : '#B6DCF8' }]}
          >
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {items.map((it) => (
                <Text key={it.id} style={{ position: 'absolute', left: `${it.x * 100}%`, top: it.y, marginLeft: -18, marginTop: -18, fontSize: ESPECIALES.includes(it.kind) ? 32 : 28 }}>{it.e}</Text>
              ))}
              {fx.map((f) => (
                <Text key={f.fxId} style={{ position: 'absolute', left: `${f.x * 100}%`, top: H - 108, marginLeft: -14, fontFamily: F.display, fontSize: 20, color: f.col }}>{f.txt}</Text>
              ))}
              <View style={{ position: 'absolute', bottom: 8, left: `${bx * 100}%`, marginLeft: -34 }}>
                {(magnetActive || hasShield) && <View style={{ position: 'absolute', left: -6, right: -6, top: -6, bottom: -6, borderRadius: 50, borderWidth: 3, borderColor: hasShield ? '#5BB8E0aa' : '#34BC9788' }} />}
                <AxoMini {...a.axoProps} evo={a.computedEvo} size={68} />
              </View>
              {levelUp && (
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffffaa' }]}>
                  <Display style={{ fontSize: 30, color: C.purple }}>¡Nivel {level}! 🎉</Display>
                </View>
              )}
            </View>
          </View>
          <Muted sm style={{ textAlign: 'center', marginTop: 8 }}>Desliza el dedo para mover a {a.petName} · llega a {tgt} pts · 🏆 {best}</Muted>
        </View>
      )}
    </Screen>
  );
}

const g = StyleSheet.create({
  fin: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingBottom: 80 },
  barra: { height: 6, backgroundColor: '#eef0f6', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  carta: { padding: 18, borderRadius: 20, backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  memo: { width: '23%', aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  simon: { width: 126, height: 126, borderRadius: 20, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  cal: { flex: 1, paddingVertical: 20, paddingHorizontal: 12, borderRadius: 20, borderWidth: 3, alignItems: 'center' },
  caja: { flex: 1, borderRadius: 20, overflow: 'hidden' },
});

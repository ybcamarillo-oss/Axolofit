import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ellipse, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Axo from './Axo';
import { Layer, VB_W, VB_H, coloresAxo } from './axoParts';

// El huevo tiembla, se rompe y sale Axo bebé con su cara de recién nacido.
// `size` es el tamaño normal de Axo. El huevo es MÁS GRANDE que Axo:
// se dibuja en un lienzo 1.45 veces mayor y Axo queda adentro, abajo al centro.
// fase: 'huevo' -> 'rompe' -> 'nacido'. Llama onListo cuando termina.

const K = 1.45; // cuánto más grande es el lienzo del huevo que Axo
const T_ROMPE = 2700; // el huevo tiembla 2.7 s antes de romperse
const T_LISTO = 5000;
const ZIG = 'L62 111 L75 124 L88 111 L100 124 L112 111 L125 124 L138 111';
// El cascarón se agranda dentro del lienzo para llenarlo
const HUEVO_T = 'translate(100 205) scale(1.36) translate(-100 -200)';

const Manchas = ({ arriba, color }) => (
  <G fill={color} opacity={0.35}>
    {arriba ? (
      <>
        <Ellipse cx={80} cy={84} rx={7} ry={5} />
        <Ellipse cx={118} cy={76} rx={5} ry={4} />
        <Ellipse cx={128} cy={98} rx={4} ry={3} />
      </>
    ) : (
      <>
        <Ellipse cx={72} cy={146} rx={6} ry={4.5} />
        <Ellipse cx={122} cy={158} rx={8} ry={5.5} />
        <Ellipse cx={96} cy={172} rx={4} ry={3} />
      </>
    )}
  </G>
);


// espera=true: el huevo solo se mece (todavía no nace); al pasar a false empieza a nacer.
export default function Nacimiento({ paletteKey = 'durazno', size = 200, onListo, faseFija, espera = false }) {
  const w = size * K;
  const h = w * (VB_H / VB_W);
  const axoH = size * (VB_H / VB_W);
  const { pal, line } = coloresAxo(paletteKey);
  const [fase, setFase] = useState(faseFija || 'huevo');

  const wobble = useSharedValue(0);
  const top = useSharedValue(0);
  const bottom = useSharedValue(0);
  const pop = useSharedValue(faseFija && faseFija !== 'huevo' ? 1 : 0);
  const asoma = useSharedValue(0); // Axo se asoma por encima del cascarón antes de salir

  useEffect(() => {
    if (faseFija) {
      if (faseFija === 'rompe') {
        top.value = 0.62;
        asoma.value = 1;
      }
      if (faseFija === 'nacido') {
        top.value = 1;
        bottom.value = 1;
      }
      return;
    }
    const e = Easing.inOut(Easing.sin);
    if (espera) {
      wobble.value = withRepeat(withSequence(withTiming(0.5, { duration: 420, easing: e }), withTiming(-0.5, { duration: 420, easing: e })), -1, false);
      return;
    }
    wobble.value = withSequence(
      // primero se mece despacito…
      withRepeat(withSequence(withTiming(0.6, { duration: 300, easing: e }), withTiming(-0.6, { duration: 300, easing: e })), 2, false),
      // …y luego tiembla rápido, cada vez más fuerte
      withRepeat(withSequence(withTiming(1, { duration: 100 }), withTiming(-1, { duration: 100 })), 7, false),
      withTiming(0, { duration: 90 })
    );
    const t1 = setTimeout(() => {
      setFase('rompe');
      top.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      pop.value = withSpring(1, { damping: 8, stiffness: 120 });
      asoma.value = withSequence(
        withTiming(1, { duration: 520, easing: Easing.out(Easing.back(1.6)) }),
        withDelay(800, withSpring(0, { damping: 15, stiffness: 110 }))
      );
      bottom.value = withDelay(1250, withTiming(1, { duration: 500 }));
    }, T_ROMPE);
    const t2 = setTimeout(() => {
      setFase('nacido');
      onListo && onListo();
    }, T_LISTO);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [espera]);

  const full = { position: 'absolute', left: 0, top: 0, width: w, height: h };
  const eggStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wobble.value * 6}deg` }] }));
  const topStyle = useAnimatedStyle(() => ({
    opacity: 1 - top.value,
    transform: [{ translateY: -top.value * h * 0.3 }, { translateX: top.value * w * 0.14 }, { rotate: `${top.value * 30}deg` }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: 1 - bottom.value,
    transform: [{ translateY: bottom.value * h * 0.1 }],
  }));
  const axoStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 3),
    transform: [{ translateY: (1 - pop.value) * axoH * 0.12 - asoma.value * axoH * 0.42 }, { scale: 0.5 + pop.value * 0.5 }],
  }));

  const cascaron = { fill: '#FFF8EE', stroke: line, strokeWidth: 2.4, strokeLinejoin: 'round' };
  return (
    <View style={{ width: w, height: h }}>
      <Layer w={w} h={h}>
        <Ellipse cx={100} cy={209} rx={52} ry={6} fill="#00000012" />
      </Layer>

      {/* Axo, a su tamaño normal, abajo al centro del lienzo */}
      {fase !== 'huevo' && (
        <Animated.View
          style={[
            { position: 'absolute', left: (w - size) / 2, top: h - axoH - h * 0.01, width: size, height: axoH },
            axoStyle,
            { transformOrigin: [size / 2, axoH * 0.9, 0] },
          ]}
        >
          <Axo paletteKey={paletteKey} mood="nace" size={size} />
        </Animated.View>
      )}

      <Animated.View pointerEvents="none" style={[full, eggStyle, { transformOrigin: [w / 2, h * 0.93, 0] }]}>
        <Animated.View style={[full, bottomStyle]}>
          <Layer w={w} h={h}>
            <G transform={HUEVO_T}>
              <Path d={`M49 119 ${ZIG} L151 119 C151 166 129 200 100 200 C71 200 49 166 49 119 Z`} {...cascaron} />
              <Manchas color={pal.gill} />
            </G>
          </Layer>
        </Animated.View>
        <Animated.View style={[full, topStyle, { transformOrigin: [w / 2, h * 0.35, 0] }]}>
          <Layer w={w} h={h}>
            <G transform={HUEVO_T}>
              <Path d="M49 119 C49 77 71 56 100 56 C129 56 151 77 151 119 L138 111 L125 124 L112 111 L100 124 L88 111 L75 124 L62 111 Z" {...cascaron} />
              <Path d="M70 80 C78 68 90 63 102 63" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" />
              <Manchas arriba color={pal.gill} />
            </G>
          </Layer>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

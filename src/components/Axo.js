import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import {
  VB_W,
  VB_H,
  Layer,
  geom,
  coloresAxo,
  Aura,
  Alas,
  Cuerpo,
  Frente,
  Comiendo,
  BrazoSoba,
  Branquias,
  CabezaBase,
  Ojos,
  Boca,
  Accesorio,
  AxoMini,
} from './axoParts';

// Axo animado: cuerpo del Axo original (sin contorno, colita enroscada) con la carita nueva.
// Está separado en capas para que cada parte se anime sola en el hilo nativo:
// flota, respira, mueve las branquias, parpadea, ladea la cabeza, mastica y se soba la panza.
// Caras (mood): 'feliz' | 'triste' | 'come' | 'nace' | 'amor'
// Etapas (evo): 'cria' | 'joven' | 'adulto' | 'mistico'

export { VB_W, VB_H, Layer, coloresAxo, AxoMini };

const HEART = 'M0 2 C-2 -2 -7 -1 -7 3 C-7 6 -3 9 0 11 C3 9 7 6 7 3 C7 -1 2 -2 0 2 Z';
const estrella = (x, y, r) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;

export default function Axo({
  paletteKey = 'durazno',
  mood = 'feliz',
  evo = 'cria',
  chub = 1,
  accessory = 'ninguno',
  outfit = 'ninguno',
  estilo = 'clasico',
  size = 220,
  onPress,
}) {
  const w = size;
  const h = size * (VB_H / VB_W);
  const g = geom({ paletteKey, evo, chub });
  const come = mood === 'come';
  const brazosArriba = mood === 'nace' || mood === 'amor';
  const parpadea = mood === 'feliz' || mood === 'triste' || mood === 'nace';

  // Valores animados (corren en el hilo de la interfaz, no en JavaScript)
  const bob = useSharedValue(0);
  const breathe = useSharedValue(1);
  const sway = useSharedValue(0);
  const tilt = useSharedValue(0);
  const blink = useSharedValue(1);
  const jump = useSharedValue(0);
  const heart = useSharedValue(0);
  const twinkle = useSharedValue(0.3);
  const chew = useSharedValue(1);
  const rub = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    bob.value = withRepeat(withTiming(-6, { duration: 1500, easing: ease }), -1, true);
    breathe.value = withRepeat(withTiming(1.03, { duration: 1300, easing: ease }), -1, true);
    sway.value = withRepeat(withTiming(1, { duration: 1100, easing: ease }), -1, true);
    tilt.value = withRepeat(withTiming(1, { duration: 2300, easing: ease }), -1, true);
    blink.value = withRepeat(
      withSequence(withDelay(2800, withTiming(0.08, { duration: 80 })), withTiming(1, { duration: 120 })),
      -1,
      false
    );
    twinkle.value = withRepeat(withTiming(1, { duration: 600, easing: ease }), -1, true);
  }, []);

  // Masticar y sobarse la pancita solo mientras come
  useEffect(() => {
    if (come) {
      chew.value = withRepeat(withTiming(0.35, { duration: 190, easing: Easing.inOut(Easing.quad) }), -1, true);
      rub.value = 0;
      rub.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(chew);
      cancelAnimation(rub);
      chew.value = withTiming(1, { duration: 120 });
    }
  }, [come]);

  const tap = () => {
    jump.value = withSequence(
      withTiming(-30, { duration: 160, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 7, stiffness: 180 })
    );
    heart.value = 0;
    heart.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
    onPress && onPress();
  };

  const wholeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value + jump.value }, { scaleX: 2 - breathe.value }, { scaleY: breathe.value }],
  }));
  const headStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-2.2 + tilt.value * 4.4}deg` }] }));
  const leftGill = useAnimatedStyle(() => ({ transform: [{ rotate: `${-6 + sway.value * 11}deg` }] }));
  const rightGill = useAnimatedStyle(() => ({ transform: [{ rotate: `${6 - sway.value * 11}deg` }] }));
  const eyesStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const mouthStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: chew.value }] }));
  const rubStyle = useAnimatedStyle(() => {
    const a = rub.value * 2 * Math.PI;
    // gira y se estira un poquito desde el hombro: la manita dibuja un círculo sobre la panza
    return { transform: [{ rotate: `${Math.sin(a) * 13}deg` }, { scaleY: 1 + Math.cos(a) * 0.07 }] };
  });
  const shadowStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 + (bob.value + jump.value) / 110 }] }));
  const twinkleStyle = useAnimatedStyle(() => ({ opacity: twinkle.value }));
  const heartStyle = useAnimatedStyle(() => ({
    opacity: heart.value === 0 ? 0 : 1 - heart.value,
    transform: [{ translateY: -heart.value * 70 }, { scale: 0.6 + heart.value * 0.8 }],
  }));

  // Conversión del viewBox a pixeles (para los puntos de giro)
  const px = (x) => (x / VB_W) * w;
  const py = (y) => (y / VB_H) * h;
  // puntos del dibujo original -> pixeles (el dibujo se encoge según la etapa)
  const hx = (x) => px(g.X(x));
  const hy = (y) => py(g.Y(y));
  const full = { position: 'absolute', left: 0, top: 0, width: w, height: h };

  const cuello = { transformOrigin: [w / 2, hy(130), 0] };
  const contenido = (
    <View style={{ width: w, height: h }}>
      <Animated.View style={[full, shadowStyle]}>
        <Layer w={w} h={h}>
          <Ellipse cx={100} cy={g.sombra.cy} rx={g.sombra.rx} ry={g.sombra.ry} fill="#00000012" />
        </Layer>
      </Animated.View>

      {/* aura: dorada fija en el adulto, morada con destellos que titilan en el místico */}
      {(evo === 'adulto' || evo === 'mistico') && (
        <Animated.View style={[full, evo === 'mistico' ? twinkleStyle : null]}>
          <Layer w={w} h={h}>
            <Aura g={g} evo={evo} />
          </Layer>
        </Animated.View>
      )}

      <Animated.View style={[full, wholeStyle, { transformOrigin: [w / 2, py(g.sombra.cy), 0] }]}>
        {/* cuerpo */}
        <Layer w={w} h={h}>
          {accessory === 'mariposa' && <Alas g={g} />}
          <Cuerpo g={g} />
        </Layer>

        {/* cabeza (se ladea suavemente) */}
        <Animated.View style={[full, headStyle, cuello]}>
          <Animated.View style={[full, leftGill, { transformOrigin: [hx(50), hy(76), 0] }]}>
            <Layer w={w} h={h}>
              <Branquias g={g} side="left" />
            </Layer>
          </Animated.View>
          <Animated.View style={[full, rightGill, { transformOrigin: [hx(150), hy(76), 0] }]}>
            <Layer w={w} h={h}>
              <Branquias g={g} side="right" />
            </Layer>
          </Animated.View>

          <Layer w={w} h={h}>
            <CabezaBase g={g} mood={mood} />
          </Layer>

          <Animated.View style={[full, parpadea ? eyesStyle : null, { transformOrigin: [w / 2, hy(89), 0] }]}>
            <Layer w={w} h={h}>
              <Ojos g={g} mood={mood} />
            </Layer>
          </Animated.View>

          <Animated.View style={[full, mouthStyle, { transformOrigin: [w / 2, hy(102.4), 0] }]}>
            <Layer w={w} h={h}>
              <Boca g={g} mood={mood} />
            </Layer>
          </Animated.View>
        </Animated.View>

        {/* pancita y ropa: van encima de la cabeza */}
        <Layer w={w} h={h}>
          <Frente g={g} outfit={outfit} brazos={come ? null : brazosArriba ? 'arriba' : 'abajo'} />
        </Layer>

        {/* accesorios: encima de la ropa, y se ladean igual que la cabeza */}
        {(accessory !== 'ninguno' || estilo === 'galan') && accessory !== 'mariposa' && (
          <Animated.View style={[full, headStyle, cuello]}>
            <Layer w={w} h={h}>
              <Accesorio g={g} k={accessory} estilo={estilo} />
            </Layer>
          </Animated.View>
        )}
        {accessory === 'mariposa' && estilo === 'galan' && (
          <Animated.View style={[full, headStyle, cuello]}>
            <Layer w={w} h={h}>
              <Accesorio g={g} k="ninguno" estilo={estilo} />
            </Layer>
          </Animated.View>
        )}

        {/* comiendo: una manita sostiene la manzanita y la otra se soba la pancita */}
        {come && (
          <Layer w={w} h={h}>
            <Comiendo g={g} outfit={outfit} />
          </Layer>
        )}
        {come && (
          <Animated.View style={[full, rubStyle, { transformOrigin: [hx(g.hombroD.x), hy(g.hombroD.y), 0] }]}>
            <Layer w={w} h={h}>
              <BrazoSoba g={g} outfit={outfit} />
            </Layer>
          </Animated.View>
        )}
      </Animated.View>

      {/* destellos al nacer */}
      {mood === 'nace' && (
        <Animated.View pointerEvents="none" style={[full, twinkleStyle]}>
          <Layer w={w} h={h}>
            <Path d={estrella(24, 46, 9)} fill="#FFD86B" />
            <Path d={estrella(178, 36, 11)} fill="#FFD86B" />
            <Path d={estrella(184, 132, 7)} fill="#FFE9A6" />
            <Path d={estrella(18, 138, 6)} fill="#FFE9A6" />
            <Path d={estrella(100, 16, 7)} fill="#FFD86B" />
          </Layer>
        </Animated.View>
      )}

      {/* corazón al tocarlo */}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: px(128), top: py(30), width: 40, height: 40 }, heartStyle]}>
        <Svg width={40} height={40} viewBox="-10 -6 20 20">
          <Path d={HEART} fill="#F47FA0" />
        </Svg>
      </Animated.View>
    </View>
  );

  // Sin onPress no captura toques (así no estorba a lo que esté detrás o alrededor)
  if (!onPress) return contenido;
  return (
    <Pressable onPress={tap} hitSlop={10}>
      {contenido}
    </Pressable>
  );
}

import React, { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Circle, Path, G, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
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
import { PALETTES } from '../theme';

// Axo bebé: diseño propio estilo kawaii (cabeza grande tipo mochi, cuerpo chiquito).
// Está separado en capas para que cada parte se anime sola en el hilo nativo.
// Caras (mood): 'feliz' | 'triste' | 'come' | 'nace' | 'amor'

export const VB_W = 200;
export const VB_H = 220;

const INK = '#4A2F35'; // ojos y boca
const MOUTH_IN = '#B8475E';
const TONGUE = '#F59AB0';
const BLUSH = '#F58FA8'; // cachetes rosas siempre, sin importar el color de Axo

function oscurecer(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export function coloresAxo(paletteKey) {
  const pal = PALETTES[paletteKey] || PALETTES.durazno;
  const body = paletteKey === 'dorado' ? 'url(#g)' : paletteKey === 'galaxia' ? 'url(#gx)' : pal.body;
  const gill = paletteKey === 'dorado' ? 'url(#gg)' : paletteKey === 'galaxia' ? 'url(#gxg)' : pal.gill;
  const line = paletteKey === 'galaxia' ? '#1B1140' : paletteKey === 'albino' ? '#B07F2E' : oscurecer(pal.gill, 0.62);
  return { pal, body, gill, line };
}

function Gradients() {
  return (
    <Defs>
      <LinearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
        <Stop offset="0" stopColor="#FFF4BE" />
        <Stop offset="0.45" stopColor="#FFD23F" />
        <Stop offset="1" stopColor="#E8A317" />
      </LinearGradient>
      <LinearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFDE6A" />
        <Stop offset="1" stopColor="#D08E0E" />
      </LinearGradient>
      <RadialGradient id="gx" cx="0.4" cy="0.32" r="0.95">
        <Stop offset="0" stopColor="#7B57D6" />
        <Stop offset="0.55" stopColor="#3B2A7A" />
        <Stop offset="1" stopColor="#190F3C" />
      </RadialGradient>
      <RadialGradient id="gxg" cx="0.5" cy="0.3" r="0.9">
        <Stop offset="0" stopColor="#9B7BFF" />
        <Stop offset="1" stopColor="#4B2E9E" />
      </RadialGradient>
    </Defs>
  );
}

export function Layer({ w, h, children }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
      <Gradients />
      {children}
    </Svg>
  );
}

// Una "hojita" de branquia redondeada
const petalo = (len, wd) =>
  `M0 ${-wd} C ${len * 0.35} ${-wd * 1.75} ${len * 0.92} ${-wd * 1.35} ${len} 0 C ${len * 0.92} ${wd * 1.35} ${len * 0.35} ${wd * 1.75} 0 ${wd} Z`;

function Gills({ fill, line, side, k = 1, hojas4 = false }) {
  const t = side === 'left' ? 'translate(40,84) scale(-1,1)' : 'translate(160,84)';
  const hojas = hojas4
    ? [
        { r: -58, len: 30, wd: 6.5 },
        { r: -28, len: 37, wd: 7.5 },
        { r: 2, len: 39, wd: 8 },
        { r: 34, len: 32, wd: 7 },
      ]
    : [
        { r: -42, len: 35, wd: 7.5 },
        { r: -4, len: 39, wd: 8 },
        { r: 34, len: 33, wd: 7 },
      ];
  return (
    <G transform={t}>
      {hojas.map((p) => (
        <G key={p.r} transform={`rotate(${p.r})`}>
          <Path d={petalo(p.len * k, p.wd)} fill={fill} stroke={line} strokeWidth={2.6} strokeLinejoin="round" />
          <Path d={`M7 0 L ${p.len * k * 0.7} 0`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        </G>
      ))}
    </G>
  );
}

// Ojo grande con brillos (el mismo en todas las caras de ojos abiertos)
function OjoGrande({ cx, cy, r = 13 }) {
  const k = r / 13;
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={INK} />
      <Ellipse cx={cx} cy={cy + 6 * k} rx={8 * k} ry={4.5 * k} fill="#9C7BD8" opacity={0.55} />
      <Circle cx={cx - 4.5 * k} cy={cy - 5 * k} r={4.8 * k} fill="#fff" />
      <Circle cx={cx + 5 * k} cy={cy + 5 * k} r={2.3 * k} fill="#fff" opacity={0.9} />
      <Circle cx={cx + 5.5 * k} cy={cy - 5.5 * k} r={1.4 * k} fill="#fff" opacity={0.8} />
    </G>
  );
}

const arco = (cx, cy) => `M${cx - 9} ${cy + 3} Q${cx} ${cy - 9} ${cx + 9} ${cy + 3}`;

function Eyes({ mood }) {
  if (mood === 'come' || mood === 'amor') {
    return (
      <G>
        <Path d={arco(70, 95)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <Path d={arco(130, 95)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      </G>
    );
  }
  if (mood === 'triste') {
    return (
      <G>
        <Path d="M58 80 L77 75" stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <Path d="M123 75 L142 80" stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <OjoGrande cx={70} cy={95} r={12} />
        <OjoGrande cx={130} cy={95} r={12} />
        <Ellipse cx={70} cy={104} rx={7.5} ry={2.4} fill="#BFE6FF" opacity={0.8} />
        <Ellipse cx={130} cy={104} rx={7.5} ry={2.4} fill="#BFE6FF" opacity={0.8} />
      </G>
    );
  }
  // feliz y nace: ojos grandes con brillos
  return (
    <G>
      <OjoGrande cx={70} cy={93} />
      <OjoGrande cx={130} cy={93} />
    </G>
  );
}

function Mouth({ mood }) {
  if (mood === 'nace') {
    return (
      <G>
        <Path d="M88 104 Q100 101 112 104 Q111 121 100 121 Q89 121 88 104 Z" fill={MOUTH_IN} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <Ellipse cx={100} cy={116.5} rx={6.5} ry={3.4} fill={TONGUE} />
      </G>
    );
  }
  if (mood === 'amor') {
    return (
      <G>
        <Path d="M91 105 Q100 103.5 109 105 Q108 116 100 116 Q92 116 91 105 Z" fill={MOUTH_IN} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <Ellipse cx={100} cy={113} rx={4.6} ry={2.4} fill={TONGUE} />
      </G>
    );
  }
  if (mood === 'come') {
    return <Ellipse cx={100} cy={109.5} rx={5.4} ry={4.6} fill={MOUTH_IN} stroke={INK} strokeWidth={2.2} />;
  }
  if (mood === 'triste') {
    return <Path d="M93 112 Q100 105.5 107 112" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />;
  }
  return <Path d="M90 106 Q95 113.5 100 106 Q105 113.5 110 106" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

const HEART = 'M0 2 C-2 -2 -7 -1 -7 3 C-7 6 -3 9 0 11 C3 9 7 6 7 3 C7 -1 2 -2 0 2 Z';
const estrella = (x, y, r) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;

// Proporciones por etapa: al crecer, la cabeza se hace más chica respecto al cuerpo,
// el cuerpo se alarga, y las branquias y la colita crecen.
const ETAPAS = {
  cria: { s: 1, dy: 0, bcy: 163, brx: 31, bry: 30, gk: 1, tail: 1, feetY: 192, arm: 12, armX: 28, armY: 162, hojas4: false },
  // joven y adulto: cuerpo en forma de pera, gordito y sentado (top/bottom = alto, sw = hombros)
  joven: { s: 0.92, dy: -11, pera: true, top: 121, bottom: 197, brx: 35, sw: 15, gk: 1.22, tail: 1.22, feetY: 196, arm: 13, armX: 28, armY: 153, hojas4: false },
  adulto: { s: 0.84, dy: -21, pera: true, top: 110, bottom: 199, brx: 41, sw: 17, gk: 1.42, tail: 1.42, feetY: 198, arm: 15, armX: 32, armY: 146, hojas4: true },
};

export default function Axo({ paletteKey = 'durazno', mood = 'feliz', evo = 'cria', size = 220, onPress }) {
  const w = size;
  const h = size * (VB_H / VB_W);
  const { pal, body, gill, line } = coloresAxo(paletteKey);
  const E = ETAPAS[evo === 'mistico' ? 'adulto' : evo] || ETAPAS.cria;
  const come = mood === 'come';
  const brazosArriba = mood === 'nace' || mood === 'amor';
  const parpadea = mood === 'feliz' || mood === 'triste' || mood === 'nace';
  const SW = 3;

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

  // Masticar solo mientras come
  useEffect(() => {
    if (come) {
      chew.value = withRepeat(withTiming(0.35, { duration: 190, easing: Easing.inOut(Easing.quad) }), -1, true);
      // la manita da vueltas sobre la pancita
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

  // Conversión del viewBox a pixeles
  const px = (x) => (x / VB_W) * w;
  const py = (y) => (y / VB_H) * h;
  // La cabeza se dibuja en sus coordenadas base y se encoge/sube según la etapa.
  const headT = `translate(100 ${139 + E.dy}) scale(${E.s}) translate(-100 -139)`;
  const hx = (x) => px(100 + (x - 100) * E.s);
  const hy = (y) => py(139 + E.dy + (y - 139) * E.s);
  const full = { position: 'absolute', left: 0, top: 0, width: w, height: h };
  const brazo = { fill: body, stroke: line, strokeWidth: SW };

  // Cuerpo
  const armY = E.armY;
  const armX = E.armX;
  const bellyY = E.pera ? E.bottom - (E.bottom - E.top) * 0.4 : E.bcy + 7;
  // Brazos al comer: van del hombro a la mano, así nunca se despegan del cuerpo
  const comeDy = E.dy + (1 - E.s) * 30;
  const brazoDe = (sx, sy, hx2, hy2) => {
    const dx = hx2 - sx;
    const dy2 = hy2 - sy;
    const len = Math.hypot(dx, dy2);
    return { cx: (sx + hx2) / 2, cy: (sy + hy2) / 2, ry: len / 2 + 5, ang: (Math.atan2(-dx, dy2) * 180) / Math.PI };
  };
  const hombroD = { x: 100 + armX - 3, y: armY - 8 };
  const hombroI = { x: 100 - armX + 3, y: armY - 8 };
  const bSoba = brazoDe(hombroD.x, hombroD.y, E.pera ? 110 : 106, bellyY + (E.pera ? -3 : 5));
  const bManzana = brazoDe(hombroI.x, hombroI.y, 87, 141 + comeDy);
  const bw = E.brx;
  const bh = E.pera ? E.bottom - E.top : 0;
  const low = E.pera ? E.bottom - bh * 0.4 : 0;
  const mid = E.pera ? E.top + bh * 0.24 : 0;
  const lowC = low + (E.bottom - low) * 0.78;
  const pera = E.pera
    ? `M100 ${E.top} C ${100 + E.sw * 1.5} ${E.top} ${100 + bw} ${mid} ${100 + bw} ${low} C ${100 + bw} ${lowC} ${100 + bw * 0.62} ${E.bottom} 100 ${E.bottom} C ${100 - bw * 0.62} ${E.bottom} ${100 - bw} ${lowC} ${100 - bw} ${low} C ${100 - bw} ${mid} ${100 - E.sw * 1.5} ${E.top} 100 ${E.top} Z`
    : null;
  // Colita: sale por abajo a la derecha y se enrosca hacia ARRIBA, afinándose en la punta
  const TAIL = 'M116 178 C 130 182 141 176 144 164 C 146 154 145 146 150 141 C 154 136 161 138 161 144 C 166 161 160 184 140 193 C 132 197 122 197 114 195 Z';
  const ALETA = 'M160 142 C 176 158 173 184 148 193 C 161 183 166 161 160 142 Z';
  const tailT = `translate(120 ${E.feetY + 5 - 8 * E.tail}) scale(${E.tail}) translate(-120 -188)`;

  return (
    <Pressable onPress={tap} hitSlop={10}>
      <View style={{ width: w, height: h }}>
        <Animated.View style={[full, shadowStyle]}>
          <Layer w={w} h={h}>
            <Ellipse cx={100} cy={208} rx={46 + (E.brx - 31) * 2} ry={7} fill="#00000012" />
          </Layer>
        </Animated.View>

        {evo === 'mistico' && (
          <Animated.View style={[full, twinkleStyle]}>
            <Layer w={w} h={h}>
              <Circle cx={100} cy={112} r={98} fill="#9B7BFF" opacity={0.22} />
            </Layer>
          </Animated.View>
        )}

        <Animated.View style={[full, wholeStyle, { transformOrigin: [w / 2, py(E.feetY + 6), 0] }]}>
          {/* cuerpo */}
          <Layer w={w} h={h}>
            <G transform={tailT}>
              {E.hojas4 && <Path d={ALETA} fill={gill} stroke={line} strokeWidth={2} strokeLinejoin="round" />}
              <Path d={TAIL} fill={body} stroke={line} strokeWidth={SW / E.tail} strokeLinejoin="round" />
              <Path d="M157 150 C 160 164 154 178 141 186" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.4} />
            </G>
            {E.pera ? (
              <G>
                <Path d={pera} fill={body} stroke={line} strokeWidth={SW} strokeLinejoin="round" />
                <Ellipse cx={100} cy={E.bottom - (E.bottom - E.top) * 0.4} rx={bw * 0.56} ry={(E.bottom - E.top) * 0.34} fill="#ffffff" opacity={0.55} />
                <Ellipse cx={100 - bw * 0.62} cy={E.bottom - 1} rx={12} ry={7.5} {...brazo} />
                <Ellipse cx={100 + bw * 0.62} cy={E.bottom - 1} rx={12} ry={7.5} {...brazo} />
              </G>
            ) : (
              <G>
                <Ellipse cx={100 - E.brx * 0.52} cy={E.feetY} rx={11} ry={7} {...brazo} />
                <Ellipse cx={100 + E.brx * 0.52} cy={E.feetY} rx={11} ry={7} {...brazo} />
                <Ellipse cx={100} cy={E.bcy} rx={E.brx} ry={E.bry} fill={body} stroke={line} strokeWidth={SW} />
                <Ellipse cx={100} cy={E.bcy + 7} rx={E.brx * 0.58} ry={E.bry * 0.63} fill="#ffffff" opacity={0.55} />
              </G>
            )}
            {!come &&
              (brazosArriba ? (
                <G>
                  <Ellipse cx={100 - armX - 9} cy={armY - 15} rx={7.5} ry={E.arm + 1} {...brazo} transform={`rotate(-58 ${100 - armX - 9} ${armY - 15})`} />
                  <Ellipse cx={100 + armX + 9} cy={armY - 15} rx={7.5} ry={E.arm + 1} {...brazo} transform={`rotate(58 ${100 + armX + 9} ${armY - 15})`} />
                </G>
              ) : (
                <G>
                  <Ellipse cx={100 - armX} cy={armY} rx={7.5} ry={E.arm} {...brazo} transform={`rotate(26 ${100 - armX} ${armY})`} />
                  <Ellipse cx={100 + armX} cy={armY} rx={7.5} ry={E.arm} {...brazo} transform={`rotate(-26 ${100 + armX} ${armY})`} />
                </G>
              ))}
          </Layer>

          {/* cabeza (se ladea suavemente) */}
          <Animated.View style={[full, headStyle, { transformOrigin: [w / 2, py(139 + E.dy), 0] }]}>
            <Animated.View style={[full, leftGill, { transformOrigin: [hx(40), hy(84), 0] }]}>
              <Layer w={w} h={h}>
                <G transform={headT}>
                  <Gills fill={gill} line={line} side="left" k={E.gk} hojas4={E.hojas4} />
                </G>
              </Layer>
            </Animated.View>
            <Animated.View style={[full, rightGill, { transformOrigin: [hx(160), hy(84), 0] }]}>
              <Layer w={w} h={h}>
                <G transform={headT}>
                  <Gills fill={gill} line={line} side="right" k={E.gk} hojas4={E.hojas4} />
                </G>
              </Layer>
            </Animated.View>

            <Layer w={w} h={h}>
              <G transform={headT}>
                <Path
                  d="M34 92 C34 58 62 40 100 40 C138 40 166 58 166 92 C166 123 140 139 100 139 C60 139 34 123 34 92 Z"
                  fill={body}
                  stroke={line}
                  strokeWidth={SW / E.s}
                  strokeLinejoin="round"
                />
                <Path d="M62 58 C74 48 90 45 104 46" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
                <G fill={pal.gill} opacity={0.4}>
                  <Ellipse cx={88} cy={56} rx={4} ry={2.8} />
                  <Ellipse cx={101} cy={51} rx={4.4} ry={3} />
                  <Ellipse cx={114} cy={56} rx={3.6} ry={2.6} />
                  <Ellipse cx={95} cy={62} rx={2.6} ry={2} />
                  <Ellipse cx={108} cy={62} rx={2.4} ry={1.8} />
                </G>
                <Ellipse cx={54} cy={109} rx={come ? 14 : 11.5} ry={come ? 9.5 : 7} fill={BLUSH} opacity={0.78} />
                <Ellipse cx={146} cy={109} rx={come ? 14 : 11.5} ry={come ? 9.5 : 7} fill={BLUSH} opacity={0.78} />
                {mood === 'triste' && <Path d="M56 114 C53 120 52 124 56 126 C60 124 59 120 56 114 Z" fill="#9BD4F5" stroke="#6FB6E0" strokeWidth={1} />}
              </G>
            </Layer>

            <Animated.View style={[full, parpadea ? eyesStyle : null, { transformOrigin: [w / 2, hy(94), 0] }]}>
              <Layer w={w} h={h}>
                <G transform={headT}>
                  <Eyes mood={mood} />
                </G>
              </Layer>
            </Animated.View>

            <Animated.View style={[full, mouthStyle, { transformOrigin: [w / 2, hy(109.5), 0] }]}>
              <Layer w={w} h={h}>
                <G transform={headT}>
                  <Mouth mood={mood} />
                </G>
              </Layer>
            </Animated.View>
          </Animated.View>

          {/* comiendo: una manita sostiene la manzanita y la otra se soba la pancita */}
          {come && (
            <Layer w={w} h={h}>
              <G transform={`translate(0 ${comeDy})`}>
                <Circle cx={100} cy={137} r={11} fill="#F26D6D" stroke="#B8404A" strokeWidth={2.4} />
                <Circle cx={109} cy={129} r={5} fill={pal.body} />
                <Path d="M100 127 Q101 121 105 119" stroke="#7A4B2A" strokeWidth={2.2} fill="none" strokeLinecap="round" />
                <Path d="M101 122 Q94 116 89 121 Q95 125 101 122 Z" fill="#6CC28A" stroke="#3E9460" strokeWidth={1.4} />
                <Circle cx={95} cy={133} r={2.2} fill="#fff" opacity={0.6} />
                <Circle cx={74} cy={122} r={1.8} fill="#F7B26B" />
                <Circle cx={128} cy={125} r={1.5} fill="#F7B26B" />
                <Circle cx={122} cy={119} r={1.2} fill="#F7B26B" />
              </G>
              <Ellipse cx={bManzana.cx} cy={bManzana.cy} rx={7.5} ry={bManzana.ry} {...brazo} transform={`rotate(${bManzana.ang} ${bManzana.cx} ${bManzana.cy})`} />
            </Layer>
          )}
          {come && (
            <Animated.View style={[full, rubStyle, { transformOrigin: [px(hombroD.x), py(hombroD.y), 0] }]}>
              <Layer w={w} h={h}>
                <Ellipse cx={bSoba.cx} cy={bSoba.cy} rx={7.5} ry={bSoba.ry} {...brazo} transform={`rotate(${bSoba.ang} ${bSoba.cx} ${bSoba.cy})`} />
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
    </Pressable>
  );
}

import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Ellipse, Circle, Path, G, Rect, Line, Defs, ClipPath, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { PALETTES } from '../theme';

// Piezas de dibujo de Axo (sin animación). Las usan:
//  - Axo.js      → versión animada por capas
//  - AxoMini     → versión quieta y ligera (un solo SVG) para listas y miniaturas
// Todo se dibuja en un lienzo de 200 x 220.

export const VB_W = 200;
export const VB_H = 220;

export const INK = '#4A2F35'; // ojos y boca
const MOUTH_IN = '#B8475E';
const TONGUE = '#F59AB0';
const BLUSH = '#F58FA8'; // cachetes rosas siempre, sin importar el color de Axo
const SW = 3;

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

export function Gradients() {
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

// Proporciones por etapa: al crecer, la cabeza se hace más chica respecto al cuerpo,
// el cuerpo se alarga, y las branquias y la colita crecen.
const ETAPAS = {
  cria: { s: 1, dy: 0, bcy: 163, brx: 31, bry: 30, gk: 1, tail: 1, feetY: 192, arm: 12, armX: 28, armY: 162, hojas4: false },
  // joven y adulto: cuerpo en forma de pera, gordito y sentado (top/bottom = alto, sw = hombros)
  joven: { s: 0.92, dy: -11, pera: true, top: 121, bottom: 197, brx: 35, sw: 15, gk: 1.22, tail: 1.15, feetY: 196, arm: 13, armX: 28, armY: 153, hojas4: false },
  adulto: { s: 0.84, dy: -21, pera: true, top: 110, bottom: 199, brx: 41, sw: 17, gk: 1.42, tail: 1.3, feetY: 198, arm: 15, armX: 32, armY: 146, hojas4: true },
};

// Colita: chiquita, sale de lado, se afina hasta terminar en punta y lleva
// tres piquitos (cresta) arriba, del color de las branquias.
const CRESTA = ['M123 175 L129 165 L135 175 Z', 'M135 175 L142 164 L147 173 Z', 'M146 172 L153 161 L157 168 Z'];
const TAIL = 'M112 194 C 134 196 153 188 163 159 C 151 171 138 174 112 171 Z';
const HEAD = 'M34 92 C34 58 62 40 100 40 C138 40 166 58 166 92 C166 123 140 139 100 139 C60 139 34 123 34 92 Z';

// Toda la geometría que depende del color, la etapa y qué tan llenito está (chub 0..1; 1 = como al inicio)
export function geom({ paletteKey = 'durazno', evo = 'cria', chub = 1 }) {
  const col = coloresAxo(paletteKey);
  const stage = evo === 'mistico' ? 'adulto' : ETAPAS[evo] ? evo : 'cria';
  const E0 = ETAPAS[stage];
  const c = Math.max(0, Math.min(1, chub));
  const f = 0.88 + 0.12 * c; // al bajar de peso el cuerpo se adelgaza un poco
  const E = { ...E0, brx: E0.brx * f, armX: E0.armX * f };
  const bw = E.brx;
  const bodyTop = E.pera ? E.top : E.bcy - E.bry;
  const bodyBottom = E.pera ? E.bottom : E.bcy + E.bry;
  const bh = bodyBottom - bodyTop;
  const bellyY = E.pera ? E.bottom - bh * 0.4 : E.bcy + 7;
  const neckY = 139 + E.dy; // donde termina la cabeza
  let bodyD;
  if (E.pera) {
    const low = E.bottom - bh * 0.4;
    const mid = E.top + bh * 0.24;
    const lowC = low + (E.bottom - low) * 0.78;
    bodyD = `M100 ${E.top} C ${100 + E.sw * 1.5} ${E.top} ${100 + bw} ${mid} ${100 + bw} ${low} C ${100 + bw} ${lowC} ${100 + bw * 0.62} ${E.bottom} 100 ${E.bottom} C ${100 - bw * 0.62} ${E.bottom} ${100 - bw} ${lowC} ${100 - bw} ${low} C ${100 - bw} ${mid} ${100 - E.sw * 1.5} ${E.top} 100 ${E.top} Z`;
  } else {
    const k = 0.5523;
    const { bcy: cy, bry: ry } = E;
    bodyD = `M100 ${cy - ry} C ${100 + bw * k} ${cy - ry} ${100 + bw} ${cy - ry * k} ${100 + bw} ${cy} C ${100 + bw} ${cy + ry * k} ${100 + bw * k} ${cy + ry} 100 ${cy + ry} C ${100 - bw * k} ${cy + ry} ${100 - bw} ${cy + ry * k} ${100 - bw} ${cy} C ${100 - bw} ${cy - ry * k} ${100 - bw * k} ${cy - ry} 100 ${cy - ry} Z`;
  }
  const comeDy = E.dy + (1 - E.s) * 30;
  const brazoDe = (sx, sy, hx2, hy2) => {
    const dx = hx2 - sx;
    const dy2 = hy2 - sy;
    const len = Math.hypot(dx, dy2);
    return { cx: (sx + hx2) / 2, cy: (sy + hy2) / 2, ry: len / 2 + 5, ang: (Math.atan2(-dx, dy2) * 180) / Math.PI };
  };
  const hombroD = { x: 100 + E.armX - 3, y: E.armY - 8 };
  const hombroI = { x: 100 - E.armX + 3, y: E.armY - 8 };
  return {
    ...col,
    E,
    stage,
    bw,
    bh,
    bodyTop,
    bodyBottom,
    bellyY,
    neckY,
    bodyD,
    comeDy,
    hombroD,
    hombroI,
    bSoba: brazoDe(hombroD.x, hombroD.y, E.pera ? 110 : 106, bellyY + (E.pera ? -3 : 5)),
    bManzana: brazoDe(hombroI.x, hombroI.y, 87, 141 + comeDy),
    headT: `translate(100 ${139 + E.dy}) scale(${E.s}) translate(-100 -139)`,
    tailT: `translate(120 ${E.feetY + 5 - 8 * E.tail}) scale(${E.tail}) translate(-120 -188)`,
    clipId: `bc_${stage}_${Math.round(c * 100)}`,
  };
}

/* ---------- OUTFITS (ropa) ---------- */
// Cada outfit: color base, color de manga y detalles. Se recorta con la forma del cuerpo,
// así el mismo dibujo sirve para bebé, joven y adulto.
const OUT = {
  jersey: { base: '#1E9E5A', sleeve: '#1E9E5A' },
  sarape: { base: '#FFF3DC', sleeve: '#E0556E' },
  hoodieRojo: { base: '#D7263D', sleeve: '#D7263D', dark: '#A81B2E' },
  hoodieAzul: { base: '#2E6FD6', sleeve: '#2E6FD6', dark: '#2156A8' },
  playeraRaya: { base: '#FFFFFF', sleeve: '#FFFFFF' },
  poloRosa: { base: '#F58FB0', sleeve: '#F58FB0' },
  chivas: { base: '#FFFFFF', sleeve: '#D7263D' },
  azulDiag: { base: '#2E6FD6', sleeve: '#2E6FD6' },
  pumas: { base: '#1D2F6F', sleeve: '#1D2F6F' },
};
export const mangaDe = (outfit) => (OUT[outfit] ? OUT[outfit].sleeve : null);

function Outfit({ g, k }) {
  const o = OUT[k];
  if (!o) return null;
  const W = g.bw;
  const x0 = 100 - W - 3;
  const x1 = 100 + W + 3;
  const yT = g.bodyTop - 3;
  const yN = g.neckY + 1;
  const yH = g.bodyBottom - (g.bodyBottom - g.neckY) * 0.24; // dobladillo
  const alto = yH - yN;
  const det = [];
  if (k === 'jersey') {
    det.push(<Path key="c" d={`M${100 - 13} ${yN - 2} Q100 ${yN + 13} ${100 + 13} ${yN - 2}`} stroke="#D7263D" strokeWidth={4.5} fill="none" strokeLinecap="round" />);
    det.push(<Line key="s1" x1={100 - W} y1={yN + 3} x2={100 - W * 0.55} y2={yN - 3} stroke="#fff" strokeWidth={3} />);
    det.push(<Line key="s2" x1={100 + W} y1={yN + 3} x2={100 + W * 0.55} y2={yN - 3} stroke="#fff" strokeWidth={3} />);
    det.push(<Circle key="e" cx={100} cy={yN + alto * 0.62} r={Math.min(7, alto * 0.2)} fill="none" stroke="#F2C744" strokeWidth={2.4} />);
    det.push(<Circle key="e2" cx={100} cy={yN + alto * 0.62} r={2} fill="#F2C744" />);
  } else if (k === 'sarape') {
    const cols = ['#E0556E', '#F2B705', '#34BC97', '#3FA9F5'];
    const n = 6;
    const bh = (yH - yN + 6) / n;
    for (let i = 0; i < n; i++) det.push(<Rect key={i} x={x0} y={yN - 4 + i * bh} width={x1 - x0} height={bh * 0.62} fill={cols[i % 4]} />);
  } else if (k === 'hoodieRojo' || k === 'hoodieAzul') {
    det.push(<Path key="h" d={`M${100 - 17} ${yN - 3} Q100 ${yN + 11} ${100 + 17} ${yN - 3}`} stroke={o.dark} strokeWidth={5} fill="none" strokeLinecap="round" />);
    det.push(<Rect key="p" x={100 - W * 0.52} y={yH - Math.min(13, alto * 0.36)} width={W * 1.04} height={Math.min(13, alto * 0.36) + 2} rx={5} fill={o.dark} />);
    det.push(<Line key="c1" x1={95} y1={yN + 5} x2={94} y2={yN + alto * 0.42} stroke="#fff" strokeWidth={2} strokeLinecap="round" />);
    det.push(<Line key="c2" x1={105} y1={yN + 5} x2={106} y2={yN + alto * 0.42} stroke="#fff" strokeWidth={2} strokeLinecap="round" />);
  } else if (k === 'playeraRaya') {
    for (let y = yN + 3, i = 0; y < yH; y += 9, i++) det.push(<Rect key={i} x={x0} y={y} width={x1 - x0} height={4} fill="#2E3A8C" />);
  } else if (k === 'poloRosa') {
    det.push(<Path key="l" d={`M100 ${yN + 11} L${100 - 14} ${yN - 3} L${100 - 3} ${yN - 3} Z`} fill="#fff" stroke="#E6A3BA" strokeWidth={1} />);
    det.push(<Path key="r" d={`M100 ${yN + 11} L${100 + 14} ${yN - 3} L${100 + 3} ${yN - 3} Z`} fill="#fff" stroke="#E6A3BA" strokeWidth={1} />);
    det.push(<Line key="p" x1={100} y1={yN + 11} x2={100} y2={yN + alto * 0.7} stroke="#D96F92" strokeWidth={1.6} />);
    det.push(<Circle key="b1" cx={100} cy={yN + alto * 0.4} r={1.8} fill="#fff" />);
    det.push(<Circle key="b2" cx={100} cy={yN + alto * 0.62} r={1.8} fill="#fff" />);
  } else if (k === 'chivas') {
    for (let x = 100 - 40, i = 0; x < x1; x += 16, i++) det.push(<Rect key={i} x={x} y={yT} width={8} height={yH - yT + 8} fill="#D7263D" />);
    det.push(<Path key="c" d={`M${100 - 13} ${yN - 2} Q100 ${yN + 11} ${100 + 13} ${yN - 2}`} stroke="#1D2F6F" strokeWidth={4} fill="none" strokeLinecap="round" />);
  } else if (k === 'azulDiag') {
    det.push(<Path key="d" d={`M${x0} ${yN - 6} L${x0} ${yN + 8} L${x1} ${yH + 4} L${x1} ${yH - 12} Z`} fill="#16233F" />);
    det.push(<Path key="c" d={`M${100 - 12} ${yN - 2} Q100 ${yN + 9} ${100 + 12} ${yN - 2}`} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />);
  } else if (k === 'pumas') {
    det.push(<Path key="v" d={`M${x0} ${yN + 1} L100 ${yN + alto * 0.72} L${x1} ${yN + 1}`} stroke="#E9B93A" strokeWidth={7} fill="none" strokeLinejoin="round" />);
    det.push(<Path key="c" d={`M${100 - 12} ${yN - 2} Q100 ${yN + 9} ${100 + 12} ${yN - 2}`} stroke="#E9B93A" strokeWidth={3} fill="none" strokeLinecap="round" />);
  }
  return (
    <G>
      <Defs>
        <ClipPath id={g.clipId}>
          <Path d={g.bodyD} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${g.clipId})`}>
        <Path d={`M${x0} ${yT} H${x1} V${yH} Q100 ${yH + 7} ${x0} ${yH} Z`} fill={o.base} />
        {det}
        <Path d={`M${x0} ${yH} Q100 ${yH + 7} ${x1} ${yH}`} stroke={g.line} strokeWidth={2} fill="none" opacity={0.55} />
      </G>
      <Path d={g.bodyD} fill="none" stroke={g.line} strokeWidth={SW} strokeLinejoin="round" />
    </G>
  );
}

/* ---------- CUERPO ---------- */
// Un brazo: óvalo girado. Con ropa, el óvalo es la manga y asoma la manita.
export function Brazo({ g, cx, cy, ry, ang, manga, tip = 1 }) {
  const rx = 7.5;
  return (
    <G transform={`rotate(${ang} ${cx} ${cy})`}>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={manga || g.body} stroke={g.line} strokeWidth={SW} />
      {manga && <Circle cx={cx} cy={cy + tip * (ry - rx + 1.5)} r={rx - 0.6} fill={g.body} stroke={g.line} strokeWidth={2.4} />}
    </G>
  );
}

// Alas de mariposa (accesorio): van detrás del cuerpo
export function Alas({ g }) {
  const y = g.E.armY - 6;
  const ala = (s) => (
    <G transform={`translate(${100 + s * (g.bw - 4)} ${y}) scale(${s} 1)`}>
      <Path d="M0 0 C 14 -34 52 -36 54 -10 C 55 6 30 12 0 4 Z" fill="#FFB7E0" stroke="#B06AC0" strokeWidth={2.4} strokeLinejoin="round" />
      <Path d="M0 4 C 22 6 46 14 40 32 C 34 46 8 36 0 10 Z" fill="#C9A7F0" stroke="#B06AC0" strokeWidth={2.4} strokeLinejoin="round" />
      <Circle cx={34} cy={-14} r={5} fill="#fff" opacity={0.75} />
      <Circle cx={24} cy={22} r={3.6} fill="#fff" opacity={0.75} />
    </G>
  );
  return (
    <G>
      {ala(-1)}
      {ala(1)}
    </G>
  );
}

// Colita + patitas + torso (con pancita clara o con ropa)
export function Cuerpo({ g, outfit }) {
  const { E, bw } = g;
  const piel = { fill: g.body, stroke: g.line, strokeWidth: SW };
  const pies = E.pera ? (
    <G>
      <Ellipse cx={100 - bw * 0.62} cy={E.bottom - 1} rx={12} ry={7.5} {...piel} />
      <Ellipse cx={100 + bw * 0.62} cy={E.bottom - 1} rx={12} ry={7.5} {...piel} />
    </G>
  ) : (
    <G>
      <Ellipse cx={100 - bw * 0.52} cy={E.feetY} rx={11} ry={7} {...piel} />
      <Ellipse cx={100 + bw * 0.52} cy={E.feetY} rx={11} ry={7} {...piel} />
    </G>
  );
  const conRopa = !!OUT[outfit];
  return (
    <G>
      <G transform={g.tailT}>
        {CRESTA.map((d) => (
          <Path key={d} d={d} fill={g.gill} stroke={g.line} strokeWidth={2.2 / E.tail} strokeLinejoin="round" />
        ))}
        <Path d={TAIL} fill={g.body} stroke={g.line} strokeWidth={SW / E.tail} strokeLinejoin="round" />
        <Path d="M124 191 C 137 191 147 186 154 176" stroke="#ffffff" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.4} />
      </G>
      {!E.pera && pies}
      <Path d={g.bodyD} fill={g.body} stroke={g.line} strokeWidth={SW} strokeLinejoin="round" />
      {!conRopa && <Ellipse cx={100} cy={g.bellyY} rx={bw * (E.pera ? 0.56 : 0.58)} ry={E.pera ? g.bh * 0.34 : E.bry * 0.63} fill="#ffffff" opacity={0.55} />}
      {conRopa && <Outfit g={g} k={outfit} />}
      {E.pera && pies}
    </G>
  );
}

// pose: 'abajo' (normal) | 'arriba' (nace, amor)
export function Brazos({ g, pose = 'abajo', outfit }) {
  const { E } = g;
  const manga = mangaDe(outfit);
  if (pose === 'arriba') {
    return (
      <G>
        <Brazo g={g} cx={100 - E.armX - 9} cy={E.armY - 15} ry={E.arm + 1} ang={-58} manga={manga} tip={-1} />
        <Brazo g={g} cx={100 + E.armX + 9} cy={E.armY - 15} ry={E.arm + 1} ang={58} manga={manga} tip={-1} />
      </G>
    );
  }
  return (
    <G>
      <Brazo g={g} cx={100 - E.armX} cy={E.armY} ry={E.arm} ang={26} manga={manga} />
      <Brazo g={g} cx={100 + E.armX} cy={E.armY} ry={E.arm} ang={-26} manga={manga} />
    </G>
  );
}

// Comiendo: manzanita mordida + el brazo que la sostiene
export function Comiendo({ g, outfit }) {
  const b = g.bManzana;
  return (
    <G>
      <G transform={`translate(0 ${g.comeDy})`}>
        <Circle cx={100} cy={137} r={11} fill="#F26D6D" stroke="#B8404A" strokeWidth={2.4} />
        <Circle cx={109} cy={129} r={5} fill={g.pal.body} />
        <Path d="M100 127 Q101 121 105 119" stroke="#7A4B2A" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <Path d="M101 122 Q94 116 89 121 Q95 125 101 122 Z" fill="#6CC28A" stroke="#3E9460" strokeWidth={1.4} />
        <Circle cx={95} cy={133} r={2.2} fill="#fff" opacity={0.6} />
        <Circle cx={74} cy={122} r={1.8} fill="#F7B26B" />
        <Circle cx={128} cy={125} r={1.5} fill="#F7B26B" />
        <Circle cx={122} cy={119} r={1.2} fill="#F7B26B" />
      </G>
      <Brazo g={g} cx={b.cx} cy={b.cy} ry={b.ry} ang={b.ang} manga={mangaDe(outfit)} />
    </G>
  );
}

// El brazo que se soba la pancita (en Axo.js gira desde el hombro)
export function BrazoSoba({ g, outfit }) {
  const b = g.bSoba;
  return <Brazo g={g} cx={b.cx} cy={b.cy} ry={b.ry} ang={b.ang} manga={mangaDe(outfit)} />;
}

/* ---------- CABEZA ---------- */
const petalo = (len, wd) =>
  `M0 ${-wd} C ${len * 0.35} ${-wd * 1.75} ${len * 0.92} ${-wd * 1.35} ${len} 0 C ${len * 0.92} ${wd * 1.35} ${len * 0.35} ${wd * 1.75} 0 ${wd} Z`;

export function Branquias({ g, side }) {
  const t = side === 'left' ? 'translate(40,84) scale(-1,1)' : 'translate(160,84)';
  const k = g.E.gk;
  const hojas = g.E.hojas4
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
    <G transform={g.headT}>
      <G transform={t}>
        {hojas.map((p) => (
          <G key={p.r} transform={`rotate(${p.r})`}>
            <Path d={petalo(p.len * k, p.wd)} fill={g.gill} stroke={g.line} strokeWidth={2.6} strokeLinejoin="round" />
            <Path d={`M7 0 L ${p.len * k * 0.7} 0`} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
          </G>
        ))}
      </G>
    </G>
  );
}

export function CabezaBase({ g, mood }) {
  const come = mood === 'come';
  return (
    <G transform={g.headT}>
      <Path d={HEAD} fill={g.body} stroke={g.line} strokeWidth={SW / g.E.s} strokeLinejoin="round" />
      <Path d="M62 58 C74 48 90 45 104 46" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.45} />
      <G fill={g.pal.gill} opacity={0.4}>
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

export function Ojos({ g, mood }) {
  let c;
  if (mood === 'come' || mood === 'amor') {
    c = (
      <G>
        <Path d={arco(70, 95)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <Path d={arco(130, 95)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      </G>
    );
  } else if (mood === 'triste') {
    c = (
      <G>
        <Path d="M58 80 L77 75" stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <Path d="M123 75 L142 80" stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <OjoGrande cx={70} cy={95} r={12} />
        <OjoGrande cx={130} cy={95} r={12} />
        <Ellipse cx={70} cy={104} rx={7.5} ry={2.4} fill="#BFE6FF" opacity={0.8} />
        <Ellipse cx={130} cy={104} rx={7.5} ry={2.4} fill="#BFE6FF" opacity={0.8} />
      </G>
    );
  } else {
    // feliz y nace: ojos grandes con brillos
    c = (
      <G>
        <OjoGrande cx={70} cy={93} />
        <OjoGrande cx={130} cy={93} />
      </G>
    );
  }
  return <G transform={g.headT}>{c}</G>;
}

export function Boca({ g, mood }) {
  let c;
  if (mood === 'nace') {
    c = (
      <G>
        <Path d="M88 104 Q100 101 112 104 Q111 121 100 121 Q89 121 88 104 Z" fill={MOUTH_IN} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
        <Ellipse cx={100} cy={116.5} rx={6.5} ry={3.4} fill={TONGUE} />
      </G>
    );
  } else if (mood === 'amor') {
    c = (
      <G>
        <Path d="M91 105 Q100 103.5 109 105 Q108 116 100 116 Q92 116 91 105 Z" fill={MOUTH_IN} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <Ellipse cx={100} cy={113} rx={4.6} ry={2.4} fill={TONGUE} />
      </G>
    );
  } else if (mood === 'come') {
    c = <Ellipse cx={100} cy={109.5} rx={5.4} ry={4.6} fill={MOUTH_IN} stroke={INK} strokeWidth={2.2} />;
  } else if (mood === 'triste') {
    c = <Path d="M93 112 Q100 105.5 107 112" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />;
  } else {
    c = <Path d="M90 106 Q95 113.5 100 106 Q105 113.5 110 106" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  return <G transform={g.headT}>{c}</G>;
}

/* ---------- ACCESORIOS (cabeza) y ESTILO ---------- */
const PELUCHE = '#FFFFFF';
const PELUCHE_SOMBRA = '#EFEAF3';
const PELUCHE_BORDE = '#B7AEC2';
const PELUCHE_ROSA = '#FFB3CB';

// Carita bordada del gorro de peluche: ojitos ovalados con brillo y boquita.
function Carita({ y, gato }) {
  return (
    <G>
      <Ellipse cx={88} cy={y} rx={2.9} ry={3.9} fill={INK} />
      <Ellipse cx={112} cy={y} rx={2.9} ry={3.9} fill={INK} />
      <Circle cx={88.9} cy={y - 1.5} r={1} fill="#fff" />
      <Circle cx={112.9} cy={y - 1.5} r={1} fill="#fff" />
      <Ellipse cx={78} cy={y + 5.5} rx={4} ry={2.2} fill={PELUCHE_ROSA} opacity={0.75} />
      <Ellipse cx={122} cy={y + 5.5} rx={4} ry={2.2} fill={PELUCHE_ROSA} opacity={0.75} />
      {gato ? (
        <Path d={`M97.6 ${y + 2.4} L102.4 ${y + 2.4} L100 ${y + 5} Z`} fill="#FF8FB0" stroke="#FF8FB0" strokeWidth={0.8} strokeLinejoin="round" />
      ) : (
        <Ellipse cx={100} cy={y + 3.2} rx={2.2} ry={1.5} fill="#FF8FB0" />
      )}
      <Path d={`M94.5 ${y + 6.2} Q97.2 ${y + 9.4} 100 ${y + 6.4} Q102.8 ${y + 9.4} 105.5 ${y + 6.2}`} stroke={INK} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {gato && (
        <Path d={`M72 ${y + 1} L64 ${y - 0.5} M72 ${y + 4} L64.5 ${y + 5.5} M128 ${y + 1} L136 ${y - 0.5} M128 ${y + 4} L135.5 ${y + 5.5}`} stroke={INK} strokeWidth={1} strokeLinecap="round" opacity={0.55} />
      )}
    </G>
  );
}

// Una tira larga del gorro que cuelga y termina en patita con almohadillas.
function Tira({ x }) {
  return (
    <G>
      <Path d={`M${x - 9.5} 96 L${x - 9.5} 157 C${x - 16} 161 ${x - 16} 181 ${x} 181 C${x + 16} 181 ${x + 16} 161 ${x + 9.5} 157 L${x + 9.5} 96 Z`} fill={PELUCHE} stroke={PELUCHE_BORDE} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d={`M${x - 5} 124 L${x - 5} 151`} stroke={PELUCHE_SOMBRA} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={x} cy={172.5} rx={5.6} ry={4.4} fill={PELUCHE_ROSA} />
      <Circle cx={x - 6.4} cy={165.4} r={2.2} fill={PELUCHE_ROSA} />
      <Circle cx={x} cy={163.4} r={2.2} fill={PELUCHE_ROSA} />
      <Circle cx={x + 6.4} cy={165.4} r={2.2} fill={PELUCHE_ROSA} />
    </G>
  );
}

// Parte del accesorio que va DETRÁS de la cabeza y las branquias (las tiras del gorro).
export function AccesorioAtras({ g, k }) {
  if (k !== 'conejo' && k !== 'gato') return null;
  return (
    <G transform={g.headT}>
      <Tira x={47} />
      <Tira x={153} />
    </G>
  );
}

export function Accesorio({ g, k, estilo }) {
  const partes = [];
  if (estilo === 'galan') {
    partes.push(
      <G key="galan">
        <Path d="M56 77 Q68 69 82 75" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M118 75 Q132 69 144 77" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M86 44 C84 28 104 22 116 32 C108 31 103 35 106 44 C100 40 92 40 86 44 Z" fill={g.gill} stroke={g.line} strokeWidth={2.2} strokeLinejoin="round" />
      </G>
    );
  }
  if (k === 'flor') {
    const cx = 62;
    const cy = 52;
    partes.push(
      <G key="flor">
        {[0, 72, 144, 216, 288].map((a) => (
          <Circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 7.5} cy={cy + Math.sin((a * Math.PI) / 180) * 7.5} r={6.4} fill="#FF9EC0" stroke="#D96A92" strokeWidth={1.4} />
        ))}
        <Circle cx={cx} cy={cy} r={5} fill="#FFD45C" stroke="#D9A21E" strokeWidth={1.2} />
      </G>
    );
  } else if (k === 'monito') {
    partes.push(
      <G key="monito" transform="translate(136 50) rotate(14)">
        <Path d="M0 0 L-18 -11 Q-22 0 -18 11 Z" fill="#FF6F9C" stroke="#C9446E" strokeWidth={2} strokeLinejoin="round" />
        <Path d="M0 0 L18 -11 Q22 0 18 11 Z" fill="#FF6F9C" stroke="#C9446E" strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={0} cy={0} r={5} fill="#FF8FB5" stroke="#C9446E" strokeWidth={2} />
      </G>
    );
  } else if (k === 'gorra') {
    partes.push(
      <G key="gorra">
        <Path d="M128 58 C152 54 178 60 181 71 C160 70 142 70 126 67 Z" fill="#2E8AD8" stroke="#1F5F9C" strokeWidth={2.4} strokeLinejoin="round" />
        <Path d="M48 68 C46 28 154 28 152 68 C128 59 72 59 48 68 Z" fill="#3FA9F5" stroke="#1F5F9C" strokeWidth={2.6} strokeLinejoin="round" />
        <Path d="M100 38 L100 62" stroke="#1F5F9C" strokeWidth={1.4} opacity={0.5} />
        <Circle cx={100} cy={37} r={3.4} fill="#fff" stroke="#1F5F9C" strokeWidth={1.4} />
      </G>
    );
  } else if (k === 'fiesta') {
    partes.push(
      <G key="fiesta">
        <Path d="M100 5 L78 47 Q100 55 122 47 Z" fill="#FFB347" stroke="#C9781E" strokeWidth={2.4} strokeLinejoin="round" />
        <Path d="M92 20 L112 29 M86 32 L117 40" stroke="#FF6F9C" strokeWidth={3.4} strokeLinecap="round" />
        <Circle cx={100} cy={6} r={5.5} fill="#FF6F9C" stroke="#C9446E" strokeWidth={1.6} />
      </G>
    );
  } else if (k === 'corona') {
    partes.push(
      <G key="corona">
        <Path d="M74 49 L69 22 L86 36 L100 15 L114 36 L131 22 L126 49 Q100 56 74 49 Z" fill="#FFD23F" stroke="#C9920E" strokeWidth={2.6} strokeLinejoin="round" />
        <Circle cx={100} cy={40} r={3.6} fill="#FF6F9C" />
        <Circle cx={84} cy={43} r={2.6} fill="#7C5CFF" />
        <Circle cx={116} cy={43} r={2.6} fill="#34BC97" />
      </G>
    );
  } else if (k === 'conejo' || k === 'gato') {
    const conejo = k === 'conejo';
    const st = { fill: PELUCHE, stroke: PELUCHE_BORDE, strokeWidth: 2.4, strokeLinejoin: 'round' };
    partes.push(
      <G key={k}>
        {conejo ? (
          <G>
            {/* orejita parada */}
            <Ellipse cx={74} cy={21} rx={9.5} ry={19} transform="rotate(-9 74 21)" {...st} />
            <Ellipse cx={74} cy={22} rx={4.4} ry={12.5} fill={PELUCHE_ROSA} transform="rotate(-9 74 22)" />
            {/* orejita doblada */}
            <Path d="M114 38 C112 22 118 8 132 6 C148 4 163 13 167 28 C169 36 160 40 155 34 C151 27 146 23 140 24 C135 25 134 31 135 38 Z" {...st} />
            <Path d="M140 13 C149 13 157 19 160 28 C155 23 148 19 139 19 Z" fill={PELUCHE_ROSA} />
            <Path d="M122 30 C122 20 126 13 133 12" stroke={PELUCHE_SOMBRA} strokeWidth={3} fill="none" strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Path d="M50 52 C47 34 51 18 57 11 C69 15 82 25 92 36 Z" {...st} />
            <Path d="M57 42 C55 32 57 24 60 20 C67 23 74 29 80 36 Z" fill={PELUCHE_ROSA} />
            <G transform="translate(200 0) scale(-1 1)">
              <Path d="M50 52 C47 34 51 18 57 11 C69 15 82 25 92 36 Z" {...st} />
              <Path d="M57 42 C55 32 57 24 60 20 C67 23 74 29 80 36 Z" fill={PELUCHE_ROSA} />
            </G>
          </G>
        )}
        {/* gorro de peluche: cubre la cabeza por arriba y a los lados */}
        <Path d="M29 94 C23 49 57 28 100 28 C143 28 177 49 171 94 C161 74 135 67 100 67 C65 67 39 74 29 94 Z" {...st} strokeWidth={2.6} />
        <Path d="M33 87 C44 71 68 63 100 63 C132 63 156 71 167 87" stroke={PELUCHE_SOMBRA} strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d="M52 44 C62 36 76 33 90 32" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
        <Carita y={46} gato={!conejo} />
      </G>
    );
  }
  if (!partes.length) return null;
  return <G transform={g.headT}>{partes}</G>;
}

/* ---------- AXO QUIETO (un solo SVG, sin animación) ---------- */
// Para miniaturas, listas y juegos: mucho más ligero que el Axo animado.
export function AxoMini({ paletteKey = 'durazno', mood = 'feliz', evo = 'cria', chub = 1, accessory = 'ninguno', outfit = 'ninguno', estilo = 'clasico', size = 60, style }) {
  const g = geom({ paletteKey, evo, chub });
  const w = size;
  const h = size * (VB_H / VB_W);
  const come = mood === 'come';
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} style={style}>
      <Gradients />
      <Ellipse cx={100} cy={208} rx={46 + (g.bw - 31) * 2} ry={7} fill="#00000012" />
      {accessory === 'mariposa' && <Alas g={g} />}
      <Cuerpo g={g} outfit={outfit} />
      {!come && <Brazos g={g} pose={mood === 'nace' || mood === 'amor' ? 'arriba' : 'abajo'} outfit={outfit} />}
      <AccesorioAtras g={g} k={accessory} />
      <Branquias g={g} side="left" />
      <Branquias g={g} side="right" />
      <CabezaBase g={g} mood={mood} />
      <Ojos g={g} mood={mood} />
      <Boca g={g} mood={mood} />
      <Accesorio g={g} k={accessory} estilo={estilo} />
      {come && <Comiendo g={g} outfit={outfit} />}
      {come && <BrazoSoba g={g} outfit={outfit} />}
    </Svg>
  );
}

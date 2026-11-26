import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Ellipse, Circle, Path, G, Rect, Line, Defs, ClipPath, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { PALETTES } from '../theme';
import { VESTIDOS } from '../data';

// Piezas de dibujo de Axo (sin animación). Las usan:
//  - Axo.js      → versión animada por capas
//  - AxoMini     → versión quieta y ligera (un solo SVG) para listas y miniaturas
//
// El CUERPO es el del Axo original de la PWA (sin contorno, colita enroscada, pequitas).
// La CARITA es la nueva (ojos grandes con brillo y cachetes rosas).
// Las tres etapas son el mismo dibujo en distinto tamaño; el adulto lleva aura dorada.
//
// El dibujo original está hecho en un lienzo de 200 x 240 con el piso en y=232.
// Aquí el lienzo es de 200 x 220, así que todo pasa por la transformación g.T.

export const VB_W = 200;
export const VB_H = 220;

export const INK = '#4A2F35'; // ojos y boca
const MOUTH_IN = '#B8475E';
const TONGUE = '#F59AB0';
const BLUSH = '#F58FA8'; // cachetes rosas siempre, sin importar el color de Axo

const K0 = 220 / 240; // del lienzo original al de la app
const PISO = 232; // piso en el dibujo original
const SUELO = 220 - (240 - PISO) * K0; // piso en el lienzo de la app
const ESCALA = { cria: 0.86, joven: 0.93, adulto: 1 }; // la diferencia grande de tamaño la pone cada pantalla

// La carita crece con Axo: de bebé tiene ojos enormes y bajos, cachetes grandes y boquita chiquita;
// de adulto los ojos son más chicos y altos, con cachetes discretos y sonrisa amplia.
const CARAS = {
  cria: { r: 14.5, y: 97, dx: 31, brx: 13.5, bry: 8.5, bop: 0.82, by: 112 },
  joven: { r: 12.5, y: 93.5, dx: 30, brx: 11.5, bry: 7, bop: 0.78, by: 109.5 },
  adulto: { r: 10.5, y: 90, dx: 28, brx: 10, bry: 5.8, bop: 0.62, by: 107 },
};

const FROND = 'M0 -6 C 20 -11 36 -10 44 -5 C 50 -2 50 2 44 5 C 36 10 20 11 0 6 C 4 2 4 -2 0 -6 Z';
const MANCHAS = [[72, 72, 3], [88, 62, 2.4], [112, 64, 3.2], [126, 80, 2.6], [80, 102, 3], [118, 106, 2.8], [100, 90, 2.4], [90, 122, 3], [112, 130, 2.6], [100, 150, 2.8], [78, 140, 2.4], [122, 146, 2.4], [64, 86, 2.2], [134, 96, 2.2]];
const ESTRELLAS = [[70, 62, 1.6], [118, 56, 2.1], [132, 84, 1.4], [64, 96, 1.7], [92, 54, 1.4], [138, 106, 1.5], [58, 76, 1.2], [108, 72, 1.2], [78, 126, 1.7], [122, 136, 1.9], [96, 162, 1.5], [128, 158, 1.2], [74, 152, 1.3], [100, 114, 1.4]];
const DESTELLOS = [[118, 56, 4], [96, 162, 3.4], [78, 126, 3]];
const CORTE = 112; // lo de arriba de esta altura es cabeza; lo de abajo, cuerpo
const destello = (x, y, r, f = 0.28) =>
  `M${x} ${y - r} L${x + r * f} ${y - r * f} L${x + r} ${y} L${x + r * f} ${y + r * f} L${x} ${y + r} L${x - r * f} ${y + r * f} L${x - r} ${y} L${x - r * f} ${y - r * f} Z`;

function oscurecer(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export function coloresAxo(paletteKey) {
  const pal = PALETTES[paletteKey] || PALETTES.durazno;
  const esp = { dorado: ['url(#g)', 'url(#gg)'], galaxia: ['url(#gx)', 'url(#gxg)'], arcoiris: ['url(#rb)', 'url(#rbg)'], luciernaga: ['url(#lu)', 'url(#lug)'], perla: ['url(#pe)', 'url(#peg)'] }[paletteKey];
  const body = esp ? esp[0] : pal.body;
  const gill = esp ? esp[1] : pal.gill;
  const line = paletteKey === 'perla' ? '#B9A7E8' : paletteKey === 'galaxia' ? '#1B1140' : paletteKey === 'albino' ? '#B07F2E' : oscurecer(pal.gill, 0.62);
  return { pal, body, gill, line };
}

const ARCO = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'];

export function Gradients() {
  return (
    <Defs>
      <LinearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
        <Stop offset="0" stopColor="#FFF8E1" />
        <Stop offset="0.38" stopColor="#FCE196" />
        <Stop offset="0.72" stopColor="#F5B041" />
        <Stop offset="1" stopColor="#C98328" />
      </LinearGradient>
      <LinearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FCE196" />
        <Stop offset="1" stopColor="#E09B2D" />
      </LinearGradient>
      <RadialGradient id="gx" cx="0.4" cy="0.32" r="0.95">
        <Stop offset="0" stopColor="#7B57D6" />
        <Stop offset="0.5" stopColor="#3B2A7A" />
        <Stop offset="1" stopColor="#190F3C" />
      </RadialGradient>
      <RadialGradient id="gxg" cx="0.5" cy="0.3" r="0.9">
        <Stop offset="0" stopColor="#9B7BFF" />
        <Stop offset="1" stopColor="#4B2E9E" />
      </RadialGradient>
      <RadialGradient id="pe" cx="0.38" cy="0.3" r="0.95">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.55" stopColor="#F6F2FF" />
        <Stop offset="1" stopColor="#E3DAF7" />
      </RadialGradient>
      <LinearGradient id="peg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#8FEDE0" />
        <Stop offset="0.5" stopColor="#C9B3F2" />
        <Stop offset="1" stopColor="#FBB6CE" />
      </LinearGradient>
      <LinearGradient id="mo" gradientUnits="userSpaceOnUse" x1="40" y1="44" x2="170" y2="196">
        <Stop offset="0" stopColor="#F6EBDD" />
        <Stop offset="0.3" stopColor="#F6EBDD" />
        <Stop offset="0.3" stopColor="#E9B896" />
        <Stop offset="0.55" stopColor="#E9B896" />
        <Stop offset="0.55" stopColor="#F6EBDD" />
        <Stop offset="0.75" stopColor="#F6EBDD" />
        <Stop offset="0.75" stopColor="#B98A6A" />
        <Stop offset="1" stopColor="#B98A6A" />
      </LinearGradient>
      <LinearGradient id="mog" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#C98E63" />
        <Stop offset="0.5" stopColor="#F0D3B5" />
        <Stop offset="1" stopColor="#C98E63" />
      </LinearGradient>
      <RadialGradient id="lu" cx="0.45" cy="0.4" r="0.8">
        <Stop offset="0" stopColor="#F3FFD0" />
        <Stop offset="0.55" stopColor="#9BEA8C" />
        <Stop offset="1" stopColor="#35C96B" />
      </RadialGradient>
      <LinearGradient id="lug" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#6CF08A" />
        <Stop offset="1" stopColor="#1FA85A" />
      </LinearGradient>
      <LinearGradient id="rb" gradientUnits="userSpaceOnUse" x1="100" y1="44" x2="100" y2="196">
        {ARCO.map((c, i) => [<Stop key={`a${i}`} offset={i / 6} stopColor={c} />, <Stop key={`b${i}`} offset={(i + 1) / 6} stopColor={c} />])}
      </LinearGradient>
      <LinearGradient id="rbg" x1="0" y1="0" x2="1" y2="0">
        {ARCO.map((c, i) => (
          <Stop key={c} offset={i / 5} stopColor={c} />
        ))}
      </LinearGradient>
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

// Toda la geometría que depende del color, la etapa y qué tan llenito está (chub 0..1)
export function geom({ paletteKey = 'durazno', evo = 'cria', chub = 1 }) {
  const col = coloresAxo(paletteKey);
  const stage = evo === 'mistico' ? 'adulto' : ESCALA[evo] ? evo : 'cria';
  const S = ESCALA[stage];
  const k = K0 * S;
  const c = Math.max(0, Math.min(1, chub));
  const tRx = 30 + 12 * c; // ancho del torso (cambia con el peso)
  const bRx = 15 + 8 * c; // pancita
  const T = `translate(100 ${SUELO}) scale(${k}) translate(-100 -${PISO})`;
  return {
    ...col,
    paletteKey,
    stage,
    S,
    k,
    tRx,
    bRx,
    T,
    headT: T,
    // la carita nueva está dibujada para una cabeza más ancha: se encoge y se centra en la cabeza original
    faceT: `${T} translate(100 86) scale(0.82) translate(-100 -89.5)`,
    // del dibujo original al lienzo de la app (para los puntos de giro de las animaciones)
    X: (x) => 100 + (x - 100) * k,
    Y: (y) => SUELO + (y - PISO) * k,
    sombra: { cy: SUELO + 1, rx: 46 * k, ry: 7 * k },
    cara: CARAS[stage],
    // hombros: pegados a la orilla del torso (cambian con lo ancho del cuerpo)
    hombroD: { x: 100 + tRx * 0.76, y: 139 },
    hombroI: { x: 100 - tRx * 0.76, y: 139 },
    clipId: `c${stage}${Math.round(c * 100)}`,
  };
}

/* ---------- AURA (adulto: dorada · místico: morada con destellos) ---------- */
export function Aura({ g, evo, dorada }) {
  if (dorada)
    return (
      <G transform={g.T}>
        <Circle cx={100} cy={118} r={92} fill="#FFD98A" opacity={0.2} />
        <Circle cx={100} cy={118} r={78} fill="#FFE9A8" opacity={0.3} />
        {[[36, 60, 6], [164, 74, 5.4], [44, 160, 5], [158, 152, 6], [100, 28, 7], [24, 116, 4.6], [176, 120, 4.6]].map((d) => (
          <Path key={d.join()} d={destello(d[0], d[1], d[2], 0.3)} fill="#FFF3C4" opacity={0.95} />
        ))}
      </G>
    );
  if (evo !== 'adulto' && evo !== 'mistico') return null;
  const mistico = evo === 'mistico';
  return (
    <G transform={g.T}>
      <Circle cx={100} cy={118} r={80} fill={mistico ? '#9B7BFF' : '#FFE08A'} opacity={mistico ? 0.22 : 0.16} />
      {mistico &&
        [[40, 66, 5], [160, 78, 6], [48, 162, 5], [156, 150, 5], [100, 34, 7], [28, 118, 4], [172, 116, 4]].map((s) => (
          <Path key={s.join()} d={destello(s[0], s[1], s[2], 0.3)} fill="#FFF6C8" opacity={0.95} />
        ))}
    </G>
  );
}

/* ---------- ALAS DE MARIPOSA (van detrás de todo) ---------- */
export function Alas({ g }) {
  return (
    <G transform={g.T}>
      <G>
        <Path d="M144 126 C 156 88, 184 68, 197 88 C 204 100, 190 128, 156 140 C 146 144, 142 137, 144 126 Z" fill="#A98EDB" stroke="#6E54B0" strokeWidth="2.5" />
        <Path d="M150 142 C 166 150, 189 164, 187 186 C 186 202, 162 200, 152 184 C 146 174, 147 156, 150 142 Z" fill="#BBA2E6" stroke="#6E54B0" strokeWidth="2.5" />
        <Circle cx="178" cy="100" r="8" fill="#EFE7FF" stroke="#6E54B0" strokeWidth="2" />
        <Circle cx="170" cy="180" r="5" fill="#EFE7FF" stroke="#6E54B0" strokeWidth="1.8" />
      </G>
      <G transform="translate(200,0) scale(-1,1)">
        <Path d="M144 126 C 156 88, 184 68, 197 88 C 204 100, 190 128, 156 140 C 146 144, 142 137, 144 126 Z" fill="#A98EDB" stroke="#6E54B0" strokeWidth="2.5" />
        <Path d="M150 142 C 166 150, 189 164, 187 186 C 186 202, 162 200, 152 184 C 146 174, 147 156, 150 142 Z" fill="#BBA2E6" stroke="#6E54B0" strokeWidth="2.5" />
        <Circle cx="178" cy="100" r="8" fill="#EFE7FF" stroke="#6E54B0" strokeWidth="2" />
        <Circle cx="170" cy="180" r="5" fill="#EFE7FF" stroke="#6E54B0" strokeWidth="1.8" />
      </G>
    </G>
  );
}

/* ---------- CUERPO: colita enroscada y torso ---------- */
export function Cuerpo({ g }) {
  const { paletteKey, pal } = g;
  return (
    <G transform={g.T}>
      <Path d="M104 152 C 130 168 160 168 162 196 C 164 222 134 232 120 215 C 135 215 149 206 145 189 C 139 171 116 161 100 156 Z" fill={g.body} />
      <Path d="M112 160 C 132 173 152 175 152 195 C 152 208 137 213 129 205 C 140 201 144 192 140 184 C 134 172 119 166 107 163 Z" fill="#ffffff" opacity={0.28} />
      <Ellipse cx={100} cy={142} rx={g.tRx} ry={46} fill={g.body} />
      {(paletteKey === 'salvaje' || paletteKey === 'cobre') && (
        <G fill={pal.gill} opacity={paletteKey === 'salvaje' ? 0.5 : 0.4}>
          {MANCHAS.filter((s) => s[1] > CORTE).map((s) => (
            <Circle key={s.join()} cx={s[0]} cy={s[1]} r={s[2]} />
          ))}
        </G>
      )}
      {paletteKey === 'galaxia' && <Cielo abajo />}
      <Detalle g={g} abajo />
    </G>
  );
}

function Cielo({ abajo }) {
  // fuera de la carita, para que no compitan con los ojos
  const cara = (s) => s[0] > 66 && s[0] < 134 && s[1] > 66 && s[1] < 108;
  const en = (s) => (abajo ? s[1] > CORTE : s[1] <= CORTE && !cara(s));
  return (
    <G>
      {ESTRELLAS.filter(en).map((s) => (
        <Circle key={s.join()} cx={s[0]} cy={s[1]} r={s[2]} fill="#FFFFFF" opacity={0.92} />
      ))}
      {DESTELLOS.filter(en).map((s) => (
        <Path key={s.join()} d={destello(s[0], s[1], s[2])} fill="#FFF6C8" opacity={0.95} />
      ))}
    </G>
  );
}

// Detalles que distinguen cada skin raro: destellos plateados, manchas, brillo verde o tornasol.
const PLATA = [[76, 64, 4.4], [122, 58, 3.6], [134, 92, 3], [84, 118, 3.8], [118, 138, 3.4], [94, 158, 3]];
const PARCHES = [[76, 68, 17, 12, -18, 1], [126, 94, 15, 11, 14, 0], [88, 132, 19, 13, -8, 1], [128, 152, 14, 10, 20, 0], [100, 108, 13, 9, 30, 0], [70, 158, 12, 8, -24, 1]];
const LUCES = [[80, 64, 4], [122, 74, 3.2], [70, 104, 3.6], [128, 128, 4.2], [96, 152, 3.4], [112, 170, 2.8]];
function Detalle({ g, abajo }) {
  const { paletteKey, pal } = g;
  const en = (s) => (abajo ? s[1] > CORTE : s[1] <= CORTE);
  if (paletteKey === 'axantico')
    return (
      <G>
        {PLATA.filter(en).map((s) => (
          <Path key={s.join()} d={destello(s[0], s[1], s[2])} fill="#FFFFFF" opacity={0.9} />
        ))}
        {!abajo && <Ellipse cx={82} cy={62} rx={24} ry={12} fill="#FFFFFF" opacity={0.55} transform="rotate(-22 82 62)" />}
        {abajo && <Ellipse cx={92} cy={140} rx={18} ry={9} fill="#FFFFFF" opacity={0.4} transform="rotate(-20 92 140)" />}
      </G>
    );
  if (paletteKey === 'mosaico')
    return (
      <G>
        {PARCHES.filter((s) => en([s[0], s[1]])).map((s) => (
          <Ellipse key={s.join()} cx={s[0]} cy={s[1]} rx={s[2]} ry={s[3]} fill={s[5] ? pal.gill : '#8A5B3C'} opacity={s[5] ? 0.85 : 0.6} transform={`rotate(${s[4]} ${s[0]} ${s[1]})`} />
        ))}
      </G>
    );
  if (paletteKey === 'luciernaga')
    return (
      <G>
        {LUCES.filter(en).map((s) => (
          <G key={s.join()}>
            <Circle cx={s[0]} cy={s[1]} r={s[2] * 2.1} fill="#D6FF8A" opacity={0.3} />
            <Circle cx={s[0]} cy={s[1]} r={s[2]} fill="#F4FFD6" opacity={0.95} />
          </G>
        ))}
      </G>
    );
  if (paletteKey === 'obsidiana')
    return (
      <G>
        {!abajo && (
          <>
            <Path d="M62 78 L92 50 L104 58 L70 92 Z" fill="#FFFFFF" opacity={0.14} />
            <Path d="M118 56 L134 72 L126 86 L110 66 Z" fill="#B794F4" opacity={0.3} />
          </>
        )}
        {abajo && <Path d="M80 128 L104 116 L112 128 L86 146 Z" fill="#B794F4" opacity={0.22} />}
        {[[84, 62, 3.4], [126, 94, 2.8], [92, 140, 3], [120, 158, 2.4]].filter(en).map((s) => (
          <Path key={s.join()} d={destello(s[0], s[1], s[2])} fill="#E9D8FD" opacity={0.95} />
        ))}
      </G>
    );
  if (paletteKey === 'perla')
    return (
      <G>
        {!abajo && (
          <>
            <Ellipse cx={84} cy={66} rx={21} ry={10} fill="#FFFFFF" opacity={0.75} transform="rotate(-22 84 66)" />
            <Ellipse cx={118} cy={98} rx={16} ry={9} fill="#A7E8E0" opacity={0.35} transform="rotate(16 118 98)" />
            <Ellipse cx={74} cy={100} rx={14} ry={8} fill="#F3B9D4" opacity={0.35} transform="rotate(-12 74 100)" />
          </>
        )}
        {abajo && (
          <>
            <Ellipse cx={112} cy={136} rx={18} ry={10} fill="#BFE9FF" opacity={0.35} transform="rotate(18 112 136)" />
            <Ellipse cx={88} cy={160} rx={15} ry={9} fill="#F6C9E4" opacity={0.35} transform="rotate(-14 88 160)" />
          </>
        )}
        {[[78, 60, 3], [126, 86, 2.4], [96, 150, 2.8]].filter(en).map((s) => (
          <Path key={s.join()} d={destello(s[0], s[1], s[2])} fill="#FFFFFF" opacity={0.95} />
        ))}
      </G>
    );
  return null;
}

/* ---------- BRACITOS (como en el ícono original: dos rayitas y una manita de tres deditos) ---------- */
// Con ropa, el bracito es la manga: toma el color de la tela y solo la manita queda del color de Axo.
const TELA = { jersey: '#006847', sarape: '#F3E2C7', hoodieRojo: '#D7263D', hoodieAzul: '#2E6FD6', playeraRaya: '#F7F7F7', poloRosa: '#F3A6BE', chivas: '#FFFFFF', azulDiag: '#5FB4E4', pumas: '#FFFFFF' };

// Va del hombro (pegado a la orilla del cuerpo, sin rayita de ese lado) hasta la manita.
// Manga de volante del vestido (se dibuja en el eje del bracito: x=0 es el hombro)
function MangaVestido({ v }) {
  return (
    <G>
      <Path d="M-5 -10 Q 6 -13 13 -11 Q 18 -16 22 -11 Q 27 -6 22 -1 Q 28 4 22 8 Q 24 14 17 12 Q 12 16 7 11 Q -3 12 -5 9 Z" fill={v.base} stroke={v.dark} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M13 -10 Q 19 0 12 11" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
      <Path d="M8 -9 Q 12 0 7 10" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.6} />
    </G>
  );
}

function Bracito({ g, hombro, mano, outfit }) {
  const dx = mano.x - hombro.x;
  const dy = mano.y - hombro.y;
  const L = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const m = L - 7; // donde empieza la manita
  const tela = TELA[outfit];
  const raya = { stroke: tela ? '#00000038' : g.pal.gill, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const manita = `M${m} -5 Q${L - 5.5} -8.6 ${L - 1.5} -6.6 Q${L + 2.6} -5.4 ${L + 0.4} -2.3 Q${L + 4.6} 0 ${L + 0.4} 2.3 Q${L + 2.6} 5.4 ${L - 1.5} 6.6 Q${L - 5.5} 8.6 ${m} 5`;
  return (
    <G transform={`translate(${hombro.x} ${hombro.y}) rotate(${ang})`}>
      <Path d={`M0 -8 Q${L / 2} -6.2 ${m} -5 L${m} 5 Q${L / 2} 6.2 0 8 Z`} fill={tela || g.body} />
      <Path d={`M0 -8 Q${L / 2} -6.2 ${m} -5`} {...raya} />
      <Path d={`M${m} 5 Q${L / 2} 6.2 0 8`} {...raya} />
      {outfit && outfit.startsWith('vestido_') && <MangaVestido v={VESTIDOS[outfit.slice(8)] || VESTIDOS.rosa} />}
      <Path d={`${manita} Z`} fill={g.body} />
      <Path d={manita} stroke={g.pal.gill} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

// Bracitos de siempre (uno en el pecho y otro abajo, como en la app original) o levantados (amor / recién nacido)
function Brazos({ g, pose = 'abajo', outfit }) {
  const i = g.hombroI;
  const d = g.hombroD;
  if (pose === 'arriba') {
    return (
      <G>
        <Bracito g={g} hombro={{ x: i.x + 4, y: 134 }} mano={{ x: i.x - 15, y: 113 }} outfit={outfit} />
        <Bracito g={g} hombro={{ x: d.x - 4, y: 134 }} mano={{ x: d.x + 15, y: 113 }} outfit={outfit} />
      </G>
    );
  }
  return (
    // postura de siempre: una manita en el pecho y la otra abajo, sobre la pancita
    <G>
      <Bracito g={g} hombro={{ x: i.x, y: 129 }} mano={{ x: 89, y: 139 }} outfit={outfit} />
      <Bracito g={g} hombro={{ x: d.x, y: 148 }} mano={{ x: 113, y: 167 }} outfit={outfit} />
    </G>
  );
}

/* ---------- COMIENDO: una manita sostiene la manzanita ---------- */
export function Comiendo({ g, outfit }) {
  return (
    <G>
      <G transform={g.faceT}>
        <Circle cx={100} cy={137} r={11} fill="#F26D6D" stroke="#B8404A" strokeWidth={2.4} />
        <Circle cx={109} cy={129} r={5} fill={g.pal.body} />
        <Path d="M100 127 Q101 121 105 119" stroke="#7A4B2A" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <Path d="M101 122 Q94 116 89 121 Q95 125 101 122 Z" fill="#6CC28A" stroke="#3E9460" strokeWidth={1.4} />
        <Circle cx={95} cy={133} r={2.2} fill="#fff" opacity={0.6} />
        <Circle cx={74} cy={122} r={1.8} fill="#F7B26B" />
        <Circle cx={128} cy={125} r={1.5} fill="#F7B26B" />
        <Circle cx={122} cy={119} r={1.2} fill="#F7B26B" />
      </G>
      <G transform={g.T}>
        <Bracito g={g} hombro={g.hombroI} mano={{ x: 90, y: 133 }} outfit={outfit} />
      </G>
    </G>
  );
}

// La otra manita se soba la pancita. Axo.js hace girar este bracito desde el hombro (g.hombroD),
// por eso el hombro se queda pegado al cuerpo y solo la manita se mueve sobre la panza.
export function BrazoSoba({ g, outfit }) {
  return (
    <G transform={g.T}>
      <Bracito g={g} hombro={g.hombroD} mano={{ x: 107, y: 158 }} outfit={outfit} />
    </G>
  );
}

/* ---------- BRANQUIAS ---------- */
export function Branquias({ g, side }) {
  const t = side === 'left' ? 'translate(50,76) scale(-1,1)' : 'translate(150,76)';
  return (
    <G transform={g.T}>
      <G transform={t}>
        {[-32, -4, 24].map((r) => (
          <G key={r} transform={`rotate(${r})`}>
            <Path d={FROND} fill={g.gill} />
          </G>
        ))}
      </G>
    </G>
  );
}

/* ---------- CABEZA: forma, pequitas y cachetes ---------- */
export function CabezaBase({ g, mood }) {
  const { paletteKey, pal } = g;
  const come = mood === 'come';
  const f = g.cara;
  return (
    <G>
      <G transform={g.T}>
        <Ellipse cx={100} cy={86} rx={54} ry={46} fill={g.body} />
        {paletteKey === 'dorado' && <Ellipse cx={82} cy={64} rx={22} ry={11} fill="#FFFDF0" opacity={0.5} transform="rotate(-22 82 64)" />}
        {(paletteKey === 'salvaje' || paletteKey === 'cobre') && (
          <G fill={pal.gill} opacity={paletteKey === 'salvaje' ? 0.5 : 0.4}>
            {MANCHAS.filter((s) => s[1] <= CORTE).map((s) => (
              <Circle key={s.join()} cx={s[0]} cy={s[1]} r={s[2]} />
            ))}
          </G>
        )}
        {paletteKey === 'galaxia' && <Cielo />}
        <Detalle g={g} />
        <G fill={pal.gill} opacity={0.45}>
          <Circle cx={78} cy={58} r={3} />
          <Circle cx={92} cy={50} r={3.4} />
          <Circle cx={106} cy={52} r={2.6} />
          <Circle cx={120} cy={60} r={3} />
          <Circle cx={68} cy={70} r={2.4} />
          <Circle cx={129} cy={74} r={2.6} />
          <Circle cx={100} cy={46} r={2.2} />
        </G>
      </G>
      <G transform={g.faceT}>
        <Ellipse cx={54} cy={f.by} rx={f.brx + (come ? 2.5 : 0)} ry={f.bry + (come ? 2.5 : 0)} fill={BLUSH} opacity={f.bop} />
        <Ellipse cx={146} cy={f.by} rx={f.brx + (come ? 2.5 : 0)} ry={f.bry + (come ? 2.5 : 0)} fill={BLUSH} opacity={f.bop} />
        {mood === 'triste' && <Path d="M56 114 C53 120 52 124 56 126 C60 124 59 120 56 114 Z" fill="#9BD4F5" stroke="#6FB6E0" strokeWidth={1} />}
      </G>
    </G>
  );
}

/* ---------- PANCITA, ROPA y BRACITOS (van encima de la cabeza; los bracitos, encima de la ropa) ---------- */
// brazos: 'abajo' | 'arriba' | null (null cuando come: ahí los bracitos van aparte, animados)
// Falda del vestido: sale de la cintura con vuelo y orilla de olitas, moñito al centro
function Falda({ tRx, v }) {
  const cx = 100, y0 = 158, y1 = 177; // falda corta
  const l = cx - tRx * 0.98, r = cx + tRx * 0.98, L = cx - tRx * 1.42, R = cx + tRx * 1.42;
  const n = 5, seg = (R - L) / n;
  let olas = '';
  for (let i = 0; i < n; i++) olas += ` Q ${R - seg * (i + 0.5)} ${y1 + 6} ${R - seg * (i + 1)} ${y1}`;
  const d = `M${l} ${y0} Q ${cx} ${y0 + 5} ${r} ${y0} Q ${R - 2} ${y0 + 11} ${R} ${y1}${olas} Q ${L + 2} ${y0 + 11} ${l} ${y0} Z`;
  return (
    <G>
      <Path d={d} fill={v.base} />
      {[-1, 1].map((o) => (
        <Path key={o} d={`M${cx + o * tRx * 0.35} ${y0 + 5} Q ${cx + o * tRx * 0.5} ${y0 + 13} ${cx + o * tRx * 0.62} ${y1 + 1}`} stroke={v.dark} strokeWidth={1.3} fill="none" opacity={0.45} />
      ))}
      <Path d={`M${l} ${y0} Q ${cx} ${y0 + 5} ${r} ${y0}`} stroke={v.dark} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d={`M${cx} ${y0 + 2} L ${cx - 9} ${y0 - 4} L ${cx - 9} ${y0 + 8} Z M${cx} ${y0 + 2} L ${cx + 9} ${y0 - 4} L ${cx + 9} ${y0 + 8} Z`} fill={v.dark} stroke={v.dark} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={cx} cy={y0 + 2} r={3} fill={v.base} stroke={v.dark} strokeWidth={1.5} />
      <Path d={`M${cx - 14} 128 Q ${cx} 140 ${cx + 14} 128`} stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />
    </G>
  );
}

export function Frente({ g, outfit = 'ninguno', brazos = 'abajo' }) {
  const { tRx } = g;
  const vestido = outfit && outfit.startsWith('vestido_') ? VESTIDOS[outfit.slice(8)] || VESTIDOS.rosa : null;
  return (
    <G transform={g.T}>
      <Ellipse cx={100} cy={150} rx={g.bRx} ry={30} fill={g.pal.belly || "#ffffff"} opacity={g.pal.belly ? 0.9 : 0.4} />
      {/* La ropa se recorta con la forma del cuerpo de Axo: queda redondita y pegada, sin hombros cuadrados */}
      <ClipPath id={'ropa' + g.clipId}>
        <Ellipse cx={100} cy={143} rx={tRx + 2.5} ry={47.5} />
      </ClipPath>
      <G clipPath={'url(#ropa' + g.clipId + ')'}>
      {vestido && (
        <Path d={"M" + (100 - tRx * 1.3) + " 126 Q 100 140 " + (100 + tRx * 1.3) + " 126 L " + (100 + tRx * 1.3) + " 162 L " + (100 - tRx * 1.3) + " 162 Z"} fill={vestido.base} />
      )}
      {outfit === "jersey" && (() => { const jw = tRx * 1.28; const cx = 100; return (
        <G>
          {/* cuerpo verde */}
          <Path d={"M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z"} fill="#006847" />
          {/* mangas */}
          <Ellipse cx={cx - jw * 0.92} cy="132" rx="15" ry="10" fill="#006847" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
          <Ellipse cx={cx + jw * 0.92} cy="132" rx="15" ry="10" fill="#006847" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
          {/* borde rojo mangas */}
          <Ellipse cx={cx - jw * 0.92} cy="138" rx="15" ry="5" fill="none" stroke="#C8102E" strokeWidth="3.5" transform={"rotate(-28 " + (cx - jw * 0.92) + " 138)"} />
          <Ellipse cx={cx + jw * 0.92} cy="138" rx="15" ry="5" fill="none" stroke="#C8102E" strokeWidth="3.5" transform={"rotate(28 " + (cx + jw * 0.92) + " 138)"} />
          {/* cuello redondo rojo */}
          <Path d="M88 127 Q100 138 112 127" fill="none" stroke="#C8102E" strokeWidth="5" strokeLinecap="round" />
          {/* rayas blancas en hombros */}
          <Line x1={cx - jw * 0.55} y1="127" x2={cx - jw * 0.82} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1={cx - jw * 0.45} y1="127" x2={cx - jw * 0.72} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1={cx - jw * 0.35} y1="127" x2={cx - jw * 0.62} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1={cx + jw * 0.55} y1="127" x2={cx + jw * 0.82} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1={cx + jw * 0.45} y1="127" x2={cx + jw * 0.72} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <Line x1={cx + jw * 0.35} y1="127" x2={cx + jw * 0.62} y2="145" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          {/* patrón azteca circular en el pecho (simplificado) */}
          <Circle cx={cx} cy="162" r="14" fill="none" stroke="#005535" strokeWidth="2.5" />
          <Circle cx={cx} cy="162" r="9" fill="none" stroke="#005535" strokeWidth="1.8" />
          <Circle cx={cx} cy="162" r="4" fill="#005535" />
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = a * Math.PI / 180;
            return <Line key={a} x1={cx + Math.cos(rad)*4} y1={162 + Math.sin(rad)*4} x2={cx + Math.cos(rad)*9} y2={162 + Math.sin(rad)*9} stroke="#005535" strokeWidth="1.5" />;
          })}
        </G>
      ); })()}
      {outfit === "sarape" && (() => { const jw = tRx * 1.32; const cols = ["#E0556E", "#F2B705", "#34BC97", "#3FA9F5"]; return (
        <G>
          <Path d={"M" + (100 - jw) + " 126 Q 100 138 " + (100 + jw) + " 126 L " + (100 + jw * 0.82) + " 188 Q 100 198 " + (100 - jw * 0.82) + " 188 Z"} fill="#F3E2C7" />
          {cols.map((col, idx) => <Rect key={idx} x={100 - jw * 0.72} y={142 + idx * 12} width={jw * 1.44} height="9" rx="2" fill={col} />)}
        </G>
      ); })()}
      {(outfit === "hoodieRojo" || outfit === "hoodieAzul") && (() => {
        const jw = tRx * 1.3; const cx = 100;
        const base = outfit === "hoodieRojo" ? "#D7263D" : "#2E6FD6";
        const dark = outfit === "hoodieRojo" ? "#A81B2E" : "#2156A8";
        return (
          <G>
            <Path d={"M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 190 Q " + cx + " 200 " + (cx - jw * 0.85) + " 190 Z"} fill={base} />
            <Ellipse cx={cx - jw * 0.92} cy="134" rx="15" ry="11" fill={base} transform={"rotate(-28 " + (cx - jw * 0.92) + " 134)"} />
            <Ellipse cx={cx + jw * 0.92} cy="134" rx="15" ry="11" fill={base} transform={"rotate(28 " + (cx + jw * 0.92) + " 134)"} />
            {/* puños */}
            <Ellipse cx={cx - jw * 0.92} cy="142" rx="13" ry="4.5" fill={dark} transform={"rotate(-28 " + (cx - jw * 0.92) + " 142)"} />
            <Ellipse cx={cx + jw * 0.92} cy="142" rx="13" ry="4.5" fill={dark} transform={"rotate(28 " + (cx + jw * 0.92) + " 142)"} />
            {/* bolsa canguro */}
            <Path d={"M" + (cx - jw * 0.46) + " 161 Q " + cx + " 168 " + (cx + jw * 0.46) + " 161 L " + (cx + jw * 0.38) + " 177 Q " + cx + " 180 " + (cx - jw * 0.38) + " 177 Z"} fill="none" stroke={dark} strokeWidth="2.5" />
            {/* cordones (más abajo, sobre el pecho) */}
            <Line x1={cx - 5} y1="140" x2={cx - 7} y2="160" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1={cx + 5} y1="140" x2={cx + 7} y2="160" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <Circle cx={cx - 7} cy="161" r="2" fill="#fff" />
            <Circle cx={cx + 7} cy="161" r="2" fill="#fff" />
          </G>
        );
      })()}
      {outfit === "chivas" && (() => {
        const jw = tRx * 1.26; const cx = 100;
        const body = "M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z";
        const sw = (jw * 2) / 6; const cid = "clChiv" + g.clipId;
        return (
          <G>
            <Ellipse cx={cx - jw * 0.92} cy="132" rx="15" ry="10" fill="#fff" stroke="#C8102E" strokeWidth="2" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
            <Ellipse cx={cx + jw * 0.92} cy="132" rx="15" ry="10" fill="#fff" stroke="#C8102E" strokeWidth="2" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
            <Path d={body} fill="#fff" />
            <ClipPath id={cid}><Path d={body} /></ClipPath>
            <G clipPath={"url(#" + cid + ")"}>
              <Rect x={cx - jw} y="120" width={sw} height="84" fill="#C8102E" />
              <Rect x={cx - jw + sw * 2} y="120" width={sw} height="84" fill="#C8102E" />
              <Rect x={cx - jw + sw * 4} y="120" width={sw} height="84" fill="#C8102E" />
            </G>
            <Path d={body} fill="none" stroke="#C8102E" strokeWidth="2" />
            <Path d="M88 127 Q100 137 112 127" fill="none" stroke="#1A2A5E" strokeWidth="4" strokeLinecap="round" />
          </G>
        );
      })()}
      {outfit === "azulDiag" && (() => {
        const jw = tRx * 1.26; const cx = 100;
        const body = "M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z";
        const cid = "clAz" + g.clipId;
        return (
          <G>
            <Ellipse cx={cx - jw * 0.92} cy="132" rx="15" ry="10" fill="#5FB4E4" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
            <Ellipse cx={cx + jw * 0.92} cy="132" rx="15" ry="10" fill="#5FB4E4" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
            <Path d={body} fill="#5FB4E4" />
            <ClipPath id={cid}><Path d={body} /></ClipPath>
            <G clipPath={"url(#" + cid + ")"}>
              <Line x1={cx - jw * 0.8} y1="190" x2={cx + jw * 0.8} y2="126" stroke="#fff" strokeWidth="17" />
            </G>
            <Path d={body} fill="none" stroke="#3F97C9" strokeWidth="1.5" />
            <Path d="M88 127 Q100 137 112 127" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </G>
        );
      })()}
      {outfit === "pumas" && (() => {
        const jw = tRx * 1.26; const cx = 100;
        const body = "M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z";
        const cid = "clPum" + g.clipId;
        return (
          <G>
            <Ellipse cx={cx - jw * 0.92} cy="132" rx="15" ry="10" fill="#fff" stroke="#1A2A5E" strokeWidth="2" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
            <Ellipse cx={cx + jw * 0.92} cy="132" rx="15" ry="10" fill="#fff" stroke="#1A2A5E" strokeWidth="2" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
            <Path d={body} fill="#fff" />
            <ClipPath id={cid}><Path d={body} /></ClipPath>
            <G clipPath={"url(#" + cid + ")"}>
              <Rect x={cx - jw} y="120" width="14" height="84" fill="#C9A227" />
              <Rect x={cx + jw - 14} y="120" width="14" height="84" fill="#C9A227" />
            </G>
            <Path d={body} fill="none" stroke="#1A2A5E" strokeWidth="1.5" />
            <Path d="M86 127 Q100 139 114 127" fill="none" stroke="#1A2A5E" strokeWidth="5" strokeLinecap="round" />
          </G>
        );
      })()}
      {outfit === "playeraRaya" && (() => {
        const jw = tRx * 1.26; const cx = 100;
        return (
          <G>
            <Path d={"M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z"} fill="#F7F7F7" />
            <Ellipse cx={cx - jw * 0.92} cy="132" rx="14" ry="10" fill="#F7F7F7" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
            <Ellipse cx={cx + jw * 0.92} cy="132" rx="14" ry="10" fill="#F7F7F7" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
            {/* franja negra diagonal cruzando el pecho */}
            <Line x1={cx - jw * 0.78} y1="170" x2={cx + jw * 0.78} y2="138" stroke="#222" strokeWidth="11" strokeLinecap="round" />
            {/* cuello */}
            <Path d="M88 127 Q100 137 112 127" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
          </G>
        );
      })()}
      {outfit === "poloRosa" && (() => {
        const jw = tRx * 1.26; const cx = 100;
        return (
          <G>
            <Path d={"M" + (cx - jw) + " 126 Q " + cx + " 142 " + (cx + jw) + " 126 L " + (cx + jw * 0.85) + " 188 Q " + cx + " 198 " + (cx - jw * 0.85) + " 188 Z"} fill="#F3A6BE" />
            <Ellipse cx={cx - jw * 0.92} cy="132" rx="14" ry="10" fill="#F3A6BE" transform={"rotate(-28 " + (cx - jw * 0.92) + " 132)"} />
            <Ellipse cx={cx + jw * 0.92} cy="132" rx="14" ry="10" fill="#F3A6BE" transform={"rotate(28 " + (cx + jw * 0.92) + " 132)"} />
            {/* puños mangas */}
            <Ellipse cx={cx - jw * 0.92} cy="139" rx="12" ry="4" fill="#E48BA6" transform={"rotate(-28 " + (cx - jw * 0.92) + " 139)"} />
            <Ellipse cx={cx + jw * 0.92} cy="139" rx="12" ry="4" fill="#E48BA6" transform={"rotate(28 " + (cx + jw * 0.92) + " 139)"} />
            {/* cuello de polo */}
            <Path d={"M" + (cx - 12) + " 126 L " + (cx - 4) + " 138 L " + cx + " 130 Z"} fill="#E48BA6" />
            <Path d={"M" + (cx + 12) + " 126 L " + (cx + 4) + " 138 L " + cx + " 130 Z"} fill="#E48BA6" />
            {/* botones */}
            <Circle cx={cx} cy="140" r="1.8" fill="#fff" />
            <Circle cx={cx} cy="148" r="1.8" fill="#fff" />
          </G>
        );
      })()}
      </G>
      {vestido && <Falda tRx={tRx} v={vestido} />}
      {brazos && <Brazos g={g} pose={brazos} outfit={outfit} />}
    </G>
  );
}

/* ---------- OJOS y BOCA (carita nueva) ---------- */
const arco = (cx, cy) => `M${cx - 9} ${cy + 3} Q${cx} ${cy - 9} ${cx + 9} ${cy + 3}`;

function OjoGrande({ cx, cy, r = 13, iris, aro }) {
  const k = r / 13;
  return (
    <G>
      {aro && <Circle cx={cx} cy={cy} r={r + 1.6} fill={aro} opacity={0.9} />}
      <Circle cx={cx} cy={cy} r={r} fill={INK} />
      <Ellipse cx={cx} cy={cy + 6 * k} rx={8 * k} ry={4.5 * k} fill={iris || "#9C7BD8"} opacity={0.6} />
      <Circle cx={cx - 4.5 * k} cy={cy - 5 * k} r={4.8 * k} fill="#fff" />
      <Circle cx={cx + 5 * k} cy={cy + 5 * k} r={2.3 * k} fill="#fff" opacity={0.9} />
      <Circle cx={cx + 5.5 * k} cy={cy - 5.5 * k} r={1.4 * k} fill="#fff" opacity={0.8} />
    </G>
  );
}

// Colores oscuros: iris ámbar y aro claro para que la mirada siga siendo lo primero que se ve
const MIRADA = { obsidiana: ['#F6E05E', '#CBD5E0'], melanico: ['#F6E05E', '#A9A9B8'], galaxia: ['#B49BFF', '#F1EBFF'] };
export function Ojos({ g, mood }) {
  const f = g.cara;
  const [iris, aro] = MIRADA[g.paletteKey] || [];
  const xi = 100 - f.dx;
  const xd = 100 + f.dx;
  let c;
  if (mood === 'come' || mood === 'amor') {
    c = (
      <G>
        <Path d={arco(xi, f.y + 2)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <Path d={arco(xd, f.y + 2)} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      </G>
    );
  } else if (mood === 'triste') {
    const r = f.r - 1;
    const y = f.y + 2;
    return (
      <G transform={g.faceT}>
        <Path d={`M${xi - 12} ${y - r - 3} L${xi + 7} ${y - r - 8}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <Path d={`M${xd - 7} ${y - r - 8} L${xd + 12} ${y - r - 3}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
        <OjoGrande cx={xi} cy={y} r={r} iris={iris} aro={aro} />
        <OjoGrande cx={xd} cy={y} r={r} iris={iris} aro={aro} />
        <Ellipse cx={xi} cy={y + r * 0.75} rx={r * 0.62} ry={2.4} fill="#BFE6FF" opacity={0.8} />
        <Ellipse cx={xd} cy={y + r * 0.75} rx={r * 0.62} ry={2.4} fill="#BFE6FF" opacity={0.8} />
      </G>
    );
  } else {
    // feliz y nace: ojos grandes con brillos
    c = (
      <G>
        <OjoGrande cx={xi} cy={f.y} r={f.r} iris={iris} aro={aro} />
        <OjoGrande cx={xd} cy={f.y} r={f.r} iris={iris} aro={aro} />
      </G>
    );
  }
  return <G transform={g.faceT}>{c}</G>;
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
    const d =
      g.stage === 'cria'
        ? 'M92.5 109 Q96.2 114.5 100 109 Q103.8 114.5 107.5 109' // boquita chiquita de bebé
        : g.stage === 'adulto'
          ? 'M87 104 Q100 117 113 104' // sonrisa amplia
          : 'M90 106 Q95 113.5 100 106 Q105 113.5 110 106';
    c = <Path d={d} stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  return <G transform={g.faceT}>{c}</G>;
}

/* ---------- ACCESORIOS (cabeza) y ESTILO ---------- */
const PELUCHE = '#FFFFFF';
const PELUCHE_SOMBRA = '#EFEAF3';
const PELUCHE_BORDE = '#B7AEC2';
const PELUCHE_ROSA = '#FFB3CB';

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

function Tira({ x }) {
  const lados = `M${x - 9.5} 127 L${x - 9.5} 161 C${x - 16} 165 ${x - 16} 185 ${x} 185 C${x + 16} 185 ${x + 16} 165 ${x + 9.5} 161 L${x + 9.5} 127`;
  return (
    <G>
      {/* sin línea arriba: la tira se funde con la capucha */}
      <Path d={`${lados} Z`} fill={PELUCHE} />
      <Path d={lados} fill="none" stroke={PELUCHE_BORDE} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <Path d={`M${x - 5} 142 L${x - 5} 157`} stroke={PELUCHE_SOMBRA} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={x} cy={176.5} rx={5.6} ry={4.4} fill={PELUCHE_ROSA} />
      <Circle cx={x - 6.4} cy={169.4} r={2.2} fill={PELUCHE_ROSA} />
      <Circle cx={x} cy={167.4} r={2.2} fill={PELUCHE_ROSA} />
      <Circle cx={x + 6.4} cy={169.4} r={2.2} fill={PELUCHE_ROSA} />
    </G>
  );
}

const CAPUCHA = 'M26 92 C26 52 58 28 100 28 C142 28 174 52 174 92 C174 128 144 146 100 146 C56 146 26 128 26 92 Z';
const CARA = 'M40 99 C40 81 60 70 100 70 C140 70 160 81 160 99 C160 121 138 133 100 133 C62 133 40 121 40 99 Z';
const CARA_SOMBRA = 'M36.5 99 C36.5 79 58 66.5 100 66.5 C142 66.5 163.5 79 163.5 99 C163.5 123 140 136.5 100 136.5 C60 136.5 36.5 123 36.5 99 Z';

export function Accesorio({ g, k, estilo }) {
  const accessory = k;
  const conejo = k === 'conejo';
  const st = { fill: PELUCHE, stroke: PELUCHE_BORDE, strokeWidth: 2.4, strokeLinejoin: 'round' };
  return (
    <G>
      <G transform={g.T}>
        {estilo === 'galan' && (
          <G transform="translate(0 -8)">
            <Path d="M62 80 l 16 -4" stroke="#5b4636" strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Path d="M116 78 l 16 4" stroke="#5b4636" strokeWidth={3.2} strokeLinecap="round" fill="none" />
          </G>
        )}
        {accessory === "flor" && (
          <G transform="translate(54,50)">
            {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx="0" cy="-9" rx="6" ry="9" fill="#FF8FB0" transform={"rotate(" + a + ")"} />)}
            <Circle cx="0" cy="0" r="5" fill="#FFD15C" />
          </G>
        )}
        {accessory === "flores" && (
          <G transform="translate(100,48)">
            {[[-26, 4, 0.8, '#FFC2D6'], [-13, -6, 1, '#FFF3B0'], [0, -11, 1.15, '#FF9EC0'], [13, -6, 1, '#D9C2FF'], [26, 4, 0.8, '#FFC2D6']].map(([x, y, e, col]) => (
              <G key={x} transform={`translate(${x},${y}) scale(${e})`}>
                {[0, 72, 144, 216, 288].map((r) => (
                  <Ellipse key={r} cx="0" cy="-6.5" rx="4.2" ry="6.5" fill={col} transform={`rotate(${r})`} />
                ))}
                <Circle cx="0" cy="0" r="3.2" fill="#FFD15C" />
              </G>
            ))}
            <Path d="M-30 6 Q 0 -2 30 6" stroke="#8FD6A8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        )}
        {accessory === "corona_real" && (
          <G transform="translate(100,46)">
            <Path d="M-26 6 L -26 -18 L -13 -6 L 0 -26 L 13 -6 L 26 -18 L 26 6 Z" fill="url(#g)" stroke="#C98328" strokeWidth="2" strokeLinejoin="round" />
            <Rect x="-26" y="4" width="52" height="7" rx="3.5" fill="#F5B041" stroke="#C98328" strokeWidth="1.6" />
            <Circle cx="0" cy="-27" r="4.6" fill="#FF8FAB" stroke="#E0556E" strokeWidth="1.2" />
            <Circle cx="-18" cy="-15" r="3" fill="#8FEDE0" />
            <Circle cx="18" cy="-15" r="3" fill="#C9B3F2" />
            <Circle cx="0" cy="-2" r="3.4" fill="#FFF3B0" />
            <Path d={destello(-32, -14, 4)} fill="#FFF8E1" opacity={0.95} />
            <Path d={destello(33, -6, 3.2)} fill="#FFF8E1" opacity={0.9} />
          </G>
        )}
        {accessory === "fiesta" && (
          <G transform="translate(100,46)"><Path d="M0 -44 L 17 2 L -17 2 Z" fill="#7C5CFF" /><Path d="M0 -44 L 6 -24 L -6 -24 Z" fill="#FFD15C" /><Circle cx="0" cy="-46" r="6" fill="#FF6F9C" /></G>
        )}
        {accessory === "corona" && (
          <G transform="translate(100,48)"><Path d="M-22 4 L -22 -16 L -10 -4 L 0 -22 L 10 -4 L 22 -16 L 22 4 Z" fill="#FFD15C" stroke="#F2B705" strokeWidth="2" /><Circle cx="0" cy="-22" r="4" fill="#E79FAE" /></G>
        )}
        {accessory === "gorra" && (
          <G transform="translate(100,46)"><Path d="M-34 6 Q -34 -22 0 -22 Q 34 -22 34 6 Z" fill="#3E7BD6" /><Path d="M2 6 Q 38 6 46 16 Q 24 13 2 13 Z" fill="#2F66BC" /><Circle cx="0" cy="-20" r="3.5" fill="#2F66BC" /></G>
        )}
        {accessory === "monito" && (
          <G transform="translate(100,120)"><Path d="M0 0 L -20 -11 L -20 11 Z" fill="#E0556E" /><Path d="M0 0 L 20 -11 L 20 11 Z" fill="#E0556E" /><Rect x="-6" y="-8" width="12" height="16" rx="4" fill="#C24459" /></G>
        )}
      </G>
      {(k === 'conejo' || k === 'gato') && (
        <G transform={g.faceT}>
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
          {/* capucha: cubre casi toda la cabeza, con hueco para la carita */}
          <Path d={`${CAPUCHA} ${CARA}`} fillRule="evenodd" fill={PELUCHE} />
          <Path d={CARA_SOMBRA} stroke={PELUCHE_SOMBRA} strokeWidth={3.4} fill="none" />
          <Path d={CAPUCHA} fill="none" stroke={PELUCHE_BORDE} strokeWidth={2.6} strokeLinejoin="round" />
          <Path d={CARA} fill="none" stroke={PELUCHE_BORDE} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M50 46 C60 37 75 33 90 32" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
          {/* tiras: cuelgan por delante, cosidas a los lados de la capucha */}
          <Tira x={50} />
          <Tira x={150} />

          <Tira x={50} />
          <Tira x={150} />
          <Carita y={47} gato={!conejo} />
        </G>
      )}
    </G>
  );
}

/* ---------- AXO QUIETO (un solo SVG): miniaturas, listas, juegos ---------- */
export function AxoMini({ aura, paletteKey = 'durazno', mood = 'feliz', evo = 'cria', chub = 1, accessory = 'ninguno', outfit = 'ninguno', estilo = 'clasico', size = 60, style }) {
  const g = geom({ paletteKey, evo, chub });
  const w = size;
  const h = size * (VB_H / VB_W);
  const come = mood === 'come';
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} style={style}>
      <Gradients />
      <Ellipse cx={100} cy={g.sombra.cy} rx={g.sombra.rx} ry={g.sombra.ry} fill="#00000012" />
      <Aura g={g} evo={evo} dorada={aura} />
      {accessory === 'mariposa' && <Alas g={g} />}
      <Cuerpo g={g} />
      <Branquias g={g} side="left" />
      <Branquias g={g} side="right" />
      <CabezaBase g={g} mood={mood} />
      <Ojos g={g} mood={mood} />
      <Boca g={g} mood={mood} />
      <Frente g={g} outfit={outfit} brazos={come ? null : mood === 'nace' || mood === 'amor' ? 'arriba' : 'abajo'} />
      <Accesorio g={g} k={accessory} estilo={estilo} />
      {come && <Comiendo g={g} outfit={outfit} />}
      {come && <BrazoSoba g={g} outfit={outfit} />}
    </Svg>
  );
}

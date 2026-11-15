import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line, Rect, Text as SvgText, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from './theme';

// Piezas de interfaz compartidas (botones, tarjetas, hojas, anillos…), con el mismo look de la PWA.

export const sombra = Platform.select({
  android: { elevation: 2 },
  default: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});

/* ---------- Texto ---------- */
export const Display = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.display, color: C.ink }, style]} />;
export const Semi = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.displaySemi, color: C.ink }, style]} />;
export const Body = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.body, color: C.ink, fontSize: 15 }, style]} />;
export const Bold = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.bodyBold, color: C.ink, fontSize: 15 }, style]} />;
export const Muted = ({ sm, style, ...p }) => <Text {...p} style={[{ fontFamily: F.body, color: C.muted, fontSize: sm ? 13 : 14.5, lineHeight: sm ? 18 : 20 }, style]} />;

/* ---------- Botones ---------- */
// kind: 'primary' (rosa), 'soft' (blanco), 'feature' (lila), 'ghost' (solo texto)
export function Btn({ kind = 'primary', big, label, children, onPress, disabled, style, textStyle }) {
  const txt = (
    <Text
      style={[
        { fontFamily: F.displaySemi, fontSize: big ? 17 : 15, textAlign: 'center' },
        { color: kind === 'primary' ? C.brown : kind === 'feature' ? '#5B45C9' : kind === 'ghost' ? C.muted : C.ink },
        textStyle,
      ]}
    >
      {label ?? children}
    </Text>
  );
  const pad = { paddingVertical: big ? 15 : 11, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, big && { alignSelf: 'stretch' }, style]}
    >
      {kind === 'primary' ? (
        <LinearGradient colors={[C.pinkLight, C.pink]} style={pad}>
          {txt}
        </LinearGradient>
      ) : (
        <View style={[pad, kind === 'soft' && { backgroundColor: '#fff', ...sombra }, kind === 'feature' && { backgroundColor: '#EFEAFF' }]}>{txt}</View>
      )}
    </Pressable>
  );
}

/* ---------- Tarjetas ---------- */
export const Card = ({ style, children, colors }) =>
  colors ? (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, style]}>
      {children}
    </LinearGradient>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );
export const CardH = ({ children, style }) => <Text style={[s.cardH, style]}>{children}</Text>;
export const SectT = ({ children, style }) => <Text style={[s.sectT, style]}>{children}</Text>;

// Fila de lista con texto a la izquierda y algo a la derecha
export const Row = ({ children, style }) => <View style={[s.row, style]}>{children}</View>;

// Opción grande seleccionable
export function RowOpt({ on, onPress, children, right, style }) {
  return (
    <Pressable onPress={onPress} style={[s.rowOpt, on && { borderColor: C.pink, backgroundColor: C.pinkSoft }, style]}>
      <View style={{ flex: 1 }}>{children}</View>
      {right ?? (on ? <Text style={{ fontSize: 18, color: C.pink, fontFamily: F.display }}>✓</Text> : null)}
    </Pressable>
  );
}

// Botón de lista (Ajustes, Juegos)
export function ListRow({ onPress, children, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.listRow, { opacity: pressed ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

/* ---------- Encabezado y pantalla ---------- */
export function Header({ title, back, dark }) {
  return (
    <View style={s.hdr}>
      {back ? (
        <Pressable onPress={back} hitSlop={10} style={s.iconBtn}>
          <Text style={{ fontSize: 22, color: C.ink, fontFamily: F.display, marginTop: -2 }}>‹</Text>
        </Pressable>
      ) : (
        <View style={{ width: 38 }} />
      )}
      <Text numberOfLines={1} style={[s.hdrTitle, dark && { color: '#fff' }]}>
        {title}
      </Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

// Pantalla con fondo degradado, encabezado opcional y contenido con scroll
export function Screen({ colors = ['#FAFBFE', '#F3F5FB'], title, back, dark, children, scroll = true, footer, pad = 16, contentStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={colors} style={{ flex: 1, paddingTop: insets.top }}>
      {title != null && <Header title={title} back={back} dark={dark} />}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: pad, paddingBottom: 24 }, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: pad }, contentStyle]}>{children}</View>
      )}
      {footer && <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>{footer}</View>}
    </LinearGradient>
  );
}

/* ---------- Hoja que sube desde abajo ---------- */
export function Sheet({ visible = true, onClose, tall, children, colors }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* 'padding' en ambos sistemas: así el teclado nunca tapa lo que se escribe en la hoja */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={[s.sheet, { maxHeight: tall ? '90%' : '82%', paddingBottom: insets.bottom + 16 }, colors && { backgroundColor: colors }]}>
          <Pressable onPress={onClose} hitSlop={12} style={s.sheetX}>
            <Text style={{ fontSize: 18, color: C.muted, fontFamily: F.display }}>✕</Text>
          </Pressable>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Ventana al centro (celebraciones)
export function Popup({ onClose, children }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[s.backdrop, { alignItems: 'center', justifyContent: 'center', padding: 22 }]} onPress={onClose}>
        <Pressable onPress={() => {}} style={s.popup}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- Campos ---------- */
export const Input = ({ style, ...p }) => <TextInput placeholderTextColor={C.gray} {...p} style={[s.input, style]} />;

export function NumField({ label, value, onChange, suffix, min, max, hint }) {
  const [text, setText] = useState(String(value));
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const commit = (v) => {
    const n = clamp(v);
    onChange(n);
    setText(String(n));
  };
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.stepper}>
        <Pressable onPress={() => commit((value || min) - 1)} style={s.stepBtn}>
          <Text style={s.stepTxt}>–</Text>
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
          <TextInput
            style={{ fontFamily: F.display, fontSize: 24, color: C.ink, minWidth: 50, textAlign: 'center', padding: 0 }}
            keyboardType="number-pad"
            selectTextOnFocus
            value={text}
            onChangeText={(t) => {
              const c = t.replace(/[^0-9]/g, '');
              setText(c);
              const n = parseInt(c, 10);
              if (!isNaN(n)) onChange(n);
            }}
            onBlur={() => {
              const n = parseInt(text, 10);
              commit(isNaN(n) ? value || min : n);
            }}
          />
          <Text style={{ fontFamily: F.body, color: C.gray, fontSize: 14 }}>{suffix}</Text>
        </View>
        <Pressable onPress={() => commit((value || min) + 1)} style={s.stepBtn}>
          <Text style={s.stepTxt}>+</Text>
        </Pressable>
      </View>
      {hint && <Muted sm style={{ marginTop: 5 }}>{hint}</Muted>}
    </View>
  );
}

// Interruptor sencillo
export const Switch = ({ on }) => (
  <View style={{ width: 46, height: 28, borderRadius: 14, backgroundColor: on ? C.mint : '#dfe3ee', justifyContent: 'center' }}>
    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', marginLeft: on ? 21 : 3 }} />
  </View>
);

/* ---------- Anillo de progreso ---------- */
export function Ring({ progress, size = 78, stroke = 9, color = C.pink, track = '#0000000f', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, progress || 0)));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={off} />
      </Svg>
      {children}
    </View>
  );
}
export const RingC = ({ big, small }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontFamily: F.display, fontSize: 17, color: C.ink, lineHeight: 20 }}>{big}</Text>
    <Text style={{ fontFamily: F.body, fontSize: 10.5, color: C.gray, lineHeight: 13 }}>{small}</Text>
  </View>
);

/* ---------- Vaso de agua ---------- */
export function GlassIcon({ filled }) {
  return (
    <Svg width={22} height={28} viewBox="0 0 22 28">
      <Path d="M4 3 L18 3 L16 24 Q16 26 14 26 L8 26 Q6 26 6 24 Z" fill={filled ? '#3FA9F5' : '#EAF4FF'} stroke="#7FB8E8" strokeWidth={1.5} strokeLinejoin="round" />
      {filled && <Path d="M6 9 L16 9 L14.7 24 Q14.7 25 13.5 25 L8.5 25 Q7.3 25 7.3 24 Z" fill="#2E96E0" opacity={0.55} />}
    </Svg>
  );
}

/* ---------- Gráfica de peso ---------- */
export function MiniChart({ data }) {
  const w = 340;
  const h = 190;
  const padX = 26;
  const padTop = 46;
  const padBottom = 26;
  const ys = data.map((d) => d.peso);
  const min = Math.min(...ys) - 0.3;
  const max = Math.max(...ys) + 0.3;
  const innerH = h - padTop - padBottom;
  const px = (i) => (data.length <= 1 ? w / 2 : padX + i * ((w - 2 * padX) / (data.length - 1)));
  const py = (v) => padTop + innerH - ((v - min) / (max - min)) * innerH;
  const pts = data.map((d, i) => ({ x: px(i), y: py(d.peso) }));
  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return 'M ' + p.x + ' ' + p.y;
    const prev = pts[i - 1];
    const midX = (prev.x + p.x) / 2;
    return acc + ' C ' + midX + ' ' + prev.y + ', ' + midX + ' ' + p.y + ', ' + p.x + ' ' + p.y;
  }, '');
  const areaPath = linePath + ' L ' + pts[pts.length - 1].x + ' ' + (h - padBottom) + ' L ' + pts[0].x + ' ' + (h - padBottom) + ' Z';
  const last = pts[pts.length - 1];
  const bubbleW = 62;
  const bubbleH = 30;
  const bubbleX = Math.min(Math.max(last.x - bubbleW / 2, 4), w - bubbleW - 4);
  const bubbleY = Math.max(last.y - bubbleH - 14, 2);
  // con muchos registros, solo algunas fechas para que no se encimen
  const cada = Math.max(1, Math.ceil(data.length / 6));
  return (
    <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height={200}>
      <Defs>
        <SvgGrad id="pesoFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E79FAE" stopOpacity={0.35} />
          <Stop offset="1" stopColor="#E79FAE" stopOpacity={0} />
        </SvgGrad>
      </Defs>
      {[0, 1, 2].map((k) => (
        <Line key={k} x1={padX} x2={w - padX} y1={padTop + (k * innerH) / 2} y2={padTop + (k * innerH) / 2} stroke="#0000000a" />
      ))}
      <Path d={areaPath} fill="url(#pesoFill)" />
      <Path d={linePath} fill="none" stroke="#E79FAE" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill="#fff" stroke="#E79FAE" strokeWidth={2.5} />
      ))}
      {data.map((d, i) =>
        i % cada === 0 || i === data.length - 1 ? (
          <SvgText key={'t' + i} x={px(i)} y={h - 6} textAnchor="middle" fontSize={11} fill="#9aa0b4">
            {d.d}
          </SvgText>
        ) : null
      )}
      <Line x1={last.x} y1={bubbleY + bubbleH} x2={last.x} y2={last.y - 6} stroke="#E79FAE" strokeWidth={1.5} strokeDasharray="2,3" />
      <Rect x={bubbleX} y={bubbleY} width={bubbleW} height={bubbleH} rx={10} fill="#E79FAE" />
      <SvgText x={bubbleX + bubbleW / 2} y={bubbleY + 12} textAnchor="middle" fontSize={8.5} fill="#fff" opacity={0.9}>
        Tu peso
      </SvgText>
      <SvgText x={bubbleX + bubbleW / 2} y={bubbleY + 24} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#fff">
        {data[data.length - 1].peso.toFixed(1)}kg
      </SvgText>
    </Svg>
  );
}

// Caja de consejo
export const Tip = ({ icon, children, colors = ['#FFF6EA', '#FFF0DE'] }) => (
  <LinearGradient colors={colors} style={s.tip}>
    <Text style={{ fontSize: 26 }}>{icon}</Text>
    <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13.5, lineHeight: 19, color: '#5c5470' }}>{children}</Text>
  </LinearGradient>
);

// Fila de macros de colores
export const Macros = ({ items, style }) => (
  <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, style]}>
    {items.map(([t, col]) => (
      <Text key={t} style={{ fontFamily: F.displaySemi, fontSize: 14, color: col }}>
        {t}
      </Text>
    ))}
  </View>
);

export const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16, marginBottom: 12, ...sombra },
  cardH: { fontFamily: F.displaySemi, fontSize: 16, color: C.ink, marginBottom: 6 },
  sectT: { fontFamily: F.displaySemi, fontSize: 15, color: C.gray, marginTop: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f4f5f9', gap: 10 },
  rowOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: C.line, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 9 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 9, ...sombra },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  hdrTitle: { flex: 1, textAlign: 'center', fontFamily: F.display, fontSize: 19, color: C.ink },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffffffcc', alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#2A2D4366' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 22 },
  sheetX: { position: 'absolute', right: 14, top: 12, zIndex: 5, width: 34, height: 34, borderRadius: 17, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  popup: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 28, padding: 22, alignItems: 'center' },
  input: { borderWidth: 2, borderColor: C.line, backgroundColor: '#fafbfd', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: F.body, fontSize: 15, color: C.ink, marginBottom: 10 },
  label: { fontFamily: F.displaySemi, fontSize: 15, color: C.ink, marginBottom: 7 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: C.line, padding: 6 },
  stepBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontFamily: F.display, fontSize: 22, color: C.ink },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 12, marginBottom: 12 },
});

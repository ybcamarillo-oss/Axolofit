import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { DEMO, computeProfile } from '../data';
import { C, F } from '../theme';
import { Btn, Display, Muted, Semi, Screen, RowOpt, NumField, Card, Macros, Sheet, sombra } from '../ui';
import Nacimiento from '../components/Nacimiento';

// Cuestionario inicial: objetivo → datos → medidas → tu plan → nombre y nacimiento de Axo.

const SLIDES = [
  { emoji: '🦎', title: 'Tu ajolote crece contigo', desc: 'Mientras mejor comes, más feliz y fuerte se vuelve. Cuídalo y él te cuida.' },
  { emoji: '🌮', title: 'Comida mexicana de verdad', desc: 'Tacos, pozole, quesadillas y más. Sin dietas raras, sin alimentos imposibles.' },
  { emoji: '📊', title: 'Plan 100% personalizado', desc: 'Calorías, macros, grasa corporal y peso ideal calculados para tu cuerpo.' },
  { emoji: '🎮', title: 'Aprende jugando', desc: 'Minijuegos, retos y tips para desarrollar hábitos sin aburrirte.' },
];
const INFO = [
  ['IMC', 'Índice de Masa Corporal. Relación entre tu peso y estatura al cuadrado. Normal: 18.5–24.9.'],
  ['% Grasa', 'Porcentaje estimado de tejido graso usando el método US Navy (circunferencias).'],
  ['Masa magra', 'Tu peso sin grasa: músculos, huesos, agua y órganos.'],
  ['Metab. basal', 'Calorías mínimas que tu cuerpo necesita aunque no te muevas nada (fórmula Mifflin-St Jeor).'],
  ['Gasto total', 'Calorías que realmente gastas en el día según tu nivel de actividad.'],
  ['Agua', 'Litros diarios recomendados según tu peso (35 ml/kg).'],
  ['Estructura', 'Tamaño de tu armazón ósea (pequeña/mediana/grande) calculado con estatura ÷ circunferencia de muñeca.'],
  ['Peso ideal', 'Peso saludable estimado para tu estatura y estructura usando la fórmula de Hamwi.'],
  ['ICM', 'Índice Cintura-Muñeca. Indica cómo se distribuye tu grasa corporal y tu riesgo cardiometabólico.'],
];

const Stat = ({ k, v, s, color }) => (
  <View style={{ width: '31.5%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', marginBottom: 8, borderTopWidth: color ? 3 : 0, borderTopColor: color, ...sombra }}>
    <Text style={{ fontFamily: F.display, fontSize: 18, color: C.ink }}>
      {v}
      <Text style={{ fontSize: 12, fontFamily: F.body }}>{s}</Text>
    </Text>
    <Text style={{ fontFamily: F.body, fontSize: 11.5, color: color || C.gray, textAlign: 'center' }}>{k}</Text>
  </View>
);

export default function Onboarding() {
  const { onboardingDone, profile, petName, pet, tieneAxo, setPhase } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('welcome');
  // Si está rehaciendo su perfil, empezamos con lo que ya tenía
  const [d, setD] = useState({ ...DEMO, ...profile });
  const [name, setName] = useState(petName || 'Axo');
  const [skipWarn, setSkipWarn] = useState(false);
  const [slide, setSlide] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [hatching, setHatching] = useState(false);
  // Usuario nuevo: color al azar. Si está rehaciendo su perfil, conserva el color de su Axo.
  const [colorNacer] = useState(() => {
    if (tieneAxo) return pet.palette;
    const c = ['durazno', 'rosa', 'menta', 'cielo', 'morado'];
    return c[Math.floor(Math.random() * c.length)];
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  // Si ya tiene su Axo y entró por error a rehacer el perfil, el botón "atrás" del teléfono la regresa sin cambiar nada
  useEffect(() => {
    if (!tieneAxo) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPhase('app');
      return true;
    });
    return () => sub.remove();
  }, [tieneAxo]);

  useEffect(() => {
    if (step !== 'welcome') return;
    const t = setInterval(() => setSlide((x) => (x + 1) % 4), 3000);
    return () => clearInterval(t);
  }, [step]);

  if (step === 'welcome')
    return (
      <LinearGradient colors={['#F3ECFF', '#E7F7F4']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, paddingTop: insets.top + 10 }}>
        <Nacimiento paletteKey={colorNacer} size={110} espera />
        <Display style={{ fontSize: 30, marginTop: 2, marginBottom: 10 }}>AxoloFit</Display>
        <View style={{ width: '100%', maxWidth: 320 }}>
          <View style={{ backgroundColor: '#ffffff99', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minHeight: 150 }}>
            <Text style={{ fontSize: 40, marginBottom: 6 }}>{SLIDES[slide].emoji}</Text>
            <Display style={{ fontSize: 16, marginBottom: 5, textAlign: 'center' }}>{SLIDES[slide].title}</Display>
            <Muted sm style={{ textAlign: 'center' }}>{SLIDES[slide].desc}</Muted>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 11, marginBottom: 16 }}>
            {SLIDES.map((_, i) => (
              <Pressable key={i} onPress={() => setSlide(i)} hitSlop={8} style={{ width: i === slide ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === slide ? C.pink : '#d7dbe6' }} />
            ))}
          </View>
          <Btn big label={tieneAxo ? 'Rehacer mi perfil 📝' : 'Crear mi ajolote 💗'} onPress={() => setStep('objetivo')} />
          {tieneAxo && <Btn kind="ghost" label="← Mejor no, volver sin cambios" onPress={() => setPhase('app')} style={{ marginTop: 8 }} />}
        </View>
      </LinearGradient>
    );

  if (step === 'objetivo')
    return (
      <Screen key="objetivo" title="Tu objetivo" back={() => setStep('welcome')} footer={<Btn big label="Continuar" onPress={() => setStep('datos')} disabled={!d.objetivo} />}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Nacimiento paletteKey={colorNacer} size={90} espera />
        </View>
        <Display style={{ fontSize: 22, textAlign: 'center', marginBottom: 4 }}>¿Cuál es tu objetivo?</Display>
        <Muted style={{ textAlign: 'center', marginBottom: 18 }}>Esto ajusta tus calorías y macros automáticamente.</Muted>
        {[
          ['perder', '⬇️ Perder peso', 'Déficit calórico controlado (−20% de tu gasto).'],
          ['mantener', '⚖️ Mantener mi peso', 'Comes exactamente lo que gastas.'],
          ['ganar', '⬆️ Ganar peso', 'Superávit moderado (+15%) para ganar masa.'],
        ].map(([v, t, desc]) => (
          <RowOpt key={v} on={d.objetivo === v} onPress={() => set('objetivo', v)}>
            <Semi style={{ fontSize: 17 }}>{t}</Semi>
            <Muted sm>{desc}</Muted>
          </RowOpt>
        ))}
      </Screen>
    );

  if (step === 'datos')
    return (
      <Screen key="datos" title="Tus datos" back={() => setStep('objetivo')} footer={<Btn big label="Continuar" onPress={() => setStep('medidas')} />}>
        <Text style={{ fontFamily: F.displaySemi, fontSize: 15, color: C.ink, marginBottom: 7 }}>Sexo biológico</Text>
        {[['F', 'Mujer'], ['M', 'Hombre'], ['X', 'Prefiero no decirlo']].map(([v, l]) => (
          <RowOpt key={v} on={d.sexo === v} onPress={() => set('sexo', v)}>
            <Semi style={{ fontSize: 15 }}>{l}</Semi>
          </RowOpt>
        ))}
        {d.sexo === 'X' ? (
          <View style={{ marginBottom: 14, padding: 12, backgroundColor: '#FFF6EA', borderWidth: 1.5, borderColor: '#FFC98A', borderRadius: 12 }}>
            <Text style={{ fontFamily: F.body, fontSize: 13, color: '#B06A12', lineHeight: 19 }}>
              <Text style={{ fontFamily: F.bodyBold }}>⚠️ Este dato afecta tu cálculo.</Text> El sexo biológico determina tu gasto calórico basal y el mínimo de calorías seguras al día. Sin él usamos un promedio que puede no ser preciso para ti. Si puedes, elige Mujer u Hombre para un plan más exacto.
            </Text>
          </View>
        ) : (
          <Muted sm style={{ marginBottom: 14 }}>Solo se usa para calcular tu energía y el piso mínimo de calorías seguras. No se comparte con nadie.</Muted>
        )}
        <NumField key="Edad" label="Edad" value={d.edad} onChange={(v) => set('edad', v)} suffix="años" min={15} max={90} hint="Toca el número para escribirlo, o usa − / +." />
        <NumField key="Peso" label="Peso" value={d.pesoKg} onChange={(v) => set('pesoKg', v)} suffix="kg" min={35} max={250} />
        <NumField key="Estatura" label="Estatura" value={d.estaturaCm} onChange={(v) => set('estaturaCm', v)} suffix="cm" min={130} max={220} />
        <Text style={{ fontFamily: F.displaySemi, fontSize: 15, color: C.ink, marginBottom: 7 }}>Nivel de actividad</Text>
        {[['sedentario', 'Sedentario'], ['ligero', 'Ligero (1–2 días)'], ['moderado', 'Moderado (3–4 días)'], ['activo', 'Activo (5–6 días)'], ['intenso', 'Muy intenso']].map(([v, l]) => (
          <RowOpt key={v} on={d.actividad === v} onPress={() => set('actividad', v)}>
            <Semi style={{ fontSize: 15 }}>{l}</Semi>
          </RowOpt>
        ))}
      </Screen>
    );

  if (step === 'medidas')
    return (
      <Screen
        key="medidas"
        title="Medidas corporales"
        back={() => setStep('datos')}
        footer={
          <>
            <Btn big label="Calcular mi plan" onPress={() => setStep('resultados')} />
            <Btn kind="ghost" label="No tengo cinta — lo hago más tarde" onPress={() => setSkipWarn(true)} style={{ marginTop: 4 }} />
          </>
        }
      >
        <Muted style={{ marginTop: 4 }}>Con esto calculamos tu % de grasa, estructura ósea, ICM y peso corporal ideal personalizado.</Muted>
        <Muted sm style={{ marginBottom: 12, marginTop: 4 }}>Necesitas una cinta métrica. Mide en cm sobre la piel, sin apretar.</Muted>
        <NumField key="Cuello" label="Cuello" value={d.cuelloCm ?? DEMO.cuelloCm} onChange={(v) => set('cuelloCm', v)} suffix="cm" min={25} max={60} />
        <NumField key="Cintura" label="Cintura" value={d.cinturaCm ?? DEMO.cinturaCm} onChange={(v) => set('cinturaCm', v)} suffix="cm" min={50} max={180} />
        {d.sexo === 'F' && <NumField key="Cadera" label="Cadera" value={d.caderaCm ?? DEMO.caderaCm} onChange={(v) => set('caderaCm', v)} suffix="cm" min={60} max={180} />}
        <NumField key="Muñeca" label="Muñeca" value={d.munecaCm ?? DEMO.munecaCm} onChange={(v) => set('munecaCm', v)} suffix="cm" min={10} max={30} hint="Mide alrededor de la muñeca en su parte más delgada." />
        {skipWarn && (
          <Sheet onClose={() => setSkipWarn(false)} colors="#FFF3E0">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, backgroundColor: '#E0556E', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>💡</Text>
              </View>
              <Display style={{ fontSize: 19, color: '#B06A12' }}>Aviso importante</Display>
            </View>
            <Text style={{ fontFamily: F.body, fontSize: 14, color: '#7a5030', lineHeight: 22, marginBottom: 16 }}>
              Las medidas de cuello, cintura, cadera y muñeca nos permiten calcular tu distribución de grasa, riesgo cardiometabólico, estructura ósea y peso ideal personalizado. Sin ellas, tu plan será menos preciso.{'\n\n'}
              <Text style={{ fontFamily: F.bodyBold, color: '#B06A12' }}>Recuerda ingresarlas en cuanto te sea posible.</Text>
            </Text>
            <Btn
              big
              label="Entendido, las agrego después"
              onPress={() => {
                setSkipWarn(false);
                setD((p) => ({ ...p, cuelloCm: null, cinturaCm: null, caderaCm: null, munecaCm: null }));
                setStep('resultados');
              }}
            />
          </Sheet>
        )}
      </Screen>
    );

  if (step === 'resultados') {
    const r = computeProfile(d);
    const riesgoCol = r.icmRiesgo === 'alto' ? '#E0556E' : r.icmRiesgo === 'moderado' ? '#F2B705' : '#34BC97';
    return (
      <Screen key="resultados" title="Tu plan" back={() => setStep('medidas')} footer={<Btn big label="¡Me encanta!" onPress={() => setStep('nombrar')} />}>
        <View style={{ alignItems: 'center' }}>
          <Nacimiento paletteKey={colorNacer} size={80} espera />
        </View>
        <Card colors={['#FCEFF1', '#EEF7F4']} style={{ alignItems: 'center' }}>
          <Muted>Tu meta diaria · {d.objetivo === 'ganar' ? '⬆️ Ganar peso' : d.objetivo === 'mantener' ? '⚖️ Mantener' : '⬇️ Perder peso'}</Muted>
          <Text style={{ fontFamily: F.display, fontSize: 44, color: C.ink }}>
            {r.objetivoDeficit}
            <Text style={{ fontSize: 18 }}> kcal</Text>
          </Text>
          <Macros style={{ justifyContent: 'center' }} items={[['Proteína ' + r.prote + ' g', '#7C5CFF'], ['Grasa ' + r.grasa + ' g', '#F2B705'], ['Carbos ' + r.carbs + ' g', '#34BC97']]} />
        </Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Stat k="IMC" v={r.imc} s="" />
          <Stat k="% Grasa" v={r.bf != null ? r.bf : '—'} s={r.bf ? '%' : ''} />
          <Stat k="Masa magra" v={r.masaMagra != null ? r.masaMagra : '—'} s={r.masaMagra ? ' kg' : ''} />
          <Stat k="Metab. basal" v={r.bmr} s="" />
          <Stat k="Gasto total" v={r.tdee} s="" />
          <Stat k="Agua" v={(r.aguaMl / 1000).toFixed(1)} s=" L" />
          {r.frameSize && <Stat k="Estructura" v={r.frameSize} s="" />}
          {r.pesoIdeal && <Stat k="Peso ideal" v={r.pesoIdeal} s=" kg" />}
          {r.icm != null && <Stat k={'ICM · riesgo ' + r.icmRiesgo} v={r.icm} s="" color={riesgoCol} />}
        </View>
        {!r.bf && <Muted sm style={{ marginBottom: 10 }}>Sin medidas solo calculamos por peso. Agrégalas después en Ajustes → Rehacer mi perfil para ver % grasa, ICM y peso ideal.</Muted>}
        <Pressable onPress={() => setShowInfo((v) => !v)} style={{ backgroundColor: C.soft, borderRadius: 14, padding: 12, marginBottom: 8 }}>
          <Text style={{ fontFamily: F.bodyBold, fontSize: 13, color: C.muted }}>{showInfo ? '▲ Ocultar explicaciones' : 'ℹ️ ¿Qué significa cada dato?'}</Text>
        </Pressable>
        {showInfo && (
          <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            {INFO.map(([term, def]) => (
              <Text key={term} style={{ fontFamily: F.body, fontSize: 13, lineHeight: 20, color: '#4a4f6a', marginBottom: 7 }}>
                <Text style={{ fontFamily: F.bodyBold, color: C.ink }}>{term}</Text> — {def}
              </Text>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#EAF7F2', borderRadius: 14, padding: 12 }}>
          <Text style={{ fontSize: 18 }}>🛡️</Text>
          <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13, lineHeight: 19, color: '#3d6b5c' }}>
            Estos cálculos son orientativos y no sustituyen a un profesional de la salud. Nunca te pediremos comer por debajo de un mínimo seguro. Si tu relación con la comida te preocupa, entra a <Text style={{ fontFamily: F.bodyBold }}>Ajustes → Apoyo</Text>.
          </Text>
        </View>
      </Screen>
    );
  }

  // nombrar y nacer
  return (
    <LinearGradient colors={['#F3ECFF', '#E7F7F4']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: insets.top }}>
      <Nacimiento key={hatching ? 'nace' : 'espera'} paletteKey={colorNacer} size={190} espera={!hatching} onListo={() => setTimeout(() => onboardingDone({ ...d }, (name || 'Axo').trim() || 'Axo', colorNacer), 1500)} />
      {!hatching ? (
        <View style={{ width: '100%', maxWidth: 320, alignItems: 'center' }}>
          <Display style={{ fontSize: 24, marginTop: 4 }}>¡Está a punto de nacer!</Display>
          <Muted style={{ marginBottom: 10 }}>¿Cómo lo vas a llamar?</Muted>
          <TextInput
            value={name}
            maxLength={14}
            onChangeText={setName}
            style={{ width: '100%', textAlign: 'center', fontFamily: F.display, fontSize: 24, color: C.ink, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: C.line, paddingVertical: 10, marginBottom: 14 }}
          />
          <Btn big label="¡Que nazca! 🥚💗" onPress={() => setHatching(true)} />
        </View>
      ) : (
        <Display style={{ fontSize: 22, color: C.pink, marginTop: 8 }}>¡Naciendo… 🥚✨!</Display>
      )}
    </LinearGradient>
  );
}

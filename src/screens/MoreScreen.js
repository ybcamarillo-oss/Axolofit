import React from 'react';
import { View, Text, Linking } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LOGO_PATHS } from '../components/logoPath';
import { useApp } from '../store';
import { avisoDePrueba } from '../notifications';
import { C, F } from '../theme';
import { Screen, Btn, Card, CardH, Muted, ListRow } from '../ui';

const Fila = ({ onPress, children, color }) => (
  <ListRow onPress={onPress}>
    <Text style={{ flex: 1, fontFamily: F.displaySemi, fontSize: 15, color: color || C.ink }}>{children}</Text>
    <Text style={{ fontFamily: F.display, fontSize: 18, color: '#c7cad6' }}>›</Text>
  </ListRow>
);

// Ajustes
export default function MoreScreen() {
  const a = useApp();
  const { avisos, petName } = a;
  const tocarAvisos = async () => {
    if (avisos === 'activados') {
      await avisoDePrueba(petName);
      a.showToast('Te llega un aviso de prueba en 5 segundos 🔔');
    } else if (avisos === 'bloqueados') {
      const est = await a.activarAvisos();
      if (est !== 'activados') Linking.openSettings();
    } else a.activarAvisos();
  };
  return (
    <Screen title="Ajustes" back={() => a.setScreen('home')} contentStyle={{ paddingBottom: 100 }}>
      <Card colors={['#FFF6DC', '#FFEFF4']}>
        <CardH>👑 AxoloFit Premium</CardH>
        <Muted sm>IA por foto ilimitada · recetas infinitas · skins y especies raras · informes avanzados · minijuegos exclusivos.</Muted>
        <Btn label="Ver planes" onPress={() => a.setOverlay('paywall')} style={{ marginTop: 10 }} />
      </Card>
      <Fila onPress={() => a.setOverlay('prefs')}>🥗 Preferencias y alergias</Fila>
      <Fila onPress={tocarAvisos}>
        🔔 {avisos === 'activados' ? 'Avisos activados ✓ · toca para probar' : avisos === 'bloqueados' ? 'Avisos bloqueados (actívalos en ajustes del teléfono)' : 'Activar avisos de ' + petName}
      </Fila>
      <Fila onPress={() => a.setOverlay('privacy')}>🛡️ Aviso de privacidad</Fila>
      <Fila onPress={() => a.showToast('Línea de la Vida (SSA): 800 911 2000 · 24/7')}>💗 Apoyo y bienestar</Fila>
      <Fila onPress={() => a.setOverlay('rename')}>✏️ Cambiar el nombre de {petName}</Fila>
      <Fila onPress={() => a.setPhase('onboarding')}>📝 Rehacer mi perfil</Fila>
      <Fila onPress={a.cerrarSesion} color="#c0392b">🚪 Cerrar sesión</Fila>
      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <Svg viewBox="230 40 220 190" width={92} height={80}>
          <Path d={LOGO_PATHS[0]} fill="#2A2D43" />
          <Circle cx={303.1} cy={160.9} r={12.5} fill="#fff" />
          <Circle cx={376.1} cy={161.7} r={12.5} fill="#fff" />
        </Svg>
        <Text style={{ fontFamily: F.body, fontSize: 20, color: C.ink }}>
          Ricky <Text style={{ fontFamily: F.bodyBold }}>Rabbit</Text>
        </Text>
        <Text style={{ fontFamily: F.body, fontSize: 17, color: C.ink }}>Dev Studio</Text>
        <Muted sm style={{ textAlign: 'center', marginTop: 8 }}>AxoloFit es un producto de Ricky Rabbit Dev Studio.</Muted>
        <Muted sm style={{ textAlign: 'center', marginTop: 6, fontSize: 11.5, opacity: 0.8 }}>Herramienta de seguimiento y educación nutricional. No sustituye la atención de un profesional de la salud.</Muted>
      </View>
    </Screen>
  );
}

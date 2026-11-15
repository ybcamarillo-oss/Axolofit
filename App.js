import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { AppProvider, useApp } from './src/store';
import { C, F } from './src/theme';
import { AxoMini } from './src/components/Axo';
import Overlays from './src/overlays';
import AuthScreen from './src/screens/AuthScreen';
import Onboarding from './src/screens/Onboarding';
import HomeScreen from './src/screens/HomeScreen';
import LogScreen from './src/screens/LogScreen';
import SemanaScreen from './src/screens/SemanaScreen';
import StatsScreen from './src/screens/StatsScreen';
import PetScreen from './src/screens/PetScreen';
import MoreScreen from './src/screens/MoreScreen';
import { ArcadeScreen, LeaderboardScreen } from './src/screens/ArcadeScreen';
import { QuizScreen, MemoScreen, SimonScreen, CatchScreen, CalScreen } from './src/screens/Games';

SplashScreen.preventAutoHideAsync().catch(() => {});

const PANTALLAS = {
  home: HomeScreen,
  log: LogScreen,
  semana: SemanaScreen,
  stats: StatsScreen,
  pet: PetScreen,
  more: MoreScreen,
  arcade: ArcadeScreen,
  leaderboard: LeaderboardScreen,
  game_quiz: QuizScreen,
  game_memo: MemoScreen,
  game_simon: SimonScreen,
  game_catch: CatchScreen,
  game_cal: CalScreen,
};

// Barra de abajo: las mismas 5 secciones que la PWA
function Nav() {
  const a = useApp();
  const insets = useSafeAreaInsets();
  const tabs = [
    ['home', '🏠', 'Inicio'],
    ['semana', '📅', 'Semana'],
    ['stats', '📊', 'Progreso'],
    ['pet', '✨', a.petName],
    ['more', '⚙️', 'Ajustes'],
  ];
  return (
    <View style={[st.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map(([k, ic, l]) => {
        const on = a.screen === k;
        return (
          <Pressable key={k} onPress={() => a.setScreen(k)} style={st.navBtn}>
            <Text style={{ fontSize: 20, opacity: on ? 1 : 0.55 }}>{ic}</Text>
            <Text numberOfLines={1} style={{ fontFamily: F.displaySemi, fontSize: 11, color: on ? C.pink : C.gray }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Raiz() {
  const a = useApp();
  const insets = useSafeAreaInsets();

  if (a.phase === 'cargando')
    return (
      <LinearGradient colors={['#F3ECFF', '#E7F7F4']} style={st.centro}>
        <AxoMini paletteKey="durazno" size={130} />
        <Text style={{ fontFamily: F.body, color: C.muted, marginTop: 8 }}>Cargando a tu Axo…</Text>
      </LinearGradient>
    );
  if (a.phase === 'auth') return <AuthScreen />;
  if (a.phase === 'onboarding') return <Onboarding />;

  const Pantalla = PANTALLAS[a.screen] || HomeScreen;
  return (
    <View style={{ flex: 1 }}>
      <Pantalla key={a.screen} />
      <Nav />
      <Overlays />
      {a.toast && (
        <View pointerEvents="none" style={[st.toast, { bottom: insets.bottom + 150 }]}>
          <Text style={st.toastTxt}>{a.toast}</Text>
        </View>
      )}
    </View>
  );
}

// Aviso flotante también fuera de la app principal (login, cuestionario)
function ToastFuera() {
  const a = useApp();
  const insets = useSafeAreaInsets();
  if (!a.toast || a.phase === 'app') return null;
  return (
    <View pointerEvents="none" style={[st.toast, { bottom: insets.bottom + 40 }]}>
      <Text style={st.toastTxt}>{a.toast}</Text>
    </View>
  );
}

export default function App() {
  const [fontsOk] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold, Nunito_600SemiBold, Nunito_800ExtraBold });
  useEffect(() => {
    if (fontsOk) SplashScreen.hideAsync().catch(() => {});
  }, [fontsOk]);
  if (!fontsOk) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <Raiz />
        <ToastFuera />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nav: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: '#fffffff2', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, elevation: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -3 } },
  navBtn: { flex: 1, alignItems: 'center', gap: 1 },
  toast: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  toastTxt: { fontFamily: F.bodyBold, fontSize: 14, color: '#fff', backgroundColor: '#2A2D43ee', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 16, overflow: 'hidden', textAlign: 'center' },
});

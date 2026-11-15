import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sb } from '../supabase';
import { C, F } from '../theme';
import Axo from '../components/Axo';

const MENSAJES = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu email antes de entrar.',
};

// Solo inicio de sesión con las mismas cuentas de la PWA.
// El registro nuevo llega en un bloque siguiente.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setError(null);
    if (!email || !pass) {
      setError('Completa email y contraseña.');
      return;
    }
    setCargando(true);
    const { error: e } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
    setCargando(false);
    if (e) setError(MENSAJES[e.message] || e.message);
  };

  return (
    <LinearGradient colors={[C.bgFrom, C.bgTo]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrap}>
        <Axo size={150} mood="amor" />
        <Text style={s.title}>¡Hola de nuevo! 💗</Text>
        <Text style={s.sub}>Entra con tu cuenta de AxoloFit</Text>

        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor={C.muted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="Contraseña"
          placeholderTextColor={C.muted}
          secureTextEntry
          autoComplete="password"
          value={pass}
          onChangeText={setPass}
          onSubmitEditing={entrar}
        />
        {error && <Text style={s.error}>{error}</Text>}

        <Pressable onPress={entrar} disabled={cargando} style={({ pressed }) => [{ width: '100%', transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <LinearGradient colors={[C.pinkLight, C.pink]} style={s.btn}>
            {cargando ? <ActivityIndicator color={C.brown} /> : <Text style={s.btnTxt}>Entrar</Text>}
          </LinearGradient>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  title: { fontFamily: F.display, fontSize: 26, color: C.ink, marginTop: 4 },
  sub: { fontFamily: F.body, fontSize: 15, color: C.muted, marginBottom: 8 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: F.body,
    fontSize: 16,
    color: C.ink,
  },
  error: { fontFamily: F.body, color: '#D0556E', alignSelf: 'flex-start' },
  btn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnTxt: { fontFamily: F.displaySemi, fontSize: 18, color: C.brown },
});

import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sb } from '../supabase';
import { useApp } from '../store';
import { C, F } from '../theme';
import { Btn, Display, Muted, Input, Sheet } from '../ui';
import { AvisoTexto, AVISO_VERSION } from '../privacidad';
import Axo from '../components/Axo';

// Entrar, crear cuenta y recuperar contraseña con código (igual que en la PWA).

// Ojito de la contraseña: cerrado cuando se ven asteriscos, abierto cuando se ve la contraseña
function Ojito({ abierto }) {
  const col = '#7A7F99';
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {abierto ? (
        <>
          <Path d="M2 12 Q12 3 22 12 Q12 21 2 12 Z" fill="none" stroke={col} strokeWidth={1.8} strokeLinejoin="round" />
          <Circle cx={12} cy={12} r={3.4} fill={col} />
        </>
      ) : (
        <>
          <Path d="M2 10 Q12 18 22 10" fill="none" stroke={col} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M5.5 13.2 L4 15.6 M9.5 15 L9 17.6 M14.5 15 L15 17.6 M18.5 13.2 L20 15.6" stroke={col} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

const MSGS = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'User already registered': 'Este email ya tiene cuenta. Inicia sesión.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'El email no es válido.',
  'Email not confirmed': 'Confirma tu email antes de entrar (revisa tu correo).',
};

const Marco = ({ children }) => {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={['#F3ECFF', '#E7F7F4']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 26, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
        >
          <View style={{ width: '100%', maxWidth: 340, alignItems: 'center' }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};
const Err = ({ children }) => (children ? <Text style={{ fontFamily: F.bodyBold, color: '#c0392b', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{children}</Text> : null);

export default function AuthScreen() {
  const { handleAuth, showToast } = useApp();
  const [acepto, setAcepto] = useState(false);
  const [verAviso, setVerAviso] = useState(false);
  const [modo, setModo] = useState('login'); // 'login' | 'registro' | 'reset'
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerificado, setOtpVerificado] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const mail = email.trim();

  const handleSubmit = async () => {
    setError(null);
    if (!mail || !pass) return setError('Completa email y contraseña.');
    if (modo === 'registro' && !nombre) return setError('¿Cómo te llamamos?');
    if (modo === 'registro' && pass !== pass2) return setError('Las contraseñas no coinciden.');
    if (modo === 'registro' && !acepto) return setError('Para crear tu cuenta necesitas aceptar el aviso de privacidad.');
    setCargando(true);
    try {
      if (modo === 'login') {
        const { data, error: e } = await sb.auth.signInWithPassword({ email: mail, password: pass });
        if (e) throw e;
        await handleAuth(data.user, null);
      } else {
        // El consentimiento queda guardado en la cuenta, con fecha y versión del aviso
        const { data, error: e } = await sb.auth.signUp({
          email: mail,
          password: pass,
          options: { data: { consentimiento_privacidad: new Date().toISOString(), aviso_version: AVISO_VERSION } },
        });
        if (e) throw e;
        if (data.user && !data.session) setConfirmado(true);
        else await handleAuth(data.user, nombre);
      }
    } catch (e) {
      setError(MSGS[e.message] || e.message);
    }
    setCargando(false);
  };

  const handleReset = async () => {
    setError(null);
    if (!mail) return setError('Escribe tu email primero.');
    setCargando(true);
    try {
      const { error: e } = await sb.auth.signInWithOtp({ email: mail, options: { shouldCreateUser: false } });
      if (e) throw e;
      setResetEnviado(true);
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  };

  const handleVerifyOtp = async () => {
    setCargando(true);
    setOtpError(null);
    try {
      const { error: e } = await sb.auth.verifyOtp({ email: mail, token: otpCode.trim(), type: 'email' });
      if (e) throw e;
      setOtpVerificado(true);
    } catch (e) {
      setOtpError('Código incorrecto o expirado. Intenta de nuevo.');
    }
    setCargando(false);
  };

  const handleNuevaPass = async () => {
    setError(null);
    if (!pass || pass.length < 6) return setError('Mínimo 6 caracteres.');
    if (pass !== pass2) return setError('Las contraseñas no coinciden.');
    setCargando(true);
    try {
      const { data, error: e } = await sb.auth.updateUser({ password: pass });
      if (e) throw e;
      showToast('¡Contraseña actualizada! 🔐');
      // el código ya inició la sesión: entramos directo
      await handleAuth(data.user, null);
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  };

  const passInput = (
    <View style={{ width: '100%' }}>
      <Input placeholder="Contraseña (mín. 6 caracteres)" secureTextEntry={!showPass} autoCapitalize="none" value={pass} onChangeText={setPass} style={{ paddingRight: 54 }} />
      <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={10} style={{ position: 'absolute', right: 12, top: 11 }}>
        <Ojito abierto={showPass} />
      </Pressable>
    </View>
  );
  const passConfirm = (
    <Input
      placeholder="Repite la contraseña"
      secureTextEntry={!showPass}
      autoCapitalize="none"
      value={pass2}
      onChangeText={setPass2}
      style={[{ width: '100%' }, pass2 && pass !== pass2 ? { borderColor: '#E15B5B' } : null]}
    />
  );

  if (confirmado)
    return (
      <Marco>
        <Axo paletteKey="durazno" size={220} mood="amor" />
        <Display style={{ fontSize: 24, marginVertical: 8 }}>¡Revisa tu email! 💌</Display>
        <Muted style={{ textAlign: 'center', marginBottom: 16 }}>
          Te mandamos un link de confirmación a <Text style={{ fontFamily: F.bodyBold }}>{mail}</Text>. Ábrelo y luego regresa aquí a iniciar sesión.
        </Muted>
        <Btn big label="Ir a iniciar sesión" onPress={() => { setModo('login'); setConfirmado(false); }} />
      </Marco>
    );

  if (modo === 'reset')
    return (
      <Marco>
        <Axo paletteKey="durazno" size={190} mood={resetEnviado ? 'amor' : 'feliz'} />
        <Display style={{ fontSize: 23, marginTop: 6, textAlign: 'center' }}>
          {!resetEnviado ? '¿Olvidaste tu contraseña?' : otpVerificado ? 'Crea tu nueva contraseña 🔐' : 'Revisa tu correo 💌'}
        </Display>
        <Muted style={{ textAlign: 'center', marginTop: 4, marginBottom: 18 }}>
          {!resetEnviado ? 'Escribe tu email y te mandamos un código.' : otpVerificado ? 'Ya verificamos tu identidad. Pon tu nueva contraseña.' : 'Escribe el código que mandamos a ' + mail + '.'}
        </Muted>
        {!resetEnviado && (
          <>
            <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ width: '100%' }} />
            <Err>{error}</Err>
            <Btn big label={cargando ? 'Enviando…' : 'Enviar código 📩'} onPress={handleReset} disabled={cargando} />
            <Btn kind="ghost" label="Volver al inicio de sesión" onPress={() => { setModo('login'); setError(null); }} style={{ marginTop: 6 }} />
          </>
        )}
        {resetEnviado && !otpVerificado && (
          <>
            <Input
              placeholder="00000000"
              keyboardType="number-pad"
              maxLength={8}
              value={otpCode}
              onChangeText={(t) => setOtpCode(t.replace(/[^0-9]/g, ''))}
              style={{ width: '100%', textAlign: 'center', fontSize: 26, letterSpacing: 8, fontFamily: F.bodyBold }}
            />
            <Err>{otpError}</Err>
            <Btn big label={cargando ? 'Verificando…' : 'Verificar código ✓'} onPress={handleVerifyOtp} disabled={cargando || otpCode.length < 6} />
            <Btn kind="ghost" label="← Cambiar email" onPress={() => { setResetEnviado(false); setOtpCode(''); setOtpError(null); }} style={{ marginTop: 6 }} />
          </>
        )}
        {resetEnviado && otpVerificado && (
          <>
            {passInput}
            {passConfirm}
            <Err>{error}</Err>
            <Btn big label={cargando ? 'Guardando…' : 'Guardar nueva contraseña 🔐'} onPress={handleNuevaPass} disabled={cargando} />
          </>
        )}
      </Marco>
    );

  return (
    <Marco>
      <Axo paletteKey="durazno" size={210} mood="feliz" />
      <Display style={{ fontSize: 30, marginTop: 6 }}>AxoloFit</Display>
      <Muted style={{ marginBottom: 18 }}>{modo === 'login' ? '¡Hola de nuevo! 💗' : 'Crea tu cuenta gratis'}</Muted>
      {modo === 'registro' && <Input placeholder="¿Cómo te llamas?" value={nombre} onChangeText={setNombre} maxLength={30} style={{ width: '100%' }} />}
      <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} style={{ width: '100%' }} />
      {passInput}
      {modo === 'registro' && passConfirm}
      {modo === 'registro' && (
        <Pressable onPress={() => setAcepto((v) => !v)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, width: '100%', marginBottom: 12, marginTop: 2 }}>
          <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: acepto ? C.pink : '#c9cbd8', backgroundColor: acepto ? C.pink : '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            {acepto && <Text style={{ color: '#fff', fontFamily: F.display, fontSize: 14, marginTop: -1 }}>✓</Text>}
          </View>
          <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13, lineHeight: 18, color: '#4a4f6a' }}>
            He leído el{' '}
            <Text onPress={() => setVerAviso(true)} style={{ fontFamily: F.bodyBold, color: C.pink, textDecorationLine: 'underline' }}>aviso de privacidad</Text>
            {' '}y doy mi consentimiento expreso para el tratamiento de mis datos de salud (peso, medidas, hábitos y fotos de comida) para las finalidades descritas.
          </Text>
        </Pressable>
      )}
      <Err>{error}</Err>
      <Btn big label={cargando ? 'Cargando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'} onPress={handleSubmit} disabled={cargando || (modo === 'registro' && !acepto)} />
      <Btn
        kind="ghost"
        label={modo === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        onPress={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(null); setPass2(''); }}
        style={{ marginTop: 6 }}
      />
      {modo === 'login' && <Btn kind="ghost" label="¿Olvidaste tu contraseña?" onPress={() => { setModo('reset'); setError(null); }} textStyle={{ fontSize: 13, color: C.gray }} />}
      {verAviso && (
        <Sheet tall onClose={() => setVerAviso(false)}>
          <Display style={{ fontSize: 22, marginBottom: 8 }}>Aviso de privacidad</Display>
          <AvisoTexto />
          <Btn big label="Entendido" onPress={() => setVerAviso(false)} />
        </Sheet>
      )}
    </Marco>
  );
}

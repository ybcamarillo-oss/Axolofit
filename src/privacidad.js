import React from 'react';
import { Text } from 'react-native';
import { C, F } from './theme';

// Aviso de privacidad integral. Se usa en Ajustes y al crear cuenta.
// PENDIENTE: que un abogado revise el texto antes de publicar en Google Play.
export const CORREO_PRIVACIDAD = 'yaracdev@gmail.com';
export const AVISO_VERSION = '2026-11-24';
export const AVISO_FECHA = '24 de noviembre de 2026';

const P = ({ b, children }) => (
  <Text style={{ fontFamily: F.body, fontSize: 13.5, lineHeight: 20, color: '#4a4f6a', marginBottom: 9 }}>
    <Text style={{ fontFamily: F.bodyBold, color: C.ink }}>{b}</Text> {children}
  </Text>
);

export function AvisoTexto() {
  return (
    <>
      <Text style={{ fontFamily: F.bodyBold, fontSize: 12.5, color: '#B06A12', backgroundColor: '#FFF6EA', borderRadius: 10, padding: 9, marginBottom: 10, overflow: 'hidden' }}>
        Borrador: pendiente de revisión legal antes de publicarse.
      </Text>
      <P b="Responsable.">Yara Berenice Camarillo Pérez, bajo el nombre comercial Ricky Rabbit Dev Studio (“nosotros”), con domicilio en Paseo Aviñón 23C, Fraccionamiento Quinta Versalles, Ojo de Agua, Tecámac, Estado de México, C.P. 55767, es responsable del tratamiento de tus datos personales en AxoloFit.</P>
      <P b="Datos que recabamos.">De identificación y contacto: nombre y correo electrónico. Datos personales sensibles de salud: sexo, edad, peso, estatura, circunferencias corporales, objetivo, nivel de actividad, registros de comida y agua, y las fotos o descripciones de comida que decidas enviar para su análisis. De uso de la app: racha, nivel, puntajes de juegos y el nombre y la apariencia de tu Axo.</P>
      <P b="Finalidades.">Crear y operar tu cuenta; calcular tus requerimientos de calorías, macronutrientes y agua; estimar los nutrientes de tus comidas con inteligencia artificial; mostrar tu progreso, recordatorios y recompensas; y darte soporte. No usamos tus datos para publicidad ni para tomar decisiones médicas: AxoloFit no sustituye la atención de un profesional de la salud.</P>
      <P b="Consentimiento.">Tratamos tus datos de salud solo con tu consentimiento expreso, que nos das al crear tu cuenta marcando la casilla correspondiente, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20 de marzo de 2025).</P>
      <P b="Con quién se comparten.">Usamos proveedores que tratan los datos solo para prestarnos su servicio (encargados): Supabase (almacenamiento de la cuenta y de tus registros), Google (servicio de pago de Gemini, que analiza las fotos y descripciones de comida; en ese servicio Google no usa los datos para entrenar sus modelos), Vercel (servidor que conecta la app con Gemini) y Expo (entrega de actualizaciones de la app; no recibe tus datos de salud). Sus servidores pueden estar fuera de México. No vendemos tus datos ni los compartimos con terceros para sus propios fines. En la tabla de récords de juegos solo se muestran el nombre de tu Axo y tus puntajes.</P>
      <P b="Conservación.">Guardamos tus datos mientras tengas tu cuenta. Si la eliminas o pides la cancelación, los borramos en un plazo máximo de 30 días, salvo que una ley nos obligue a conservar algo.</P>
      <P b="Tus derechos (ARCO).">Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos, así como revocar tu consentimiento o limitar su uso, escribiendo a {CORREO_PRIVACIDAD}. Te responderemos en los plazos que marca la ley. Si consideras que no atendimos tu solicitud, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno.</P>
      <P b="Seguridad.">La información viaja cifrada (HTTPS) y cada cuenta solo puede ver sus propios datos. Ningún sistema es infalible, pero aplicamos medidas administrativas, técnicas y físicas para protegerlos.</P>
      <P b="Cambios a este aviso.">Si cambiamos este aviso te lo informaremos dentro de la app antes de que el cambio aplique. Última actualización: {AVISO_FECHA}.</P>
    </>
  );
}

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Avisos de Axo. Son notificaciones "locales": las programa el propio teléfono,
// así que funcionan sin internet y sin servidor.

const CANAL = 'axo-avisos';
const T = Notifications.SchedulableTriggerInputTypes;
const web = Platform.OS === 'web';

// Si llega un aviso con la app abierta, también se muestra.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// En Android el canal debe existir antes de pedir permiso (Android 13+).
async function asegurarCanal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Avisos de Axo',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#E79FAE',
  });
}

// 'activados' | 'sin-pedir' | 'bloqueados'
export async function estadoAvisos() {
  if (web) return 'bloqueados';
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return 'activados';
  return p.canAskAgain ? 'sin-pedir' : 'bloqueados';
}

export async function pedirAvisos() {
  if (web) return 'bloqueados';
  await asegurarCanal();
  const p = await Notifications.requestPermissionsAsync();
  if (p.granted) return 'activados';
  return p.canAskAgain ? 'sin-pedir' : 'bloqueados';
}

// Borra lo programado y lo vuelve a programar. Se llama cada vez que se abre la app,
// así el aviso de "te extraño" siempre cuenta 2 días desde la última visita.
export async function programarAvisos(nombre = 'Axo') {
  if (web) return;
  await asegurarCanal();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const diarios = [
    { hour: 9, minute: 0, title: '¡Buenos días! 🌞', body: `${nombre} ya despertó y tiene hambre. ¿Qué desayunamos?` },
    { hour: 14, minute: 30, title: 'Hora de comer 🍽️', body: `${nombre} quiere saber qué vas a comer hoy.` },
    { hour: 20, minute: 30, title: '¿Ya cenaste? 🌙', body: `Registra tu cena para que ${nombre} duerma con la pancita llena.` },
  ];
  for (const a of diarios) {
    await Notifications.scheduleNotificationAsync({
      content: { title: a.title, body: a.body },
      trigger: { type: T.DAILY, hour: a.hour, minute: a.minute, channelId: CANAL },
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: { title: `${nombre} te extraña 🥺`, body: 'Hace dos días que no vienes. Tu racha te está esperando.' },
    trigger: { type: T.TIME_INTERVAL, seconds: 48 * 60 * 60, channelId: CANAL },
  });
}

// Para probar: llega un aviso en 5 segundos (cierra o minimiza la app para verlo en la barra).
export async function avisoDePrueba(nombre = 'Axo') {
  if (web) return;
  await asegurarCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: `¡Hola! Soy ${nombre} 💗`, body: 'Así se ven mis avisos.' },
    trigger: { type: T.TIME_INTERVAL, seconds: 5, channelId: CANAL },
  });
}

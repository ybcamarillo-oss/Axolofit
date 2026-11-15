# AxoloFit nativa — puesta en marcha (una sola vez)

El código de la app nativa vive en la rama **nativa** de este repo. La rama `main` sigue siendo la PWA y el servicio de Gemini; no se toca.

Todo se hace desde el navegador. No necesitas instalar nada.

## 1. Cuenta de Expo
Crea una cuenta gratis en https://expo.dev (puedes entrar con GitHub).

## 2. Abrir una terminal en la nube (GitHub Codespaces)
En GitHub, dentro del repo `Axolofit`:
1. Cambia a la rama **nativa** (botón que dice `main`, arriba a la izquierda).
2. Botón verde **Code → pestaña Codespaces → Create codespace on nativa**.

Se abre un editor con una terminal abajo. Pega estos comandos, uno por uno:

```bash
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest update:configure
git add -A && git commit -m "Conectar con Expo" && git push
npx eas-cli@latest build -p android --profile preview
```

- `login`: tu usuario y contraseña de expo.dev.
- `init`: responde que sí a crear el proyecto.
- `build`: cuando pregunte por el "Android Keystore", responde que sí (Expo lo genera y lo guarda; es la firma de tu app, no se pierde).
- El build tarda unos 10 a 20 minutos. Al terminar te da un link y un QR: ábrelo en tu Android e instala el APK.

## 3. Conectar GitHub con Expo (actualizaciones automáticas)
En expo.dev → tu proyecto **axolofit** → **Project settings → GitHub** → instala la app de Expo y conecta el repo `Axolofit`.

Desde ahí, cada cambio que llegue a la rama `nativa` se publica solo y la app instalada lo recibe (ciérrala y ábrela dos veces).

## Cuándo sí hay que compilar otra vez
Solo si agregamos una librería nativa o cambiamos íconos o permisos. Se repite el último comando desde Codespaces.

## Qué probar en el teléfono
- Al abrir por primera vez, Axo nace del huevo. Para verlo otra vez: botón **Nacer**.
- Botones **Comer**, **Feliz**, **Con hambre** y **Etapa** (bebé, joven, adulto): son temporales, solo para revisar las caras.
- Toca **Activar avisos** y acepta el permiso. Luego **Probar aviso (5 s)** y minimiza la app: debe llegar una notificación de Axo.
- Avisos programados: 9:00, 14:30 y 20:30 todos los días, y uno de "te extraño" a los 2 días sin abrir la app.

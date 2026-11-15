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
- **Cuenta:** crear cuenta, cuestionario completo y ver nacer a Axo. Cerrar sesión y volver a entrar.
- **Inicio:** tocar a Axo (salta y manda beso), marcar vasos de agua, agregar un antojo con el botón **+** (Axo come y se soba la pancita).
- **Registrar:** buscar una comida, **Describir** (IA) y **Foto** (IA, pide permiso de cámara).
- **Meta del día:** al llegar al 80% de tus calorías sale la celebración, sube la racha y el nivel.
- **Semana:** palomear platillos, cambiar uno, regenerar el día, cambiar preferencias.
- **Progreso:** registrar tu peso y ver la gráfica.
- **Juegos:** los 5 juegos y la tabla de récords.
- **Axo:** cambiar color, accesorio, outfit y fondo.
- **Avisos:** activar avisos y, en Ajustes, tocar "Avisos activados · toca para probar" y minimizar la app.

## Cómo está organizado el código
- `App.js`: arranque, barra de abajo y qué pantalla se muestra.
- `src/store.js`: el "cerebro": datos del usuario, comidas, racha, nivel y todo lo que se guarda en Supabase.
- `src/data.js`: comidas, menús, recetas y cálculos, copiados tal cual de la PWA.
- `src/plan.js`: lógica del plan semanal.
- `src/screens/`: una pantalla por archivo. `src/overlays.js`: las ventanas que suben desde abajo.
- `src/components/`: el dibujo de Axo (`axoParts.js`), su animación (`Axo.js`) y el huevo (`Nacimiento.js`).
- `src/notifications.js`: avisos. `src/ui.js`: botones, tarjetas y demás piezas visuales.

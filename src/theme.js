// Colores y tipografía copiados de la PWA para que se sienta la misma app.
export const C = {
  ink: '#2A2D43',
  muted: '#7a8099',
  pink: '#E79FAE',
  pinkSoft: '#FCEFF1',
  pinkLight: '#F7CCD4',
  brown: '#5E4334',
  mint: '#34BC97',
  line: '#eceff7',
  card: '#ffffffcc',
  bgFrom: '#E7F7F4',
  bgTo: '#CDEFE9',
  purple: '#7C5CFF',
  blue: '#3FA9F5',
  gold: '#F2B705',
  red: '#E0556E',
  soft: '#f4f6fb',
  gray: '#9aa0b4',
};

export const F = {
  display: 'Fredoka_700Bold',
  displaySemi: 'Fredoka_600SemiBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
  bodyBlack: 'Nunito_800ExtraBold',
};

// Los colores de Axo vienen de la PWA (src/data.js)
export { PALETTES } from './data';

// Misma regla de evolución que la PWA (por días de racha).
export const evoPorRacha = (racha) =>
  racha >= 60 ? 'mistico' : racha >= 21 ? 'adulto' : racha >= 7 ? 'joven' : 'cria';

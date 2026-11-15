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
};

export const F = {
  display: 'Fredoka_700Bold',
  displaySemi: 'Fredoka_600SemiBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
};

export const PALETTES = {
  durazno: { body: '#F0C3AC', gill: '#DD9E83', blush: '#EE9A86' },
  rosa: { body: '#F4B7C6', gill: '#E388A0', blush: '#EE8FA5' },
  menta: { body: '#A9E3D0', gill: '#4FBFA0', blush: '#7FD9BD' },
  cielo: { body: '#B4D4FB', gill: '#6FA3F0', blush: '#8FBDF5' },
  morado: { body: '#C9A7F0', gill: '#8E5BD0', blush: '#BC8FE6' },
  dorado: { body: '#FFE08A', gill: '#F2B705', blush: '#FFD15C' },
  galaxia: { body: '#C9B6FF', gill: '#7C5CFF', blush: '#A98FFF' },
  leucistico: { body: '#FBE7EA', gill: '#FF7088', blush: '#F6C9D2' },
  albino: { body: '#F7E6A0', gill: '#EFC850', blush: '#F2DA8A' },
  melanico: { body: '#5E5E6B', gill: '#3F3F4A', blush: '#73737F' },
  salvaje: { body: '#9C8B63', gill: '#6E5E3C', blush: '#8A7A52' },
  cobre: { body: '#C98E63', gill: '#A8693F', blush: '#BE8055' },
  arcoiris: { body: '#C9A7F0', gill: '#8E5BD0', blush: '#FFB3D9' },
};

// Misma regla de evolución que la PWA (por días de racha).
export const evoPorRacha = (racha) =>
  racha >= 60 ? 'mistico' : racha >= 21 ? 'adulto' : racha >= 7 ? 'joven' : 'cria';

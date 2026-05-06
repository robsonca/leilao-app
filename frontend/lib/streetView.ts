const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

interface StreetViewOpts {
  width?: number;
  height?: number;
  fov?: number;
  pitch?: number;
}

// Monta a query de localização mais precisa possível para o Street View.
// Para apartamentos, remove o sufixo de unidade/bloco (", Apto X, BL Y")
// que confunde o geocodificador. Para todos, adiciona bairro + cidade.
export function buildLocationQuery(imovel: {
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: string;
}): string {
  let rua = imovel.endereco;
  if (imovel.tipo === 'Apartamento') {
    rua = rua.replace(/,?\s*Apto\b.*/i, '').trim();
  }
  return `${rua}, ${imovel.bairro}, ${imovel.cidade}`;
}

export function streetViewUrl(
  imovel: { endereco: string; bairro: string; cidade: string; tipo: string },
  opts: StreetViewOpts = {},
): string {
  const { width = 640, height = 420, fov = 80, pitch = 5 } = opts;
  const location = buildLocationQuery(imovel);
  return (
    `https://maps.googleapis.com/maps/api/streetview` +
    `?size=${width}x${height}` +
    `&location=${encodeURIComponent(location)}` +
    `&fov=${fov}&pitch=${pitch}` +
    `&key=${API_KEY}`
  );
}

export function streetViewWebUrl(imovel: {
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: string;
}): string {
  const location = buildLocationQuery(imovel);
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&layer=c`;
}

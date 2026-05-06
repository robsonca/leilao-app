const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

interface StreetViewOpts {
  width?: number;
  height?: number;
  fov?: number;
  pitch?: number;
}

export function streetViewUrl(endereco: string, opts: StreetViewOpts = {}): string {
  const { width = 640, height = 420, fov = 80, pitch = 5 } = opts;
  return (
    `https://maps.googleapis.com/maps/api/streetview` +
    `?size=${width}x${height}` +
    `&location=${encodeURIComponent(endereco)}` +
    `&fov=${fov}&pitch=${pitch}` +
    `&key=${API_KEY}`
  );
}

export function streetViewWebUrl(endereco: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&layer=c`;
}

/**
 * GPS API client — ControlGPS (track16)
 *
 * Only uses wsAcc=vl (vehicle list). Read-only.
 */

export type GpsVehicle = {
  id: string;
  name: string;
  date: string;
  lat: string;
  long: string;
  speed: string;
  engine: string;        // "0" = off, "1" = on
  odometer: string;
  drivingStatus: string; // "Movimiento", "Parado", etc.
};

export async function fetchGpsVehicles(): Promise<GpsVehicle[]> {
  const baseUrl = process.env.GPS_API_BASE_URL;
  const apiKey = process.env.GPS_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("GPS_API_BASE_URL y GPS_API_KEY son obligatorios");
  }

  const url = `${baseUrl}?wsKey=${encodeURIComponent(apiKey)}&wsAcc=vl&format=json`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`GPS API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("GPS API: respuesta no es un array");
  }

  return data as GpsVehicle[];
}

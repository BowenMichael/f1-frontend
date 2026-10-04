import { LocationPoint } from '../types/replay';

const API_URL = 'https://api.openf1.org/v1/';

export async function GETLocations(
  sessionKey: number,
  driverNumber?: number,
  dateAfter?: string,
  dateBefore?: string
): Promise<LocationPoint[]> {
  const params = new URLSearchParams();
  params.append('session_key', sessionKey.toString());
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }
  if (dateAfter) {
    params.append('date>', dateAfter);
  }
  if (dateBefore) {
    params.append('date<', dateBefore);
  }

  const queryString = params.toString();
  const url = `${API_URL}location?${queryString}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

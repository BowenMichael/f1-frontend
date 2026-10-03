export interface Driver {
  broadcast_name: string;
  country_code: string | null;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string | null;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string | null;
  team_name: string | null;
}

const API_URL = 'https://api.openf1.org/v1/';

export async function GETDrivers(driverNumber?: number, sessionKey?: number): Promise<Driver[]> {
  const params = new URLSearchParams();
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }
  if (sessionKey !== undefined) {
    params.append('session_key', sessionKey.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}drivers${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch drivers: ${res.statusText}`);
  }

  const data: Driver[] = await res.json();
  return data;
}

export interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_type: string;
  meeting_key: number;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export async function GETSessions(
  countryName?: string,
  sessionName?: string,
  year?: number
): Promise<Session[]> {
  const params = new URLSearchParams();
  if (countryName) params.append('country_name', countryName);
  if (sessionName) params.append('session_name', sessionName);
  if (year) params.append('year', year.toString());

  const queryString = params.toString();
  const url = `${API_URL}sessions${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch sessions: ${res.statusText}`);
  }

  const data: Session[] = await res.json();
  return data;
}

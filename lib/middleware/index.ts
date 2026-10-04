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

const apiCache = new Map<string, Promise<any>>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fetchWithRetry(url: string, retries = 3, delay = 1200): Promise<any> {
  return fetch(url)
    .then(async (res) => {
      if (res.status === 429 && retries > 0) {
        await wait(delay);
        return fetchWithRetry(url, retries - 1, delay * 1.5);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .catch(async (err) => {
      if (retries > 0) {
        await wait(delay);
        return fetchWithRetry(url, retries - 1, delay * 1.5);
      }
      throw err;
    });
}

function cachedFetch<T>(url: string): Promise<T> {
  const cached = apiCache.get(url);
  if (cached) {
    return cached as Promise<T>;
  }
  const promise = fetchWithRetry(url).catch((err) => {
    apiCache.delete(url);
    throw err;
  });
  apiCache.set(url, promise);
  return promise as Promise<T>;
}

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
  return cachedFetch<Driver[]>(url);
}

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  country_flag?: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type?: string;
  circuit_info_url?: string;
  circuit_image?: string;
  gmt_offset: string;
  date_start: string;
  date_end: string;
  year: number;
  is_cancelled?: boolean;
}

export async function GETMeetings(year?: number): Promise<Meeting[]> {
  const params = new URLSearchParams();
  if (year !== undefined) {
    params.append('year', year.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}meetings${queryString ? `?${queryString}` : ''}`;
  return cachedFetch<Meeting[]>(url);
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
  is_cancelled?: boolean;
}

export async function GETSessions(
  countryName?: string,
  sessionName?: string,
  year?: number,
  meetingKey?: number
): Promise<Session[]> {
  const params = new URLSearchParams();
  if (countryName) params.append('country_name', countryName);
  if (sessionName) params.append('session_name', sessionName);
  if (year !== undefined) params.append('year', year.toString());
  if (meetingKey !== undefined) params.append('meeting_key', meetingKey.toString());

  const queryString = params.toString();
  const url = `${API_URL}sessions${queryString ? `?${queryString}` : ''}`;
  return cachedFetch<Session[]>(url);
}

export interface Lap {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  duration_sector_1?: number | null;
  duration_sector_2?: number | null;
  duration_sector_3?: number | null;
  i1_speed?: number | null;
  i2_speed?: number | null;
  is_pit_out_lap?: boolean | null;
  lap_duration: number | null;
  st_speed?: number | null;
}

export async function GETLaps(sessionKey: number, driverNumber?: number): Promise<Lap[]> {
  const params = new URLSearchParams();
  params.append('session_key', sessionKey.toString());
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}laps?${queryString}`;
  return cachedFetch<Lap[]>(url);
}

export interface Interval {
  date: string;
  session_key: number;
  meeting_key: number;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
}

export async function GETIntervals(sessionKey: number, driverNumber?: number): Promise<Interval[]> {
  const params = new URLSearchParams();
  params.append('session_key', sessionKey.toString());
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}intervals?${queryString}`;
  return cachedFetch<Interval[]>(url);
}

export interface Stint {
  meeting_key: number;
  session_key: number;
  stint_number: number;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export async function GETStints(sessionKey: number, driverNumber?: number): Promise<Stint[]> {
  const params = new URLSearchParams();
  params.append('session_key', sessionKey.toString());
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}stints?${queryString}`;
  return cachedFetch<Stint[]>(url);
}

export interface Position {
  date: string;
  session_key: number;
  meeting_key: number;
  driver_number: number;
  position: number;
}

export async function GETPositions(sessionKey: number, driverNumber?: number): Promise<Position[]> {
  const params = new URLSearchParams();
  params.append('session_key', sessionKey.toString());
  if (driverNumber !== undefined) {
    params.append('driver_number', driverNumber.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}position?${queryString}`;
  return cachedFetch<Position[]>(url);
}

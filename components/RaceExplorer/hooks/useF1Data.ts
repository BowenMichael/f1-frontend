import { useState, useEffect } from 'react';
import {
  GETMeetings,
  GETSessions,
  GETDrivers,
  Meeting,
  Session,
  Driver,
} from '../../../lib/middleware';
import { getDefaultSeason } from '../../../utils/seasons';

export interface UseF1DataReturn {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  meetings: Meeting[];
  loadingMeetings: boolean;
  meetingsError: string | null;
  selectedMeetingKey: number | null;
  setSelectedMeetingKey: (key: number | null) => void;
  selectedMeeting: Meeting | undefined;
  sessions: Session[];
  loadingSessions: boolean;
  sessionsError: string | null;
  selectedSessionKey: number | null;
  setSelectedSessionKey: (key: number | null) => void;
  drivers: Driver[];
  loadingDrivers: boolean;
  driversError: string | null;
}

export function useF1Data(initialSeason?: string): UseF1DataReturn {
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason || getDefaultSeason());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState<boolean>(false);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);
  const [driversError, setDriversError] = useState<string | null>(null);

  // Fetch meetings when selected season changes
  useEffect(() => {
    let isMounted = true;
    setLoadingMeetings(true);
    setMeetingsError(null);
    setSelectedMeetingKey(null);
    setSessions([]);
    setSelectedSessionKey(null);
    setDrivers([]);

    const yearNum = parseInt(selectedSeason, 10);
    GETMeetings(yearNum)
      .then((data) => {
        if (!isMounted) return;
        setMeetings(data || []);
        if (data && data.length > 0) {
          setSelectedMeetingKey(data[0].meeting_key);
        }
        setLoadingMeetings(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setMeetingsError(err instanceof Error ? err.message : 'Failed to fetch meetings');
        setLoadingMeetings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSeason]);

  // Fetch sessions when selected meeting changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedMeetingKey) {
      setSessions([]);
      setSelectedSessionKey(null);
    } else {
      setLoadingSessions(true);
      setSessionsError(null);
      setSelectedSessionKey(null);
      setDrivers([]);

      GETSessions(undefined, undefined, undefined, selectedMeetingKey)
        .then((data) => {
          if (!isMounted) return;
          const sessionList = data || [];
          setSessions(sessionList);
          if (sessionList.length > 0) {
            // Default to Race session if available, else first session
            const raceSession = sessionList.find(
              (s) =>
                s.session_name.toLowerCase().includes('race') &&
                !s.session_name.toLowerCase().includes('sprint')
            );
            setSelectedSessionKey(
              raceSession ? raceSession.session_key : sessionList[0].session_key
            );
          }
          setLoadingSessions(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setSessionsError(err instanceof Error ? err.message : 'Failed to fetch sessions');
          setLoadingSessions(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedMeetingKey]);

  // Fetch drivers when selected session changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedSessionKey) {
      setDrivers([]);
    } else {
      setLoadingDrivers(true);
      setDriversError(null);

      GETDrivers(undefined, selectedSessionKey)
        .then((data) => {
          if (!isMounted) return;
          const driverList = data || [];
          const uniqueDrivers = Array.from(
            new Map(driverList.map((d) => [d.driver_number, d])).values()
          );
          setDrivers(uniqueDrivers);
          setLoadingDrivers(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setDriversError(err instanceof Error ? err.message : 'Failed to fetch drivers');
          setLoadingDrivers(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedSessionKey]);

  const selectedMeeting = meetings.find((m) => m.meeting_key === selectedMeetingKey);

  return {
    selectedSeason,
    setSelectedSeason,
    meetings,
    loadingMeetings,
    meetingsError,
    selectedMeetingKey,
    setSelectedMeetingKey,
    selectedMeeting,
    sessions,
    loadingSessions,
    sessionsError,
    selectedSessionKey,
    setSelectedSessionKey,
    drivers,
    loadingDrivers,
    driversError,
  };
}

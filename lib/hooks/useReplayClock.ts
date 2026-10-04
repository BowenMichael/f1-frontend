import { useState, useEffect, useRef, useCallback } from 'react';
import { PlaybackSpeed } from '../types/replay';

export interface UseReplayClockOptions {
  startTime: number;
  endTime: number;
  initialSpeed?: PlaybackSpeed;
}

export function useReplayClock({ startTime, endTime, initialSpeed = 1 }: UseReplayClockOptions) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(initialSpeed);
  const [currentTime, setCurrentTime] = useState<number>(startTime);

  const isPlayingRef = useRef<boolean>(isPlaying);
  const speedRef = useRef<PlaybackSpeed>(speed);
  const currentTimeRef = useRef<number>(currentTime);
  const lastFrameTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const tick = useCallback(
    (now: number) => {
      if (!isPlayingRef.current) {
        lastFrameTimeRef.current = 0;
        return;
      }

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = now;
      }
      const deltaMs = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const nextTime = currentTimeRef.current + deltaMs * speedRef.current;
      if (nextTime >= endTime) {
        currentTimeRef.current = endTime;
        setCurrentTime(endTime);
        setIsPlaying(false);
        lastFrameTimeRef.current = 0;
        return;
      }

      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);

      animFrameIdRef.current = requestAnimationFrame(tick);
    },
    [endTime]
  );

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = 0;
      animFrameIdRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastFrameTimeRef.current = 0;
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, tick]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentTimeRef.current >= endTime) {
        currentTimeRef.current = startTime;
        setCurrentTime(startTime);
      }
      return !prev;
    });
  }, [startTime, endTime]);

  const seek = useCallback(
    (targetTime: number) => {
      const bounded = Math.max(startTime, Math.min(endTime, targetTime));
      currentTimeRef.current = bounded;
      setCurrentTime(bounded);
    },
    [startTime, endTime]
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    currentTimeRef.current = startTime;
    setCurrentTime(startTime);
  }, [startTime]);

  return {
    isPlaying,
    speed,
    currentTime,
    togglePlay,
    setSpeed,
    seek,
    reset,
  };
}

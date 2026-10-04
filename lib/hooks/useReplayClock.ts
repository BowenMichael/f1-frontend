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

  const lastStateUpdateTimeRef = useRef<number>(0);

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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('replayTick', { detail: endTime }));
        }
        setCurrentTime(endTime);
        setIsPlaying(false);
        lastFrameTimeRef.current = 0;
        return;
      }

      currentTimeRef.current = nextTime;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('replayTick', { detail: nextTime }));
      }
      // Throttle React state update for controls slider to avoid full re-rendering at 60fps
      if (now - lastStateUpdateTimeRef.current >= 100) {
        lastStateUpdateTimeRef.current = now;
        setCurrentTime(nextTime);
      }

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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('replayTick', { detail: startTime }));
        }
        setCurrentTime(startTime);
      }
      return !prev;
    });
  }, [startTime, endTime]);

  const seek = useCallback(
    (targetTime: number) => {
      const bounded = Math.max(startTime, Math.min(endTime, targetTime));
      currentTimeRef.current = bounded;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('replayTick', { detail: bounded }));
      }
      setCurrentTime(bounded);
    },
    [startTime, endTime]
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    currentTimeRef.current = startTime;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('replayTick', { detail: startTime }));
    }
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

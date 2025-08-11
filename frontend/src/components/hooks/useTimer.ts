import {useCallback, useEffect, useState} from "react";

const useTimer = (initialTime: number = 0) => {
  const [time, setTime] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isActive) {
      timerId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      if (timerId) clearInterval(timerId);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isActive, time]);

  const startTimer = useCallback((initialTime: number) => {
    setTime(initialTime);
    setIsActive(true);
  }, []);
  const stopTimer = useCallback(() => setIsActive(false), []);
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(0);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };

  return { time: formatTime(time), startTimer, stopTimer, resetTimer };
};

export default useTimer;

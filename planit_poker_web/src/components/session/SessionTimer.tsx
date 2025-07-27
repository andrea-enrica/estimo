import { useEffect } from "react";
import useTimer from "../hooks/useTimer";

interface IOwnProps {
  startTime: number;
  hasRefreshed: boolean;
  isSessionActive: boolean;
}

export default function SessionTimer(props: IOwnProps) {
  const { startTime, hasRefreshed, isSessionActive } = props;
  const { time, startTimer, stopTimer } = useTimer();

  useEffect(() => {
    if (isSessionActive) {
      if (hasRefreshed) {
        startTimer(startTime);
      } else {
        startTimer(0);
      }
    } else {
      stopTimer();
    }
  }, [isSessionActive, startTime, hasRefreshed, startTimer, stopTimer]);

  return <p>{time}</p>;
}

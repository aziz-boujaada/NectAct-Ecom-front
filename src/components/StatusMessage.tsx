import type { Status } from '../types';
import { useEffect, useState } from "react";


type StatusMessageProps = {
  status: Status;
};

export function StatusMessage({ status }: StatusMessageProps) {
  const [displayStatus, setDisplayStatus] = useState<Status>(null);

  useEffect(() => {
    if (!status) return;

    // Show the message immediately when status changes
    setDisplayStatus(status);
    
    // Hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setDisplayStatus(null);
    }, 5000);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [status]);

  if (!displayStatus) return null;

  return (
    <div className={`status ${displayStatus.type}`}>
      {displayStatus.text}
    </div>
  );
}

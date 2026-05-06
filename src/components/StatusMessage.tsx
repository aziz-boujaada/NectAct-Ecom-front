import type { Status } from '../types';
import { useEffect, useState } from "react";


type StatusMessageProps = {
  status: Status;
};

export function StatusMessage({ status }: StatusMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!status) return;

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [status]);

  if (!status || !visible) return null;

  return (
    <div className={`status ${status.type}`}>
      {status.text}
    </div>
  );
}

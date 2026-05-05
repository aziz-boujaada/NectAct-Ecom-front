import type { Status } from '../types';

type StatusMessageProps = {
  status: Status;
};

export function StatusMessage({ status }: StatusMessageProps) {
  if (!status) return null;

  return <div className={`status ${status.type}`}>{status.text}</div>;
}

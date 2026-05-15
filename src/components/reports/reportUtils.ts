export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultReportRange(days = 30) {
  const to = getLocalDateString();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return {
    from: getLocalDateString(fromDate),
    to,
  };
}

export function unwrapReportData<T>(response: { data?: T } | T | null | undefined): T | null {
  if (!response) return null;

  if (typeof response === 'object' && response !== null && 'data' in response) {
    const data = (response as { data?: T }).data;
    if (data !== undefined && data !== null) return data;
  }

  return response as T;
}

export function formatRangeLabel(fromDate?: string, toDate?: string) {
  if (!fromDate || !toDate) return 'all dates';
  return `${fromDate} to ${toDate}`;
}


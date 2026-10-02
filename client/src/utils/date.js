const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

export const getDateInputValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: vietnamTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

export const toPublishedAtValue = (date) => new Date(`${date}T12:00:00+07:00`).toISOString();

export const formatPostDate = (value) => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: vietnamTimeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

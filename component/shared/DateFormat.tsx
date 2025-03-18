export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
};

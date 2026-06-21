export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_SERVER_URL || '';
  return `${baseUrl}${path}`;
};

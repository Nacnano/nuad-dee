export const getFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const setToLocalStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromLocalStorage = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.clear();
};

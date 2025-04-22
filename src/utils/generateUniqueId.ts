
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

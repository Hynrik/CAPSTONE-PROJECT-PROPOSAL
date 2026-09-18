export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};

export const getRole = () => {
  const user = getUser();
  return user?.role;
};
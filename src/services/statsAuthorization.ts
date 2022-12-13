export default async function getAuthorizationToken(username: string, password: string): Promise<string> {
  const authorizationToken = `Basic ${window.btoa(`${username}:${password}`)}`;
  const response = await fetch(`${import.meta.env.VITE_STATS_ORIGIN}/login`, {
    headers: { Authorization: authorizationToken },
  });

  if (response.status === 200) {
    return authorizationToken;
  }

  if (response.status === 401) {
    throw new Error("Authentication failed, invalid username or password");
  }

  throw new Error(`Authentication failed, unsupported status ${response.status}`);
}

export function getStoredAuthorizationToken(): string | null {
  return sessionStorage.getItem("authorizationToken") ?? localStorage.getItem("authorizationToken");
}

export function setStoredAuthorizationToken(authorizationToken: string, remember: boolean): void {
  // when remember is true, store in localStorage, otherwise store in sessionStorage
  if (remember) {
    localStorage.setItem("authorizationToken", authorizationToken);
    sessionStorage.removeItem("authorizationToken");
  } else {
    sessionStorage.setItem("authorizationToken", authorizationToken);
    localStorage.removeItem("authorizationToken");
  }
}

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Store JWT token in SecureStore
 */
export async function storeToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieve JWT token from SecureStore
 */
export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store user object in SecureStore (JSON stringified)
 */
export async function storeUser(user) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieve user object from SecureStore
 */
export async function getUser() {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear all auth data (logout)
 */
export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Check if user is authenticated (has a stored token)
 */
export async function isAuthenticated() {
  const token = await getToken();
  return !!token;
}

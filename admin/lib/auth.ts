"use client";

const TOKEN_KEY = "sports_venue_admin_token";
const USER_KEY = "sports_venue_admin_user";

export interface AdminUser {
  userId: string;
  phone: string;
  username?: string;
  token: string;
}

async function callCloudFunction(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export function saveUser(user: AdminUser) {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function register(phone: string, password: string, username?: string) {
  const data = await callCloudFunction("register", { phone, password, username });
  const user: AdminUser = { userId: data.userId, phone, username, token: data.token };
  saveUser(user);
  return user;
}

export async function login(phone: string, password: string) {
  const data = await callCloudFunction("login", { phone, password });
  const user: AdminUser = { userId: data.userId, phone, username: data.username, token: data.token };
  saveUser(user);
  return user;
}

export function logout() {
  clearUser();
  window.location.href = "/login";
}

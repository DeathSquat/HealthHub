import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Local session utilities for no-auth mode
const LOCAL_USER_ID_KEY = "hh_local_user_id";
const LOCAL_ROLE_KEY = "hh_local_role"; // 'user' | 'doctor'

export function getOrCreateLocalUserId(): string {
  try {
    const existing = localStorage.getItem(LOCAL_USER_ID_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(LOCAL_USER_ID_KEY, newId);
    return newId;
  } catch {
    return "anonymous";
  }
}

export type LocalRole = "user" | "doctor" | null;

export function getLocalRole(): LocalRole {
  try {
    const role = localStorage.getItem(LOCAL_ROLE_KEY);
    return (role === "user" || role === "doctor") ? role : null;
  } catch {
    return null;
  }
}

export function setLocalRole(role: Exclude<LocalRole, null>): void {
  try {
    localStorage.setItem(LOCAL_ROLE_KEY, role);
  } catch {
    // ignore
  }
}
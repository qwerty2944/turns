const KEY = "turns_recent_emails";
const MAX = 5;

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
};

const write = (list: string[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
};

export const recentEmails = {
  list: read,
  add(email: string) {
    const e = email.trim().toLowerCase();
    if (!e) return;
    const next = [e, ...read().filter((x) => x !== e)];
    write(next);
  },
  remove(email: string) {
    const e = email.trim().toLowerCase();
    write(read().filter((x) => x !== e));
  },
};

export interface UserRecord {
  passwordHash: string;
  salt: string;
}

const USERS_KEY = "users"; // maps username -> UserRecord
const CURRENT_USER_KEY = "currentUser";


export function getCurrentUser(): string | null {
return localStorage.getItem(CURRENT_USER_KEY);
}


export function setCurrentUser(username: string | null) {
if (username) localStorage.setItem(CURRENT_USER_KEY, username);
else localStorage.removeItem(CURRENT_USER_KEY);
}


export function loadUsers(): Record<string, UserRecord> {
try {
return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
} catch {
return {};
}
}


export function saveUsers(users: Record<string, UserRecord>) {
localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


export function todosKey(username: string) {
return `todos:${username}`;
}


export async function hashPassword(password: string, salt: string): Promise<string> {
const enc = new TextEncoder();
const data = enc.encode(password + salt);
const digest = await crypto.subtle.digest("SHA-256", data);
const bytes = Array.from(new Uint8Array(digest));
return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}


export function generateSalt(length = 16): string {
const arr = new Uint8Array(length);
crypto.getRandomValues(arr);
return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}


export async function signUp(username: string, password: string): Promise<"ok" | string> {
const users = loadUsers();
if (users[username]) return "Username already exists";
const salt = generateSalt();
const passwordHash = await hashPassword(password, salt);
users[username] = { passwordHash, salt };
saveUsers(users);
setCurrentUser(username);
return "ok";
}


export async function logIn(username: string, password: string): Promise<"ok" | string> {
const users = loadUsers();
const rec = users[username];
if (!rec) return "User not found";
const hash = await hashPassword(password, rec.salt);
if (hash !== rec.passwordHash) return "Invalid credentials";
setCurrentUser(username);
return "ok";
}


export function logOut() {
setCurrentUser(null);
}
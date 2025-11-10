import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, User, Booking, Trip } from './types';
import type { Env } from './core-utils';
// A simple in-memory password check for mock purposes.
// In a real app, use a secure hashing library like bcrypt.
const checkPassword = (input: string, stored: string) => `mock_${input}` === stored;
const hashPassword = (password: string) => `mock_${password}`;
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private users = new Map<string, User>();
  private bookingsByUser = new Map<string, Booking[]>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<any>();
      for (const [key, value] of stored) {
        if (key.startsWith('session_')) {
          this.sessions.set(key.replace('session_', ''), value as SessionInfo);
        } else if (key.startsWith('user_')) {
          this.users.set(key.replace('user_', ''), value as User);
        } else if (key.startsWith('bookings_')) {
          this.bookingsByUser.set(key.replace('bookings_', ''), value as Booking[]);
        }
      }
      this.loaded = true;
    }
  }
  // User Management
  async registerUser(email: string, password: string): Promise<{ success: boolean; data?: { user: { id: string, email: string }, token: string }; error?: string }> {
    await this.ensureLoaded();
    if (Array.from(this.users.values()).some(u => u.email === email)) {
      return { success: false, error: 'User with this email already exists.' };
    }
    const userId = crypto.randomUUID();
    const user: User = {
      id: userId,
      email,
      passwordHash: hashPassword(password),
    };
    this.users.set(userId, user);
    await this.ctx.storage.put(`user_${userId}`, user);
    // Mock token is just the user ID
    const token = userId;
    return { success: true, data: { user: { id: user.id, email: user.email }, token } };
  }
  async loginUser(email: string, password: string): Promise<{ success: boolean; data?: { user: { id: string, email: string }, token: string }; error?: string }> {
    await this.ensureLoaded();
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user || !checkPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid email or password.' };
    }
    // Mock token is just the user ID
    const token = user.id;
    return { success: true, data: { user: { id: user.id, email: user.email }, token } };
  }
  // Booking Management
  async addBooking(userId: string, trip: Trip): Promise<{ success: boolean; data?: Booking; error?: string }> {
    await this.ensureLoaded();
    if (!this.users.has(userId)) {
      return { success: false, error: 'User not found.' };
    }
    const userBookings = this.bookingsByUser.get(userId) || [];
    const newBooking: Booking = {
      id: `B-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      trip,
      bookingDate: new Date().toISOString(),
    };
    userBookings.push(newBooking);
    this.bookingsByUser.set(userId, userBookings);
    await this.ctx.storage.put(`bookings_${userId}`, userBookings);
    return { success: true, data: newBooking };
  }
  async getBookings(userId: string): Promise<{ success: boolean; data?: Booking[]; error?: string }> {
    await this.ensureLoaded();
    if (!this.users.has(userId)) {
      return { success: false, error: 'User not found.' };
    }
    const userBookings = this.bookingsByUser.get(userId) || [];
    return { success: true, data: userBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()) };
  }
  // Session Management
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    const sessionInfo: SessionInfo = {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    };
    this.sessions.set(sessionId, sessionInfo);
    await this.ctx.storage.put(`session_${sessionId}`, sessionInfo);
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.ctx.storage.delete(`session_${sessionId}`);
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.ctx.storage.put(`session_${sessionId}`, session);
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.ctx.storage.put(`session_${sessionId}`, session);
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    const keys = Array.from(this.sessions.keys()).map(k => `session_${k}`);
    this.sessions.clear();
    await this.ctx.storage.delete(keys);
    return count;
  }
}
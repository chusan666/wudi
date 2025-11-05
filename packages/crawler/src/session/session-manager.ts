import type { BrowserContext, Cookie } from 'playwright';
import { getLogger } from '../config/logger.js';
import type { SessionCredentials, SessionState } from '../types/index.js';

export interface SessionManagerOptions {
  sessionTTL?: number;
}

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();
  private readonly logger = getLogger();
  private readonly sessionTTL: number;

  constructor(options: SessionManagerOptions = {}) {
    this.sessionTTL = options.sessionTTL ?? 24 * 60 * 60 * 1000; // 24 hours default
  }

  async createSession(
    sessionId: string,
    context: BrowserContext,
    credentials?: SessionCredentials,
  ): Promise<SessionState> {
    this.logger.info({ sessionId }, 'Creating session');

    if (credentials) {
      await this.performLogin(context, credentials);
    }

    const cookies = await context.cookies();
    const expiresAt = new Date(Date.now() + this.sessionTTL);

    const sessionState: SessionState = {
      cookies: cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires,
      })),
      expiresAt,
    };

    this.sessions.set(sessionId, sessionState);
    return sessionState;
  }

  private async performLogin(context: BrowserContext, credentials: SessionCredentials): Promise<void> {
    // TODO: Implement actual login logic based on target platform
    // This is a placeholder that should be customized for specific platforms
    this.logger.info('Performing login (placeholder implementation)');
    
    // Example login flow:
    // const page = await context.newPage();
    // await page.goto('LOGIN_URL');
    // await page.fill('input[name="username"]', credentials.username);
    // await page.fill('input[name="password"]', credentials.password);
    // await page.click('button[type="submit"]');
    // await page.waitForNavigation();
    // await page.close();
  }

  async restoreSession(sessionId: string, context: BrowserContext): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn({ sessionId }, 'Session not found');
      return false;
    }

    if (this.isExpired(session)) {
      this.logger.warn({ sessionId }, 'Session expired');
      this.sessions.delete(sessionId);
      return false;
    }

    this.logger.info({ sessionId }, 'Restoring session');

    const cookies: Cookie[] = session.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain || '',
      path: c.path || '/',
      expires: c.expires || -1,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    }));

    await context.addCookies(cookies);
    return true;
  }

  async updateSession(sessionId: string, context: BrowserContext): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn({ sessionId }, 'Cannot update non-existent session');
      return;
    }

    const cookies = await context.cookies();
    session.cookies = cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires,
    }));

    this.logger.info({ sessionId }, 'Session updated');
  }

  getSession(sessionId: string): SessionState | undefined {
    const session = this.sessions.get(sessionId);

    if (session && this.isExpired(session)) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.info({ sessionId }, 'Session deleted');
  }

  private isExpired(session: SessionState): boolean {
    return new Date() > session.expiresAt;
  }

  cleanupExpiredSessions(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.info({ cleaned }, 'Cleaned up expired sessions');
    }
  }
}

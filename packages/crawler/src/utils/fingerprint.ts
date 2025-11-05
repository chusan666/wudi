import type { BrowserFingerprint } from '../types/index.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 2560, height: 1440 },
];

const LOCALES = ['en-US', 'en-GB', 'zh-CN', 'zh-TW'];

const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFingerprint(): BrowserFingerprint {
  const viewport = randomChoice(VIEWPORTS);
  const isMobile = Math.random() < 0.2;

  return {
    userAgent: randomChoice(USER_AGENTS),
    viewport: {
      width: viewport.width + randomBetween(-50, 50),
      height: viewport.height + randomBetween(-50, 50),
    },
    deviceScaleFactor: isMobile ? randomChoice([2, 3]) : 1,
    isMobile,
    hasTouch: isMobile,
    locale: randomChoice(LOCALES),
    timezone: randomChoice(TIMEZONES),
  };
}

export function generateFingerprintId(fingerprint: BrowserFingerprint): string {
  return `${fingerprint.userAgent.slice(0, 20)}_${fingerprint.viewport.width}x${fingerprint.viewport.height}`;
}

export function generateRandomHeaders(fingerprint: BrowserFingerprint): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': `${fingerprint.locale},en;q=0.9`,
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': Math.random() < 0.5 ? '1' : '0',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };

  return headers;
}

declare global {
  interface Window {
    __COMMITTEE_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const DEFAULT_API_BASE_URL = '/api';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const resolveApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE_URL;
  }

  const configured = window.__COMMITTEE_CONFIG__?.apiBaseUrl?.trim();
  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }

  return stripTrailingSlash(configured);
};

export const resolveApiOrigin = (apiBaseUrl: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return new URL(apiBaseUrl, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export {};

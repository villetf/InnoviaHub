export {};

declare global {
  interface Window {
    __env?: {
      NG_APP_API_URL?: string;
      NG_APP_HUB_URL?: string;
    };
  }
}

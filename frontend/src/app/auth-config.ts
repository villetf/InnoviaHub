import { Configuration, PopupRequest } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || 
             window.navigator.userAgent.indexOf('Trident/') > -1;

export const msalConfig: Configuration = {
  auth: {
    clientId: '3b2d7872-61e0-426e-ac3a-3803d77187b3', // Klient-ID
    authority: 'https://login.microsoftonline.com/57d13b38-9721-41f0-b8e4-bcc0183ad098',
    redirectUri: window.__env?.NG_APP_LOGIN_REDIRECT_URL,
    postLogoutRedirectUri: window.__env?.NG_APP_LOGOUT_REDIRECT_URL
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: isIE
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            return;
          case 1: // LogLevel.Warning
            console.warn(message);
            return;
          case 2: // LogLevel.Info
            console.info(message);
            return;
          case 3: // LogLevel.Verbose
            console.debug(message);
            return;
        }
      }
    }
  }
};

export const loginRequest: PopupRequest = {
  scopes: ['user.read', 'openid', 'profile'],
  prompt: 'select_account'
};

export const protectedResources = {
  innoviaApi: {
    endpoint: `${window.__env?.NG_APP_API_URL}/api`,
    scopes: ['user.read']
  },
  graphApi: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['user.read']
  }
};
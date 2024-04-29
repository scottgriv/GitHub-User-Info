// src/environments/environment.prod.ts
export const environment = {
    production: true,
    usePersonalAccessToken: false, // true will use the personalAccessToken, false will use unauthenticated access
    personalAccessToken: '' // Only utilize this for local testing purposes - DO NOT PUSH TO GITHUB
  };
  
import { typedAPI } from './api-builder';

export interface ThemePreferencePayload {
  theme: string;
  color: string;
  fontScale: number;
  motionIntensity: number;
}

export interface ThemePreferenceRecord extends ThemePreferencePayload {
  updatedAtUtc: string;
}

export interface ThemePreferenceResponse {
  preferences: ThemePreferenceRecord | null;
}

export const themePreferencesAPI = {
  get: async (): Promise<ThemePreferenceResponse> => {
    return typedAPI.auth.getPreferences<ThemePreferenceResponse>();
  },

  update: async (payload: ThemePreferencePayload): Promise<ThemePreferenceResponse> => {
    return typedAPI.auth.updatePreferences<ThemePreferenceResponse>({ body: payload });
  },
};

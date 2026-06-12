export type AuthProviderId = "kakao" | "naver" | "google";

export type DeviceSlot = "mobile" | "personal_laptop" | "work_laptop";

export type AuthProviderOption = {
  readonly provider: AuthProviderId;
  readonly label: string;
  readonly enabled: boolean;
};

export type AuthProvidersResponse = {
  readonly providers: AuthProviderOption[];
};

export type AuthUser = {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: string;
  readonly status: string;
  readonly settings: {
    readonly sensitiveWarningEnabled: boolean;
    readonly defaultReminderMinutes: number;
    readonly emailNotificationEnabled: boolean;
    readonly browserPushEnabled: boolean;
  };
};

export type AuthDevice = {
  readonly id: string;
  readonly slot: DeviceSlot | string;
  readonly label: string | null;
};

export type AuthTokenResponse = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: AuthUser;
  readonly device?: AuthDevice;
};

export type ExchangeAuthTokenInput = {
  readonly supabaseAccessToken: string;
  readonly deviceSlot: DeviceSlot;
  readonly deviceId: string;
  readonly deviceLabel?: string;
  readonly replaceExistingDevice?: boolean;
};

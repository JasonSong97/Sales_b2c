import type {
  AuthDeviceRecord,
  AuthMeRecord,
} from "@/modules/auth/application/ports/auth.repository";

export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: MeResponse;
  readonly device?: {
    readonly id: string;
    readonly slot: string;
    readonly label: string | null;
  };
}

export interface MeResponse {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: string;
  readonly status: string;
}

export interface AdminMeResponse {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: "ADMIN";
}

// 기능 : 로그인/토큰 갱신 결과를 클라이언트 응답 형식으로 변환합니다.
export function createAuthTokenResponse(input: {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
  readonly user: AuthMeRecord;
  readonly device?: AuthDeviceRecord;
}): AuthTokenResponse {
  const response: AuthTokenResponse = {
    accessToken: input.accessToken,
    accessTokenExpiresAt: input.accessTokenExpiresAt.toISOString(),
    refreshToken: null,
    user: toMeResponse(input.user),
  };

  if (!input.device) {
    return response;
  }

  return {
    ...response,
    device: {
      id: input.device.id,
      slot: input.device.slot,
      label: input.device.label,
    },
  };
}

// 기능 : 인증 사용자 레코드를 일반 사용자 내 정보 응답으로 변환합니다.
export function toMeResponse(user: AuthMeRecord): MeResponse {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

// 기능 : 인증 사용자 레코드를 관리자 내 정보 응답으로 변환합니다.
export function toAdminMeResponse(user: AuthMeRecord): AdminMeResponse {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: "ADMIN",
  };
}

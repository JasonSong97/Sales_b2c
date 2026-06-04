# G01-G05 Foundation/Auth API 명세

## 1. 목적

이 문서는 G01-G05에서 구현할 Backend 기반 API와 인증/사용자 context API 계약을 정의한다.

이 범위는 도메인 CRUD를 구현하기 전에 User Web, Admin Web, Backend가 같은 인증 기준과 기본 응답 구조를 사용할 수 있게 만드는 단계다.

## 2. 포함 goal

- G01. Backend 프로젝트 스캐폴딩
- G02. User Web 프로젝트 스캐폴딩
- G03. Admin Web 프로젝트 스캐폴딩
- G04. Prisma schema 1차 반영과 DB 연결
- G05. Auth/User Backend 기반

## 3. API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| Health Check API | `GetHealth` | `GET` | `/api/health` | `HealthCheckRequest` | `HealthCheckResponse` | 없음 |
| 소셜 로그인 Provider 목록 API | `ListAuthProviders` | `GET` | `/api/auth/providers` | `ListAuthProvidersRequest` | `AuthProviderListResponse` | 없음 |
| OAuth 시작 API | `StartOAuthLogin` | `GET` | `/api/auth/:provider/start` | `StartOAuthLoginRequest` | redirect | 없음 |
| OAuth Callback API | `HandleOAuthCallback` | `GET` | `/api/auth/:provider/callback` | `OAuthCallbackRequest` | `AuthTokenResponse` | User, UserOAuthAccount |
| 로그아웃 API | `Logout` | `POST` | `/api/auth/logout` | `LogoutRequest` | `LogoutResponse` | UserOAuthAccount 또는 session 저장소 |
| 내 정보 조회 API | `GetMe` | `GET` | `/api/me` | `GetMeRequest` | `MeResponse` | User, UserSetting |
| 내 설정 조회 API | `GetMySettings` | `GET` | `/api/users/me/settings` | `GetMySettingsRequest` | `UserSettingResponse` | UserSetting |
| 내 설정 수정 API | `UpdateMySettings` | `PATCH` | `/api/users/me/settings` | `UpdateMySettingsRequest` | `UserSettingResponse` | UserSetting |
| Admin 내 정보 조회 API | `GetAdminMe` | `GET` | `/admin/api/me` | `GetAdminMeRequest` | `AdminMeResponse` | User |

## 4. API 상세

### 4.1 Health Check API

- API 이름: Health Check API
- API 식별자: `GetHealth`
- Method: `GET`
- Path: `/api/health`
- 인증: 없음
- 권한: 없음

#### 목적

Backend 서버가 실행 중인지 FE, 배포 환경, 로컬 개발자가 확인한다.

#### Request

- Request 이름: `HealthCheckRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. 서버 프로세스가 요청을 받는다.
2. DB 연결 확인은 G04 이후 선택적으로 붙인다.
3. API 서버 상태를 `ok`로 응답한다.

#### Response

- Response 이름: `HealthCheckResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `status` | `"ok"` | 서버 상태 |
| `timestamp` | string | 응답 시각 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 서버 내부 오류 | `InternalServerError` | 500 |

### 4.2 소셜 로그인 Provider 목록 API

- API 이름: 소셜 로그인 Provider 목록 API
- API 식별자: `ListAuthProviders`
- Method: `GET`
- Path: `/api/auth/providers`
- 인증: 없음
- 권한: 없음

#### 목적

User Web 로그인 화면이 MVP에서 제공하는 소셜 로그인 버튼을 동일한 기준으로 렌더링한다.

#### Request

- Request 이름: `ListAuthProvidersRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. 서버 설정에서 활성화된 provider 목록을 읽는다.
2. MVP 기본 provider인 Kakao, Google, Naver, Apple을 반환한다.
3. provider가 환경 변수 미설정으로 비활성화된 경우 `enabled = false`로 내려줄 수 있다.

#### Response

- Response 이름: `AuthProviderListResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `providers` | array | 로그인 provider 목록 |
| `providers[].provider` | enum | `KAKAO`, `GOOGLE`, `NAVER`, `APPLE` |
| `providers[].label` | string | 화면 표시명 |
| `providers[].enabled` | boolean | 현재 환경에서 사용 가능 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| provider 설정 로딩 실패 | `AuthProviderConfigError` | 500 |

### 4.3 OAuth 시작 API

- API 이름: OAuth 시작 API
- API 식별자: `StartOAuthLogin`
- Method: `GET`
- Path: `/api/auth/:provider/start`
- 인증: 없음
- 권한: 없음

#### 목적

사용자가 선택한 소셜 provider의 OAuth 인증 화면으로 이동한다.

#### Request

- Request 이름: `StartOAuthLoginRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `provider` | enum path | 필수 | `kakao`, `google`, `naver`, `apple` |
| `redirectTo` | string query | 선택 | 로그인 완료 후 이동할 FE 경로 |

#### 비즈니스 로직 흐름

1. provider path 값을 validation한다.
2. provider adapter가 활성화되어 있는지 확인한다.
3. OAuth state를 생성한다.
4. provider 인증 URL을 생성한다.
5. 사용자를 provider 인증 URL로 redirect한다.

#### Response

- Response 이름: redirect

| 필드 | 타입 | 설명 |
|---|---|---|
| redirect | HTTP redirect | provider 인증 URL로 이동 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 지원하지 않는 provider | `UnsupportedOAuthProvider` | 400 |
| provider 설정 누락 | `OAuthProviderDisabled` | 503 |

### 4.4 OAuth Callback API

- API 이름: OAuth Callback API
- API 식별자: `HandleOAuthCallback`
- Method: `GET`
- Path: `/api/auth/:provider/callback`
- 인증: 없음
- 권한: 없음

#### 목적

소셜 provider 인증 결과를 받아 사용자를 가입 또는 로그인 처리하고 토큰을 발급한다.

#### Request

- Request 이름: `OAuthCallbackRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `provider` | enum path | 필수 | OAuth provider |
| `code` | string query | 필수 | provider 인증 code |
| `state` | string query | 필수 | CSRF 방지 state |

#### 비즈니스 로직 흐름

1. provider와 state를 검증한다.
2. provider adapter로 access token과 profile을 가져온다.
3. `UserOAuthAccount`에서 provider 계정을 조회한다.
4. 기존 계정이 없으면 `User`와 `UserOAuthAccount`를 생성한다.
5. 기존 계정이 있으면 마지막 로그인 시각을 갱신한다.
6. access token과 refresh token 또는 session을 발급한다.
7. `AuthTokenResponse`를 반환하거나 FE callback URL로 redirect한다.

#### Response

- Response 이름: `AuthTokenResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | API 호출용 토큰 |
| `refreshToken` | string | 갱신 토큰. G00 결정에 따라 생략 가능 |
| `user` | object | 로그인 사용자 요약 |
| `user.id` | string | 사용자 ID |
| `user.name` | string | 사용자명 |
| `user.email` | string | 이메일 |
| `user.role` | enum | `USER` 또는 `ADMIN` |

#### 연결된 DB 스키마

- 생성: User, UserOAuthAccount, UserSetting
- 조회: UserOAuthAccount, User
- 수정: User, UserOAuthAccount
- 삭제: 없음
- 감사 로그: 없음
- transaction: User/UserOAuthAccount/UserSetting upsert는 transaction 필요

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| state 불일치 | `InvalidOAuthState` | 400 |
| provider 인증 실패 | `OAuthExchangeFailed` | 401 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.5 로그아웃 API

- API 이름: 로그아웃 API
- API 식별자: `Logout`
- Method: `POST`
- Path: `/api/auth/logout`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `LogoutRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `refreshToken` | string | 선택 | refresh token 저장 정책을 사용할 때 전달 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. token/session 저장 정책이 있으면 현재 refresh token 또는 session을 폐기한다.
3. 성공 응답을 반환한다.

#### Response

- Response 이름: `LogoutResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `success` | boolean | 로그아웃 처리 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: UserOAuthAccount 또는 session table
- 수정: UserOAuthAccount 또는 session table
- 삭제: token/session 저장 정책에 따라 가능
- 감사 로그: 없음
- transaction: 단일 token/session 처리면 필수 아님

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |

### 4.6 내 정보 조회 API

- API 이름: 내 정보 조회 API
- API 식별자: `GetMe`
- Method: `GET`
- Path: `/api/me`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `GetMeRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `User`와 `UserSetting`을 조회한다.
3. User Web app shell에서 필요한 사용자 요약과 설정을 반환한다.

#### Response

- Response 이름: `MeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 사용자 ID |
| `name` | string | 사용자명 |
| `email` | string | 이메일 |
| `role` | enum | 사용자 역할 |
| `status` | enum | 사용자 상태 |
| `settings` | object | 사용자 기본 설정 |
| `settings.sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 사용 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: User, UserSetting
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.7 내 설정 조회 API

- API 이름: 내 설정 조회 API
- API 식별자: `GetMySettings`
- Method: `GET`
- Path: `/api/users/me/settings`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `GetMySettingsRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `UserSetting`을 조회한다.
3. 설정이 없으면 기본 설정을 생성하거나 기본값을 응답한다.

#### Response

- Response 이름: `UserSettingResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 이메일 알림 사용 여부 |
| `browserPushEnabled` | boolean | 브라우저 푸시 사용 여부 |

#### 연결된 DB 스키마

- 생성: UserSetting. 없을 때 기본값 생성 가능
- 조회: UserSetting
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 기본값 생성 시 upsert

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |

### 4.8 내 설정 수정 API

- API 이름: 내 설정 수정 API
- API 식별자: `UpdateMySettings`
- Method: `PATCH`
- Path: `/api/users/me/settings`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `UpdateMySettingsRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `sensitiveWarningEnabled` | boolean | 선택 | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 선택 | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 선택 | 이메일 알림 |
| `browserPushEnabled` | boolean | 선택 | 브라우저 푸시 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. 현재 사용자 `UserSetting`을 upsert한다.
4. 수정된 설정을 반환한다.

#### Response

- Response 이름: `UserSettingResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 이메일 알림 |
| `browserPushEnabled` | boolean | 브라우저 푸시 |

#### 연결된 DB 스키마

- 생성: UserSetting
- 조회: UserSetting
- 수정: UserSetting
- 삭제: 없음
- 감사 로그: 없음
- transaction: upsert 단위

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| 알림 시간이 음수 | `ValidationError` | 400 |

### 4.9 Admin 내 정보 조회 API

- API 이름: Admin 내 정보 조회 API
- API 식별자: `GetAdminMe`
- Method: `GET`
- Path: `/admin/api/me`
- 인증: Admin
- 권한: `role = ADMIN`

#### Request

- Request 이름: `GetAdminMeRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. AdminGuard로 `role = ADMIN`인지 확인한다.
3. Admin shell에서 필요한 사용자 정보를 반환한다.

#### Response

- Response 이름: `AdminMeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | Admin 사용자 ID |
| `name` | string | 이름 |
| `email` | string | 이메일 |
| `role` | enum | `ADMIN` |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: User
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| Admin 아님 | `Forbidden` | 403 |

## 5. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`

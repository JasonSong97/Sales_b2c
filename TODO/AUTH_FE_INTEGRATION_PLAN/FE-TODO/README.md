# FE TODO

이 폴더는 Auth/User Backend API를 실제 User Web과 Admin Web 인증 흐름에 연결하기 위한 FE 실행용 `/goal` 문서를 둔다.

## Goals

- `G01-AUTH-FE-INTEGRATION.goal.md`: Supabase Auth + Backend token exchange 연동
- `G02-FE-SETTINGS-PROFILE-DEVICES.goal.md`: 로그인 이후 설정 탭의 개인 정보 조회/수정, 등록 기기 조회

## 현재 상태

- 선행 BE API와 User/Auth DB 기준은 완료됐다.
- FE 인증 연동과 설정 탭 구현은 아직 미완료다.

## 작업 목적

- User Web과 Admin Web의 mock-only 인증을 실제 Supabase Auth + Backend App token 흐름으로 교체한다.
- 401 발생 시 refresh-once 재시도와 logout 정리를 API client 공통 흐름으로 만든다.
- User Web 설정 화면에서 개인 정보와 등록 기기를 조회하고, 이름 수정까지 실제 Backend API와 연결한다.
- FE는 refresh token을 JavaScript 저장소에 보관하지 않고 Backend cookie 기반 refresh 흐름을 사용한다.

## 작업 경계

FE 작업 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

FE는 화면, 라우팅, API client 연결, 상태 관리를 담당한다.

FE는 다음 작업을 하지 않는다.

- BE 코드 수정
- DB schema/migration 작성
- User/Auth DDL 작성
- 계정 삭제 기능 추가
- user settings 기능 추가
- 기기명 수정/기기 해제 기능 추가

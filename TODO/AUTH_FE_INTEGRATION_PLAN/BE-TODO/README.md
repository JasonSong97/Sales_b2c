# BE TODO

이 폴더는 BE 실행용 `/goal` 문서를 둔다.

## Goals

- `[완료] G01-BE-USER-PROFILE-DEVICES.goal.md`: 로그인 이후 설정 탭에 필요한 User API와 User/Auth DDL 기준 검증

## 현재 상태

- 상태: 완료
- 완료 확인일: 2026-06-11
- 완료 근거: `BE/prisma/schema.prisma`, `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`, `BE/src/modules/auth`, `BE/src/modules/user`
- 검증: `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test`, `build` 통과
- 참고: 검증 실행 환경의 Node.js 버전이 package engine과 달라 경고가 출력될 수 있으나, 완료 확인 시 명령은 모두 exit code 0으로 종료됐다.

## 작업 경계

BE 작업 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

BE는 API, schema, repository, use case, controller, Backend 문서를 담당한다.

BE는 다음 작업을 하지 않는다.

- FE 화면 구현
- FE 라우터 수정
- FE 상태 관리 수정
- 기기명 수정/기기 해제 API 추가
- 계정 삭제 API 추가
- user settings API 추가

# Repository Root And Testing Decision

## 결정

기존 `AI_INFRA` 폴더 안에 있던 정본 구조를 저장소 루트로 올린다.

현재 정본 구조:

```text
AGENT/
FE/
BE/
archive/
README.md
```

루트에는 `package.json`과 workspace 설정을 두지 않는다.

## 테스트 자동화

MVP 테스트 자동화는 User Web과 Admin Web을 모두 포함한다.

- User Web: `FE/user-web`에서 Playwright E2E 관리
- Admin Web: `FE/admin-web`에서 Playwright E2E 관리
- Backend: `BE`에서 위험도 높은 도메인/권한/Import/민감정보 중심 테스트 관리

공용 테스트 패키지는 만들지 않는다.


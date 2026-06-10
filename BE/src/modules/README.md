# 백엔드 모듈

이 폴더는 백엔드 기능 모듈을 두는 공간이다. 현재는 User/Auth 기반만 남기고 영업 도메인 모듈은 제거한 상태다.

현재 모듈 지도:

| 모듈 | 목적 |
|---|---|
| `auth` | Supabase token 교환, App token, session, device |
| `user` | 현재 사용자, 설정, 계정 삭제 |
| `health` | 가벼운 health endpoint |

영업 도메인 모듈과 DDL은 이후 요청 순서에 맞춰 차근차근 다시 추가한다.

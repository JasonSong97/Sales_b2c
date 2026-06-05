# 공유 Infrastructure

infrastructure 구현체를 이곳에 둔다.

예시:

- Prisma service
- logger wrapper
- encryption adapter
- Supabase storage adapter
- SMTP/Web Push/OpenAI/Google adapter

기능별 repository는 해당 기능 모듈의 infrastructure 폴더 아래에 둔다.

Supabase Cloud 연동 구현체는 `supabase/` 아래에 둔다. 이 구현체는 Auth JWT 검증과 Storage 파일 저장을 담당하지만, application/domain 계층에는 Supabase SDK 타입을 노출하지 않는다.

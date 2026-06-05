# 공유 Application

application 계층에서 공유하는 port와 orchestration primitive를 이곳에 둔다.

예시:

- transaction manager port
- 현재 사용자 context type
- storage/encryption/external provider port
- pagination request/response type

Supabase Auth와 Supabase Storage도 application 계층에서는 직접 의존하지 않는다. `ExternalAuthVerifier`와 `StoragePort` 같은 port를 통해 사용하고, 실제 Supabase 구현체는 infrastructure 계층에 둔다.

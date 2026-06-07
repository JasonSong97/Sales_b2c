# Notification 모듈

구현 범위:

- 알림 목록/읽음 상태
- 알림 설정
- SMTP email 발송
- Browser Push VAPID 발송
- browser push 구독 정보 암호화 저장
- 일정/딜/회의록 이벤트의 Notification 생성
- 발송 실패 retry 기본 정책

실제 발송 adapter는 아래 환경변수가 모두 있을 때 선택된다. 없으면 local/test용 stub adapter가 사용된다.

- SMTP: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- Web Push: `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

# Learner Achievement UX Guide

기준일은 `README.md`를 따른다.

이 문서는 학생/학습자가 문제, 강의, 과제, 챕터, 복습 루틴을 완료했을 때 성취감을 주는 UI/UX 기준이다. 관리자나 학원장이 보는 성과 요약 화면이 아니라, 학습자가 "방금 해냈다", "조금 나아졌다", "다음 것도 해볼 만하다"라고 느끼게 하는 완료 경험을 설계한다.

## 핵심 원칙

1. 완료 사실을 즉시 알려준다.
   학습자는 action 직후 피드백을 받아야 한다. 저장됨, 제출됨, 완료됨, 채점됨 같은 상태가 늦거나 흐리면 성취감이 생기기 어렵다.

2. 칭찬보다 성장 근거를 먼저 보여준다.
   "잘했어요"만 보여주기보다 완료한 양, 늘어난 정확도, 줄어든 오답, 이어진 학습일, 다음 단계 진척률처럼 스스로 납득할 수 있는 근거를 보여준다.

3. 작은 완료와 큰 완료를 다르게 보상한다.
   매 문제마다 큰 축하 모달을 띄우면 흐름이 끊긴다. 작은 완료는 inline feedback, 세션 완료는 result card, 챕터/목표 달성은 badge나 짧은 celebration으로 구분한다.

4. 다음 행동을 부담 없이 제안한다.
   성취 화면은 끝이 아니라 다음 학습으로 이어지는 다리다. CTA는 "다음 학습 시작", "오답 3개 복습", "오늘 목표 마저 하기"처럼 하나를 우선한다.

5. 비교보다 자기 진전을 강조한다.
   학생 화면의 기본값은 타인 순위보다 나의 연속 학습, 이전 대비 향상, 목표 대비 진척이다. 경쟁 요소는 서비스 정책상 필요할 때만 제한적으로 쓴다.

6. 정적인 완료 화면보다 "변화가 보이는 완료 화면"을 만든다.
   성취감은 화면이 바뀌는 순간에 강하게 느껴진다. 체크 아이콘, progress fill, 숫자 count-up, badge reveal처럼 짧고 명확한 변화가 필요하다.

## 완료 순간의 기본 구조

학습자가 무언가를 끝냈을 때 화면은 아래 순서로 정보를 보여준다.

```text
+--------------------------------------+
| 완료 메시지                          |
| 오늘 한 일 / 방금 끝낸 단위           |
| 성장 근거: +진척률, +정확도, streak   |
| 다음 추천 행동                        |
| 보조 행동: 결과 보기, 쉬기, 목록 이동 |
+--------------------------------------+
```

필수 요소:

| 요소 | 목적 | 예시 |
| --- | --- | --- |
| 완료 메시지 | action이 성공했음을 즉시 인지 | 오늘 학습을 완료했어요 |
| 완료 단위 | 무엇을 끝냈는지 명확화 | 문법 퀴즈 12문제 완료 |
| 성장 근거 | 성취감을 납득하게 함 | 정답률이 지난번보다 8% 올랐어요 |
| 누적 신호 | 다시 쓰고 싶게 함 | 5일 연속 학습 중 |
| 다음 CTA | 다음 행동으로 연결 | 오답 3개 복습하기 |
| 보조 CTA | 부담을 낮춤 | 결과 자세히 보기, 오늘은 마치기 |

## 완료 크기별 UX 강도

| 완료 단위 | 권장 UI | 모션 강도 | 보여줄 정보 | 피해야 할 것 |
| --- | --- | --- | --- | --- |
| 문제 1개 정답 | inline success, 짧은 색상 변화 | 낮음 | 정답 여부, 짧은 해설 진입 | 매번 모달, 긴 축하 |
| 문제 1개 오답 후 재성공 | inline recovery feedback | 낮음 | 다시 맞힌 사실, 핵심 힌트 | 실패감 강조 |
| 퀴즈/강의 1개 완료 | result card, progress fill | 중간 | 점수, 완료 수, 오답 수, 다음 추천 | 점수만 크게 표시 |
| 오늘 목표 완료 | completion panel, streak, goal progress | 중간 | 오늘 목표 달성, 연속 학습, 누적 시간 | 과한 confetti 반복 |
| 챕터/레벨 완료 | badge unlock, milestone screen | 중간~높음 | 새 배지, 다음 레벨, 누적 성과 | 닫기 어려운 전체 화면 |
| 장기 목표 달성 | milestone summary | 중간~높음 | 기간, 총 학습량, 개선 지표 | 타인 비교 중심 |

## 성취감을 만드는 데이터

가능하면 아래 중 2~3개만 선택한다. 너무 많은 숫자를 한 번에 보여주면 성취감보다 분석 화면처럼 느껴진다.

| 데이터 | 좋은 사용 | 주의점 |
| --- | --- | --- |
| 완료 수 | 오늘 12문제를 끝냈어요 | 단순 노동량처럼 보이지 않게 다음 의미를 붙임 |
| 진척률 | 챕터 68% 완료 | 100%까지 남은 거리만 강조하지 않기 |
| 정답률 | 지난 퀴즈보다 8% 상승 | 낮은 점수일 때는 회복 행동과 함께 표시 |
| 오답 감소 | 오답 3개를 다시 맞혔어요 | 틀린 개수만 크게 보여주지 않기 |
| 연속 학습 | 5일 연속 학습 중 | streak 중단을 벌처럼 느끼게 하지 않기 |
| 누적 시간 | 이번 주 2시간 40분 집중 | 시간만 길다고 좋은 학습처럼 보이지 않게 함 |
| 다음 추천 | 오답 3개만 복습하면 오늘 목표 완료 | CTA와 직접 연결 |

## 성취감을 주는 디자인 관점

성취 화면은 관리자용 KPI 카드처럼 차갑게 보이면 안 된다. 그렇다고 랜딩페이지처럼 과하게 장식하면 학습 흐름이 끊긴다. 핵심은 "작은 보상감이 확실히 느껴지는 변화"다.

| 디자인 요소 | 권장 방향 | 피해야 할 것 |
| --- | --- | --- |
| 중심 초점 | 완료 메시지와 핵심 숫자 1개를 가장 먼저 보이게 함 | 점수, 배지, CTA, 그래프가 동시에 경쟁 |
| 색상 | 프로젝트 success/accent 색상을 중심으로 배경 tint와 텍스트 대비를 분리 | 모든 요소를 초록/금색으로 칠하기 |
| 형태 | 둥근 badge, progress bar, result card처럼 완료 단위를 손에 잡히게 표현 | 일반 알림 toast 하나로만 처리 |
| 아이콘 | check, spark, trophy, flame류를 1개만 선택해 의미를 고정 | 여러 보상 아이콘을 섞어 의미가 흐려짐 |
| 깊이감 | result card나 badge에 얕은 shadow/elevation으로 떠오르는 느낌 | 강한 glow, 두꺼운 shadow, 과한 3D |
| 여백 | 완료 메시지 주변은 넉넉히 두고 다음 CTA는 바로 아래 배치 | 결과 숫자를 빽빽하게 나열 |
| 배경 | 작은 radial highlight, soft tint, confetti 몇 조각 정도만 제한 사용 | 전체 화면을 덮는 반복 파티클 |
| CTA | primary CTA 1개를 명확히 강조하고 secondary는 낮은 강도 | 같은 강도의 버튼 3개 이상 |

## 권장 시각 시퀀스

학습 완료 화면은 한 번에 모든 정보를 보여주기보다 짧은 순서로 드러내면 더 잘 와닿는다.

| 단계 | 시간 | 화면 변화 | 목적 |
| --- | --- | --- | --- |
| 1. 즉시 완료 | 0~150ms | 버튼/문항 상태가 success로 전환, check 표시 | action이 성공했음을 즉시 인지 |
| 2. 완료 카드 진입 | 150~300ms | result card가 4~8px 위로 올라오며 opacity 전환 | 화면 초점 이동 |
| 3. 진척 변화 | 300~650ms | progress bar/ring이 현재 값까지 채워짐 | 내가 앞으로 나아갔다는 감각 |
| 4. 핵심 숫자 | 500~800ms | 점수, 정답률, 연속 학습일 중 1개 count-up | 성장 근거를 시각적으로 각인 |
| 5. 보상 요소 | 650~900ms | badge, streak chip, small sparkle 중 하나 reveal | 완료의 감정적 보상 |
| 6. 다음 행동 | 800ms 이후 | 다음 학습 CTA가 자연스럽게 나타남 | 재방문/이어하기 유도 |

전체 시퀀스는 1초 안팎으로 끝내는 것이 좋다. 학습자는 축하를 보러 온 것이 아니라 다음 학습을 이어가기 위해 머무른다.

## 디자인 패턴 레시피

| 패턴 | 시각 구성 | 애니메이션 | 적합한 상황 |
| --- | --- | --- | --- |
| Soft Check Complete | check icon, success tint, 1줄 메시지 | check scale 0.9 -> 1.0, opacity fade | 문제 1개, 저장, 제출 |
| Progress Lift Card | result card, progress bar, 변화량 chip | card lift 4px, progress fill 500ms | 퀴즈/강의 완료 |
| Score Count Card | 큰 점수 1개, 보조 지표 2개 이하 | 숫자 count-up 600ms | 결과 화면 |
| Badge Unlock | badge icon, 배지명, 획득 조건 | badge pop, 작은 sparkle 2~4개 | 챕터/레벨 완료 |
| Streak Moment | streak chip, 오늘 완료 표시, 회복 안내 | chip slide/fade, 숫자 count-up | 매일 학습 완료 |
| Next Step Reward | 추천 카드, 예상 시간, CTA | CTA delayed fade 150ms | 완료 후 이어가기 |

## 시각 강도 단계

| 강도 | 사용 범위 | 디자인 | 모션 |
| --- | --- | --- | --- |
| 낮음 | 문제 정답, 짧은 저장 | inline tint, check, 짧은 메시지 | 150~250ms |
| 중간 | 퀴즈/강의/오늘 목표 완료 | result card, progress fill, score count-up | 500~800ms |
| 높음 | 챕터/레벨/장기 목표 달성 | badge unlock, milestone panel, 제한적 sparkle | 800~1000ms |

높음 강도도 매번 쓰지 않는다. 드문 milestone에만 써야 기억에 남는다.

## 카피 기준

학습자 성취 카피는 짧고 구체적이어야 한다. "대단해요"보다 "무엇이 나아졌는지"를 말한다.

| 상황 | 권장 카피 | 피할 카피 |
| --- | --- | --- |
| 기본 완료 | 오늘 학습을 완료했어요 | 완료 |
| 퀴즈 완료 | 12문제 중 10문제를 맞혔어요 | 축하합니다! |
| 향상 | 지난번보다 정답률이 8% 올랐어요 | 천재네요 |
| 재도전 성공 | 다시 풀어서 3문제를 맞혔어요 | 아까는 틀렸지만 |
| 다음 학습 | 오답 3개만 복습하면 오늘 목표가 끝나요 | 계속 공부하세요 |
| 휴식 허용 | 오늘 목표를 끝냈어요. 여기서 마쳐도 좋아요 | 아직 부족해요 |

톤 원칙:

- 유치한 과장보다 차분한 인정이 오래 간다.
- 낮은 점수에도 회복 경로를 함께 보여준다.
- 학생을 탓하거나 압박하는 표현을 쓰지 않는다.
- "너는 못했다"보다 "다음에 할 일"을 말한다.

## 컴포넌트 패턴

| 컴포넌트 | 사용 시점 | 구성 |
| --- | --- | --- |
| Inline Success | 문제 정답, 저장, 짧은 완료 | 체크 아이콘, 1줄 메시지, 짧은 색상 변화 |
| Progress Fill | 챕터/오늘 목표 진척 | 현재 값, 목표 값, 변화량 |
| Result Card | 퀴즈/강의 완료 | 점수, 완료 수, 오답 수, 다음 CTA |
| Achievement Badge | 의미 있는 milestone | 배지명, 획득 조건, 다음 목표 |
| Streak Chip | 반복 사용 유도 | 연속 일수, 오늘 완료 여부, 회복 안내 |
| Next Step Card | 완료 후 이동 | 추천 학습 1개, 예상 시간, CTA |
| Reflection Prompt | 긴 학습 후 정리 | 오늘 알게 된 것, 어려웠던 것 1개 |

기본 completion component contract:

```md
## Learner Completion Component Brief

- completion type: question / quiz / lesson / daily goal / chapter / long-term goal
- learner goal:
- completed item:
- success metric:
- growth evidence:
- next recommended action:
- secondary action:
- reward element: none / progress / streak / badge / milestone
- visual reward style: inline / card / badge / milestone panel
- animation sequence: check / progress fill / count-up / badge reveal / CTA reveal
- motion intensity: low / medium / high
- reduced motion fallback:
- empty/low-score fallback:
```

## 모션 기준

성취 모션은 학습을 방해하지 않는 범위에서 "변화가 생겼다"는 느낌만 준다.

| 패턴 | 권장 시간 | 사용 |
| --- | --- | --- |
| 체크 아이콘 전환 | 150~250ms | 문제/작은 action 완료 |
| progress fill | 300~600ms | 목표 진척 |
| 점수 count-up | 500~800ms | 퀴즈/결과 화면 |
| badge reveal | 500~800ms | milestone |
| celebration overlay | 800ms 이하 | 챕터/장기 목표처럼 드문 완료 |

규칙:

- 정적 success 메시지만 두지 말고 최소 하나의 시각 변화(check, fill, count-up, reveal)를 둔다.
- 매 문제마다 confetti, full-screen modal, 큰 사운드 효과를 쓰지 않는다.
- milestone이 아닌 완료는 화면 흐름 안에서 처리한다.
- reduced motion 환경에서는 count-up과 reveal을 정적 숫자/배지로 대체한다.
- 모바일에서는 hover 기반 성취 표현을 쓰지 않는다.

## 학습 지속을 위한 완료 후 흐름

완료 화면은 아래 세 가지 중 하나를 선택하게 한다.

| 다음 흐름 | 적합한 경우 | CTA 예시 |
| --- | --- | --- |
| 바로 이어가기 | 짧은 학습 단위, 몰입이 유지될 때 | 다음 문제 풀기 |
| 약점 회복 | 오답/낮은 점수가 있을 때 | 오답 3개 복습하기 |
| 마무리 인정 | 오늘 목표를 끝냈을 때 | 오늘은 마치기 |

좋은 완료 화면은 "더 하라"만 말하지 않는다. 이미 완료한 것을 인정하고, 더 할 수 있는 선택지를 준다.

## 레퍼런스 선택

| 목적 | 먼저 볼 사이트 | 가져올 것 |
| --- | --- | --- |
| 실제 학습/앱 완료 흐름 | Mobbin, Page Flows | 완료 후 다음 행동, result screen, onboarding reward |
| 진행률/결과 모션 | Motion Primitives, Animate UI | progress, count-up, badge reveal timing |
| 기본 컴포넌트 구조 | shadcn/ui, Radix UI, Base UI | dialog, toast, tabs, progress의 접근성 contract |
| 제한적 시각 보상 | Magic UI, React Bits, Aceternity UI | 짧은 highlight, badge reveal 아이디어 |
| 학습 카드/목록 | HyperUI, Kokonut UI | 카드 hierarchy, empty/result 상태 |

## 체크리스트

- 완료 직후 300ms 안에 상태 변화가 보이는가?
- 완료한 단위가 명확한가?
- 칭찬만 있고 성장 근거가 빠져 있지 않은가?
- 다음 CTA가 하나로 우선순위화되어 있는가?
- 낮은 점수나 오답이 있어도 회복 행동을 제안하는가?
- check, progress fill, count-up, badge reveal 중 최소 하나의 시각 변화가 있는가?
- 애니메이션 시퀀스가 1초 안팎에서 끝나는가?
- 보상 요소가 completion level에 맞는 강도로 제한되어 있는가?
- 매번 같은 축하 모션을 반복해 피로감을 만들지 않는가?
- streak가 압박이나 죄책감으로 작동하지 않는가?
- reduced motion fallback이 있는가?
- 모바일에서 CTA와 결과 숫자가 겹치지 않는가?
- 학생 화면에서 관리자용 KPI처럼 차갑게 보이지 않는가?

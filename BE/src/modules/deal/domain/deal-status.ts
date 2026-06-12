export enum DealStatusCode {
  INITIAL_CONTACT = "INITIAL_CONTACT",
  NEEDS_CHECK = "NEEDS_CHECK",
  PROPOSAL_QUOTE = "PROPOSAL_QUOTE",
  NEGOTIATION = "NEGOTIATION",
  WON = "WON",
  LOST = "LOST",
}

const DEAL_STATUS_LABELS: Readonly<Record<DealStatusCode, string>> = {
  [DealStatusCode.INITIAL_CONTACT]: "초기 접촉",
  [DealStatusCode.NEEDS_CHECK]: "니즈 확인",
  [DealStatusCode.PROPOSAL_QUOTE]: "제안/견적",
  [DealStatusCode.NEGOTIATION]: "협상",
  [DealStatusCode.WON]: "성사",
  [DealStatusCode.LOST]: "실패",
};

export const DEAL_STATUS_CODES: readonly DealStatusCode[] = [
  DealStatusCode.INITIAL_CONTACT,
  DealStatusCode.NEEDS_CHECK,
  DealStatusCode.PROPOSAL_QUOTE,
  DealStatusCode.NEGOTIATION,
  DealStatusCode.WON,
  DealStatusCode.LOST,
];

// 기능 : Deal 상태 code의 한국어 label을 반환합니다.
export function getDealStatusLabel(status: DealStatusCode): string {
  return DEAL_STATUS_LABELS[status];
}

// 기능 : 저장소에서 읽은 문자열이 Deal 상태 code인지 확인합니다.
export function isDealStatusCode(value: string): value is DealStatusCode {
  return DEAL_STATUS_CODES.some((status) => status === value);
}

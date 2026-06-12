import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

// 역할 : RequestWithRequestId HTTP 요청에 request id 추적 값을 보관하는 구조를 정의합니다.
export type RequestWithRequestId = Request & {
  readonly requestId: string;
};

// 역할 : RequestIdMiddleware 모든 HTTP 요청에 request id를 부여하고 응답 header로 전달합니다.
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  // 기능 : 요청 header의 request id를 이어받거나 새 request id를 생성합니다.
  use(request: Request, response: Response, next: NextFunction): void {
    // 1. 신뢰 가능한 길이의 incoming request id를 정규화한다.
    const incomingRequestId = this.normalizeRequestId(
      request.header(REQUEST_ID_HEADER)
    );

    // 2. incoming request id가 없으면 서버에서 새 request id를 생성한다.
    const requestId = incomingRequestId ?? randomUUID();
    Object.assign(request, { requestId });

    // 3. 응답 header에 request id를 설정하고 다음 middleware로 넘긴다.
    response.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }

  // 기능 : 외부에서 전달된 request id가 추적용으로 사용할 수 있는 문자열인지 검증합니다.
  private normalizeRequestId(value: string | undefined): string | null {
    const normalized = value?.trim();

    if (!normalized || normalized.length > 128) {
      return null;
    }

    return normalized;
  }
}

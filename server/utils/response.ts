import { setResponseStatus } from "h3";

export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

export type ApiResponse<T> = {
  data: T | null;
  meta?: Record<string, any>;
  error?: ApiError;
};

export function sendSuccess<T>(
  event: any,
  data: T,
  statusCode = 200,
  meta?: Record<string, any>
): ApiResponse<T> {
  setResponseStatus(event, statusCode);
  return { data, ...(meta ? { meta } : {}) };
}

export function sendError(
  event: any,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): ApiResponse<null> {
  setResponseStatus(event, statusCode, message);
  return {
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

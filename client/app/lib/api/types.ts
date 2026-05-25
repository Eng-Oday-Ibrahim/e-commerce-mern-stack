export type ApiErrorResponse = {
  ok: false;
  code: string;
  message: string;
  issues?: Array<{ path: string; message: string }>;
};

export type ApiOkResponse<T extends Record<string, unknown> = Record<string, never>> = {
  ok: true;
} & T;


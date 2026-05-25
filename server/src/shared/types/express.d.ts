import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      sessionId: string;
      subject: { type: 'user' | 'customer'; id: string; roles?: string[] };
    };
  }
}


import { Role } from '../utils/constants.js';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
      role: Role;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

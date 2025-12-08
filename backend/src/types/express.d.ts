import { Role, UserStatus } from "@/constants/user.constants.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export { };

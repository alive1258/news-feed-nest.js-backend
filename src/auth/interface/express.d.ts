import { ActiveUserData } from '../interface/active-user-data.interface';

declare module 'express' {
  interface Request {
    user?: ActiveUserData & { permissions: string[] };
  }
}

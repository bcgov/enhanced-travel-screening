import { Request } from 'express';

export interface IUserRequest extends Request {
  user: {
    token: string;
  };
}

export interface PhacEntryError {
  id: string;
  index: string;
  errors: string[];
}

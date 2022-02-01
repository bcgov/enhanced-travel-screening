export interface User {
  username: string;
  password: string;
  salt: string;
  type?: string;
  token?: string;
}

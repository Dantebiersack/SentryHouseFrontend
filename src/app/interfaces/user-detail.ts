export interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  phoneNumber: string;
  twoFacotrEnabled: true;
  phoneNumberConfirmed: true;
  accessFailedCount: 0;
}

export interface User {
  fullName: string;
  password: string,
  email: string;
  roles: string[];
}
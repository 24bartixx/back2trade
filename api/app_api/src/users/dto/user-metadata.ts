import { User } from "@prisma/client";

export interface UserMetadata {
  email: string;
  password: string;
}

export function userToMetadata(user: User) {
  return {
    email: user.email,
    password: user.password
  };
}

import { RoleEnum } from "src/user/role.enum";
import type { User } from "src/user/entities/user.entity";

export function hasRole(user: User, ...roles: RoleEnum[]): boolean {
  if (!user || !user.roles) {
    return false;
  }
  
  // Here: assume user.roles is an array of Role objects
  return user.roles.some((role) => roles.includes(role.name as RoleEnum));
}

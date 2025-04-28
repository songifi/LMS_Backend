import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/user/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (string | RoleEnum)[]) => {
  // Convert all roles to strings to ensure consistency
  const stringRoles = roles.map(role => String(role));
  return SetMetadata(ROLES_KEY, stringRoles);
};
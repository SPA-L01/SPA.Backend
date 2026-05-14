import { SetMetadata } from '@nestjs/common';
import { Role } from '@modules/user/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Role, ...Role[]]) =>
  SetMetadata(ROLES_KEY, roles);

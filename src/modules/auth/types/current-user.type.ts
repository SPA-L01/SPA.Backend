import { Role } from '@modules/user/enums/role.enum';

export type CurrentUser = {
  id: string; // UUID
  role: Role;
};

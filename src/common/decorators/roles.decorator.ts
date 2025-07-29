import { SetMetadata } from '@nestjs/common';
import { EUserTypes } from '../constants/common.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserTypes[]) => SetMetadata(ROLES_KEY, roles);

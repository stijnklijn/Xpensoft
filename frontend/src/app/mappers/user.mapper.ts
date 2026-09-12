import { UserResponseDto } from '../api/generated/models';
import { User } from '../models/user';

export function toUserEntity(dto: UserResponseDto): User {
  return {
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    lastLoginDateTime: dto.lastLoginDateTime ?? undefined,
    language: dto.language ?? undefined,
    defaultResultsPerPage: Number(dto.defaultResultsPerPage),
  };
}

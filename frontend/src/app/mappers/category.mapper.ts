import { CategoryDto } from '../api/generated/models';

export function toCategoryEntities(dtos: CategoryDto[]): Category[] {
  return dtos.map((dto) => ({
    id: dto.id!,
    name: dto.name,
    isIncome: dto.isIncome,
  }));
}

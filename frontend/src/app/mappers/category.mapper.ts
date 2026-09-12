import { CategoryDto } from '../api/generated/models';

export function toCategoryEntity(dto: CategoryDto): Category {
  return {
    id: dto.id!,
    name: dto.name,
    isIncome: dto.isIncome,
  };
}

export function toCategoryEntities(dtos: CategoryDto[]): Category[] {
  return dtos.map(toCategoryEntity);
}

import { TransactionDto } from '../api/generated/models';

export function toTransactionEntities(dtos: TransactionDto[]): Transaction[] {
  return dtos.map((dto) => ({
    id: dto.id!,
    date: new Date(dto.date),
    description: dto.description,
    categoryId: dto.categoryId!,
    amount: Number(dto.amount),
  }));
}

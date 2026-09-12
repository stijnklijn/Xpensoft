import { TransactionDto } from '../api/generated/models';
import { Transaction } from '../models/transaction';

export function toTransactionEntity(dto: TransactionDto): Transaction {
  return {
    id: dto.id!,
    date: new Date(dto.date),
    description: dto.description,
    categoryId: dto.categoryId!,
    amount: Number(dto.amount),
  };
}

export function toTransactionEntities(dtos: TransactionDto[]): Transaction[] {
  return dtos.map(toTransactionEntity);
}

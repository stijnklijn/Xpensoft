import { Transaction } from './transaction';

export interface SortOption {
  label?: string;
  field: keyof Transaction;
  asc: boolean;
}

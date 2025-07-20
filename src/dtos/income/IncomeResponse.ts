import { IncomeDto } from './IncomeDto';

export interface IncomeResponse {
  success: boolean;
  data?: IncomeDto | IncomeDto[];
  message?: string;
}

import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateIncomeDto } from "@/domain/models/income-expense/income/create-income.dto";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";

export interface IncomeInterface {
    getAllIncomes(): Promise<Income[]>;
    getIncomeById(incomeId: string): Promise<Income>;
    createIncome(token: BearerTokenedRequest, income: CreateIncomeDto): Promise<Income>;
    updateIncome(idToken: TokenedRequest, data: UpdateIncomeDto): Promise<Income>;
    deleteIncome(idToken: TokenedRequest): Promise<Income>;
}
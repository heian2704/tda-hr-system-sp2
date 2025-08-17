import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateExpenseDto } from "@/domain/models/income-expense/expense/create-expense.dto";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";

export interface ExpenseInterface {
    getAllExpenses(): Promise<Expense[]>;
    getExpenseById(id: string): Promise<Expense>;
    createExpense(token: BearerTokenedRequest, expense: CreateExpenseDto): Promise<Expense>;
    updateExpense(idtoken: TokenedRequest, expense: UpdateExpenseDto): Promise<Expense>;
    deleteExpense(idtoken: TokenedRequest): Promise<Expense>;
}
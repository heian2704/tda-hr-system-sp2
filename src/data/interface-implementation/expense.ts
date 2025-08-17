import { ExpenseInterface } from "@/domain/interfaces/income-expense/expense/ExpenseInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateExpenseDto } from "@/domain/models/income-expense/expense/create-expense.dto";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/services/network/api";
import { create } from "domain";

export class ExpenseInterfaceImpl implements ExpenseInterface {
    getAllExpenses(): Promise<Expense[]> {
        return apiGetRequestsHandler<Expense[]>({
            endpoint: "/expense",
        });
    }
    getExpenseById(id: string): Promise<Expense> {
        return apiGetRequestsHandler<Expense>({
            endpoint: `/expense/${id}`,
        });
    }
    createExpense(token: BearerTokenedRequest, expense: CreateExpenseDto): Promise<Expense> {
        return apiPostRequestsHandler<Expense>({
            endpoint: "/expense",
            body: expense,
            token: token.token
        });
    }
    updateExpense(idtoken: TokenedRequest, expense: UpdateExpenseDto): Promise<Expense> {
        return apiPatchRequestsHandler<Expense>({
            endpoint: `/expense/${idtoken.id}`,
            body: expense,
            token: idtoken.token
        });
    }
    deleteExpense(idtoken: TokenedRequest): Promise<Expense> {
        return apiDeleteRequestsHandler<Expense>({
            endpoint: `/expense/${idtoken.id}`,
            token: idtoken.token
        });
    }

}
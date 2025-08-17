import { ExpenseInterface } from "@/domain/interfaces/income-expense/expense/ExpenseInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";

export class GetAllExpenseUseCase {
    constructor(private expenseInterface: ExpenseInterface) {}

    async execute(): Promise<Expense[]> {
        return this.expenseInterface.getAllExpenses();
    }
}

export class GetExpenseByIdUseCase {
    constructor(private expenseInterface: ExpenseInterface) {}

    async execute(id: string): Promise<Expense> {
        return this.expenseInterface.getExpenseById(id);
    }
}

export class CreateExpenseUseCase {
    constructor(private expenseInterface: ExpenseInterface) {}

    async execute(token: BearerTokenedRequest, expense: Expense): Promise<Expense> {
        return this.expenseInterface.createExpense(token, expense);
    }
}

export class UpdateExpenseUseCase {
    constructor(private expenseInterface: ExpenseInterface) {}

    async execute(idtoken: TokenedRequest, expense: Expense): Promise<Expense> {
        return this.expenseInterface.updateExpense(idtoken, expense);
    }
}

export class DeleteExpenseUseCase {
    constructor(private expenseInterface: ExpenseInterface) {}

    async execute(idtoken: TokenedRequest): Promise<Expense> {
        return this.expenseInterface.deleteExpense(idtoken);
    }
}
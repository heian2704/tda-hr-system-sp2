import { IncomeInterface } from "@/domain/interfaces/income-expense/income/IncomeInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateIncomeDto } from "@/domain/models/income-expense/income/create-income.dto";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";

export class GetAllIncomesUseCase {
    constructor(private incomeInterface: IncomeInterface) {}

    async execute(): Promise<Income[]> {
        return this.incomeInterface.getAllIncomes();
    }
}

export class GetIncomeByIdUseCase {
    constructor(private incomeInterface: IncomeInterface) {}

    async execute(id: string): Promise<Income> {
        return this.incomeInterface.getIncomeById(id);
    }
}

export class CreateIncomeUseCase {
    constructor(private incomeInterface: IncomeInterface) {}

    async execute(token: BearerTokenedRequest, income: CreateIncomeDto): Promise<Income> {
        return this.incomeInterface.createIncome(token, income);
    }
}

export class UpdateIncomeUseCase {
    constructor(private incomeInterface: IncomeInterface) {}

    async execute(idToken: TokenedRequest, income: UpdateIncomeDto): Promise<Income> {
        return this.incomeInterface.updateIncome(idToken, income);
    }
}

export class DeleteIncomeUseCase {
    constructor(private incomeInterface: IncomeInterface) {}

    async execute(idToken: TokenedRequest): Promise<Income> {
        return this.incomeInterface.deleteIncome(idToken);
    }
}

import { IncomeInterface } from "@/domain/interfaces/income-expense/income/IncomeInterface";
import { 
    BearerTokenedRequest, 
    TokenedRequest 
} from "@/domain/models/common/header-param";
import { CreateIncomeDto } from "@/domain/models/income-expense/income/create-income.dto";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";
import { 
    apiDeleteRequestsHandler, 
    apiGetRequestsHandler, 
    apiPatchRequestsHandler, 
    apiPostRequestsHandler 
} from "@/network/api";

export class IncomeInterfaceImpl implements IncomeInterface {
    getAllIncomes(): Promise<Income[]> {
        return apiGetRequestsHandler<Income[]>({
                endpoint: "/income",
            });
    }
    getIncomeById(incomeId: string): Promise<Income> {
        return apiGetRequestsHandler<Income>({
            endpoint: `/income/${incomeId}`,
        });
    }
    createIncome(token: BearerTokenedRequest, income: CreateIncomeDto): Promise<Income> {
        return apiPostRequestsHandler<Income>({
            endpoint: "/income",
            body: income,
            token: token.token,
        });
    }
    updateIncome(idToken: TokenedRequest, data: UpdateIncomeDto): Promise<Income> {
        return apiPatchRequestsHandler<Income>({
            endpoint: `/income/${idToken.id}`,
            body: data,
            token: idToken.token,
        });
    }
    deleteIncome(idToken: TokenedRequest): Promise<Income> {
        return apiDeleteRequestsHandler<Income>({
            endpoint: `/income/${idToken.id}`,
            token: idToken.token,
        });
    }
    
}
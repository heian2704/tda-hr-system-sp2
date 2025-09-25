import { WorklogInterface } from "@/domain/interfaces/worklog/WorklogInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateWorklogDto } from "@/domain/models/worklog/create-worklog.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { Worklogs } from "@/domain/models/worklog/get-worklogs.dto";
import { UpdateWorklogDto } from "@/domain/models/worklog/update-worklog.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/network/api";

export class WorklogInterfaceImpl implements WorklogInterface {
    getWorklogsByEmployeeId(employeeId: string): Promise<Worklog[]> {
        return apiGetRequestsHandler<Worklog[]>({
            endpoint: `/employee-product/by-employee-id?employeeId=${employeeId}`,
        });
    }
    async getAllWorklogs(limit: number, page: number): Promise<Worklogs> {
        return apiGetRequestsHandler<Worklogs>({
            endpoint: "/employee-product?limit=" + limit + "&page=" + page,
        });
    }

    async getWorklogById(id: string): Promise<Worklog> {
        return apiGetRequestsHandler<Worklog>({
            endpoint: `/employee-product/${id}`,
        });
    }

    async createWorklog(idToken: BearerTokenedRequest, createWorklogDto: CreateWorklogDto): Promise<Worklog> {
        return apiPostRequestsHandler<Worklog>({
            endpoint: `/employee-product`,
            body: createWorklogDto,
            token: idToken.token
        });
    }

    async updateWorklog(idToken: TokenedRequest, updateWorklogDto: UpdateWorklogDto): Promise<Worklog> {
        return apiPatchRequestsHandler<Worklog>({
            endpoint: `/employee-product/${idToken.id}`,
            body: updateWorklogDto,
            token: idToken.token
        });
    }

    async deleteWorklog(idToken: TokenedRequest): Promise<Worklog> {
        return apiDeleteRequestsHandler<Worklog>({
            endpoint: `/employee-product/${idToken.id}`,
            token: idToken.token
        });
    }
}
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateWorklogDto } from "@/domain/models/worklog/create-worklog.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { Worklogs } from "@/domain/models/worklog/get-worklogs.dto";
import { UpdateWorklogDto } from "@/domain/models/worklog/update-worklog.dto";

export interface WorklogInterface {
    getAllWorklogs(limit: number, page: number): Promise<Worklogs>;
    getWorklogById(id: string): Promise<Worklog>;
    getWorklogsByEmployeeId(employeeId: string): Promise<Worklog[]>;
    createWorklog(token: BearerTokenedRequest, createWorklogDto: CreateWorklogDto): Promise<Worklog>;
    updateWorklog(idToken: TokenedRequest, updateWorklogDto: UpdateWorklogDto): Promise<Worklog>;
    deleteWorklog(idToken: TokenedRequest): Promise<Worklog>;
}
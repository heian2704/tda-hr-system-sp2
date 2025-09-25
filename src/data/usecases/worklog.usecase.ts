import { WorklogInterface } from "@/domain/interfaces/worklog/WorklogInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateWorklogDto } from "@/domain/models/worklog/create-worklog.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { Worklogs } from "@/domain/models/worklog/get-worklogs.dto";
import { UpdateWorklogDto } from "@/domain/models/worklog/update-worklog.dto";

export class GetAllWorklogUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(limit: number, page: number): Promise<Worklogs> {
        return this.worklogInterface.getAllWorklogs(limit, page);
    }
}

export class GetWorklogByIdUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(idToken: TokenedRequest): Promise<Worklog> {
        return this.worklogInterface.getWorklogById(idToken.id);
    }
}

export class GetWorklogsByEmployeeIdUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(employeeId: string): Promise<Worklog[]> {
        return this.worklogInterface.getWorklogsByEmployeeId(employeeId);
    }
}

export class CreateWorklogUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(token: BearerTokenedRequest, createWorklogDto: CreateWorklogDto): Promise<Worklog> {
        return this.worklogInterface.createWorklog(token, createWorklogDto);
    }
}

export class UpdateWorklogUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(idToken: TokenedRequest, updateWorklogDto: UpdateWorklogDto): Promise<Worklog> {
        return this.worklogInterface.updateWorklog(idToken, updateWorklogDto);
    }
}

export class DeleteWorklogUseCase {
    constructor(private worklogInterface: WorklogInterface) {}

    execute(idToken: TokenedRequest): Promise<Worklog> {
        return this.worklogInterface.deleteWorklog(idToken);
    }
}
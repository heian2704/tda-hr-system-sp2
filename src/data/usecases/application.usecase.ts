import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { AllApplications } from "@/domain/models/application/get-all-applications.model";
import { UpdateApplicationDto, UpdateApplicationStatus } from "@/domain/models/application/update-application.dto";

export class GetAllApplicationUseCase {
    constructor(private applicationInterface: ApplicationInterface) {}

    execute(): Promise<Application[]> {
        return this.applicationInterface.getAllApplication();
    }
}

export class GetApplicationByIdUseCase {
    constructor(private applicationInterface: ApplicationInterface) {}

    execute(idToken: TokenedRequest): Promise<Application> {
        return this.applicationInterface.getApplicationById(idToken.id);
    }
}

export class CreateApplicationUseCase {
    constructor(private applicationInterface: ApplicationInterface){}

    execute(idToken: BearerTokenedRequest, createApplicationDto: CreateApplicationDto): Promise<Application> {
        return this.applicationInterface.createApplication(idToken, createApplicationDto);
    }
}

export class UpdateApplicationUseCase {
    constructor(private applicationInterface: ApplicationInterface) {}

    execute(idToken: TokenedRequest, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        return this.applicationInterface.updateApplication(idToken, updateApplicationDto);
    }
}

export class DeleteApplicationUseCase {
    constructor(private applicationInterface: ApplicationInterface) {}

    execute(idToken: TokenedRequest): Promise<Application> {
        return this.applicationInterface.deleteApplication(idToken);
    }
}

export class UpdateApplicationStatusUseCase {
    constructor(private applicationInterface: ApplicationInterface) {}

    execute(idToken: TokenedRequest, status: UpdateApplicationStatus): Promise<Application> {
        return this.applicationInterface.updateApplicationStatus(idToken, status);
    }
}

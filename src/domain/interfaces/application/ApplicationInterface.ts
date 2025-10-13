import { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import { AllApplications } from "@/domain/models/application/get-all-applications.model";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { UpdateApplicationDto, UpdateApplicationStatusDto } from "@/domain/models/application/update-application.dto";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";

export interface ApplicationInterface {
    getAllApplication(): Promise<Application[]>;
    getApplicationById(id: string): Promise<Application>;
    createApplication(token: BearerTokenedRequest, createApplicationDto: CreateApplicationDto): Promise<Application>;
    updateApplication(idToken: BearerTokenedRequest, updateApplicationDto: UpdateApplicationDto): Promise<Application>;
    deleteApplication(idToken: BearerTokenedRequest): Promise<Application>;
    updateApplicationStatus(idToken: BearerTokenedRequest, status: UpdateApplicationStatusDto): Promise<Application>;
}

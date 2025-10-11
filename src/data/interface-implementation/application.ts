import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { AllApplications } from "@/domain/models/application/get-all-applications.model";
import { UpdateApplicationDto, UpdateApplicationStatus } from "@/domain/models/application/update-application.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/network/api";

export class ApplicationInterfaceImpl implements ApplicationInterface {
    getAllApplication(): Promise<AllApplications> {
        return apiGetRequestsHandler<AllApplications>({
            endpoint: '/application'
        });
    }

    getApplicationById(id: string): Promise<Application> {
        return apiGetRequestsHandler<Application>({
            endpoint: `/application/${id}`
        });
    }

    createApplication(idToken: BearerTokenedRequest, createApplicationDto: CreateApplicationDto): Promise<Application> {
        return apiPostRequestsHandler<Application>({
            endpoint: '/application',
            body: createApplicationDto,
            token: idToken.token
        });
    }

    updateApplication(idToken: TokenedRequest, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
        return apiPatchRequestsHandler<Application>({
            endpoint: `/application/${idToken.id}`,
            body: updateApplicationDto,
            token: idToken.token
        });
    }

    updateApplicationStatus(idToken: TokenedRequest, status: UpdateApplicationStatus): Promise<Application> {
        return apiPatchRequestsHandler<Application>({
            endpoint: `/application/${idToken.id}/status`,
            body: status,
            token: idToken.token,
        });
    }

    deleteApplication(idToken: TokenedRequest): Promise<Application> {
        return apiDeleteRequestsHandler<Application>({
            endpoint: `/application/${idToken.id}`,
            token: idToken.token,
        });
    }
}
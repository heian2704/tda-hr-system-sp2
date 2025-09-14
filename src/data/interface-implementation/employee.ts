import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { Employees } from "@/domain/models/employee/get-employees.model";
import { UpdateEmployeeDto, UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/network/api";

export class EmployeeInterfaceImpl implements EmployeeInterface {
    getAllEmployee(limit: number, page: number): Promise<Employees> {
        return apiGetRequestsHandler<Employees> ({
            endpoint: '/employee?limit=' + limit + '&page=' + page
        });
    }

    getEmployeeById(id: string): Promise<Employee> {
        return apiGetRequestsHandler<Employee> ({
            endpoint: `/employee/${id}`
        })
    }

    createEmployee(idToken: BearerTokenedRequest, createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return apiPostRequestsHandler<Employee> ({
            endpoint: '/employee',
            body: createEmployeeDto,
            token: idToken.token
        })
    }

    updateEmployee(idToken: TokenedRequest, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        return apiPatchRequestsHandler<Employee> ({
            endpoint: `/employee/${idToken.id}`,
            body: updateEmployeeDto,
            token: idToken.token
        })
    }

    updateEmployeeStatus(idToken: TokenedRequest, status: UpdateEmpStatus): Promise<Employee> {
        return apiPatchRequestsHandler<Employee> ({
            endpoint: `/employee/${idToken.id}/status`,
            body: status,
            token: idToken.token,
        })
    }

    deleteEmployee(idToken: TokenedRequest): Promise<Employee> {
        return apiDeleteRequestsHandler<Employee> ({
            endpoint: `/employee/${idToken.id}`,
            token: idToken.token,
        })
    }
}
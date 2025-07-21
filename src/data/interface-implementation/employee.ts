import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { apiGetRequestsHandler } from "@/services/network/api";

export class EmployeeInterfaceImpl implements EmployeeInterface {
    async getAllEmployee(): Promise<Employee[]> {
        return await apiGetRequestsHandler<Employee[]> ({
            endpoint: '/employee',
        });
    }
}
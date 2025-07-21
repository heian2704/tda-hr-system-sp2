import { Employee } from "@/domain/models/employee/get-employee.model";

export interface EmployeeInterface {
    getAllEmployee(): Promise<Employee[]>;
}
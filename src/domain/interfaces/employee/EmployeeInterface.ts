import { EmpStatus } from "@/constants/employee-status.enum";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { UpdateEmployeeDto, UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

export interface EmployeeInterface {
    getAllEmployee(): Promise<Employee[]>;
    getEmployeeById(id: string): Promise<Employee>;
    createEmployee(idToken: BearerTokenedRequest, createEmployeeDto: CreateEmployeeDto): Promise<Employee>
    updateEmployee(idToken: TokenedRequest, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>
    deleteEmployee(idToken: TokenedRequest): Promise<Employee>
    updateEmployeeStatus(idToken: TokenedRequest, status: UpdateEmpStatus): Promise<Employee>
}
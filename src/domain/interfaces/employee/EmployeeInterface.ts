import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { Employees } from "@/domain/models/employee/get-employees.model";
import { UpdateEmployeeDto, UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

export interface EmployeeInterface {
    getAllEmployee(limit: number, page: number, empName?: string): Promise<Employees>;
    getEmployeeById(id: string): Promise<Employee>;
    createEmployee(token: BearerTokenedRequest, createEmployeeDto: CreateEmployeeDto): Promise<Employee>
    updateEmployee(idToken: TokenedRequest, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>
    deleteEmployee(idToken: TokenedRequest): Promise<Employee>
    updateEmployeeStatus(idToken: TokenedRequest, status: UpdateEmpStatus): Promise<Employee>
}
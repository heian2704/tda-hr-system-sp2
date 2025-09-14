import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { Employees } from "@/domain/models/employee/get-employees.model";
import { UpdateEmployeeDto, UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

export class GetAllEmployeeUseCase {
    constructor(private employeeInterface: EmployeeInterface){}

    execute(limit: number, page: number): Promise<Employees> {
        return this.employeeInterface.getAllEmployee(limit, page);
    }
}


export class GetEmployeeByIdUseCase {
    constructor(private employeeInterface: EmployeeInterface) {}

    execute(idToken: TokenedRequest): Promise<Employee> {
        return this.employeeInterface.getEmployeeById(idToken.id);
    }
}

export class CreateEmployeeUseCase {
    constructor(private employeeInterface: EmployeeInterface){}

    execute(idToken: BearerTokenedRequest, createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return this.employeeInterface.createEmployee(idToken, createEmployeeDto);
    }
}

export class UpdateEmployeeUseCase {
    constructor(private employeeInterface: EmployeeInterface) {}

    execute(idToken: TokenedRequest, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        return this.employeeInterface.updateEmployee(idToken, updateEmployeeDto);
    }
}

export class DeleteEmployeeUseCase {
    constructor(private employeeInterface: EmployeeInterface) {}

    execute(idToken: TokenedRequest): Promise<Employee> {
        return this.employeeInterface.deleteEmployee(idToken);
    }
}

export class UpdateEmployeeStatusUseCase {
    constructor(private employeeInterface: EmployeeInterface) {}

    execute(idToken: TokenedRequest, status: UpdateEmpStatus): Promise<Employee> {
        return this.employeeInterface.updateEmployeeStatus(idToken, status);
    }
}

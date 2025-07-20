import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { Employee } from "@/domain/models/employee/get-employee.model";

export class GetAllEmployeeUseCase {
    constructor(private employeeInterface: EmployeeInterface){}

    async execute(): Promise<Employee[]> {
        return this.employeeInterface.getAllEmployee();
    }
}
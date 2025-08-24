// import { CreateEmployeeUseCase, DeleteEmployeeUseCase, GetAllEmployeeUseCase, GetEmployeeByIdUseCase, UpdateEmployeeStatusUseCase, UpdateEmployeeUseCase } from "@/data/usecases/employee.usecase";
// import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";

// interface EmployeeDummyProps {
//     getAllEmployeeUseCase: GetAllEmployeeUseCase
//     getEmployeeByIdUseCase: GetEmployeeByIdUseCase
//     createEmployeeUseCase: CreateEmployeeUseCase
//     updateEmployeeUseCase: UpdateEmployeeUseCase
//     updateEmployeeStatusUseCase: UpdateEmployeeStatusUseCase
//     deleteEmployeeUseCase: DeleteEmployeeUseCase
// }

// const EmployeeListView: React.FC<EmployeeDummyProps> = ({ getAllEmployeeUseCase }) => {
//   const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);

//   if (loading) return <div>Loading employees...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Employee List</h2>
//       <ul className="space-y-2">
//         {employees.map((emp) => (
//           <li key={emp._id} className="p-2 bg-white shadow rounded">
//             {emp.name} — {emp.position}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default EmployeeListView;

import React from "react";
import { EmpStatus } from "@/constants/employee-status.enum";
import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetAllEmployeeUseCase,
  GetEmployeeByIdUseCase,
  UpdateEmployeeStatusUseCase,
  UpdateEmployeeUseCase,
} from "@/data/usecases/employee.usecase";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { UpdateEmployeeDto, UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

interface EmployeeDummyProps {
  getAllEmployeeUseCase: GetAllEmployeeUseCase;
  getEmployeeByIdUseCase: GetEmployeeByIdUseCase;
  createEmployeeUseCase: CreateEmployeeUseCase;
  updateEmployeeUseCase: UpdateEmployeeUseCase;
  updateEmployeeStatusUseCase: UpdateEmployeeStatusUseCase;
  deleteEmployeeUseCase: DeleteEmployeeUseCase;
}

// Your real token
const ID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODRhOTk3NDFkN2U1ZDE1ZjYyMjE3ZmQiLCJlbWFpbCI6InRodXllaW5AZW1haWwuY29tIiwiaWF0IjoxNzU0NjY1NzU0LCJleHAiOjE3NTQ2NjkzNTQsImF1ZCI6InRkYS1iYWNrZW5kLWtoYWtpLnZlcmNlbC5hcHAiLCJpc3MiOiJ0ZGEtYmFja2VuZC1raGFraS52ZXJjZWwuYXBwIn0.6KTnfeBvMoxFl7kucoCo2fGQ9EiegbqfVZnWeQBKypc";

// Helper for TokenedRequest
const makeTokenedRequest = (id: string): TokenedRequest => ({
  id,
  token: ID_TOKEN,
});

const EmployeeListView: React.FC<EmployeeDummyProps> = ({
  getAllEmployeeUseCase,
  getEmployeeByIdUseCase,
  createEmployeeUseCase,
  updateEmployeeUseCase,
  updateEmployeeStatusUseCase,
  deleteEmployeeUseCase,
}) => {
  const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);
  // define hooks here

  // CREATE
  const handleCreate = async () => {
    try {
      const dto: CreateEmployeeDto = {
        name: "KOKO MGMG SHINE",
        phoneNumber: "0912345678",
        address: "123 Dummy Street",
        position: "Intern",
        status: EmpStatus.ACTIVE,
        joinedDate: new Date().toISOString(),
      };

      const result = await createEmployeeUseCase.execute({ token: ID_TOKEN }, dto);
      alert("Create Dummy Done");
      console.log("Created:", result);
    } catch (err: any) {
      console.error("Create Error:", err);
      alert(`Error creating employee: ${err?.message || JSON.stringify(err)}`);
    }
  };

  // READ
  const handleGetById = async (id: string) => {
    const emp = await getEmployeeByIdUseCase.execute(makeTokenedRequest(id));
    alert(`Got: ${emp.name}`);
  };

  // UPDATE
  const handleUpdate = async (id: string) => {
    const dto: UpdateEmployeeDto = {
      name: "Updated Dummy Name",
      position: "Updated Intern",
    };
    await updateEmployeeUseCase.execute(makeTokenedRequest(id), dto);
    alert("Update Dummy Done");
  };

  // UPDATE STATUS
  const handleUpdateStatus = async (id: string) => {
    try {
        const statusdto: UpdateEmpStatus = {status: EmpStatus.ON_LEAVE}
        await updateEmployeeStatusUseCase.execute(makeTokenedRequest(id), statusdto);
        alert("Status Updated to ON_LEAVE");
    } catch(err) {
        alert(err)
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    await deleteEmployeeUseCase.execute(makeTokenedRequest(id));
    alert("Dummy Deleted");
  };

  // RENDER
  if (loading) return <div>Loading employees...</div>;
  if (error && typeof error === "string") return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>

      <button onClick={handleCreate} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        + Create Dummy Employee
      </button>

      <ul className="space-y-2">
        {employees.map((emp) => (
          <li
            key={emp._id}
            className="p-2 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <strong>{emp.name}</strong> — {emp.position}
            </div>
            <div className="space-x-1">
              <button
                onClick={() => handleGetById(emp._id)}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                View
              </button>
              <button
                onClick={() => handleUpdate(emp._id)}
                className="px-2 py-1 bg-yellow-300 rounded"
              >
                Update
              </button>
              <button
                onClick={() => handleUpdateStatus(emp._id)}
                className="px-2 py-1 bg-purple-300 rounded"
              >
                Status
              </button>
              <button
                onClick={() => handleDelete(emp._id)}
                className="px-2 py-1 bg-red-400 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeListView;

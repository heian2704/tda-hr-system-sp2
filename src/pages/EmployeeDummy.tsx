import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";

interface EmployeeDummyProps {
    getAllEmployeeUseCase: GetAllEmployeeUseCase
}

const EmployeeListView: React.FC<EmployeeDummyProps> = ({ getAllEmployeeUseCase }) => {
  const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>
      <ul className="space-y-2">
        {employees.map((emp) => (
          <li key={emp._id} className="p-2 bg-white shadow rounded">
            {emp.name} — {emp.position}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeListView;
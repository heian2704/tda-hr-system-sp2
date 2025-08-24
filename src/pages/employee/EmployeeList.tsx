import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";
import { useSearchParams } from "react-router-dom";

interface EmployeeDummyProps {
    getAllEmployeeUseCase: GetAllEmployeeUseCase
}

const EmployeeListView: React.FC<EmployeeDummyProps> = ({ getAllEmployeeUseCase }) => {
  const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>; 
  
  const [searchParams] = useSearchParams(); // Get the search params from the URL
  const searchQuery = searchParams.get('q') || ''; // Get the 'q' parameter

  const lowerCaseSearchQuery = searchQuery.toLowerCase();

  const filteredEmployees = employees.filter(employee => {
    return (
      employee.name.toLowerCase().includes(lowerCaseSearchQuery) ||
      employee.phoneNumber.toLowerCase().includes(lowerCaseSearchQuery) ||
      employee.position.toLowerCase().includes(lowerCaseSearchQuery) ||
      employee.address.toLowerCase().includes(lowerCaseSearchQuery) ||
      employee.status.toLowerCase().includes(lowerCaseSearchQuery) ||
      employee._id.toLowerCase().includes(lowerCaseSearchQuery)
    );
  });

  return (
    <div className="employee-list-page">
      <h1 className="text-2xl font-bold mb-4">Employee List</h1>
      {searchQuery && (
        <p className="mb-4 text-gray-600">
          Showing results for: <span className="font-semibold">"{searchQuery}"</span>
        </p>
      )}

      {filteredEmployees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Phone Number</th>
                <th className="py-3 px-6 text-left">Position</th>
                <th className="py-3 px-6 text-left">Address</th>
                <th className="py-3 px-6 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {filteredEmployees.map(employee => (
                <tr key={employee._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{employee._id}</td>
                  <td className="py-3 px-6 text-left">{employee.name}</td>
                  <td className="py-3 px-6 text-left">{employee.phoneNumber}</td>
                  <td className="py-3 px-6 text-left">{employee.position}</td>
                  <td className="py-3 px-6 text-left">{employee.address}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No employees found matching "{searchQuery}".</p>
      )}
    </div>
  );
};

export default EmployeeListView;
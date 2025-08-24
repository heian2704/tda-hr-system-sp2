import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate if it was intended to be used directly here

// Ensure these import paths are correct relative to 'src/pages/Index.tsx'
import TopBar from '../components/TopBar'; // e.g., src/components/TopBar.tsx
import LoginForm from '../app/login/components/LoginForm'; // e.g., src/pages/Index/components/LoginForm.tsx
import { CreateEmployeeUseCase, DeleteEmployeeUseCase, GetAllEmployeeUseCase, GetEmployeeByIdUseCase, UpdateEmployeeStatusUseCase, UpdateEmployeeUseCase } from '@/data/usecases/employee.usecase';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import EmployeeListView from './EmployeeDummy';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';


// dummy and for example
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeInterface);
const updateEmployeeUseCase = new UpdateEmployeeUseCase(employeeInterface);
const updateEmployeeStatusUseCase = new UpdateEmployeeStatusUseCase(employeeInterface);
const deleteEmployeeUseCase = new DeleteEmployeeUseCase(employeeInterface);

// Define the interface for the props that LoginPage itself expects.
// It receives `setIsLoggedIn` from `App.tsx` and passes it down to `LoginForm`.
interface LoginPageProps {
  setIsLoggedIn: (value: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsLoggedIn }) => {
  // useNavigate is not strictly needed directly in LoginPage as LoginForm handles navigation after login.
  // Keeping it here as it was in your previous code.
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        {/*
          LoginForm is rendered here.
          It receives the `setIsLoggedIn` prop directly, allowing it to
          update the global authentication state upon successful login.
        */}
        <LoginForm setIsLoggedIn={setIsLoggedIn} />



        {/* This is just dummy and for example. Comment that out to test. */}
        
        <div className="mt-12">
          <EmployeeListView 
          getAllEmployeeUseCase={getAllEmployeeUseCase} 
          getEmployeeByIdUseCase={getEmployeeByIdUseCase} 
          createEmployeeUseCase={createEmployeeUseCase} 
          updateEmployeeUseCase={updateEmployeeUseCase} 
          updateEmployeeStatusUseCase={updateEmployeeStatusUseCase} 
          deleteEmployeeUseCase={deleteEmployeeUseCase} 
          />
        </div> 
       

      </div>
    </div>
  );
};

export default LoginPage;
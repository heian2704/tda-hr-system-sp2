import { useState, useEffect } from 'react';
import { CreateEmployeeDto } from '@/domain/models/employee/create-employee.dto';

export const useEmployeeForm = (employeeToEdit?: CreateEmployeeDto) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (employeeToEdit) {
      setFullName(employeeToEdit.name);
      setPhoneNumber(employeeToEdit.phoneNumber);
      setRole(employeeToEdit.position);
      setJoinDate(employeeToEdit.joinedDate);
      setAddress(employeeToEdit.address);
      setStatus(employeeToEdit.status);
    } else {
      setFullName('');
      setPhoneNumber('');
      setRole('');
      setJoinDate('');
      setAddress('');
      setStatus('active');
    }
  }, [employeeToEdit]);

  return {
    fullName, setFullName,
    phoneNumber, setPhoneNumber,
    role, setRole,
    joinDate, setJoinDate,
    address, setAddress,
    status, setStatus,
  };
};

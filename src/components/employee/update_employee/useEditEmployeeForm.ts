// useEmployeeForm.ts
import { useState, useEffect } from 'react';
import {EmployeeUpdateDto} from "@/dtos/employee/EmployeeUpdateDto.ts";

export const useEditEmployeeForm = (employeeToEdit?: EmployeeUpdateDto) => {
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
            setJoinDate(employeeToEdit.joinedDate ? employeeToEdit.joinedDate.slice(0, 10) : '');
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

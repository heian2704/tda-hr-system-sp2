import React, { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { EmpStatus } from "@/constants/employee-status.enum";
import { EmployeePageTranslations } from "@/contexts/LanguageContext";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { UpdateEmployeeStatusUseCase } from "@/data/usecases/employee.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

interface StatusChangerProps {
  employeeId: string;
  employeeName: string;
  currentStatus: string;
  translations: EmployeePageTranslations;
  onUpdate: any;
}

const StatusChanger: React.FC<StatusChangerProps> = ({
  employeeId,
  currentStatus,
  translations,
  onUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showStatusEditAlert, setShowStatusEditAlert] = useState(false);
  const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
  const updateEmployeeStatusUseCase = new UpdateEmployeeStatusUseCase(employeeInterface);

  const token = localStorage.getItem('token');
  if(!token)
  {
    throw new Error('Token not found');
  }
  const makeTokenedRequest = (id: string): TokenedRequest => ({
    id,
    token: token,
  });

  const getStatusDisplay = (status: string) => {
    return status === EmpStatus.ACTIVE ? translations.active : translations.resigned;
  };

  const getBadgeStyle = (status: string) => {
    return status === EmpStatus.ACTIVE ? {
      bg: 'bg-[#E6FAF7]',
      text: 'text-[#00B09A]'
    } : {
      bg: 'bg-[#FFF2F2]',
      text: 'text-[#EB5757]'
    };
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (employeeId: string, newStatus: UpdateEmpStatus) => {
    if (isUpdating || newStatus.status === currentStatus) return;
    try {
      setIsUpdating(true);
      const result = await updateEmployeeStatusUseCase.execute(makeTokenedRequest(employeeId), newStatus);
      setIsOpen(false);
      if(result)
      {
        onUpdate();
        setShowStatusEditAlert(true);
        setTimeout(() => setShowStatusEditAlert(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update employee status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentBadgeStyle = getBadgeStyle(currentStatus);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {showStatusEditAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {translations.statusUpdate || '{entryType} Updated'}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${currentBadgeStyle.bg} ${currentBadgeStyle.text} hover:opacity-80 transition-opacity ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{getStatusDisplay(currentStatus)}</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => handleStatusChange(employeeId, { status: EmpStatus.ACTIVE })}
              disabled={isUpdating}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {translations.activeStatus}
            </button>
            <button
              onClick={() => handleStatusChange(employeeId, { status: EmpStatus.RESIGNED })}
              disabled={isUpdating}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {translations.resignedStatus}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusChanger;
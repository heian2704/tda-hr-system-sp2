import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { UpdateEmployeeStatusUseCase } from "@/data/usecases/employee.usecase";
import { useUpdateEmployeeStatus } from "@/hooks/employee/update-employee-status.hook";
import type { TokenedRequest } from "@/domain/models/common/header-param";
import { EmpStatus } from "@/constants/employee-status.enum";
import type { UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

type Props = {
  employeeId: string;
  value?: string;
  onUpdated?: (newStatus: string) => void;
  compact?: boolean;
  // Optional key to force reset (e.g., when a date filter changes)
  resetKey?: string | number;
};

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const updateEmployeeStatusUseCase = new UpdateEmployeeStatusUseCase(employeeInterface);

const OPTIONS: string[] = [EmpStatus.ACTIVE, EmpStatus.INACTIVE];

const EmployeeStatusSelect: React.FC<Props> = ({ employeeId, value, onUpdated, compact, resetKey }) => {
  const { updateStatus, loading } = useUpdateEmployeeStatus(updateEmployeeStatusUseCase);
  const [status, setStatus] = useState<string>(value || "");

  const tokenReq: TokenedRequest | null = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    return { id: employeeId, token } as TokenedRequest;
  }, [employeeId]);

  // Keep internal state in sync with incoming value or when resetKey changes
  useEffect(() => {
    setStatus(value || "");
  }, [value, employeeId, resetKey]);

  const applyUpdate = async (newStatus: string) => {
    if (!newStatus) return;
    const current = status || value || "";
    if (current.toLowerCase() === newStatus.toLowerCase()) return;
    setStatus(newStatus);
    if (!tokenReq) return;
    const dto: UpdateEmpStatus = { status: newStatus as EmpStatus };
    await updateStatus(tokenReq, dto);
    onUpdated?.(newStatus);
  };

  const badgeClasses = (() => {
    if ((status || value) === EmpStatus.ACTIVE) return "bg-green-100 text-green-700";
    if ((status || value) === EmpStatus.INACTIVE) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  })();

  const label = (status || value || "Update employee status").replace(/_/g, " ");

  return (
    <div className={compact ? "inline-flex items-center" : "flex items-center gap-2"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={loading || !tokenReq}>
          <button
            type="button"
            className={`inline-flex items-center justify-center h-7 min-w-[110px] px-3 rounded-full text-xs font-medium whitespace-nowrap ${badgeClasses} ${
              loading || !tokenReq ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
            aria-label="Update employee status"
            title={!tokenReq ? "Sign in required" : "Change status"}
          >
            <span className="capitalize">{label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[8rem]">
          {OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt}
              disabled={loading}
              className="text-sm capitalize"
              onClick={() => applyUpdate(opt)}
            >
              {opt.replace(/_/g, " ")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EmployeeStatusSelect;

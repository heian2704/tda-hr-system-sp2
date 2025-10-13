import React, { useMemo, useState } from "react";
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
  selectedIds: string[];
  currentStatusById?: Record<string, string>;
  onApplied?: (newStatus: string) => void;
};

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const updateEmployeeStatusUseCase = new UpdateEmployeeStatusUseCase(employeeInterface);

const OPTIONS: string[] = [EmpStatus.ACTIVE, EmpStatus.INACTIVE];

const BulkEmployeeStatusUpdateBar: React.FC<Props> = ({ selectedIds, currentStatusById, onApplied }) => {
  const { updateStatus } = useUpdateEmployeeStatus(updateEmployeeStatusUseCase);
  const [working, setWorking] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const disabled = working || !token || selectedIds.length < 2;

  const applyBulk = async (newStatus: string) => {
    if (disabled) return;
    const idsToUpdate = selectedIds.filter((id) => {
      const current = currentStatusById?.[id];
      return !current || current.toLowerCase() !== newStatus.toLowerCase();
    });

    if (idsToUpdate.length === 0) {
      onApplied?.(newStatus);
      return;
    }
    setWorking(true);
    try {
      for (const id of idsToUpdate) {
        const req: TokenedRequest = { id, token: token! };
        const dto: UpdateEmpStatus = { status: newStatus as EmpStatus };
        await updateStatus(req, dto);
      }
      onApplied?.(newStatus);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${
              disabled
                ? "bg-emerald-400/60 text-black cursor-not-allowed"
                : "bg-emerald-500 text-black hover:bg-emerald-600"
            }`}
            aria-label="Bulk update employee status"
            title={disabled ? "Select at least 2 rows" : "Set status for selected"}
          >
            <span>{`Bulk Set Status (${selectedIds.length})`}</span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-90" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[12rem]">
          {OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt}
              disabled={working}
              className="text-sm capitalize"
              onClick={() => applyBulk(opt)}
            >
              {opt.replace(/_/g, " ")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkEmployeeStatusUpdateBar;

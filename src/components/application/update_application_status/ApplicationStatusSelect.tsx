import React, { useMemo, useState } from "react";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { UpdateApplicationStatusUseCase } from "@/data/usecases/application.usecase";
import { useUpdateApplicationStatus } from "@/hooks/application/update-application-status.hook";
import type { TokenedRequest } from "@/domain/models/common/header-param";
import { AppStatus } from "@/constants/application-status.enum";
import { UpdateApplicationStatusDto } from "@/domain/models/application/update-application.dto";
import { EmpStatus } from "@/constants/employee-status.enum";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  applicationId: string;
  value?: string; // current status (string in Application model)
  onUpdated?: (newStatus: string) => void;
  compact?: boolean;
};

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const updateApplicationStatusUseCase = new UpdateApplicationStatusUseCase(applicationInterface);

const OPTIONS: string[] = [AppStatus.ACCEPTED, AppStatus.REJECTED];

export const ApplicationStatusSelect: React.FC<Props> = ({ applicationId, value, onUpdated, compact }) => {
  const { updateStatus, loading } = useUpdateApplicationStatus(updateApplicationStatusUseCase);
  const [status, setStatus] = useState<string>(() => {
    const initial = value ?? AppStatus.APPLIED;
    // For 'applied', show placeholder "Select status" by default
    return initial === AppStatus.APPLIED ? "" : initial;
  });

  const tokenReq: TokenedRequest | null = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    return { id: applicationId, token } as TokenedRequest;
  }, [applicationId]);

  const applyUpdate = async (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === "") return; // ignore placeholder
    if(newStatus === AppStatus.APPLIED) return; // cannot set back to 'applied'
    if(newStatus === AppStatus.ACCEPTED) newStatus = AppStatus.ACCEPTED; // map to employee status
    if(newStatus === AppStatus.REJECTED) newStatus = AppStatus.REJECTED; // map to employee status
    if (!tokenReq) return;
    const statusDto: UpdateApplicationStatusDto = {
      status: newStatus,
    };
    await updateStatus(tokenReq, statusDto);
    onUpdated?.(newStatus);
  };

  const badgeClasses = (() => {
    if (status === AppStatus.ACCEPTED) return "bg-green-100 text-green-700";
    if (status === AppStatus.REJECTED) return "bg-red-100 text-red-700";
    // placeholder or applied
    return "bg-gray-100 text-gray-700";
  })();

  const label = status ? status : "Select status";

  return (
    <div className={compact ? "inline-flex items-center" : "flex items-center gap-2"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={loading || !tokenReq}>
          <button
            type="button"
            className={`inline-flex items-center justify-center h-7 min-w-[110px] px-3 rounded-full text-xs font-medium whitespace-nowrap ${badgeClasses} ${
              loading || !tokenReq ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
            aria-label="Update application status"
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
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ApplicationStatusSelect;

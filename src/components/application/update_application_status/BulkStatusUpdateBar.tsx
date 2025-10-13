import React, { useMemo, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { UpdateApplicationStatusUseCase } from "@/data/usecases/application.usecase";
import { useUpdateApplicationStatus } from "@/hooks/application/update-application-status.hook";
import type { TokenedRequest } from "@/domain/models/common/header-param";
import { AppStatus } from "@/constants/application-status.enum";
import type { UpdateApplicationStatusDto } from "@/domain/models/application/update-application.dto";

type Props = {
  selectedIds: string[];
  currentStatusById?: Record<string, string>;
  onApplied?: (newStatus: string) => void;
};

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const updateApplicationStatusUseCase = new UpdateApplicationStatusUseCase(applicationInterface);

const OPTIONS: string[] = [AppStatus.ACCEPTED, AppStatus.REJECTED];

const BulkStatusUpdateBar: React.FC<Props> = ({ selectedIds, currentStatusById, onApplied }) => {
  const { updateStatus } = useUpdateApplicationStatus(updateApplicationStatusUseCase);
  const [working, setWorking] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);
  const disabled = working || !token || selectedIds.length < 2;

  const applyBulk = async (newStatus: string) => {
    if (disabled) return;
    if (newStatus === AppStatus.APPLIED) return; // do not set back to applied
    // Filter out ids that already have the same status
    const idsToUpdate = selectedIds.filter((id) => {
      const current = currentStatusById?.[id];
      return !current || current.toLowerCase() !== newStatus.toLowerCase();
    });

    // If nothing to update, still notify parent so it can clear selection if desired
    if (idsToUpdate.length === 0) {
      onApplied?.(newStatus);
      return;
    }
    setWorking(true);
    try {
      for (const id of idsToUpdate) {
        const req: TokenedRequest = { id, token: token! };
        const dto: UpdateApplicationStatusDto = { status: newStatus };
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
            aria-label="Bulk update application status"
            title={disabled ? "Select at least 2 rows" : "Set status for selected"}
          >
            <Clock className="w-4 h-4 mr-2" />
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
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkStatusUpdateBar;

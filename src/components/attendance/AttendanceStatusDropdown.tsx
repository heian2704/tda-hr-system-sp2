import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttendanceInterface } from "@/domain/interfaces/attendance/AttendanceInterface";
import { AttendanceInterfaceImpl } from "@/data/interface-implementation/attendance";
import { UpdateAttendanceUseCase } from "@/data/usecases/attendance.usecase";
import { useUpdateAttendance } from "@/hooks/attendance/update-attendance.hook";
import type { TokenedRequest } from "@/domain/models/common/header-param";
import type { UpdateAttendanceDto } from "@/domain/models/attendance/update-attendance.dto";

type Props = {
  attendanceId: string;
  employeeId: string;
  value?: string; // current attendanceStatus
  checkInTime?: string;
  checkOutTime?: string;
  compact?: boolean;
  onUpdated?: (newStatus: string) => void;
};

const attendanceInterface: AttendanceInterface = new AttendanceInterfaceImpl();
const updateAttendanceUseCase = new UpdateAttendanceUseCase(attendanceInterface);

const OPTIONS = ["active", "inactive"] as const;

const AttendanceStatusDropdown: React.FC<Props> = ({
  attendanceId,
  employeeId,
  value,
  checkInTime,
  checkOutTime,
  onUpdated,
  compact,
}) => {
  const { update, loading } = useUpdateAttendance(updateAttendanceUseCase);
  const [status, setStatus] = useState<string>(value ?? "active");

  const tokenReq: TokenedRequest | null = useMemo(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;
    return { id: attendanceId, token } as TokenedRequest;
  }, [attendanceId]);

  const applyUpdate = async (newStatus: string) => {
    setStatus(newStatus);
    if (!tokenReq) return;
    // Build a minimal UpdateAttendanceDto - backend requires employeeId, checkIn/out, attendanceStatus
    const dto: UpdateAttendanceDto = {
      employeeId,
      checkInTime: checkInTime ?? new Date().toISOString(),
      checkOutTime: checkOutTime ?? new Date().toISOString(),
      attendanceStatus: newStatus,
    };
    await update(tokenReq, dto);
    onUpdated?.(newStatus);
  };

  const badgeClasses = (() => {
    if (status === "active") return "bg-green-100 text-green-700";
    if (status === "inactive") return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  })();

  const label = status || "inactive";

  return (
    <div className={compact ? "inline-flex items-center" : "flex items-center gap-2"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={loading || !tokenReq}>
          <button
            type="button"
            className={`inline-flex items-center justify-center h-7 min-w-[110px] px-3 rounded-full text-xs font-medium whitespace-nowrap ${badgeClasses} ${
              loading || !tokenReq ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
            aria-label="Update attendance status"
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

export default AttendanceStatusDropdown;

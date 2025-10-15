import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmpStatus } from "@/constants/employee-status.enum";
import { AttendanceInterface } from "@/domain/interfaces/attendance/AttendanceInterface";
import { AttendanceInterfaceImpl } from "@/data/interface-implementation/attendance";
import { CreateAttendanceUseCase } from "@/data/usecases/attendance.usecase";
import { useCreateAttendance } from "@/hooks/attendance/create-attendance.hook";
import type { BearerTokenedRequest } from "@/domain/models/common/header-param";
import type { CreateAttendanceDto } from "@/domain/models/attendance/create-attendance.dto";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  selectedIds: string[];
  onCreated?: () => void;
  triggerClassName?: string;
  disabled?: boolean;
};

const attendanceInterface: AttendanceInterface = new AttendanceInterfaceImpl();
const createAttendanceUseCase = new CreateAttendanceUseCase(attendanceInterface);

const AddManualAttendanceBulkModal: React.FC<Props> = ({ selectedIds, onCreated, triggerClassName, disabled }) => {
  const { translations } = useLanguage();
  const t = translations.attendancePage;
  const { create, loading, error } = useCreateAttendance(createAttendanceUseCase);
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [date, setDate] = useState<string>(`${yyyy}-${mm}-${dd}`);
  const [inTime, setInTime] = useState<string>("");
  const [outTime, setOutTime] = useState<string>("");
  const [status, setStatus] = useState<EmpStatus>(EmpStatus.ACTIVE);

  const tokenReq: BearerTokenedRequest | null = useMemo(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;
    return { token };
  }, []);

  const resetForm = () => {
    setInTime("");
    setOutTime("");
    setStatus(EmpStatus.ACTIVE);
    setLocalError(null);
  };

  const combineToIso = (d: string, t: string) => {
    if (!d || !t) return "";
    const iso = new Date(`${d}T${t}:00`);
    return isNaN(iso.getTime()) ? "" : iso.toISOString();
  };

  const onSubmit = async () => {
    setLocalError(null);
    if (!tokenReq) {
      setLocalError("Sign in required");
      return;
    }
    if (!inTime) {
      setLocalError("Check-in time is required");
      return;
    }
    const checkInIso = combineToIso(date, inTime);
    const checkOutIso = outTime ? combineToIso(date, outTime) : "";
    if (!checkInIso) {
      setLocalError("Invalid check-in time");
      return;
    }
    if (checkOutIso && new Date(checkOutIso) < new Date(checkInIso)) {
      setLocalError("Check-out must be after check-in");
      return;
    }

    // Create attendance entries for all selected employees (sequentially for simplicity)
    for (const employeeId of selectedIds) {
      const payload: CreateAttendanceDto = {
        employeeId,
        checkInTime: checkInIso,
        checkOutTime: checkOutIso || checkInIso,
        attendanceStatus: status,
      };
      await create(tokenReq, payload);
    }

    if (!error) {
      onCreated?.();
      setOpen(false);
      resetForm();
    }
  };

  const basePill =
    "inline-flex items-center justify-center h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors";
  const activeCls = status === EmpStatus.ACTIVE ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200";
  const inactiveCls = status === EmpStatus.INACTIVE ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!disabled) { setOpen(o); if (!o) resetForm(); } }}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={
            triggerClassName ||
            `flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto
             ${disabled ? "bg-[#EB5757] text-white cursor-not-allowed"
                        : "bg-red-600 text-white border"}`
          }
          aria-label="Bulk add back-date attendance"
          title={disabled ? "Select at least 1 row" : (t.backDateButton || "Back Date")}
        >
          <span>{t.backDateButton || "Back Date"} ({selectedIds.length})</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {(t.addBackDateTitle || "Add Attendance With Back Date")} — {selectedIds.length}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="att-date">{t.dateColumn || "Date"}</Label>
            <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="att-in">{t.checkInColumn || "Check-in"}</Label>
              <Input id="att-in" type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="att-out">{t.checkOutColumn || "Check-out"}</Label>
              <Input id="att-out" type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Attendance status">
            <button type="button" className={`${basePill} ${activeCls}`} onClick={() => setStatus(EmpStatus.ACTIVE)}>
              Active
            </button>
            <button type="button" className={`${basePill} ${inactiveCls}`} onClick={() => setStatus(EmpStatus.INACTIVE)}>
              Inactive
            </button>
          </div>
          {(error || localError) && (
            <div className="text-sm text-red-600">{localError || error}</div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            {t.cancel || "Cancel"}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={loading || !tokenReq || selectedIds.length === 0}>
            {loading ? "Saving..." : (t.createButton || "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddManualAttendanceBulkModal;

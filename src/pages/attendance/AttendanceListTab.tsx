import React, { useEffect, useMemo, useState } from "react";
import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { AttendanceInterface } from "@/domain/interfaces/attendance/AttendanceInterface";
import { AttendanceInterfaceImpl } from "@/data/interface-implementation/attendance";
import { GetAllAttendanceUseCase } from "@/data/usecases/attendance.usecase";
import { useGetAllAttendances } from "@/hooks/attendance/get-all-attendance.hook";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { GetEmployeeByIdUseCase } from "@/data/usecases/employee.usecase";
import type { TokenedRequest } from "@/domain/models/common/header-param";
import { useGetEmployeeById } from "@/hooks/employee/get-employee-by-id.hook";
import { EmpStatus } from "@/constants/employee-status.enum";
// Display-only: show status as a colored pill in this tab

const attendanceInterface: AttendanceInterface = new AttendanceInterfaceImpl();
const getAllAttendanceUseCase = new GetAllAttendanceUseCase(attendanceInterface);

// For resolving employee names from IDs
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);

// Renders an employee name for a given ID using the provided hook
const EmployeeNameCell: React.FC<{ id: string }> = ({ id }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const idToken: TokenedRequest = { id, token: token ?? undefined };
  const { employee, loading } = useGetEmployeeById(getEmployeeByIdUseCase, idToken);
  if (loading && !employee) return <span className="text-gray-400">Loading…</span>;
  return <span>{employee?.name || id}</span>;
};

type AttendanceRow = Attendance & { checkInTime?: string; createdAt?: string; date?: string };

const AttendanceListTab: React.FC = () => {
  const { attendances, loading, error } = useGetAllAttendances(getAllAttendanceUseCase);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");

  const rows = useMemo(() => (attendances as unknown as AttendanceRow[]) ?? [], [attendances]);

  // Build a local cache of employeeId -> employee name for name-based search
  const [empNameMap, setEmpNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const uniqueIds = Array.from(new Set(rows.map((r) => r.employeeId)));
    const missing = uniqueIds.filter((id) => !empNameMap.has(id));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const next = new Map(empNameMap);
      await Promise.all(
        missing.map(async (id) => {
          try {
            const emp = await getEmployeeByIdUseCase.execute({ id, token });
            if (!cancelled && emp?.name) next.set(id, emp.name);
          } catch {
            // ignore failures per id
          }
        })
      );
      if (!cancelled) setEmpNameMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, empNameMap]);

  const filtered: AttendanceRow[] = useMemo(() => {
    if (!query.trim()) return Array.isArray(rows) ? rows : [];
    const q = query.toLowerCase();
    const arr: AttendanceRow[] = Array.isArray(rows) ? rows : [];
    return arr.filter((a) => (empNameMap.get(a.employeeId) || '').toLowerCase().includes(q));
  }, [rows, query, empNameMap]);

  const hasDateFilter = !!filterDate;

  const filteredByDate: AttendanceRow[] = useMemo(() => {
    if (!hasDateFilter) return filtered;
    const target = new Date(filterDate);
    if (isNaN(target.getTime())) return filtered;
    const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
    return filtered.filter((a) => {
      const base = a.date || a.createdAt || a.checkOutTime;
      if (!base) return false;
      const d = new Date(base);
      if (isNaN(d.getTime())) return false;
      return d >= startOfDay && d <= endOfDay;
    });
  }, [filtered, filterDate, hasDateFilter]);

  const effectiveList = hasDateFilter ? filteredByDate : filtered;
  const totalPages = Math.ceil(effectiveList.length / ITEMS_PER_PAGE) || 1;
  const pageSlice: AttendanceRow[] = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return (hasDateFilter ? filteredByDate : filtered).slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, filteredByDate, hasDateFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  function formatTime(value?: string) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(value?: string) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  function pillClassForAttendance(value?: string) {
    const v = (value || "").toLowerCase();
    if (v === EmpStatus.ACTIVE) return "bg-green-100 text-green-700";
    if (v === EmpStatus.INACTIVE) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  function formatStatusLabel(value?: string) {
    if (!value) return "-";
    return value
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="mt-4">
      {loading && <div className="text-center py-8">Loading attendances...</div>}
      {error && <div className="text-center py-8 text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
            <div className="flex w-full md:w-auto gap-3 items-center">
              <div className="relative w-full md:w-80">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search employee by name..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Check-in</th>
                  <th className="py-3 px-4 font-semibold">Check-out</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                      {query ? "No attendances match your search." : "No attendances found."}
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((a: AttendanceRow) => (
                    <tr key={a._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <EmployeeNameCell id={a.employeeId} />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center justify-center h-7 min-w-[110px] px-2 rounded-full text-xs font-medium ${pillClassForAttendance(a.attendanceStatus)}`}
                        >
                          {formatStatusLabel(a.attendanceStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{formatTime(a.checkInTime)}</td>
                      <td className="py-3 px-4 text-gray-700">{formatTime(a.checkOutTime)}</td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(a.date || a.createdAt || a.checkOutTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                    page === currentPage
                      ? "bg-[#EB5757] text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || filtered.length === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500">Total: {(hasDateFilter ? filteredByDate.length : filtered.length)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceListTab;

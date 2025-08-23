import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  DollarSign,
  FileText,
  Plus,
  ChevronDown,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Minus,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { PayrollDto } from "@/dtos/payroll/PayrollDto";
import { EmployeeResponse } from "@/dtos/employee/EmployeeResponse";
import { PayrollService } from "@/services/PayrollService";
import { employeeService } from "@/services/employeeService";
import { PayrollData } from "@/dtos/payroll/PayrollData";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { PayrollInterfaceImpl } from "@/data/interface-implementation/payroll";
import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { GetEmployeeByIdUseCase } from "@/data/usecases/employee.usecase";
import { GetAllPayrollUseCase } from "@/data/usecases/payroll.usecase";
import { useGetAllPayroll } from "@/hooks/payroll/get-all-payroll.hook";
import { useGetEmployeeById } from "@/hooks/employee/get-employee-by-id.hook";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Employee } from "@/domain/models/employee/get-employee.model";
import {
  formatISOWeek,
  formatYYYYMM,
  getISOWeekStartEnd,
  ITEMS_PER_PAGE,
} from "@/constants/page-utils";

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const payrollInterface: PayrollInterface = new PayrollInterfaceImpl();

const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);
const getAllPayrollUseCase = new GetAllPayrollUseCase(payrollInterface);
// --- Main Payroll Component ---
const Payroll = () => {
  const { loading, error, payrolls, getAllPayrolls } =
    useGetAllPayroll(getAllPayrollUseCase);
  const [periodType, setPeriodType] = useState<"month" | "week" | "day">("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // YYYY-MM
  const [selectedWeek, setSelectedWeek] = useState<string>("");   // YYYY-Www
  const [selectedDay, setSelectedDay]   = useState<string>("");   // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1);
  const [payrollEntries, setPayrollEntries] = useState<PayrollData[]>([]);
  const token = localStorage.getItem("token");
  const idToken = (id: string): TokenedRequest => ({
    id: id,
    token: token,
  });

  const { translations } = useLanguage();
  const payrollPageTranslations = translations.payrollPage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    getAllPayrolls();
  }, []);

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(formatYYYYMM(now));
    setSelectedWeek(formatISOWeek(now));
    setSelectedDay(now.toISOString().slice(0, 10));
  }, []);

  // Fetch payroll and employee data
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (loading) return;
      if (error) {
        console.error("Payroll load error:", error);
        setPayrollEntries([]);
        return;
      }
      if (!payrolls || payrolls.length === 0) {
        setPayrollEntries([]);
        return;
      }

      try {
        const uniqueIds = Array.from(
          new Set(payrolls.map((p) => p.employeeId))
        );
        const empMap = new Map<string, Employee>();

        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const emp = await getEmployeeByIdUseCase.execute(idToken(id));
              if (emp) empMap.set(id, emp);
            } catch (e) {
              console.warn(`Skipping missing employee ${id}`, e);
            }
          })
        );

        const payrollData: PayrollData[] = payrolls
          .map((p) => {
            const emp = empMap.get(p.employeeId);
            if (!emp) return null; // skip if employee missing
            return {
              _id: p._id,
              employeeId: p.employeeId,
              fullName: emp.name,
              position: emp.position,
              totalQuantity: p.totalQuantity,
              totalSalary: p.totalSalary,
              // Guard against invalid dates (expects ISO or valid string)
              period: isNaN(new Date(p.period).getTime())
                ? new Date()
                : new Date(p.period),
            } as PayrollData;
          })
          .filter((x): x is PayrollData => x !== null);

        console.log("Payroll data processed:", payrollData);
        setPayrollEntries(payrollData);
      } catch (error) {
        console.error("Failed to fetch payroll data:", error);
      }
    };

    fetchPayrollData();
  }, [payrolls, loading, error, payrollPageTranslations]);

  const filteredPayrollEntries = useMemo(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (periodType === "month" && selectedMonth) {
      const [yStr, mStr] = selectedMonth.split("-");
      const y = Number(yStr), m = Number(mStr);
      if (m >= 1 && m <= 12) {
        start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        end   = new Date(y, m, 0, 23, 59, 59, 999);
      }
    } else if (periodType === "week" && selectedWeek) {
      const range = getISOWeekStartEnd(selectedWeek);
      if (range) {
        start = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate(), 0, 0, 0, 0);
        end   = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate(), 23, 59, 59, 999);
      }
    } else if (periodType === "day" && selectedDay) {
      const d = new Date(selectedDay);
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }

    if (start && end) {
      const s = start.getTime();
      const e = end.getTime();
      return payrollEntries.filter(p => {
        const t = new Date(p.period).getTime();
        return t >= s && t <= e;
      });
    }
    return payrollEntries;
  }, [payrollEntries, periodType, selectedMonth, selectedWeek, selectedDay]);

  // NEW: reset to first page when filter changes
  useEffect(() => { setCurrentPage(1); }, [periodType, selectedMonth, selectedWeek, selectedDay]);

  // Pagination
  const totalEntries = filteredPayrollEntries.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayrollEntries = filteredPayrollEntries.slice(startIndex, endIndex);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="text-center py-8">{translations.common.loading}...</div>
    );
  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        {translations.common.error}: {error}
      </div>
    );

  return (
    <div className="font-sans antialiased text-gray-800">
      <div className="space-y-4">
        {/* Table Header/Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">
                {payrollPageTranslations.allPayrollTitle}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Period Type Dropdown */}
              <div className="relative w-full sm:w-40">
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as "month" | "week" | "day")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none"
                >
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {periodType === "month" && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              )}

              {periodType === "week" && (
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              )}

              {periodType === "day" && (
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              )}

              <button
                onClick={() => alert("Export functionality not implemented.")}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#4CAF50] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                {payrollPageTranslations.exportButton}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">
                    {payrollPageTranslations.fullNameColumn}
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    {payrollPageTranslations.roleColumn}
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    {payrollPageTranslations.totalQuantityColumn}
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    {payrollPageTranslations.totalSalaryColumn}
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    {payrollPageTranslations.periodColumn}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPayrollEntries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {entry.fullName}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {entry.position}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {entry.totalQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      Ks. {entry.totalSalary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {entry.period.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {payrollPageTranslations.showing} {startIndex + 1}{" "}
              {payrollPageTranslations.of} {Math.min(endIndex, totalEntries)}{" "}
              {payrollPageTranslations.of} {totalEntries}{" "}
              {payrollPageTranslations.payrollEntries}
            </p>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      page === currentPage
                        ? "bg-[#EB5757] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;

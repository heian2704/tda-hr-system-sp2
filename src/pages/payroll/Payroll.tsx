import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search // Import the Search icon
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { PayrollDto } from "@/dtos/payrolls/payrolls.dto";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { PayrollInterfaceImpl } from "@/data/interface-implementation/payroll";
import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { GetAllEmployeeUseCase, GetEmployeeByIdUseCase } from "@/data/usecases/employee.usecase";
import { GetAllPayrollUseCase, GetPayrollsByEmployeeIdUseCase } from "@/data/usecases/payroll.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model";
import {
  ITEMS_PER_PAGE,
} from "@/constants/page-utils";
import { exportToCsv, yearMonthToQueryParam } from "@/lib/utils";
import type { Payroll } from "@/domain/models/payroll/get-payroll.dto";

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const payrollInterface: PayrollInterface = new PayrollInterfaceImpl();

const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllPayrollUseCase = new GetAllPayrollUseCase(payrollInterface);
const getPayrollsByEmployeeIdUseCase = new GetPayrollsByEmployeeIdUseCase(payrollInterface);
// --- Main Payroll Component ---
const Payroll = () => {
  const [payrolls, setPayrolls] = useState<Payroll[] | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [payrollEntries, setPayrollEntries] = useState<PayrollDto[]>([]);

  const { translations } = useLanguage();
  const payrollPageTranslations = translations.payrollPage;

  // Use both searchParams and setSearchParams for full control
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayrolls, setTotalPayrolls] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim().length > 0;

  const fetchPayrollData = useCallback(async (page: number, month: number, year: number) => {
    setPageLoading(true);
    try {
      const payrollResponse = await getAllPayrollUseCase.execute(
        ITEMS_PER_PAGE,
        page,
        yearMonthToQueryParam(year, month)
      );

      type Paginated<T> = { data: T[]; total?: number; totalPages?: number; page?: number; limit?: number } | null;
      const pr = payrollResponse as Paginated<Payroll>;
      const serverTotal = pr?.total ?? pr?.data?.length ?? 0;
      const serverTotalPages = pr?.data?.length > ITEMS_PER_PAGE ? Math.ceil(serverTotal / ITEMS_PER_PAGE) : 1;

      if (!pr || !pr.data || pr.data.length === 0) {
        setPayrolls([]);
        setPayrollEntries([]);
        setTotalPages(serverTotalPages);
        setTotalPayrolls(serverTotal);
        return;
      }

      const rows = pr.data;
      setPayrolls(rows);
      setTotalPages(serverTotalPages);
      setTotalPayrolls(serverTotal);

      const uniqueIds = Array.from(new Set(rows.map((p) => p.employeeId)));
      const token = localStorage.getItem("token");
      const empMap = new Map<string, Employee>();
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const emp = await getEmployeeByIdUseCase.execute({ id, token });
            if (emp) empMap.set(id, emp);
          } catch (e) {
            console.warn(`Skipping missing employee ${id}`, e);
          }
        })
      );

      const payrollData: PayrollDto[] = mapPayrollDto(rows, empMap);
      setPayrollEntries(payrollData);
    } catch (error) {
      console.error("Failed to fetch payroll data:", error);
      setPayrolls([]);
      setPayrollEntries([]);
      setTotalPages(0);
      setTotalPayrolls(0);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSearching) return;
    fetchPayrollData(currentPage, selectedMonth || currentMonth, currentYear);
  }, [currentPage, currentMonth, currentYear, selectedMonth, isSearching, fetchPayrollData]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    const month = selectedMonth || currentMonth;
    await fetchPayrollData(page, month, currentYear);
  };

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.toLowerCase();
    setPageLoading(true);
    try {
      if (!trimmedQuery) {
        setCurrentPage(1);
        await fetchPayrollData(1, selectedMonth || currentMonth, currentYear);
        return;
      }

      const employees = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, 1, trimmedQuery);
      const employeeData = employees?.data || [];

      if (!employeeData.length) {
        setPayrollEntries([]);
        setTotalPages(1);
        setTotalPayrolls(0);
        setCurrentPage(1);
        return;
      }

      const payrollLists = await Promise.all(
        employeeData.map(async (emp) => {
          if (!emp._id) return [] as Payroll[];
          try {
            const prs = await getPayrollsByEmployeeIdUseCase.execute(emp._id);
            return Array.isArray(prs) ? prs : [];
          } catch {
            return [] as Payroll[];
          }
        })
      );

      const payrollsByEmp = payrollLists.flat();
      if (!payrollsByEmp.length) {
        setPayrollEntries([]);
        setTotalPages(1);
        setTotalPayrolls(0);
        setCurrentPage(1);
        return;
      }

      const empMap = new Map(employeeData.map((emp) => [emp._id, emp] as const));
      const payrollData: PayrollDto[] = mapPayrollDto(payrollsByEmp, empMap as Map<string, Employee>);
      setPayrollEntries(payrollData);
      setTotalPages(1);
      setTotalPayrolls(payrollData.length);
      setCurrentPage(1);
    } finally {
      setPageLoading(false);
    }
  }, [currentMonth, currentYear, fetchPayrollData, selectedMonth]);

  useEffect(() => { 
    setCurrentPage(1);
    if (searchQuery) {
      handleSearch(searchQuery);
    } else if (selectedMonth && currentYear) {
      fetchPayrollData(1, selectedMonth, currentYear);
    }
  }, [selectedMonth, searchQuery, currentYear, fetchPayrollData, handleSearch]);
  
  const handleExport = () => {
    exportToCsv(payrollEntries, payrollPageTranslations);
  };

  if (pageLoading && payrollEntries.length === 0) return <div className="text-center py-8">{translations.common.loading}...</div>;
  //if (error) return <div className="text-center py-8 text-red-600">{translations.common.error}: {error}</div>;
  console.log("page: ", currentPage, " totalPages:", totalPages);
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
              {/* Search box */}
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={payrollPageTranslations.searchPlaceholder || "Search employees..."}
                    className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              {/* Period Type Dropdown */}
              <div className="relative w-full sm:w-40">
                <select
                  value={selectedMonth || currentMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setSelectedMonth(m);
                    setCurrentMonth(m);
                  }}
                  className="h-10 w-full px-3 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none"
                >
                  <option value="0">--set month--</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              {/* Year Dropdown */}
              <div className="relative w-full sm:w-32">
                <select
                  value={currentYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value);
                    setCurrentYear(y);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full px-3 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none"
                >
                  {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <button
                onClick={() => handleExport()}
                className="h-10 flex items-center justify-center gap-2 px-4 bg-[#4CAF50] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors w-full sm:w-auto"
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
                {payrollEntries.length > 0 && payrollEntries[0] ? (
                  payrollEntries.map((entry) => (
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
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      {"No payroll records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {totalPages > 0 &&
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
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

function mapPayrollDto(payrolls: Payroll[], empMap: Map<string, Employee>): PayrollDto[] {
  return payrolls
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
      } as PayrollDto;
    })
    .filter((x): x is PayrollDto => x !== null);
}

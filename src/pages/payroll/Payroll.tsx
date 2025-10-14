import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search, // Import the Search icon
  Calendar
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { PayrollDto } from "@/dtos/payrolls/payrolls.dto";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { PayrollInterfaceImpl } from "@/data/interface-implementation/payroll";
import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { GetAllEmployeeUseCase, GetEmployeeByIdUseCase } from "@/data/usecases/employee.usecase";
import { GetAllPayrollUseCase, GetPayrollsByEmployeeIdUseCase, GetTotalPayrollByMonthYearUseCase } from "@/data/usecases/payroll.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model";
import {
  ITEMS_PER_PAGE,
} from "@/constants/page-utils";
import { exportToCsv, yearMonthToQueryParam } from "@/lib/utils";
import type { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const payrollInterface: PayrollInterface = new PayrollInterfaceImpl();

const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllPayrollUseCase = new GetAllPayrollUseCase(payrollInterface);
const getTotalPayrollByMonthYearUseCase = new GetTotalPayrollByMonthYearUseCase(payrollInterface);
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
  // Date filter state (like WorkLog page)
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({ startDate: "", endDate: "" });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);

  const { translations } = useLanguage();
  const payrollPageTranslations = translations.payrollPage;

  // Use both searchParams and setSearchParams for full control
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayrolls, setTotalPayrolls] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim().length > 0;
  const hasDateFilter = !!(dateFilter.startDate || dateFilter.endDate);

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

  // Fetch monthly total amount (server-calculated) whenever month/year changes and no date range filter is active
  useEffect(() => {
    const month = selectedMonth || currentMonth;
    let cancelled = false;
    (async () => {
      try {
        const total = await getTotalPayrollByMonthYearUseCase.execute(month, currentYear);
        if (!cancelled) setMonthlyTotal(total ?? 0);
      } catch {
        if (!cancelled) setMonthlyTotal(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedMonth, currentMonth, currentYear]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    if (isSearching || hasDateFilter) return; // client-side pagination when searching or date filtering
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

  // Close date filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply date filter to payroll entries (client-side)
  const filteredPayrollEntries = useMemo(() => {
    let entries = [...payrollEntries];
    if (hasDateFilter) {
      entries = entries.filter((p) => {
        const periodDate = p.period instanceof Date ? p.period : new Date(p.period);
        if (Number.isNaN(periodDate.getTime())) return false;
        let inRange = true;
        if (dateFilter.startDate && dateFilter.endDate) {
          const start = startOfDay(parseISO(dateFilter.startDate));
          const end = endOfDay(parseISO(dateFilter.endDate));
          inRange = isWithinInterval(periodDate, { start, end });
        } else if (dateFilter.startDate) {
          const start = startOfDay(parseISO(dateFilter.startDate));
          inRange = periodDate >= start;
        } else if (dateFilter.endDate) {
          const end = endOfDay(parseISO(dateFilter.endDate));
          inRange = periodDate <= end;
        }
        return inRange;
      });
    }
    return entries;
  }, [payrollEntries, dateFilter, hasDateFilter]);

  // Determine entries to display and effective total pages
  const effectiveTotalPages = useMemo(() => {
    if (isSearching || hasDateFilter) {
      const total = filteredPayrollEntries.length;
      return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    }
    return totalPages;
  }, [filteredPayrollEntries.length, hasDateFilter, isSearching, totalPages]);

  const displayedEntries = useMemo(() => {
    if (isSearching || hasDateFilter) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredPayrollEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    return payrollEntries;
  }, [filteredPayrollEntries, payrollEntries, currentPage, hasDateFilter, isSearching]);
  
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
              {/* Date Filter Dropdown */}
              <div className="relative" ref={dateFilterRef}>
                <button
                  onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                  className="flex items-center justify-between h-10 w-full sm:w-auto px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {hasDateFilter ? 'Filtered by date' : 'Filter by date'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {isDateFilterOpen && (
                  <div className="absolute mt-1 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 p-4">
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">Start date</label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => { setDateFilter((prev) => ({ ...prev, startDate: e.target.value })); setCurrentPage(1); }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">End date</label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => { setDateFilter((prev) => ({ ...prev, endDate: e.target.value })); setCurrentPage(1); }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { setDateFilter({ startDate: '', endDate: '' }); setCurrentPage(1); }}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setIsDateFilterOpen(false)}
                        className="text-xs bg-[#EB5757] text-white px-3 py-1 rounded-md"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
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
                {displayedEntries.length > 0 && displayedEntries[0] ? (
                  displayedEntries.map((entry) => (
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
                      {hasDateFilter
                        ? "No payroll records found for the selected date range."
                        : (isSearching
                            ? "No payroll records found for the current search."
                            : "No payroll records found.")}
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
              {effectiveTotalPages > 0 &&
                Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map(
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
                disabled={currentPage === effectiveTotalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-medium text-gray-700">
              This Month Total Salary: <span className="text-gray-700">Ks. {monthlyTotal}</span>
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

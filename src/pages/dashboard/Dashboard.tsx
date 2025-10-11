import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { WorklogInterfaceImpl } from "@/data/interface-implementation/worklog";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { ExpenseInterfaceImpl } from "@/data/interface-implementation/expense";
import { IncomeInterfaceImpl } from "@/data/interface-implementation/income";
import { PayrollInterfaceImpl } from "@/data/interface-implementation/payroll";
import { GetAllWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { GetAllPayrollUseCase } from "@/data/usecases/payroll.usecase";
import { GetAllExpenseUseCase } from "@/data/usecases/expense.usecase";
import { GetAllIncomesUseCase } from "@/data/usecases/income.usecase";
import { useGetAllWorklogs } from "@/hooks/worklog/get-all-worklog.hook";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";
import { useGetAllExpense } from "@/hooks/income-expense/expense/get-all-expense.hook";
import { useGetAllIncome } from "@/hooks/income-expense/income/get-all-income.hook";
import { useGetAllPayroll } from "@/hooks/payroll/get-all-payroll.hook";
import { useLanguage } from "@/contexts/LanguageContext";
import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { Employee as EmployeeModel } from "@/domain/models/employee/get-employee.model";
import { yearMonthToQueryParam } from "@/lib/utils";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";

// --- Utility Functions (moved here from a separate utils file) ---
const formatMMK = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " Ks";

const parseToDate = (v) => {
  if (!v && v !== 0) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
// -----------------------------------------------------------------

// Simple localStorage cache with TTL
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const getCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const { ts, data } = parsed;
    if (typeof ts !== 'number') return null;
    if (Date.now() - ts > CACHE_TTL_MS) return null; // expired
    return data ?? null;
  } catch {
    return null;
  }
};
const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore quota errors
  }
};

const worklogInterface = new WorklogInterfaceImpl();
const employeeInterface = new EmployeeInterfaceImpl();
const payrollInterface = new PayrollInterfaceImpl();
const expenseInterface = new ExpenseInterfaceImpl();
const incomeInterface = new IncomeInterfaceImpl();

const getAllWorklogUseCase = new GetAllWorklogUseCase(worklogInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllPayrollUseCase = new GetAllPayrollUseCase(payrollInterface);
const getAllExpenseUseCase = new GetAllExpenseUseCase(expenseInterface);
const getAllIncomeUseCase = new GetAllIncomesUseCase(incomeInterface);

// Memoized Card components for better performance
const MemoizedCard = memo(Card);
const MemoizedCardHeader = memo(CardHeader);
const MemoizedCardContent = memo(CardContent);
const MemoizedCardTitle = memo(CardTitle);

// Custom hook to handle data fetching and processing
const useDashboardData = (selectedMonth, selectedYear, selectedEmployeeId) => {
  const [allWorklogs, setAllWorklogs] = useState<Worklog[]>([]);
  const { employees, loading: employeesLoading } = useGetAllEmployees(getAllEmployeeUseCase);
  const { expenses, loading: expensesLoading } = useGetAllExpense(getAllExpenseUseCase);
  const { incomes, loading: incomesLoading } = useGetAllIncome(getAllIncomeUseCase);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeModel[]>([]);
  const { translations, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const dashboardTranslations = translations.dashboard;

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const cached = getCache('dashboard:employees');
        if (cached) {
          setAllEmployees(cached);
          return;
        }
        // Fallback to fetching all pages
        let acc = [];
        let page = 1;
        let totalPages = 1;
        do {
          const response = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, page);
          const rows = response?.data ?? [];
          acc = acc.concat(rows);
          totalPages = response?.totalPages ?? 1;
          page++;
        } while (page <= totalPages);
        setAllEmployees(acc);
        setCache('dashboard:employees', acc);
      } catch (error) {
        console.error("Error fetching all employees:", error);
      }
    };
    const fetchPayrolls = async () => {
      try {
        // Prefer using cached ALL payrolls to avoid per-period refetches
        const allCached = getCache('dashboard:payrolls:all');
        if (allCached) {
          setPayrolls(allCached);
          return;
        }

        const periodKey = (selectedMonth === null || selectedYear === null)
          ? 'all'
          : `${selectedYear}-${(selectedMonth as number) + 1}`;
        const cacheKey = `dashboard:payrolls:${periodKey}`;
        const cached = getCache(cacheKey);
        if (cached) {
          setPayrolls(cached);
          return;
        }

        let all: Payroll[] = [];
        let page = 1;
        let totalPages = 1;
        const periodParam = periodKey === 'all' ? '' : yearMonthToQueryParam(selectedYear, (selectedMonth as number) + 1);
        do {
          const resp = await getAllPayrollUseCase.execute(ITEMS_PER_PAGE, page, periodParam);
          const rows = resp?.data ?? [];
          all = all.concat(rows);
          totalPages = resp?.totalPages ?? 1;
          page++;
        } while (page <= totalPages);

        setPayrolls(all);
        setCache(cacheKey, all);
        if (periodKey === 'all') setCache('dashboard:payrolls:all', all);
      } catch (error) {
        console.error("Error fetching payrolls:", error);
      }
    };

    const fetchWorklogs = async () => {
      try {
        const cached = getCache('dashboard:worklogs:all');
        if (cached) {
          setAllWorklogs(cached);
          return;
        }
        let allPages: Worklog[] = [];
        let currentPageNum = 1;
        let hasMore = true;
        while (hasMore) {
          const worklogsPage = await getAllWorklogUseCase.execute(
            ITEMS_PER_PAGE,
            currentPageNum
          );
          const pageData = worklogsPage?.data ?? [];
          allPages = [...allPages, ...pageData];
          if (pageData.length < ITEMS_PER_PAGE || currentPageNum >= (worklogsPage?.totalPages ?? 0)) {
            hasMore = false;
          }
          currentPageNum++;
        }
        setAllWorklogs(allPages);
        setCache('dashboard:worklogs:all', allPages);
      } catch (error) {
        console.error("Error fetching worklogs:", error);
      }
    };

    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAllEmployees(), fetchPayrolls(), fetchWorklogs()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [employees, selectedYear, selectedMonth]);

  const isLoading = loading || expensesLoading || incomesLoading;

  const worklogsWithDates = useMemo(
    () => (Array.isArray(allWorklogs) ? allWorklogs.map(w => ({ ...w, updatedAt: parseToDate(w.updatedAt) })) : []),
    [allWorklogs]
  );
  const payrollsWithDates = useMemo(
    () => (Array.isArray(payrolls) ? payrolls.map(p => ({ ...p, period: parseToDate(p.period) })) : []),
    [payrolls]
  );
  const incomesWithDates = useMemo(
    () => (Array.isArray(incomes) ? incomes.map(i => ({ ...i, date: parseToDate(i.date) })) : []),
    [incomes]
  );
  const expensesWithDates = useMemo(
    () => (Array.isArray(expenses) ? expenses.map(e => ({ ...e, date: parseToDate(e.date) })) : []),
    [expenses]
  );

  // Build a fast lookup of known employee IDs to skip orphaned references
  const employeeIdSet = useMemo(() => new Set((allEmployees ?? []).map(e => e._id)), [allEmployees]);

  const { monthIncome, monthExpenses } = useMemo(() => {
    let inc = 0, exp = 0;
    incomesWithDates.forEach(i => {
      const d = i.date;
      if (d && (selectedMonth === null || d.getMonth() === selectedMonth) && (selectedYear === null || d.getFullYear() === selectedYear)) {
        inc += i.amount;
      }
    });
    expensesWithDates.forEach(e => {
      const d = e.date;
      if (d && (selectedMonth === null || d.getMonth() === selectedMonth) && (selectedYear === null || d.getFullYear() === selectedYear)) {
        exp += e.amount;
      }
    });
    return { monthIncome: inc, monthExpenses: exp };
  }, [incomesWithDates, expensesWithDates, selectedMonth, selectedYear]);

  const monthPayroll = useMemo(() => payrollsWithDates.reduce((s, p) => {
    const d = p.period;
    if (!d) return s;
    // Skip payrolls whose employee no longer exists
    if (!employeeIdSet.has(p.employeeId)) return s;
    const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
    const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
    return s + (monthMatch && yearMatch ? p.totalSalary : 0);
  }, 0), [payrollsWithDates, selectedMonth, selectedYear, employeeIdSet]);

  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(allEmployees) || allEmployees.length === 0) return [];
    return allEmployees.filter((e) => {
      const d = parseToDate(e.joinedDate);
      if (!d) return false;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
      return monthMatch && yearMatch;
    });
  }, [allEmployees, selectedMonth, selectedYear]);

  const employeeMap = useMemo(() => {
    const map = new Map();
    const list = filteredEmployees;
    list.forEach(emp => map.set(emp._id, emp));
    return map;
  }, [filteredEmployees]);

  const filteredWorklogs = useMemo(() => {
    return worklogsWithDates.filter(w => {
      const d = w.updatedAt;
      if (!d) return false;
      // Skip worklogs whose employee no longer exists
      if (!employeeIdSet.has(w.employeeId)) return false;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
      return monthMatch && yearMatch && (!selectedEmployeeId || w.employeeId === selectedEmployeeId);
    });
  }, [worklogsWithDates, selectedMonth, selectedYear, selectedEmployeeId, employeeIdSet]);

  const employeeWorklogSummary = useMemo(() => {
    const summary = {
      name: 'All Employees',
      quantity: 0,
      totalPrice: 0,
      payroll: 0,
      avgValuePerWorklog: 0,
      avgQuantityPerWorklog: 0
    };

    if (selectedEmployeeId) {
      const employee = employeeMap.get(selectedEmployeeId);
      if (employee) {
        summary.name = employee.name;
      }
    }

    filteredWorklogs.forEach(w => {
      summary.quantity += w.quantity;
      summary.totalPrice += w.totalPrice;
    });

    const worklogCount = filteredWorklogs.length;
    summary.avgValuePerWorklog = worklogCount > 0 ? summary.totalPrice / worklogCount : 0;
    summary.avgQuantityPerWorklog = worklogCount > 0 ? summary.quantity / worklogCount : 0;

    const employeePayroll = payrollsWithDates.find(p => {
      const d = p.period;
      if (!d) return false;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
      return monthMatch && yearMatch && p.employeeId === selectedEmployeeId;
    });

    if (employeePayroll) {
      summary.payroll = employeePayroll.totalSalary;
    } else if (!selectedEmployeeId) {
      summary.payroll = monthPayroll;
    }

    return summary;
  }, [filteredWorklogs, employeeMap, payrollsWithDates, selectedEmployeeId, selectedMonth, selectedYear, monthPayroll]);

  const payrollTrendData = useMemo(() => {
    const dayLabels = language === 'Burmese'
      ? [translations.common.sunday, translations.common.monday, translations.common.tuesday, translations.common.wednesday, translations.common.thursday, translations.common.friday, translations.common.saturday]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = {};
    dayLabels.forEach(label => totals[label] = 0);
    
    filteredWorklogs.forEach(w => {
      const d = w.updatedAt;
      if (d) {
        const k = dayLabels[d.getDay()];
        totals[k] += w.totalPrice;
      }
    });

    return dayLabels.map(k => ({ name: k, amount: totals[k] }));
  }, [filteredWorklogs, language, translations]);

  const incomeExpenseMonthly = useMemo(() => {
    const inc = Array(12).fill(0);
    const exp = Array(12).fill(0);
    const pay = Array(12).fill(0);
    
    incomesWithDates.forEach(i => {
      const d = i.date;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) inc[d.getMonth()] += i.amount;
    });
    
    expensesWithDates.forEach(e => {
      const d = e.date;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) exp[d.getMonth()] += e.amount;
    });

    payrollsWithDates.forEach(p => {
      const d = p.period;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) pay[d.getMonth()] += p.totalSalary;
    });
    
    const monthLabels = language === 'Burmese'
      ? ['ဇန်', 'ဖေဖော်', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်', 'အောက်', 'နိုဝင်', 'ဒီဇင်']
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
    return Array.from({ length: 12 }).map((_, m) => ({ 
      name: monthLabels[m], 
      income: inc[m], 
      expenses: exp[m],
      payroll: pay[m],
    }));
  }, [incomesWithDates, expensesWithDates, payrollsWithDates, language, selectedYear]);

  return {
    isLoading,
    dashboardTranslations,
    employees,
    allEmployees,
    filteredEmployees,
    monthIncome,
    monthExpenses,
    monthPayroll,
    filteredWorklogs,
    employeeMap,
    employeeWorklogSummary,
    payrollTrendData,
    incomeExpenseMonthly,
    language
  };
};

const Dashboard = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const {
    isLoading,
    dashboardTranslations,
    employees,
    allEmployees,
    filteredEmployees,
    monthIncome,
    monthExpenses,
    monthPayroll,
    filteredWorklogs,
    employeeMap,
    employeeWorklogSummary,
    payrollTrendData,
    incomeExpenseMonthly,
    language
  } = useDashboardData(selectedMonth, selectedYear, selectedEmployeeId);

  const bestDay = useMemo(() => {
    const trendData = payrollTrendData;
    if (trendData.length === 0) return null;
    const best = trendData.reduce((prev, current) => (prev.amount > current.amount ? prev : current));
    return best.amount > 0 ? best.name : null;
  }, [payrollTrendData]);

  const monthProfit = monthIncome - monthExpenses - monthPayroll;

  const monthOptions = useMemo(() => {
    const monthNames = language === 'Burmese'
      ? ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return [
      { value: null, label: dashboardTranslations.allMonths || 'All Months' },
      ...monthNames.map((name, index) => ({ value: index, label: name })),
    ];
  }, [language, dashboardTranslations]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return [
      { value: null, label: dashboardTranslations.allYears || 'All Years' },
      ...years.map(year => ({ value: year, label: String(year) })),
    ];
  }, [dashboardTranslations]);

  const activityItems = useMemo(() => {
    if (!filteredWorklogs || filteredWorklogs.length === 0) return [];
    
    return filteredWorklogs
      .sort((a, b) => (b.updatedAt).getTime() - (a.updatedAt).getTime())
      .slice(0, 2)
      .map(w => {
        const employeeName = employeeMap.get(w.employeeId)?.name || 'Unknown Employee';
        const d = w.updatedAt;
        const time = d ? d.toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const date = d ? d.toLocaleDateString() : '';
        const text = `${employeeName}: ${dashboardTranslations.total}: ${w.quantity} • ${formatMMK(w.totalPrice)}`;
        return { id: w._id, time, date, text, employeeName };
      });
  }, [filteredWorklogs, employeeMap, dashboardTranslations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background p-4 sm:p-6">
      {/* Top Bar - Unified Search, Language, Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-extrabold text-foreground">{dashboardTranslations.title || "Dashboard Overview"}</h1>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setSelectedMonth(value === "null" ? null : Number(value))}
            value={selectedMonth === null ? "null" : String(selectedMonth)}
          >
            <SelectTrigger className="w-[120px] bg-card border-border rounded-xl">
              <SelectValue placeholder={dashboardTranslations.month || "Month"} />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value ?? "all"} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setSelectedYear(value === "null" ? null : Number(value))}
            value={selectedYear === null ? "null" : String(selectedYear)}
          >
            <SelectTrigger className="w-[100px] bg-card border-border rounded-xl">
              <SelectValue placeholder={dashboardTranslations.year || "Year"} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year.value ?? "all"} value={String(year.value)}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="rounded-2xl border-border shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dashboardTranslations.onBoardEmployeesByMonth || "On Board Employees"}</CardTitle>
              <Users className="w-5 h-5 text-indigo-500" />
            </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{filteredEmployees.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dashboardTranslations.monthlyPayroll || "Monthly Payroll"}</CardTitle>
              <Wallet className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground whitespace-normal break-words max-w-full leading-tight">{formatMMK(monthPayroll)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dashboardTranslations.monthlyIncome || "Monthly Income"}</CardTitle>
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground whitespace-normal break-words max-w-full leading-tight">{formatMMK(monthIncome)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dashboardTranslations.monthlyExpenses || "Monthly Expenses"}</CardTitle>
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground whitespace-normal break-words max-w-full leading-tight">{formatMMK(monthExpenses)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dashboardTranslations.monthlyProfit || "Monthly Profit"}</CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground whitespace-normal break-words max-w-full leading-tight">{formatMMK(monthProfit)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-border shadow-sm lg:col-span-2 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-foreground">{dashboardTranslations.employeePerformanceOverview || "Employee Performance Overview"}</CardTitle>
                <Select
                  onValueChange={(value) => setSelectedEmployeeId(value === "all" ? null : value)}
                  value={selectedEmployeeId || "all"}
                >
                  <SelectTrigger className="w-[180px] bg-card border-border">
                    <SelectValue placeholder="Select an Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{dashboardTranslations.allEmployees || "All Employees"}</SelectItem>
                    {allEmployees.map(employee => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 border border-border rounded-xl bg-muted flex flex-col items-start">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{dashboardTranslations.worklogQuantity || "Worklog Quantity"}</h3>
                  <p className="text-xl font-semibold text-foreground">{employeeWorklogSummary.quantity}</p>
                </div>
                <div className="p-4 border border-border rounded-xl bg-muted flex flex-col items-start">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{dashboardTranslations.totalValue || "Total Value"}</h3>
                  <p className="text-xl font-semibold text-foreground">{formatMMK(employeeWorklogSummary.totalPrice)}</p>
                </div>
                <div className="p-4 border border-border rounded-xl bg-muted flex flex-col items-start">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{dashboardTranslations.monthlyPayrollTitle || "Monthly Payroll"}</h3>
                  <p className="text-xl font-semibold text-foreground">{formatMMK(employeeWorklogSummary.payroll)}</p>
                </div>
                <div className="p-4 border border-border rounded-xl bg-muted flex flex-col items-start">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{dashboardTranslations.avgWorklogQuantity || "Avg. Worklog Quantity"}</h3>
                  <p className="text-xl font-semibold text-foreground">{employeeWorklogSummary.avgQuantityPerWorklog.toFixed(2)}</p>
                </div>
              </div>
              <Card className="rounded-2xl border-border shadow-sm flex-1">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">{dashboardTranslations.weeklyWorklogTrend || "Weekly Worklog Trend"}</CardTitle>
                  {bestDay && (
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <Award size={16} className="mr-1" />
                      {dashboardTranslations.bestDay || 'Best day'}: {bestDay}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="h-[250px]">
                  {payrollTrendData.every(d => d.amount === 0) ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {dashboardTranslations.noData || "No data available for this period."}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={payrollTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000}K`} />
                        <Tooltip formatter={(value) => formatMMK(value)} />
                        <Line type="monotone" dataKey="amount" stroke="#FF6767" strokeWidth={3} dot={{ stroke: '#FF6767', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="rounded-2xl border-border shadow-sm flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-foreground">{dashboardTranslations.activityLog || "Activity Log"}</CardTitle>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground" aria-label="Refresh activity log">
                  <RefreshCcw size={18} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                {activityItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {dashboardTranslations.noActivities || "No recent activities found."}
                  </div>
                ) : (
                  activityItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-xl p-3 bg-muted">
                      <p className="text-sm text-foreground font-medium">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.date} {item.time}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">{dashboardTranslations.yearlyFinancialOverview || "Yearly Financial Overview"}</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                {incomeExpenseMonthly.every(d => d.income === 0 && d.expenses === 0 && d.payroll === 0) ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {dashboardTranslations.noData || "No data available for this period."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={incomeExpenseMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000}K`} />
                      <Tooltip formatter={(value, name) => [
                        formatMMK(value),
                        name === 'income' ? dashboardTranslations.monthlyIncome : name === 'expenses' ? dashboardTranslations.monthlyExpenses : dashboardTranslations.monthlyPayrollTitle
                      ]} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#3ABEFF" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="expenses" stroke="#FF6767" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="payroll" stroke="#32cd32" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
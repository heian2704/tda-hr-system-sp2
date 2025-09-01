import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Award,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { WorklogInterfaceImpl } from "@/data/interface-implementation/worklog";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { ExpenseInterfaceImpl } from "@/data/interface-implementation/expense";
import { IncomeInterfaceImpl } from "@/data/interface-implementation/income";
import { PayrollInterfaceImpl } from "@/data/interface-implementation/payroll";
import { WorklogInterface } from "@/domain/interfaces/worklog/WorklogInterface";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { ExpenseInterface } from "@/domain/interfaces/income-expense/expense/ExpenseInterface";
import { IncomeInterface } from "@/domain/interfaces/income-expense/income/IncomeInterface";
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

const formatMMK = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " Ks";
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const worklogInterface: WorklogInterface = new WorklogInterfaceImpl();
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const payrollInterface: PayrollInterface = new PayrollInterfaceImpl();
const expenseInterface: ExpenseInterface = new ExpenseInterfaceImpl();
const incomeInterface: IncomeInterface = new IncomeInterfaceImpl();

const getAllWorklogUseCase = new GetAllWorklogUseCase(worklogInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllPayrollUseCase = new GetAllPayrollUseCase(payrollInterface);
const getAllExpenseUseCase = new GetAllExpenseUseCase(expenseInterface);
const getAllIncomeUseCase = new GetAllIncomesUseCase(incomeInterface);

const Dashboard = () => {
  const { worklogs } = useGetAllWorklogs(getAllWorklogUseCase);
  const { employees } = useGetAllEmployees(getAllEmployeeUseCase);
  const { expenses } = useGetAllExpense(getAllExpenseUseCase);
  const { incomes } = useGetAllIncome(getAllIncomeUseCase);
  const { payrolls } = useGetAllPayroll(getAllPayrollUseCase);

  const { translations, language } = useLanguage();
  const dashboardTranslations = translations.dashboard;

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number | null>(today.getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const parseToDate = (v: any): Date | null => {
    if (!v && v !== 0) return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const worklogsWithDates = useMemo(
    () => (Array.isArray(worklogs) ? worklogs.map(w => ({ ...w, updatedAt: parseToDate(w.updatedAt) })) : []),
    [worklogs]
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

  const { monthIncome, monthExpenses } = useMemo(() => {
    let inc = 0, exp = 0;
    incomesWithDates.forEach(i => {
      const d = i.date as Date | null;
      if (d && (selectedMonth === null || d.getMonth() === selectedMonth) && (selectedYear === null || d.getFullYear() === selectedYear)) {
        inc += i.amount;
      }
    });
    expensesWithDates.forEach(e => {
      const d = e.date as Date | null;
      if (d && (selectedMonth === null || d.getMonth() === selectedMonth) && (selectedYear === null || d.getFullYear() === selectedYear)) {
        exp += e.amount;
      }
    });
    return { monthIncome: inc, monthExpenses: exp };
  }, [incomesWithDates, expensesWithDates, selectedMonth, selectedYear]);

  const monthPayroll = useMemo(() => payrollsWithDates.reduce((s, p) => {
    const d = p.period as Date | null;
    if (!d) return s;
    const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
    const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
    return s + (monthMatch && yearMatch ? p.totalSalary : 0);
  }, 0), [payrollsWithDates, selectedMonth, selectedYear]);

  const monthProfit = useMemo(() => monthIncome - monthExpenses - monthPayroll, [monthIncome, monthExpenses, monthPayroll]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach(emp => map.set(emp._id, emp));
    return map;
  }, [employees]);

  const filteredWorklogs = useMemo(() => {
    return worklogsWithDates
      .filter(w => {
        const d = w.updatedAt as Date | null;
        if (!d) return false;
        const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
        const yearMatch = selectedYear === null || d.getFullYear() === selectedYear;
        return monthMatch && yearMatch;
      })
      .filter(w => !selectedEmployeeId || w.employeeId === selectedEmployeeId);
  }, [worklogsWithDates, selectedMonth, selectedYear, selectedEmployeeId]);

  const activityItems = useMemo(() => {
    return filteredWorklogs
      .sort((a, b) => (b.updatedAt as Date).getTime() - (a.updatedAt as Date).getTime())
      .map(w => {
        const employeeName = employeeMap.get(w.employeeId)?.name || 'Unknown Employee';
        const d = w.updatedAt as Date;
        const time = d ? d.toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
        const text = `${employeeName}: ${dashboardTranslations.total}: ${w.quantity} • ${formatMMK(w.totalPrice)}`;
        return { id: w._id, time, text, employeeName, quantity: w.quantity, totalPrice: w.totalPrice };
      })
      .filter(item => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return item.employeeName.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.text.toLowerCase().includes(lowerCaseSearchTerm);
      });
  }, [filteredWorklogs, dashboardTranslations, employeeMap, searchTerm]);

  const employeeWorklogSummary = useMemo(() => {
    const summary: { name: string; quantity: number; totalPrice: number; payroll: number; avgValuePerWorklog: number; avgQuantityPerWorklog: number } = {
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
      const d = p.period as Date | null;
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
    const currentDayLabels = language === 'Burmese'
      ? [translations.common.sunday, translations.common.monday, translations.common.tuesday, translations.common.wednesday, translations.common.thursday, translations.common.friday, translations.common.saturday]
      : dayLabels;
      
    const totals: Record<string, number> = {};
    currentDayLabels.forEach(label => totals[label] = 0);
    
    filteredWorklogs.forEach(w => {
      const d = w.updatedAt as Date;
      const k = currentDayLabels[d.getDay()];
      totals[k] += w.totalPrice;
    });

    return currentDayLabels.map(k => ({ name: k, amount: totals[k] }));
  }, [filteredWorklogs, language, translations]);

  const bestDay = useMemo(() => {
    const trendData = payrollTrendData;
    if (trendData.length === 0) return null;
    const best = trendData.reduce((prev, current) => (prev.amount > current.amount ? prev : current));
    return best.amount > 0 ? best.name : null;
  }, [payrollTrendData]);
  
  const incomeExpenseMonthly = useMemo(() => {
    const inc = Array(12).fill(0);
    const exp = Array(12).fill(0);
    const pay = Array(12).fill(0);
    
    incomesWithDates.forEach(i => {
      const d = i.date as Date | null;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) inc[d.getMonth()] += i.amount;
    });
    
    expensesWithDates.forEach(e => {
      const d = e.date as Date | null;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) exp[d.getMonth()] += e.amount;
    });

    payrollsWithDates.forEach(p => {
      const d = p.period as Date | null;
      if (d && (selectedYear === null || d.getFullYear() === selectedYear)) pay[d.getMonth()] += p.totalSalary;
    });
    
    const currentMonthLabels = language === 'Burmese'
      ? ['ဇန်', 'ဖေဖော်', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်', 'အောက်', 'နိုဝင်', 'ဒီဇင်']
      : monthLabels;
      
    return Array.from({ length: 12 }).map((_, m) => ({ 
      name: currentMonthLabels[m], 
      income: inc[m], 
      expenses: exp[m],
      payroll: pay[m],
    }));
  }, [incomesWithDates, expensesWithDates, payrollsWithDates, language, selectedYear]);

  const monthOptions = useMemo(() => {
    const monthNames = language === 'Burmese'
      ? ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return [
      { value: null, label: dashboardTranslations.allMonths || 'All Months' },
      ...monthNames.map((name, index) => ({
        value: index,
        label: name,
      })),
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar - Unified Search, Language, Date */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold text-gray-900">{dashboardTranslations.title || "Dashboard Overview"}</h1>
          <Select
            onValueChange={(value) => setSelectedMonth(value === "null" ? null : Number(value))}
            value={selectedMonth === null ? "null" : String(selectedMonth)}
          >
            <SelectTrigger className="w-[120px] bg-white border-gray-300 rounded-xl">
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
            <SelectTrigger className="w-[100px] bg-white border-gray-300 rounded-xl">
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

      <div className="p-6 flex-1 overflow-auto">
        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="rounded-2xl border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{dashboardTranslations.totalEmployees || "Total Employees"}</CardTitle>
              <Users className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{dashboardTranslations.monthlyPayroll || "Monthly Payroll"}</CardTitle>
              <Wallet className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMMK(monthPayroll)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{dashboardTranslations.monthlyIncome || "Monthly Income"}</CardTitle>
              <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMMK(monthIncome)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{dashboardTranslations.monthlyExpenses || "Monthly Expenses"}</CardTitle>
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMMK(monthExpenses)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-200 shadow-sm transition-transform duration-200 hover:scale-[1.02] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{dashboardTranslations.monthlyProfit || "Monthly Profit"}</CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMMK(monthProfit)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-gray-200 shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-800">{dashboardTranslations.employeePerformanceOverview || "Employee Performance Overview"}</CardTitle>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => setSelectedEmployeeId(value === "all" ? null : value)}
                    value={selectedEmployeeId || "all"}
                  >
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                      <SelectValue placeholder="Select an Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-start">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{dashboardTranslations.worklogQuantity || "Worklog Quantity"}</h3>
                  <p className="text-xl font-semibold text-gray-900">{employeeWorklogSummary.quantity}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-start">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{dashboardTranslations.totalValue || "Total Value"}</h3>
                  <p className="text-xl font-semibold text-gray-900">{formatMMK(employeeWorklogSummary.totalPrice)}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-start">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{dashboardTranslations.monthlyPayrollTitle || "Monthly Payroll"}</h3>
                  <p className="text-xl font-semibold text-gray-900">{formatMMK(employeeWorklogSummary.payroll)}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-start">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{dashboardTranslations.avgWorklogQuantity || "Avg. Worklog Quantity"}</h3>
                  <p className="text-xl font-semibold text-gray-900">{employeeWorklogSummary.avgQuantityPerWorklog.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                {bestDay && selectedEmployeeId && (
                  <div className="flex-1 flex items-center justify-center p-3 rounded-xl bg-purple-50 text-purple-800">
                    <Award className="w-5 h-5 mr-2" />
                    <p className="text-sm font-medium">{dashboardTranslations.bestPerformanceDay || "Best Performance Day"}: <span className="font-semibold">{bestDay}</span></p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-lg font-bold text-gray-800">{dashboardTranslations.activityLog || "Activity Log"}</CardTitle>
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-gray-800">
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-4">
                  {activityItems.length > 0 ? (
                    activityItems.map((item, index) => (
                      <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-100 rounded-xl">
                        <div className="flex-1 text-sm text-gray-800 leading-tight">
                          <span className="font-semibold">{item.employeeName}:</span> {item.text}
                        </div>
                        <div className="mt-1 sm:mt-0 sm:ml-4 text-xs font-mono text-gray-500 flex-shrink-0">
                          {item.time}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10">{dashboardTranslations.noActivityFound || "No recent activity."}</p>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold text-gray-800 mb-4">
                {selectedEmployeeId ? `${employeeMap.get(selectedEmployeeId)?.name}'s ${dashboardTranslations.payrollTrend || "Weekly Worklog Trend"}` : (dashboardTranslations.payrollTrend || "Weekly Worklog Trend")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tick={{ fill: '#4B5563', fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatMMK(v)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name={dashboardTranslations.total || "Total"}
                    stroke="#FF6767"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold text-gray-800 mb-4">
                {dashboardTranslations.incomeVsExpenses || "Yearly Financial Overview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeExpenseMonthly}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tick={{ fill: '#4B5563', fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatMMK(Number(v))} />
                  <Legend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name={dashboardTranslations.monthlyIncome || "Monthly Income"}
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name={dashboardTranslations.monthlyExpenses || "Monthly Expenses"}
                    stroke="#FF5722"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payroll"
                    name={dashboardTranslations.monthlyPayroll || "Monthly Payroll"}
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
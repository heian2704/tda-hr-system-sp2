
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutDashboard,
  FileText,
  Receipt,
  BarChart3,
  Search,
  LogOut,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { Product } from "@/domain/models/product/get-product.dto";
import { WorklogInterfaceImpl } from "@/data/interface-implementation/worklog";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { ProductInterfaceImpl } from "@/data/interface-implementation/product";
import { WorklogInterface } from "@/domain/interfaces/worklog/WorklogInterface";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { ProductInterface } from "@/domain/interfaces/product/ProductInterface";
import { ExpenseInterfaceImpl } from "@/data/interface-implementation/expense";
import { ExpenseInterface } from "@/domain/interfaces/income-expense/expense/ExpenseInterface";
import { IncomeInterfaceImpl } from "@/data/interface-implementation/income";
import { IncomeInterface } from "@/domain/interfaces/income-expense/income/IncomeInterface";
import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
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

const formatMMK = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " Ks";
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const dayLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ---------- Demo Fallback Data ---------- //
const makeDemoData = () => {
  const today = new Date();
  const employees: Employee[] = Array.from({ length: 560 }).map((_, i) => ({
    _id: String(i + 1), name: `Employee ${i + 1}`, phoneNumber: "0912345678", address: "Yangon, MM",
    position: i % 7 === 0 ? "Supervisor" : "Operator", status: "Active",
    joinedDate: new Date(2023, (i % 12), (i % 28) + 1).toISOString(),
  }));
  const expenses: Expense[] = Array.from({ length: 40 }).map((_, i) => ({ _id: `ex-${i}`, title: "Utilities", description: "Monthly", amount: 30000 + (i % 10) * 5000, date: new Date(today.getFullYear(), i % 12, (i % 27) + 1).toISOString() }));
  const incomes: Income[] = Array.from({ length: 40 }).map((_, i) => ({ _id: `in-${i}`, title: "Sales", description: "Product", amount: 100000 + (i % 10) * 20000, date: new Date(today.getFullYear(), i % 12, (i % 27) + 1).toISOString() }));
  const payrolls: Payroll[] = Array.from({ length: 8 }).map((_, i) => ({ _id: `pr-${i}`, employeeId: String((i % 50) + 1), totalQuantity: 10 + (i % 20), totalSalary: 560000, period: new Date(today.getFullYear(), today.getMonth() - i, 1) }));
  const worklogs: Worklog[] = Array.from({ length: 28 }).map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - i); dt.setHours(9 + (i % 4), (i * 7) % 60, 0, 0);
    return { _id: `wl-${i}`, employeeId: String((i % 50) + 1), productId: String((i % 4) + 1), quantity: 10 + (i % 30), totalPrice: 1000 * (5 + (i % 10)), updatedAt: dt };
  });
  const products: Product[] = [{ _id: "1", name: "Widget A", price: 2000 }];
  return { employees, expenses, incomes, payrolls, worklogs, products };
};

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

interface DashboardProps {
  employees?: Employee[];
  expenses?: Expense[];
  incomes?: Income[];
  payrolls?: Payroll[];
  products?: Product[];
  worklogs?: Worklog[];
}

const Dashboard = (props: DashboardProps) => {
  const { worklogs, loading: loadingWorklogs, error: errorWorklogs} = useGetAllWorklogs(getAllWorklogUseCase);
  const {employees, loading: loadingEmployees, error: errorEmployees} = useGetAllEmployees(getAllEmployeeUseCase);
  const {expenses, loading: loadingExpenses, error: errorExpenses} = useGetAllExpense(getAllExpenseUseCase);
  const {incomes, loading: loadingIncomes, error: errorIncomes} = useGetAllIncome(getAllIncomeUseCase);
  const {payrolls, loading: loadingPayrolls, error: errorPayrolls} = useGetAllPayroll(getAllPayrollUseCase);

  // Normalize date fields -> convert ISO strings to Date objects
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
  console.log("payroll", payrolls);


  const today = new Date();

  // KPIs
  const totalEmployees = employees.length;
  const { monthIncome, monthExpenses } = useMemo(() => {
    const start = startOfMonth(today); const end = endOfMonth(today);
    let inc = 0, exp = 0;
    incomesWithDates.forEach(i => { const d = i.date as Date | null; if (d && d >= start && d <= end) inc += i.amount; });
    expensesWithDates.forEach(e => { const d = e.date as Date | null; if (d && d >= start && d <= end) exp += e.amount; });
    return { monthIncome: inc, monthExpenses: exp };
  }, [incomesWithDates, expensesWithDates]);

  const monthPayroll = useMemo(() => payrollsWithDates.reduce((s, p) => {
    const d = p.period as Date | null;
    return s + ((d && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) ? p.totalSalary : 0);
  }, 0), [payrollsWithDates]);

  // Activity
  // Prepare activity items: latest 50 worklogs sorted by updatedAt desc
  const activityItems = useMemo(() => {
    const items = (Array.isArray(worklogsWithDates) ? worklogsWithDates : [])
      .filter(w => !!w.updatedAt)
      .sort((a, b) => (b.updatedAt as Date).getTime() - (a.updatedAt as Date).getTime())
      .slice(0, 50)
      .map(w => {
        const d = w.updatedAt as Date;
        const time = d ? d.toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
        const text = `Qty: ${w.quantity} • ${formatMMK(w.totalPrice)}`;
        return { id: w._id, time, text };
      });
    return items;
  }, [worklogsWithDates]);

  // Charts
  const payrollTrendData = useMemo(() => {
    // order Mon..Sun to match screenshot
    const totals: Record<string, number> = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
    worklogsWithDates.forEach(w => {
      const d = w.updatedAt as Date | null;
      if (!d) return;
      const k = dayLabels[(d.getDay()+6)%7]; totals[k] += w.totalPrice;
    });
    return Object.keys(totals).map(k => ({ name: k, amount: totals[k] }));
  }, [worklogsWithDates]);

  const incomeExpenseMonthly = useMemo(() => {
    const year = today.getFullYear(); const inc = Array(12).fill(0); const exp = Array(12).fill(0);
    incomesWithDates.forEach(i => { const d = i.date as Date | null; if (d && d.getFullYear()===year) inc[d.getMonth()] += i.amount; });
    expensesWithDates.forEach(e => { const d = e.date as Date | null; if (d && d.getFullYear()===year) exp[d.getMonth()] += e.amount; });
    return Array.from({ length: 12 }).map((_, m) => ({ name: monthLabels[m], income: inc[m], expenses: exp[m] }));
  }, [incomesWithDates, expensesWithDates]);

  // UI helpers
  const MenuItem = ({ active, icon: Icon, label }: { active?: boolean; icon: any; label: string }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer transition ${active ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50"}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );

  return (
    <div>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}
      >
        Dashboard
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-xl border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" /> Total Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalEmployees}</div>
              <div className="text-xs text-gray-400 mt-2">
                Update: {today.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-400" /> Monthly Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {formatMMK(monthPayroll)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Update: {today.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-rose-400" /> Monthly
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {formatMMK(monthIncome)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Update: {today.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-rose-400" /> Monthly
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {formatMMK(monthExpenses)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Update: {today.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card className="rounded-xl border-gray-100 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[11px] text-gray-400 text-right mb-2">
              Update: {today.toLocaleDateString()}
            </div>
            <div className="max-h-[320px] overflow-auto">
              <ul className="space-y-3">
                {activityItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                    <div className="w-[110px] text-xs text-gray-500">
                      {item.time}
                    </div>
                    <div className="flex-1 text-sm">{item.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_20px_40px_rgba(255,99,132,0.08)]">
          <div className="text-center font-medium mb-2">
            Payroll trend over time
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} tickCount={6} />
                <Tooltip formatter={(v: number) => formatMMK(v)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_20px_40px_rgba(255,99,132,0.08)]">
          <div className="text-center font-medium mb-2">Income vs Expenses</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeExpenseMonthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} />
                <Tooltip formatter={(v: number) => formatMMK(Number(v))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Dashboard;

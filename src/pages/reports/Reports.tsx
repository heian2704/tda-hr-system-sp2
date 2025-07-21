import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ChevronDown, TrendingUp, TrendingDown, Users, DollarSign, ClipboardList } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { employeeService } from '@/services/employeeService';
import { worklogService } from '@/services/worklogService';
import { EmployeeResponse } from '@/dtos/employee/EmployeeResponse';
import { worklogDto } from '@/dtos/worklog/worklogDto';
import { ReportService } from '@/services/ReportService';
import { ReportDto } from '@/dtos/report/ReportDto';

// Mock data for Income vs Expense (you can replace with real API data)
//   const incomeExpenseData = [
//   { name: 'Income', value: 700000, color: '#FF6B6B' },
//   { name: 'Expense', value: 300000, color: '#A8A8A8' }
// ];
// Fetch income and expense data from API



// Mock data for Work Log over time (you can replace with real API data)
// const workLogData = [
//   { month: 'JAN', logs: 2800 },
//   { month: 'FEB', logs: 3200 },
//   { month: 'MAR', logs: 2900 },
//   { month: 'APR', logs: 3500 },
//   { month: 'MAY', logs: 4200 },
//   { month: 'JUN', logs: 3800 },
//   { month: 'JUL', logs: 3300 },
//   { month: 'AUG', logs: 3600 },
//   { month: 'SEP', logs: 3100 },
//   { month: 'OCT', logs: 3400 },
//   { month: 'NOV', logs: 2900 },
//   { month: 'DEC', logs: 3200 }
// ];
const Reports = () => {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [workLogs, setWorkLogs] = useState<worklogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [workLogPeriod, setWorkLogPeriod] = useState('Annually');
  const { translations } = useLanguage();
  const [incomeExpenseData, setIncomeExpenseData] = useState<ReportDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeeData, worklogData] = await Promise.all([
          employeeService.getAllEmployees(),
          worklogService.getAllWorklogs()
        ]);
        
        setEmployees(employeeData);
        setWorkLogs(worklogData);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const fetchIncomeExpenseData = async () => {
      try {
        const response = await ReportService.getAllReports("7", "2025");
        if (!response) {
          throw new Error(`Failed to fetch income/expense data: ${response?._id} ${response?.date}`);
        }
        setIncomeExpenseData(response);
      } catch (error) {
        console.error('Error fetching income/expense data:', error);
      }
    };

    fetchIncomeExpenseData();
  }, []);

  // Calculate top 7 employee productivity based on work logs
  const getTopEmployeeProductivity = () => {
    const employeeProductivity = employees.map(employee => {
      const employeeWorkLogs = workLogs.filter(log => log.employeeId === employee._id);
      const totalQuantity = employeeWorkLogs.reduce((sum, log) => sum + log.quantity, 0);
      
      return {
        id: employee._id,
        name: employee.name.split(' ')[0],
        productivity: totalQuantity,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=40`
      };
    });

    return employeeProductivity
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 7);
  };

  const topEmployees = getTopEmployeeProductivity();

  // Calculate total income and expense percentages
  console.log("Income/Expense Data:", incomeExpenseData);
  const totalIncomeExpense = incomeExpenseData 
    ? (incomeExpenseData.totalExpense || 0) + (incomeExpenseData.totalIncome || 0)
    : 0;
    
  const incomePercentage = incomeExpenseData && totalIncomeExpense > 0
    ? Math.round(((incomeExpenseData.totalIncome || 0) / totalIncomeExpense) * 100)
    : 0;
    
  const expensePercentage = incomeExpenseData && totalIncomeExpense > 0
    ? Math.round(((incomeExpenseData.totalExpense || 0) / totalIncomeExpense) * 100)
    : 0;

  const pieChartData = incomeExpenseData ? [
    { 
      name: 'Income', 
      value: incomeExpenseData.totalIncome, 
      color: '#FF6B6B' 
    },
    { 
      name: 'Expense', 
      value: incomeExpenseData.totalExpense, 
      color: '#A8A8A8' 
    }
  ] : [];

  // get linechart data from worklogs. Show total worklog quantity of every employee per month
  const workLogData = workLogs.reduce((acc, log) => {
    const month = new Date(log.updatedAt).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, logs: 0 };
    }
    acc[month].logs += log.quantity;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 7 Employee Productivity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Statistics</p>
              <h2 className="text-xl font-bold text-gray-800">Top 7 Employee Productivity</h2>
            </div>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="Month">Month</option>
                <option value="Week">Week</option>
                <option value="Year">Year</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEmployees} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="productivity" 
                  fill="#FF6B6B" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Avatars */}
          <div className="flex justify-center space-x-4 mt-4">
            {topEmployees.map((employee, index) => (
              <div key={employee.id} className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expense */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Income vs Expense</h2>
          
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">Expense ({incomeExpenseData?.totalExpense || 0}Ks)</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{expensePercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-600">Income ({incomeExpenseData?.totalIncome || 0}Ks)</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{incomePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Work Log Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Work log</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setWorkLogPeriod('Daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                workLogPeriod === 'Daily' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setWorkLogPeriod('Weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                workLogPeriod === 'Weekly' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setWorkLogPeriod('Annually')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                workLogPeriod === 'Annually' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annually
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workLogs} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="workLogGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                domain={[0, 5000]}
                tickFormatter={(value) => `${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white' }}
                formatter={(value: number) => [`${value.toLocaleString()} Logs`, '']}
              />
              <Area
                type="monotone"
                dataKey="logs"
                stroke="#FF6B6B"
                strokeWidth={3}
                fill="url(#workLogGradient)"
                dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#FF6B6B' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Work Logs</p>
              <p className="text-2xl font-bold text-gray-800">{workLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Income</p>
              <p className="text-2xl font-bold text-gray-800">{incomeExpenseData.totalIncome}Ks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
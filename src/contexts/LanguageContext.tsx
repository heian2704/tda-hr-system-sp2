import React, { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode, useEffect } from 'react';

// Define specific types for translation structure for better type safety
interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

export interface EmployeePageTranslations {
  totalEmployee: string;
  active: string;
  onLeave: string;
  allEmployees: string;
  sortBy: string;
  joinDate: string;
  addNewEmployee: string;
  showing: string;
  of: string;
  employees: string;
  fullNameColumn: string;
  employeeIdColumn: string;
  phoneNumberColumn: string;
  addressColumn: string;
  roleColumn: string;
  joinDateColumn: string;
  statusColumn: string;
  actionColumn: string;
  editButton: string;
  address: string;
  name: string;
  status: string;
  addNewEmployeeTitle: string;
  fullNamePlaceholder: string;
  baseRatePlaceholder: string;
  phoneNumberPlaceholder: string;
  addressPlaceholder: string;
  rolePlaceholder: string;
  joinDatePlaceholder: string;
  selectTypeLabel: string;
  activeStatus: string;
  onLeaveStatus: string;
  cancelButton: string;
  addButton: string;
  saving: string;
  createSuccessfully: string;
  editSuccessfully: string;
  deleteSuccessfully: string;
  statusUpdate: string;
  editEmployeeTitle: string;
  saveChangesButton: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage1: string;
  confirmDeleteMessage2: string;
  deleteButton: string;
}

export interface WorkLogPageTranslations {
  [x: string]: string;
  createdSuccessfully: string;
  updatedSuccessfully: string;
  deleteSuccessfully: string;
  totalWorkLogs: string;
  totalCompletedWorklogs: string;
  totalQuantityProduced: string;
  workLogsTitle: string;
  searchPlaceholder: string;
  sortBy: string;
  date: string;
  addNewWorkLog: string;
  fullNameColumn: string;
  employeeIdColumn: string;
  dateColumn: string;
  productNameColumn: string;
  quantityColumn: string;
  roleColumn: string;
  totalPriceColumn: string;
  noteColumn: string;
  actionColumn: string;
  editButton: string;
  deleteButton: string;
  deleting: string;
  addNewWorkLogTitle: string;
  editWorkLogTitle: string;
  fullNameLabel: string;
  productRateLabel: string;
  quantityLabel: string;
  roleLabel: string;
  dateLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  cancelButton: string;
  addWorkLogButton: string;
  saving: string;
  saveChangesButton: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage1: string;
  confirmDeleteMessage2: string;
  deleteButtonConfirm: string;
  selectEmployee: string;
  optional: string;
  datePlaceholder: string;
  inActiveStatus: string;
  statusOnGoing: string;
  statusCompleted: string;
  statusRejected: string;
  all: string;
}

interface PayrollPageTranslations {
  totalNetPayroll: string;
  totalBonus: string;
  totalDeduction: string;
  allPayrollTitle: string;
  payrollPeriodDisplay: string;
  exportButton: string;
  searchPlaceholder: string;
  sortBy: string;
  date: string;
  fullNameColumn: string;
  roleColumn: string;
  productRateColumn: string;
  totalQuantityColumn: string;
  totalSalaryColumn: string;
  bonusDeductionColumn: string;
  netSalaryColumn: string;
  showing: string;
  of: string;
  payrollEntries: string;
  none: string;
  addBonusDeductionTitle: string;
  type: string;
  bonus: string;
  deduction: string;
  amount: string;
  notePlaceholder: string;
  optional: string;
  cancelButton: string;
  saveButton: string;
  invalidAmount: string;
  periodColumn: string;
  periodTypeLabel: string;
  periodTypeDay: string;
  periodTypeWeek: string;
  periodTypeMonth: string;
  periodTypeCustom: string;
  startDateLabel: string;
  endDateLabel: string;
  applyFilterButton: string;
  currentPeriod: string;
  paidStatusColumn: string;
  statusPaid: string;
  statusUnpaid: string;
}

export interface ExpenseIncomePageTranslations {
  totalNetIncomeExpense: string;
  totalIncome: string;
  totalExpense: string;
  incomeTab: string;
  expenseTab: string;
  sortBy: string;
  amount: string;
  addNewIncome: string;
  addNewExpense: string;
  incomeTitleColumn: string;
  expenseTitleColumn: string;
  amountColumn: string;
  dateColumn: string;
  noteColumn: string;
  actionColumn: string;
  editButton: string;
  deleteButton: string;
  showing: string;
  of: string;
  incomeEntries: string;
  expenseEntries: string;
  na: string;
  noEntriesFound: string;
  addNewIncomeTitle: string;
  addNewExpenseTitle: string;
  editIncomeTitle: string;
  editExpenseTitle: string;
  incomeNamePlaceholder: string;
  expenseTitlePlaceholder: string;
  clientPlaceholder: string;
  amountPlaceholder: string;
  notePlaceholder: string;
  cancelButton: string;
  addButton: string;
  saving: string;
  saveChangesButton: string;
  optional: string;
  invalidAmount: string;
  deleteMessage: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage1: string;
  confirmDeleteMessage2: string;
  deleteButtonConfirm: string;
  createSuccessfully: string;
  editSuccessfully: string;
  deleteSuccessfully: string;
  periodColumn: string;
  periodTypeLabel: string;
  periodTypeDay: string;
  periodTypeWeek: string;
  periodTypeMonth: string;
  periodTypeCustom: string;
  startDateLabel: string;
  endDateLabel: string;
  applyFilterButton: string;
  currentPeriod: string;
  selectPeriod: string;
}

interface DashboardTranslations {
  allEmployees: string;
  noData: string;
  noActivities: string;
  weeklyWorklogTrend: string;
  bestDay: string;
  yearlyFinancialOverview: string;
  title: string;
  totalEmployees: string;
  onBoardEmployeesByMonth: string;
  monthlyPayroll: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  monthlyProfit: string;
  update: string;
  employeePerformanceOverview: string;
  activityLog: string;
  payrollTrend: string;
  incomeVsExpenses: string;
  total: string;
  noActivityFound: string;
  worklogQuantity: string;
  totalValue: string;
  monthlyPayrollTitle: string;
  avgWorklogQuantity: string;
  bestPerformanceDay: string;
  allMonths: string;
  allYears: string;
  month: string;
  year: string;
}

// New interface for Attendance page translations
export interface AttendancePageTranslations {
  [x: string]: ReactNode;
  attendanceTitle: string;
  totalEmployees: string;
  present: string;
  absent: string;
  clockInPlaceholder: string;
  clockOutPlaceholder: string;
  durationPlaceholder: string;
  actions: string;
  clockIn: string;
  clockOut: string;
  markAsPresent: string;
  markAsAbsent: string;
  bulkActions: string;
  selectAll: string;
  showing: string;
  of: string;
  employees: string;
  noData: string;
  selectTime: string;
  confirm: string;
  cancel: string;
  bulkClockIn: string;
  bulkClockOut: string;
  loading: string;
}

// Extend the main AppTranslations to include the new Attendance page
interface AppTranslations {
  totalEmployees: ReactNode;
  present: ReactNode;
  absent: ReactNode;
  attendanceTitle: ReactNode;
  loading: ReactNode;
  employeeName: string;
  durationPlaceholder: ReactNode;
  actions: ReactNode;
  noData: ReactNode;
  showing: ReactNode;
  of: ReactNode;
  selectTime: ReactNode;
  cancel: ReactNode;
  confirm: ReactNode;
  attendancePage: AttendancePageTranslations; // Added this line
  dashboard: DashboardTranslations;
  sidebar: SidebarItem[];
  searchPlaceholder: string;
  logout: string;
  employeePage: EmployeePageTranslations;
  workLogPage: WorkLogPageTranslations;
  payrollPage: PayrollPageTranslations;
  expenseIncomePage: ExpenseIncomePageTranslations;
  common: {
    loading: string;
    error: string;
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
  };
}

interface AllTranslationsCollection {
  English: AppTranslations;
  Burmese: AppTranslations;
}

interface LanguageContextType {
  language: "English" | "Burmese";
  setLanguage: Dispatch<SetStateAction<"English" | "Burmese">>;
  translations: AppTranslations;
  allTranslations: AllTranslationsCollection;
}

const allAppTranslations: AllTranslationsCollection = {
  English: {
    sidebar: [
      { path: "/dashboard", label: "Dashboard", icon: "📊" },
      { path: "/employee", label: "Employee", icon: "🧑‍💼" },
      { path: "/attendance", label: "Attendance", icon: "📅" },
      { path: "/worklog", label: "Work Log", icon: "🕒" },
      { path: "/payroll", label: "Payroll", icon: "💵" },
      { path: "/expense-income", label: "Expense & Income", icon: "💳" },
      { path: "/application", label: "Application", icon: "📝" }
    ],
    searchPlaceholder: "Search",
    logout: "Log out",
    common: {
      loading: "Loading",
      error: "Error",
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
    },
    employeePage: {
      totalEmployee: "Total Employee",
      active: "Active",
      onLeave: "On Leave",
      allEmployees: "All Employees",
      sortBy: "Sort by:",
      joinDate: "Join Date",
      addressPlaceholder: "Address",
      addNewEmployee: "Add New Employee",
      showing: "Showing",
      of: "of",
      employees: "employees",
      fullNameColumn: "Full Name",
      employeeIdColumn: "Employee ID",
      phoneNumberColumn: "Phone Number",
      addressColumn: "Address",
      roleColumn: "Role",
      joinDateColumn: "Join Date",
      statusColumn: "Status",
      actionColumn: "Action",
      editButton: "Edit",
      address: "Address",
      name: "Name",
      status: "Status",
      addNewEmployeeTitle: "Add new employee",
      fullNamePlaceholder: "Full Name",
      baseRatePlaceholder: "Base rate",
      phoneNumberPlaceholder: "Phone number",
      rolePlaceholder: "Role",
      joinDatePlaceholder: "Join date (DD/MM/YYYY)",
      selectTypeLabel: "Select Type",
      activeStatus: "Active",
      onLeaveStatus: "On Leave",
      cancelButton: "Cancel",
      addButton: "Add",
      saving: "Saving...",
      createSuccessfully: "Employee created successfully.",
      editSuccessfully: "Employee updated successfully.",
      deleteSuccessfully: "Employee deleted successfully.",
      statusUpdate: "Status updated successfully.",
      editEmployeeTitle: "Edit Employee",
      saveChangesButton: "Save Changes",
      confirmDeleteTitle: "Confirm Deletion",
      confirmDeleteMessage1: "Are you sure you want to delete",
      confirmDeleteMessage2: "? This action cannot be undone.",
      deleteButton: "Delete",
    },
    attendancePage: {
      attendanceTitle: "Employee Attendance",
      totalEmployees: "Total Employees",
      present: "Present",
      absent: "Absent",
      clockInPlaceholder: "Clock In",
      clockOutPlaceholder: "Clock Out",
      durationPlaceholder: "Duration",
      actions: "Actions",
      clockIn: "Clock In",
      clockOut: "Clock Out",
      markAsPresent: "Mark as Present",
      markAsAbsent: "Mark as Absent",
      bulkActions: "Bulk Actions",
      selectAll: "Select All",
      showing: "Showing",
      of: "of",
      employees: "employees",
      noData: "No attendance data found for this date. Click Clock In to get started.",
      selectTime: "Select Time",
      confirm: "Confirm",
      cancel: "Cancel",
      bulkClockIn: "Bulk Clock In",
      bulkClockOut: "Bulk Clock Out",
      loading: "Loading employees...",
    },
    workLogPage: {
      createdSuccessfully: "Worklog Created",
      updatedSuccessfully: "Worklog Updated",
      deleteSuccessfully: "Worklog Deleted",
      totalWorkLogs: "Total Work Logs",
      totalCompletedWorklogs: "Total Completed Worklogs",
      totalQuantityProduced: "Total Quantity Produced",
      workLogsTitle: "Work Logs",
      searchPlaceholder: "Type employee name to search...",
      sortBy: "Sort by:",
      date: "Date",
      addNewWorkLog: "Add New Work Log",
      fullNameColumn: "Full Name",
      employeeIdColumn: "Employee ID",
      dateColumn: "Date",
      productNameColumn: "Product Name",
      quantityColumn: "Quantity",
      roleColumn: "Role",
      totalPriceColumn: "Total Price",
      noteColumn: "Note",
      actionColumn: "Action",
      editButton: "Edit",
      deleteButton: "Delete",
      deleting: "Deleting...",
      addNewWorkLogTitle: "Add New Work Log",
      editWorkLogTitle: "Edit Work Log",
      fullNameLabel: "Full Name",
      productRateLabel: "Product Rate",
      quantityLabel: "Quantity",
      roleLabel: "Role",
      dateLabel: "Date",
      noteLabel: "Note (Optional)",
      notePlaceholder: "Any additional notes...",
      cancelButton: "Cancel",
      addWorkLogButton: "Add Work Log",
      saving: "Saving...",
      saveChangesButton: "Save Changes",
      confirmDeleteTitle: "Confirm Deletion",
      confirmDeleteMessage1: "Are you sure you want to delete the work log entry for",
      confirmDeleteMessage2: "? This action cannot be undone.",
      deleteButtonConfirm: "Delete",
      selectEmployee: "Select Employee",
      optional: "(Optional)",
      datePlaceholder: "YYYY-MM-DD",
      inActiveStatus: "Inactive",
      statusOnGoing: "On Going",
      statusCompleted: "Completed",
      statusRejected: "Rejected",
      all: "All",
    },
    payrollPage: {
      totalNetPayroll: "Total Net Payroll",
      totalBonus: "Total Bonus",
      totalDeduction: "Total Deduction",
      allPayrollTitle: "All Payroll",
      payrollPeriodDisplay: "Payroll Period",
      exportButton: "Export",
      searchPlaceholder: "Type employee name to search...",
      sortBy: "Sort by:",
      date: "Date",
      fullNameColumn: "Full Name",
      roleColumn: "Role",
      productRateColumn: "Product Rate",
      totalQuantityColumn: "Total Quantity",
      totalSalaryColumn: "Total Salary",
      bonusDeductionColumn: "Bonus / Deduction",
      netSalaryColumn: "Net Salary",
      showing: "Showing",
      of: "of",
      payrollEntries: "payroll entries",
      none: "None",
      addBonusDeductionTitle: "Add Bonus / Deduction",
      type: "Type",
      bonus: "Bonus",
      deduction: "Deduction",
      amount: "Amount",
      notePlaceholder: "Add note (optional)",
      optional: "(Optional)",
      cancelButton: "Cancel",
      saveButton: "Save",
      invalidAmount: "Invalid amount",
      periodColumn: "Period",
      periodTypeLabel: "Period Type",
      periodTypeDay: "Day",
      periodTypeWeek: "Week",
      periodTypeMonth: "Month",
      periodTypeCustom: "Custom",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      applyFilterButton: "Apply Filter",
      currentPeriod: "Current Period",
      paidStatusColumn: "Paid Status",
      statusPaid: "Paid",
      statusUnpaid: "Unpaid",
    },
    expenseIncomePage: {
      totalNetIncomeExpense: "Total Net Income/Expense",
      totalIncome: "Total Income",
      totalExpense: "Total Expense",
      incomeTab: "Income",
      expenseTab: "Expense",
      sortBy: "Sort by:",
      amount: "Amount",
      addNewIncome: "Add New Income",
      addNewExpense: "Add New Expense",
      incomeTitleColumn: "Title",
      expenseTitleColumn: "Title",
      amountColumn: "Amount",
      dateColumn: "Date",
      noteColumn: "Note",
      actionColumn: "Action",
      editButton: "Edit",
      deleteButton: "Delete",
      showing: "Showing",
      of: "of",
      incomeEntries: "income entries",
      expenseEntries: "expense entries",
      na: "N/A",
      noEntriesFound: "No entries found.",
      addNewIncomeTitle: "Add New Income",
      addNewExpenseTitle: "Add New Expense",
      editIncomeTitle: "Edit Income",
      editExpenseTitle: "Edit Expense",
      incomeNamePlaceholder: "Income title",
      expenseTitlePlaceholder: "Expense title",
      clientPlaceholder: "Client (optional)",
      amountPlaceholder: "Amount",
      notePlaceholder: "Note (optional)",
      cancelButton: "Cancel",
      addButton: "Add",
      saving: "Saving...",
      saveChangesButton: "Save Changes",
      optional: "(Optional)",
      invalidAmount: "Invalid amount",
      deleteMessage: "Are you sure you want to delete this entry? This action cannot be undone.",
      confirmDeleteTitle: "Confirm Deletion",
      confirmDeleteMessage1: "Are you sure you want to delete this entry?",
      confirmDeleteMessage2: "This action cannot be undone.",
      deleteButtonConfirm: "Delete",
      createSuccessfully: "Entry created successfully.",
      editSuccessfully: "Entry updated successfully.",
      deleteSuccessfully: "Entry deleted successfully.",
      periodColumn: "Period",
      periodTypeLabel: "Period Type",
      periodTypeDay: "Day",
      periodTypeWeek: "Week",
      periodTypeMonth: "Month",
      periodTypeCustom: "Custom",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      applyFilterButton: "Apply Filter",
      currentPeriod: "Current Period",
      selectPeriod: "Select Period",
    },
    dashboard: {
      allEmployees: "All Employees",
      noData: "No data available",
      noActivities: "No recent activities",
      weeklyWorklogTrend: "Weekly Worklog Trend",
      bestDay: "Best Day",
      yearlyFinancialOverview: "Yearly Financial Overview",
      title: "Dashboard",
      totalEmployees: "Total Employees",
      onBoardEmployeesByMonth: "Onboard Employees",
      monthlyPayroll: "Monthly Payroll",
      monthlyIncome: "Monthly Income",
      monthlyExpenses: "Monthly Expenses",
      monthlyProfit: "Monthly Profit",
      update: "Updated",
      employeePerformanceOverview: "Employee Performance Overview",
      activityLog: "Activity Log",
      payrollTrend: "Payroll Trend",
      incomeVsExpenses: "Income vs Expenses",
      total: "Total",
      noActivityFound: "No activity found",
      worklogQuantity: "Worklog Quantity",
      totalValue: "Total Value",
      monthlyPayrollTitle: "Monthly Payroll",
      avgWorklogQuantity: "Avg. Worklog Quantity",
      bestPerformanceDay: "Best Performance Day",
      allMonths: "All Months",
      allYears: "All Years",
      month: "Month",
      year: "Year",
    },
    totalEmployees: '',
    present: '',
    absent: '',
    attendanceTitle: '',
    loading: '',
    employeeName: '',
    durationPlaceholder: '',
    actions: '',
    noData: '',
    showing: '',
    of: '',
    selectTime: '',
    cancel: '',
    confirm: ''
  },
  Burmese: {
    sidebar: [
      { path: "/dashboard", label: "ဒက်ရှ်ဘုတ်", icon: "📊" },
      { path: "/employee", label: "ဝန်ထမ်း", icon: "🧑‍💼" },
      { path: "/attendance", label: "တက်ရောက်မှု", icon: "📅" },
      { path: "/worklog", label: "အလုပ်မှတ်တမ်း", icon: "🕒" },
      { path: "/payroll", label: "လစာ", icon: "💵" },
      { path: "/expense-income", label: "အသုံးစရိတ်နှင့်ဝင်ငွေ", icon: "💳" },
      { path: "/application", label: "အလုပ်လျှောက်လွှာ", icon: "📝" }
    ],
    searchPlaceholder: "ရှာဖွေပါ",
    logout: "ထွက်ရန်",
    common: {
      loading: "တင်နေသည်",
      error: "အမှား",
      sunday: "တနင်္ဂနွေ",
      monday: "တနင်္လာ",
      tuesday: "အင်္ဂါ",
      wednesday: "ဗုဒ္ဓဟူး",
      thursday: "ကြာသပတေး",
      friday: "သောကြာ",
      saturday: "စနေ",
    },
    employeePage: {
      totalEmployee: "စုစုပေါင်းဝန်ထမ်း",
      active: "လုပ်ငန်းခွင်ဝင်",
      onLeave: "ခွင့်ယူ",
      allEmployees: "ဝန်ထမ်းအားလုံး",
      sortBy: "‌စီစစ်ရွေးချယ်ရန်",
      joinDate: "စတင်ဝင်ရောက်သည့်နေ့",
      addressPlaceholder: "နေရပ်လိပ်စာ",
      addNewEmployee: "ဝန်ထမ်းအသစ်ထည့်ရန်",
      showing: "ပြသနေသည်",
      of: "၏",
      employees: "ဝန်ထမ်းများ",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      employeeIdColumn: "ဝန်ထမ်း ID",
      phoneNumberColumn: "ဖုန်းနံပါတ်",
      addressColumn: "နေရပ်လိပ်စာ",
      roleColumn: "ရာထူး",
      joinDateColumn: "စတင်ဝင်ရောက်သည့်ရက်စွဲ",
      statusColumn: "အခြေအနေ",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      address: "နေရပ်လိပ်စာ",
      name: "အမည်",
      status: "အခြေအနေ",
      addNewEmployeeTitle: "ဝန်ထမ်းအသစ်ထည့်ရန်",
      fullNamePlaceholder: "အမည်အပြည့်အစုံ",
      baseRatePlaceholder: "အခြေခံနှုန်းထား",
      phoneNumberPlaceholder: "ဖုန်းနံပါတ်",
      rolePlaceholder: "ရာထူး",
      joinDatePlaceholder: "စတင်ဝင်ရောက်သည့်ရက်စွဲ (DD/MM/YYYY)",
      selectTypeLabel: "အမျိုးအစားရွေးပါ",
      activeStatus: "လုပ်ငန်းခွင်ဝင်",
      onLeaveStatus: "ခွင့်ယူ",
      cancelButton: "ပယ်ဖျက်ရန်",
      addButton: "ထည့်ရန်",
      saving: "သိမ်းဆည်းနေသည်...",
      createSuccessfully: "ဝန်ထမ်းအသစ်ထည့်သွင်းမှု အောင်မြင်သည်။",
      editSuccessfully: "ဝန်ထမ်းအချက်အလက် ပြင်ဆင်မှု အောင်မြင်သည်။",
      deleteSuccessfully: "ဝန်ထမ်းအချက်အလက် ဖျက်သိမ်းမှု အောင်မြင်သည်။",
      statusUpdate: "အခြေအနေ ပြင်ဆင်မှု အောင်မြင်သည်။",
      editEmployeeTitle: "ဝန်ထမ်းပြင်ဆင်ရန်",
      saveChangesButton: "အပြောင်းအလဲများသိမ်းရန်",
      confirmDeleteTitle: "ဖျက်သိမ်းရန်အတည်ပြုပါ",
      confirmDeleteMessage1: "ဖျက်သိမ်းရန် သေချာပါသလား",
      confirmDeleteMessage2: "ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍မရပါ။",
      deleteButton: "ဖျက်မည်",
    },
    attendancePage: {
      attendanceTitle: "ဝန်ထမ်း တက်ရောက်မှု",
      totalEmployees: "စုစုပေါင်း ဝန်ထမ်း",
      present: "ပစ္စုပ္ပန်",
      absent: "မရှိ",
      clockInPlaceholder: "နာရီ စတင်ဝင်ရောက်",
      clockOutPlaceholder: "နာရီ ထွက်ခွာ",
      durationPlaceholder: "ကြာချိန်",
      actions: "လုပ်ဆောင်မှုများ",
      clockIn: "နာရီ စတင်ဝင်ရောက်",
      clockOut: "နာရီ ထွက်ခွာ",
      markAsPresent: "ပစ္စုပ္ပန်အဖြစ် မှတ်သားပါ",
      markAsAbsent: "မရှိအဖြစ် မှတ်သားပါ",
      bulkActions: "အစုလိုက် လုပ်ဆောင်ချက်များ",
      selectAll: "အားလုံးရွေးပါ",
      showing: "ပြသနေသည်",
      of: "၏",
      employees: "ဝန်ထမ်းများ",
      noData: "ဤရက်စွဲအတွက် တက်ရောက်မှုဒေတာမတွေ့ပါ။ နာရီစတင်ဝင်ရောက်ရန် ကလစ်နှိပ်ပါ။",
      selectTime: "အချိန်ရွေးပါ",
      confirm: "အတည်ပြုပါ",
      cancel: "ပယ်ဖျက်ပါ",
      bulkClockIn: "အစုလိုက် နာရီစတင်ဝင်ရောက်",
      bulkClockOut: "အစုလိုက် နာရီထွက်ခွာ",
      loading: "ဝန်ထမ်းများကို တင်နေသည်...",
    },
    workLogPage: {
      createdSuccessfully: "အလုပ်မှတ်တမ်းထည့်သွင်းမှု အောင်မြင်သည်။",
      updatedSuccessfully: "အလုပ်မှတ်တမ်းပြင်ဆင်မှု အောင်မြင်သည်။",
      deleteSuccessfully: "အလုပ်မှတ်တမ်းဖျက်သိမ်းမှု အောင်မြင်သည်။",
      totalWorkLogs: "စုစုပေါင်းအလုပ်မှတ်တမ်းများ",
      totalCompletedWorklogs: "ပြီးစီးသောအလုပ်မှတ်တမ်းများ",
      searchPlaceholder: "ဝန်ထမ်းအမည်ရိုက်ထည့်၍ ရှာဖွေပါ...",
      totalQuantityProduced: "စုစုပေါင်းထုတ်လုပ်သောအရေအတွက်",
      workLogsTitle: "အလုပ်မှတ်တမ်းများ",
      sortBy: "စီစဥ်ရန်",
      date: "ရက်စွဲ",
      addNewWorkLog: "အလုပ်မှတ်တမ်းအသစ်ထည့်ရန်",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      employeeIdColumn: "ဝန်ထမ်း ID",
      dateColumn: "ရက်စွဲ",
      productNameColumn: "ထုတ်ကုန်အမည်",
      quantityColumn: "အရေအတွက်",
      roleColumn: "ရာထူး",
      totalPriceColumn: "စုစုပေါင်းတန်ဖိုး",
      noteColumn: "မှတ်ချက်",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      deleteButton: "ဖျက်မည်",
      deleting: "ဖျက်နေသည်...",
      addNewWorkLogTitle: "အလုပ်မှတ်တမ်းအသစ်ထည့်ရန်",
      editWorkLogTitle: "အလုပ်မှတ်တမ်းပြင်ဆင်ရန်",
      fullNameLabel: "အမည်အပြည့်အစုံ",
      productRateLabel: "ထုတ်ကုန်နှုန်း",
      quantityLabel: "အရေအတွက်",
      roleLabel: "ရာထူး",
      dateLabel: "ရက်စွဲ",
      noteLabel: "မှတ်ချက် (ရွေးချယ်နိုင်သည်)",
      notePlaceholder: "အပိုဆောင်းမှတ်ချက်များ...",
      cancelButton: "ပယ်ဖျက်ရန်",
      addWorkLogButton: "အလုပ်မှတ်တမ်းထည့်ရန်",
      saving: "သိမ်းဆည်းနေသည်...",
      saveChangesButton: "အပြောင်းအလဲများသိမ်းရန်",
      confirmDeleteTitle: "ဖျက်သိမ်းရန်အတည်ပြုပါ",
      confirmDeleteMessage1: "အလုပ်မှတ်တမ်းကိုဖျက်သိမ်းရန်သေချာပါသလား",
      confirmDeleteMessage2: "ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍မရပါ။",
      deleteButtonConfirm: "ဖျက်မည်",
      selectEmployee: "ဝန်ထမ်းရွေးပါ",
      optional: "(ရွေးချယ်နိုင်သည်)",
      datePlaceholder: "YYYY-MM-DD",
      inActiveStatus: "လုပ်ငန်းခွင်မဝင်",
      statusOnGoing: "ဆက်လက်လုပ်ဆောင်နေဆဲ",
      statusCompleted: "ပြီးစီး",
      statusRejected: "ပယ်ချ",
      all: "အားလုံး",
    },
    payrollPage: {
      totalNetPayroll: "စုစုပေါင်းလစာ",
      totalBonus: "စုစုပေါင်းဆုကြေး",
      totalDeduction: "စုစုပေါင်းဖြတ်တောက်မှု",
      allPayrollTitle: "လစာအားလုံး",
      payrollPeriodDisplay: "လစာကာလ",
      searchPlaceholder: "ဝန်ထမ်းအမည်ရိုက်ထည့်၍ ရှာဖွေပါ...",
      exportButton: "ပို့ရန်",
      sortBy: "စီစဥ်ရန်",
      date: "ရက်စွဲ",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      roleColumn: "ရာထူး",
      productRateColumn: "ထုတ်ကုန်နှုန်း",
      totalQuantityColumn: "စုစုပေါင်းအရေအတွက်",
      totalSalaryColumn: "စုစုပေါင်းလစာ",
      bonusDeductionColumn: "ဆုကြေး/ဖြတ်တောက်မှု",
      netSalaryColumn: "အသားတင်လစာ",
      showing: "ပြသနေသည်",
      of: "၏",
      payrollEntries: "လစာစာရင်း",
      none: "မရှိပါ",
      addBonusDeductionTitle: "ဆုကြေး / ဖြတ်တောက်မှုထည့်ရန်",
      type: "အမျိုးအစား",
      bonus: "ဆုကြေး",
      deduction: "ဖြတ်တောက်မှု",
      amount: "ပမာဏ",
      notePlaceholder: "မှတ်ချက်ထည့်ပါ (ရွေးချယ်နိုင်သည်)",
      optional: "(ရွေးချယ်နိုင်သည်)",
      cancelButton: "ပယ်ဖျက်ရန်",
      saveButton: "သိမ်းရန်",
      invalidAmount: "ပမာဏမမှန်ကန်ပါ",
      periodColumn: "ကာလ",
      periodTypeLabel: "ကာလအမျိုးအစား",
      periodTypeDay: "ရက်",
      periodTypeWeek: "ပတ်",
      periodTypeMonth: "လ",
      periodTypeCustom: "စိတ်ကြိုက်",
      startDateLabel: "စတင်သည့်ရက်စွဲ",
      endDateLabel: "ပြီးဆုံးသည့်ရက်စွဲ",
      applyFilterButton: "စစ်ထုတ်မည်",
      currentPeriod: "လက်ရှိကာလ",
      paidStatusColumn: "ပေးချေပြီးအခြေအနေ",
      statusPaid: "ပေးပြီး",
      statusUnpaid: "မပေးရသေး",
    },
    expenseIncomePage: {
      totalNetIncomeExpense: "စုစုပေါင်းအသားတင်ဝင်ငွေ/အသုံးစရိတ်",
      totalIncome: "စုစုပေါင်းဝင်ငွေ",
      totalExpense: "စုစုပေါင်းအသုံးစရိတ်",
      incomeTab: "ဝင်ငွေ",
      expenseTab: "အသုံးစရိတ်",
      sortBy: "စီစဥ်ရန်",
      amount: "ပမာဏ",
      addNewIncome: "ဝင်ငွေအသစ်ထည့်ရန်",
      addNewExpense: "အသုံးစရိတ်အသစ်ထည့်ရန်",
      incomeTitleColumn: "ခေါင်းစဉ်",
      expenseTitleColumn: "ခေါင်းစဉ်",
      amountColumn: "ပမာဏ",
      dateColumn: "ရက်စွဲ",
      noteColumn: "မှတ်ချက်",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      deleteButton: "ဖျက်မည်",
      showing: "ပြသနေသည်",
      of: "၏",
      incomeEntries: "ဝင်ငွေစာရင်းများ",
      expenseEntries: "အသုံးစရိတ်စာရင်းများ",
      na: "မရှိပါ",
      noEntriesFound: "စာရင်းမတွေ့ပါ။",
      addNewIncomeTitle: "ဝင်ငွေအသစ်ထည့်ရန်",
      addNewExpenseTitle: "အသုံးစရိတ်အသစ်ထည့်ရန်",
      editIncomeTitle: "ဝင်ငွေပြင်ဆင်ရန်",
      editExpenseTitle: "အသုံးစရိတ်ပြင်ဆင်ရန်",
      incomeNamePlaceholder: "ဝင်ငွေခေါင်းစဉ်",
      expenseTitlePlaceholder: "အသုံးစရိတ်ခေါင်းစဉ်",
      clientPlaceholder: "ဖောက်သည် (ရွေးချယ်နိုင်သည်)",
      amountPlaceholder: "ပမာဏ",
      notePlaceholder: "မှတ်ချက် (ရွေးချယ်နိုင်သည်)",
      cancelButton: "ပယ်ဖျက်ရန်",
      addButton: "ထည့်ရန်",
      saving: "သိမ်းဆည်းနေသည်...",
      saveChangesButton: "အပြောင်းအလဲများသိမ်းရန်",
      optional: "(ရွေးချယ်နိုင်သည်)",
      invalidAmount: "ပမာဏမမှန်ကန်ပါ",
      deleteMessage: "ဤစာရင်းကို ဖျက်သိမ်းရန် သေချာပါသလား။ ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍မရပါ။",
      confirmDeleteTitle: "ဖျက်သိမ်းရန်အတည်ပြုပါ",
      confirmDeleteMessage1: "ဤစာရင်းကို ဖျက်သိမ်းရန် သေချာပါသလား?",
      confirmDeleteMessage2: "ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍မရပါ။",
      deleteButtonConfirm: "ဖျက်မည်",
      createSuccessfully: "စာရင်းထည့်သွင်းမှု အောင်မြင်သည်။",
      editSuccessfully: "စာရင်းပြင်ဆင်မှု အောင်မြင်သည်။",
      deleteSuccessfully: "စာရင်းဖျက်သိမ်းမှု အောင်မြင်သည်။",
      periodColumn: "ကာလ",
      periodTypeLabel: "ကာလအမျိုးအစား",
      periodTypeDay: "ရက်",
      periodTypeWeek: "ပတ်",
      periodTypeMonth: "လ",
      periodTypeCustom: "စိတ်ကြိုက်",
      startDateLabel: "စတင်သည့်ရက်စွဲ",
      endDateLabel: "ပြီးဆုံးသည့်ရက်စွဲ",
      applyFilterButton: "စစ်ထုတ်မည်",
      currentPeriod: "လက်ရှိကာလ",
      selectPeriod: "ကာလရွေးပါ",
    },
    dashboard: {
      allEmployees: "ဝန်ထမ်းအားလုံး",
      noData: "ဒေတာမရှိပါ",
      noActivities: "မကြာသေးမီကလုပ်ဆောင်မှုများမရှိပါ",
      weeklyWorklogTrend: "အပတ်စဉ် အလုပ်မှတ်တမ်းခေတ်ရေစီးကြောင်း",
      bestDay: "အကောင်းဆုံးနေ့",
      yearlyFinancialOverview: "နှစ်အလိုက်ဘဏ္ဍာရေးအကျဉ်းချုပ်",
      title: "ဒက်ရှ်ဘုတ်",
      totalEmployees: "စုစုပေါင်းဝန်ထမ်း",
      onBoardEmployeesByMonth: "လစဥ် ဝန်ထမ်းအသစ်ဝင်ရောက်မှု",
      monthlyPayroll: "လစဉ်လစာ",
      monthlyIncome: "လစဉ်ဝင်ငွေ",
      monthlyExpenses: "လစဉ်အသုံးစရိတ်",
      monthlyProfit: "လစဉ်အမြတ်",
      update: "နောက်ဆုံးပြင်ဆင်ထားသည်",
      employeePerformanceOverview: "ဝန်ထမ်းစွမ်းဆောင်ရည်အကျဉ်းချုပ်",
      activityLog: "လုပ်ဆောင်ချက်မှတ်တမ်း",
      payrollTrend: "လစာခေတ်ရေစီးကြောင်း",
      incomeVsExpenses: "ဝင်ငွေနှင့်အသုံးစရိတ်",
      total: "စုစုပေါင်း",
      noActivityFound: "လုပ်ဆောင်ချက်မတွေ့ပါ",
      worklogQuantity: "အလုပ်မှတ်တမ်းအရေအတွက်",
      totalValue: "စုစုပေါင်းတန်ဖိုး",
      monthlyPayrollTitle: "လစဉ်လစာ",
      avgWorklogQuantity: "ပျမ်းမျှအလုပ်မှတ်တမ်းအရေအတွက်",
      bestPerformanceDay: "အကောင်းဆုံးစွမ်းဆောင်ရည်နေ့",
      allMonths: "လအားလုံး",
      allYears: "နှစ်အားလုံး",
      month: "လ",
      year: "နှစ်",
    },
    totalEmployees: '',
    present: '',
    absent: '',
    attendanceTitle: '',
    loading: '',
    employeeName: '',
    durationPlaceholder: '',
    actions: '',
    noData: '',
    showing: '',
    of: '',
    selectTime: '',
    cancel: '',
    confirm: ''
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"English" | "Burmese">("English");
  const translations = allAppTranslations[language];

  useEffect(() => {
    // You can add logic here to load the preferred language from localStorage if you want
    const savedLanguage = localStorage.getItem('language') as "English" | "Burmese";
    if (savedLanguage && allAppTranslations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations,
    allTranslations: allAppTranslations,
  }), [language, translations]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
// React's useMemo is imported from 'react', so you don't need to implement it yourself.
// Remove this function. If you want a custom implementation for learning purposes, here is a simple (non-reactive) version:

function useMemo<T>(factory: () => T, deps: unknown[]): T {
  // This is a naive implementation for demonstration only.
  // It does not provide memoization across renders.
  return factory();
}

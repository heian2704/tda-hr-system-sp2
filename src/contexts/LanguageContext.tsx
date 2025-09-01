import React, { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

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
  title: string;
  totalEmployees: string;
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

interface AppTranslations {
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
      { path: "/worklog", label: "Work Log", icon: "🕒" },
      { path: "/payroll", label: "Payroll", icon: "💵" },
      { path: "/expense-income", label: "Expense & Income", icon: "💳" }
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
    workLogPage: {
      createdSuccessfully: "Worklog Created",
      updatedSuccessfully: "Worklog Updated",
      deleteSuccessfully: "Worklog Deleted",
      totalWorkLogs: "Total Work Logs",
      totalCompletedWorklogs: "Total Completed Worklogs",
      totalQuantityProduced: "Total Quantity Produced",
      workLogsTitle: "Work Logs",
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
      optional: "Optional",
      datePlaceholder: "YYYY-MM-DD",
      inActiveStatus: "Selected Employee Is Not Active",
      statusOnGoing: "On Going",
      statusCompleted: "Completed",
      statusRejected: "Rejected",
      all: "All",
      showing: 'Showing',
      of: 'of',
      workLogs: 'work logs'
    },
    payrollPage: {
      totalNetPayroll: "Total Net Payroll",
      totalBonus: "Total Bonus",
      totalDeduction: "Total Deduction",
      allPayrollTitle: "All Payroll",
      payrollPeriodDisplay: "Payroll Period:",
      exportButton: "Export",
      sortBy: "Sort by:",
      date: "Date",
      fullNameColumn: "Full Name",
      roleColumn: "Role",
      productRateColumn: "Product Rate",
      totalQuantityColumn: "Total Quantity",
      totalSalaryColumn: "Total Salary",
      bonusDeductionColumn: "Bonus/Deduction",
      netSalaryColumn: "Net Salary",
      showing: "Showing",
      of: "of",
      payrollEntries: "payroll entries",
      none: "None",
      addBonusDeductionTitle: "Add Bonus/Deduction",
      type: "Type",
      bonus: "Bonus",
      deduction: "Deduction",
      amount: "Amount",
      notePlaceholder: "Reason for bonus/deduction (optional)",
      optional: "Optional",
      cancelButton: "Cancel",
      saveButton: "Save",
      invalidAmount: "Please enter a valid positive amount.",
      periodColumn: "Date",
      periodTypeLabel: "Select Period:",
      periodTypeDay: "Day",
      periodTypeWeek: "Week",
      periodTypeMonth: "Month",
      periodTypeCustom: "Custom Range",
      startDateLabel: "Start Date:",
      endDateLabel: "End Date:",
      applyFilterButton: "Apply Filter",
      currentPeriod: "Current Period:",
      paidStatusColumn: "Paid Status",
      statusPaid: "Paid",
      statusUnpaid: "Unpaid",
    },
    expenseIncomePage: {
      totalNetIncomeExpense: "Total Income & Expense",
      totalIncome: "Total Income",
      totalExpense: "Total Expense",
      incomeTab: "Income",
      expenseTab: "Expense",
      sortBy: "Sort by:",
      amount: "Amount",
      addNewIncome: "Add New Income",
      addNewExpense: "Add New Expense",
      incomeTitleColumn: "Income Title",
      expenseTitleColumn: "Expense Title",
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
      noEntriesFound: "No entries found for this period/filter.",
      addNewIncomeTitle: "Add New Income",
      addNewExpenseTitle: "Add New Expense",
      editIncomeTitle: "Edit Income",
      editExpenseTitle: "Edit Expense",
      incomeNamePlaceholder: "Income Name",
      expenseTitlePlaceholder: "Expense Title",
      clientPlaceholder: "Client",
      amountPlaceholder: "Amount",
      notePlaceholder: "Additional Note...",
      cancelButton: "Cancel",
      addButton: "Add",
      saving: "Saving...",
      saveChangesButton: "Save Changes",
      optional: "Optional",
      invalidAmount: "Please enter a valid positive amount.",
      deleteMessage: "Deleted successfully.",
      confirmDeleteTitle: "Confirm Deletion",
      confirmDeleteMessage1: "Are you sure you want to delete",
      confirmDeleteMessage2: "? This action cannot be undone.",
      deleteButtonConfirm: "Delete",
      createSuccessfully: "Entry created successfully.",
      editSuccessfully: "Entry updated successfully.",
      deleteSuccessfully: "Entry deleted successfully.",
      periodColumn: "Date",
      periodTypeLabel: "Select Period:",
      periodTypeDay: "Day",
      periodTypeWeek: "Week",
      periodTypeMonth: "Month",
      periodTypeCustom: "Custom Range",
      startDateLabel: "Start Date:",
      endDateLabel: "End Date:",
      applyFilterButton: "Apply Filter",
      currentPeriod: "Current Period:",
      selectPeriod: "Select period...",
    },
    dashboard: {
      title: "Dashboard",
      totalEmployees: "Total Employees",
      monthlyPayroll: "Monthly Payroll",
      monthlyIncome: "Monthly Income",
      monthlyExpenses: "Monthly Expenses",
      monthlyProfit: "Monthly Profit",
      update: "Update",
      employeePerformanceOverview: "Employee Performance Overview",
      activityLog: "Activity Log",
      payrollTrend: "Weekly Worklog Trend",
      incomeVsExpenses: "Yearly Financial Overview",
      total: "Total",
      noActivityFound: "No recent activity.",
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
  },
  Burmese: {
    sidebar: [
      { path: "/dashboard", label: "ပန်းတိုင်စာမျက်နှာ", icon: "📊" },
      { path: "/employee", label: "ဝန်ထမ်း", icon: "🧑‍💼" },
      { path: "/worklog", label: "အလုပ်မှတ်တမ်း", icon: "🕒" },
      { path: "/payroll", label: "လစာ", icon: "💵" },
      { path: "/expense-income", label: "ကုန်ကျစရိတ်နှင့် ဝင်ငွေ", icon: "💳" }
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
      totalEmployee: "ဝန်ထမ်းစုစုပေါင်း",
      active: "လုပ်ငန်းခွင်ဝင်",
      onLeave: "ခွင့်ယူထား",
      allEmployees: "ဝန်ထမ်းအားလုံး",
      sortBy: "စီစစ်ရန်:",
      joinDate: "ဝင်ရောက်သည့်နေ့စွဲ",
      addNewEmployee: "ဝန်ထမ်းအသစ်ထည့်ရန်",
      addressPlaceholder: "လိပ်စာ",
      showing: "ပြသနေသည်",
      of: "၏",
      employees: "ဝန်ထမ်းများ",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      employeeIdColumn: "ဝန်ထမ်း ID",
      phoneNumberColumn: "ဖုန်းနံပါတ်",
      addressColumn: "လိပ်စာ",
      roleColumn: "ရာထူး",
      joinDateColumn: "ပူးပေါင်းသည့်နေ့",
      statusColumn: "အခြေအနေ",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      address: "လိပ်စာ",
      name: "အမည်",
      status: "အခြေအနေ",
      addNewEmployeeTitle: "ဝန်ထမ်းအသစ်ထည့်ရန်",
      fullNamePlaceholder: "အမည်အပြည့်အစုံ",
      baseRatePlaceholder: "အခြေခံနှုန်း",
      phoneNumberPlaceholder: "ဖုန်းနံပါတ်",
      rolePlaceholder: "ရာထူး",
      joinDatePlaceholder: "ပူးပေါင်းသည့်နေ့ (DD/MM/YYYY)",
      selectTypeLabel: "အမျိုးအစားရွေးပါ",
      activeStatus: "လုပ်ငန်းခွင်ဝင်",
      onLeaveStatus: "ခွင့်ယူထား",
      cancelButton: "ပယ်ဖျက်ရန်",
      addButton: "ထည့်ရန်",
      saving: "မှတ်သားနေသည်...",
      createSuccessfully: "ဝန်ထမ်းအသစ်ဖန်တီးပြီးပါပြီ။",
      editSuccessfully: "ဝန်ထမ်းပြင်ဆင်ပြီးပါပြီ။",
      deleteSuccessfully: "ဝန်ထမ်းဖျက်ပြီးပါပြီ။",
      editEmployeeTitle: "ဝန်ထမ်းပြင်ဆင်ရန်",
      statusUpdate: "အခြေအနေပြောင်းလဲပြီးပါပြီ။",
      saveChangesButton: "အပြောင်းအလဲများ သိမ်းဆည်းရန်",
      confirmDeleteTitle: "ဖျက်ရန် အတည်ပြုပါ",
      confirmDeleteMessage1: "ဖျက်ရန်သေချာပါသလား",
      confirmDeleteMessage2: " ဤလုပ်ဆောင်ချက်ကို ပြန်ဖျက်၍မရပါ။",
      deleteButton: "ဖျက်ရန်",
    },
    workLogPage: {
      createdSuccessfully: "အလုပ်မှတ်တမ်းအသစ်ထည့်ပြီးပါပြီ",
      updatedSuccessfully: "အလုပ်မှတ်တမ်းပြင်ဆင်ပြီးပါပြီ",
      deleteSuccessfully: "အလုပ်မှတ်တမ်းဖျက်ပြီးပါပြီ",
      totalWorkLogs: "စုစုပေါင်းအလုပ်မှတ်တမ်းများ",
      totalCompletedWorklogs: "ပြီးစီးလုပ်ငန်းမှတ်တမ်းအရေအတွက်",
      totalQuantityProduced: "စုစုပေါင်းထုတ်လုပ်မှုပမာဏ",
      workLogsTitle: "အလုပ်မှတ်တမ်းများ",
      sortBy: "စီစစ်ရန်:",
      date: "နေ့စွဲ",
      addNewWorkLog: "အလုပ်မှတ်တမ်းအသစ်ထည့်ရန်",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      employeeIdColumn: "ဝန်ထမ်း ID",
      dateColumn: "နေ့စွဲ",
      productNameColumn: "ထုတ်ကုန်အမည်",
      quantityColumn: "ပမာဏ",
      roleColumn: "ရာထူး",
      totalPriceColumn: "စုစုပေါင်းဈေးနှုန်း",
      noteColumn: "မှတ်စု",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      deleteButton: "ဖျက်ရန်",
      deleting: "ဖျက်နေသည်...",
      addNewWorkLogTitle: "အလုပ်မှတ်တမ်းအသစ်ထည့်ရန်",
      editWorkLogTitle: "အလုပ်မှတ်တမ်းပြင်ဆင်ရန်",
      fullNameLabel: "အမည်အပြည့်အစုံ",
      productRateLabel: "ထုတ်ကုန်နှုန်း",
      quantityLabel: "ပမာဏ",
      roleLabel: "ရာထူး",
      dateLabel: "နေ့စွဲ",
      noteLabel: "မှတ်စု (ရွေးချယ်နိုင်သည်)",
      notePlaceholder: "အခြားမှတ်စုများ...",
      cancelButton: "ပယ်ဖျက်ရန်",
      addWorkLogButton: "အလုပ်မှတ်တမ်းထည့်ရန်",
      saving: "မှတ်သားနေသည်...",
      saveChangesButton: "အပြောင်းအလဲများ သိမ်းဆည်းရန်",
      confirmDeleteTitle: "ဖျက်ရန် အတည်ပြုပါ",
      confirmDeleteMessage1: "အလုပ်မှတ်တမ်းအတွက် ဖျက်ရန်သေချာပါသလား",
      confirmDeleteMessage2: " ဤလုပ်ဆောင်ချက်ကို ပြန်ဖျက်၍မရပါ။",
      deleteButtonConfirm: "ဖျက်ရန်",
      selectEmployee: "ဝန်ထမ်းရွေးပါ",
      optional: "ရွေးချယ်နိုင်သည်",
      datePlaceholder: "YYYY-MM-DD (ဥပမာ: 2025-06-22)",
      inActiveStatus: "ဝန်ထမ်းရုံးမလာပါ",
      statusOnGoing: "ဆောင်ရွက်ဆဲ",
      statusCompleted: "ပြီးစီး",
      statusRejected: "ငြင်းပယ်",
      all: "အားလုံး",
      showing: 'ပြသနေသည်',
      of: '၏',
      workLogs: 'အလုပ်မှတ်တမ်းများ'
    },
    payrollPage: {
      totalNetPayroll: "စုစုပေါင်းလစာ",
      totalBonus: "စုစုပေါင်းအပိုဆု",
      totalDeduction: "စုစုပေါင်းဖြတ်တောက်မှု",
      allPayrollTitle: "လစာအားလုံး",
      payrollPeriodDisplay: "လစာကာလ:",
      exportButton: "ထုတ်ရန်",
      sortBy: "စီစစ်ရန်:",
      date: "နေ့စွဲ",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      roleColumn: "ရာထူး",
      productRateColumn: "ထုတ်ကုန်နှုန်း",
      totalQuantityColumn: "စုစုပေါင်းပမာဏ",
      totalSalaryColumn: "စုစုပေါင်းလစာ",
      bonusDeductionColumn: "အပိုဆု/ဖြတ်တောက်မှု",
      netSalaryColumn: "အသားတင်လစာ",
      showing: "ပြသနေသည်",
      of: "၏",
      payrollEntries: "လစာစာရင်းများ",
      none: "မရှိပါ",
      addBonusDeductionTitle: "အပိုဆု/ဖြတ်တောက်မှု ထည့်ရန်",
      type: "အမျိုးအစား",
      bonus: "အပိုဆု",
      deduction: "ဖြတ်တောက်မှု",
      amount: "ပမာဏ",
      notePlaceholder: "အပိုဆု/ဖြတ်တောက်မှုအတွက် မှတ်ချက် (ရွေးချယ်နိုင်သည်)",
      optional: "ရွေးချယ်နိုင်သည်",
      cancelButton: "ပယ်ဖျက်ရန်",
      saveButton: "သိမ်းဆည်းရန်",
      invalidAmount: "မှန်ကန်သော ပမာဏကို ထည့်သွင်းပါ။",
      periodColumn: "နေ့စွဲ",
      periodTypeLabel: "ကာလရွေးချယ်ပါ:",
      periodTypeDay: "နေ့စဉ်",
      periodTypeWeek: "အပတ်စဉ်",
      periodTypeMonth: "လစဉ်",
      periodTypeCustom: "စိတ်ကြိုက်ရက်စွဲ",
      startDateLabel: "စတင်ရက်စွဲ:",
      endDateLabel: "ပြီးဆုံးရက်စွဲ:",
      applyFilterButton: "စစ်ထုတ်ရန်",
      currentPeriod: "လက်ရှိကာလ:",
      paidStatusColumn: "ပေးချေမှုအခြေအနေ",
      statusPaid: "ပေးပြီး",
      statusUnpaid: "မပေးရသေး",
    },
    expenseIncomePage: {
      totalNetIncomeExpense: "စုစုပေါင်းဝင်ငွေနှင့်အသုံးစရိတ်",
      totalIncome: "စုစုပေါင်းဝင်ငွေ",
      totalExpense: "စုစုပေါင်းအသုံးစရိတ်",
      incomeTab: "ဝင်ငွေ",
      expenseTab: "အသုံးစရိတ်",
      sortBy: "စီစစ်ရန်:",
      amount: "ပမာဏ",
      addNewIncome: "ဝင်ငွေအသစ်ထည့်ရန်",
      addNewExpense: "အသုံးစရိတ်အသစ်ထည့်ရန်",
      incomeTitleColumn: "ဝင်ငွေခေါင်းစဥ်",
      expenseTitleColumn: "အသုံးစရိတ်ခေါင်းစဥ်",
      amountColumn: "ပမာဏ",
      dateColumn: "နေ့စွဲ",
      noteColumn: "မှတ်စု",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      deleteButton: "ဖျက်ရန်",
      showing: "ပြသနေသည်",
      of: "၏",
      incomeEntries: "ဝင်ငွေစာရင်းများ",
      expenseEntries: "အသုံးစရိတ်စာရင်းများ",
      na: "မသက်ဆိုင်ပါ",
      noEntriesFound: "မည်သည့်စာရင်းမျှမတွေ့ပါ။",
      addNewIncomeTitle: "ဝင်ငွေအသစ်ထည့်ရန်",
      addNewExpenseTitle: "အသုံးစရိတ်အသစ်ထည့်ရန်",
      editIncomeTitle: "ဝင်ငွေပြင်ဆင်ရန်",
      editExpenseTitle: "အသုံးစရိတ်ပြင်ဆင်ရန်",
      incomeNamePlaceholder: "ဝင်ငွေအမည်",
      expenseTitlePlaceholder: "အသုံးစရိတ်ခေါင်းစဥ်",
      clientPlaceholder: "ဖောက်သည်",
      amountPlaceholder: "ပမာဏ",
      notePlaceholder: "အခြားမှတ်စုများ...",
      cancelButton: "ပယ်ဖျက်ရန်",
      addButton: "ထည့်ရန်",
      saving: "မှတ်သားနေသည်...",
      saveChangesButton: "အပြောင်းအလဲများ သိမ်းဆည်းရန်",
      optional: "ရွေးချယ်နိုင်သည်",
      invalidAmount: "မှန်ကန်သော ပမာဏကို ထည့်သွင်းပါ။",
      deleteMessage: "အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ။",
      confirmDeleteTitle: "ဖျက်ရန် အတည်ပြုပါ",
      confirmDeleteMessage1: "ဖျက်ရန်သေချာပါသလား",
      confirmDeleteMessage2: " ဤလုပ်ဆောင်ချက်ကို ပြန်ဖျက်၍မရပါ။",
      deleteButtonConfirm: "ဖျက်ရန်",
      createSuccessfully: "စာရင်းအသစ်ဖန်တီးပြီးပါပြီ။",
      editSuccessfully: "စာရင်းပြင်ဆင်ပြီးပါပြီ။",
      deleteSuccessfully: "စာရင်းဖျက်ပြီးပါပြီ။",
      periodColumn: "နေ့စွဲ",
      periodTypeLabel: "ကာလရွေးချယ်ပါ:",
      periodTypeDay: "နေ့စဉ်",
      periodTypeWeek: "အပတ်စဉ်",
      periodTypeMonth: "လစဉ်",
      periodTypeCustom: "စိတ်ကြိုက်ရက်စွဲ",
      startDateLabel: "စတင်ရက်စွဲ:",
      endDateLabel: "ပြီးဆုံးရက်စွဲ:",
      applyFilterButton: "စစ်ထုတ်ရန်",
      currentPeriod: "လက်ရှိကာလ:",
      selectPeriod: "ကာလရွေးချယ်ပါ...",
    },
    dashboard: {
      title: "ဒက်ရှ်ဘုတ်",
      totalEmployees: "စုစုပေါင်း ဝန်ထမ်း",
      monthlyPayroll: "လစဉ် လုပ်ခ",
      monthlyIncome: "လစဉ် ဝင်ငွေ",
      monthlyExpenses: "လစဉ် ထွက်ငွေ",
      monthlyProfit: "လစဉ် အမြတ်",
      update: "နောက်ဆုံးရက်စွဲ",
      employeePerformanceOverview: "ဝန်ထမ်းလုပ်ငန်းစွမ်းဆောင်ရည် ခြုံငုံသုံးသပ်ချက်",
      activityLog: "လုပ်ဆောင်မှု မှတ်တမ်း",
      payrollTrend: "အပတ်စဉ် အလုပ်မှတ်တမ်း ခေတ်ရေစီးကြောင်း",
      incomeVsExpenses: "နှစ်စဉ် ဘဏ္ဍာရေး ခြုံငုံသုံးသပ်ချက်",
      total: "စုစုပေါင်း",
      noActivityFound: "မကြာသေးမီက လှုပ်ရှားမှုမရှိပါ။",
      worklogQuantity: "အလုပ်မှတ်တမ်း ပမာဏ",
      totalValue: "စုစုပေါင်းတန်ဖိုး",
      monthlyPayrollTitle: "လစဉ် လုပ်ခ",
      avgWorklogQuantity: "ပျမ်းမျှအလုပ်မှတ်တမ်း ပမာဏ",
      bestPerformanceDay: "အကောင်းဆုံး စွမ်းဆောင်ရည်နေ့",
      allMonths: "လအားလုံး",
      allYears: "နှစ်အားလုံး",
      month: "လ",
      year: "နှစ်",
    },
  },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"English" | "Burmese">("English");

  const translations = allAppTranslations[language];

  const contextValue = {
    language,
    setLanguage,
    translations,
    allTranslations: allAppTranslations,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
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
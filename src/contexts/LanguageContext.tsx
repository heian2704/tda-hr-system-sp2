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
  addressColumn: string; // NEW: Address column
  roleColumn: string;
  joinDateColumn: string;
  statusColumn: string;
  actionColumn: string;
  editButton: string;
  address: string;
  name: string; // NEW: Address label for modal
  status: string; // NEW: Status label for modal
  // --- NEW MODAL TRANSLATION KEYS ---
  addNewEmployeeTitle: string;
  fullNamePlaceholder: string;
  baseRatePlaceholder: string;
  phoneNumberPlaceholder: string;
  addressPlaceholder: string; // NEW: Address placeholder
  rolePlaceholder: string;
  joinDatePlaceholder: string;
  selectTypeLabel: string;
  activeStatus: string;
  onLeaveStatus: string;
  cancelButton: string;
  addButton: string;
  saving: string;
  // --- NEW EDIT/DELETE MODAL TRANSLATIONS ---
  createSuccessfully: ReactNode;
  editSuccessfully: ReactNode;
  deleteSuccessfully: ReactNode;
  statusUpdate: ReactNode;
  editEmployeeTitle: ReactNode;
  saveChangesButton: ReactNode;
  confirmDeleteTitle: ReactNode;
  confirmDeleteMessage1: ReactNode;
  confirmDeleteMessage2: ReactNode;
  deleteButton: ReactNode;
}

// UPDATED: Define specific types for Work Log page translation structure
interface WorkLogPageTranslations {
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
  productNameColumn: string; // Added missing property
  quantityColumn: string;
  roleColumn: string;
  totalPriceColumn: string; // Changed from salaryColumn
  noteColumn: string;
  actionColumn: string;
  showing: string;
  of: string;
  workLogs: string;
  editButton: string;
  deleteButton: string;
  deleting: string;
  // Modal specific translations for WorkLog
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
  // Status options translations
  statusOnGoing: string;
  statusCompleted: string;
  statusRejected: string;
  all: string; // Added 'All' for status filter dropdown
}

// UPDATED: Define specific types for Payroll page translation structure
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
  none: string; // For "Bonus/Deduction" column when no bonus/deduction
  // Bonus/Deduction Modal Translations
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
  // Period selection translations
  periodColumn: string;
  periodTypeLabel: string;
  periodTypeDay: string;
  periodTypeWeek: string;
  periodTypeMonth: string;
  periodTypeCustom: string;
  startDateLabel: string;
  endDateLabel: string;
  applyFilterButton: string;
  currentPeriod: string; // For displaying the selected period, e.g., "1/04/2020 - 1/04/2020"
  // NEW: Paid Status translations
  paidStatusColumn: string;
  statusPaid: string;
  statusUnpaid: string;
}

// UPDATED: Define specific types for Expense & Income page translation structure
export interface ExpenseIncomePageTranslations {
  totalNetIncomeExpense: string;
  totalIncome: string;
  totalExpense: string;
  incomeTab: string;
  expenseTab: string;
  sortBy: string;
  amount: string; // Used for "Sort by: Amount"
  addNewIncome: string;
  addNewExpense: string;
  incomeTitleColumn: string;
  expenseTitleColumn: string;
  amountColumn: string; // Changed from categoryColumn to paidToColumn
  dateColumn: string;
  noteColumn: string;
  actionColumn: string;
  editButton: string;
  deleteButton: string;
  showing: string;
  of: string;
  incomeEntries: string;
  expenseEntries: string;
  na: string; // N/A for Note column
  noEntriesFound: string;
  // Modals
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
  // NEW: Period selection translations
  periodColumn:string;
  periodTypeLabel: string;
  periodTypeDay: string;
  periodTypeWeek: string;
  periodTypeMonth: string;
  periodTypeCustom: string;
  startDateLabel: string;
  endDateLabel: string;
  applyFilterButton: string;
  currentPeriod: string; // For displaying the selected period, e.g., "1/04/2020 - 1/04/2020"
  selectPeriod: string; // "Select period..."
}


// Full translations structure used by the context
interface AppTranslations {
  sidebar: SidebarItem[];
  searchPlaceholder: string;
  logout: string;
  employeePage: EmployeePageTranslations;
  workLogPage: WorkLogPageTranslations;
  payrollPage: PayrollPageTranslations;
  expenseIncomePage: ExpenseIncomePageTranslations; // NEW: Nested object for expense & income page translations
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
  }
}

interface AllTranslationsCollection {
  English: AppTranslations;
  Burmese: AppTranslations;
}

// Define the shape of the context value
interface LanguageContextType {
  language: "English" | "Burmese";
  setLanguage: Dispatch<SetStateAction<"English" | "Burmese">>;
  translations: AppTranslations;
  allTranslations: AllTranslationsCollection;
}

// Global translation data
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
      addressPlaceholder: "Address", // NEW: Address placeholder
      addNewEmployee: "Add New Employee",
      showing: "Showing",
      of: "of",
      employees: "employees",
      fullNameColumn: "Full Name",
      employeeIdColumn: "Employee ID",
      phoneNumberColumn: "Phone Number",
      addressColumn: "Address", // NEW: Address column
      roleColumn: "Role",
      joinDateColumn: "Join Date",
      statusColumn: "Status",
      actionColumn: "Action",
      editButton: "Edit",
      address: "Address",
      name: "Name", // Added missing property
      status: "Status", // Added missing property
      // --- MODAL TRANSLATIONS ---
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
      // --- EDIT/DELETE MODAL TRANSLATIONS ---
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
    // UPDATED: Work Log Page Translations (Added 'all' key)
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
      showing: "Showing",
      of: "of",
      workLogs: "work logs",
      editButton: "Edit",
      deleteButton: "Delete",
      deleting: "Deleting...",
      // Modal specific translations for WorkLog
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
      // Status options translations
      statusOnGoing: "On Going",
      statusCompleted: "Completed",
      statusRejected: "Rejected",
      all: "All", // Added 'All' for status filter dropdown
    },
    // UPDATED: Payroll Page Translations (Added new keys for period selection and paid status)
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
      // Bonus/Deduction Modal Translations
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
      // Period selection translations
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
      // NEW: Paid Status translations
      paidStatusColumn: "Paid Status",
      statusPaid: "Paid",
      statusUnpaid: "Unpaid",
    },
    // UPDATED: Expense & Income Page Translations (Updated column/placeholder keys)
    expenseIncomePage: {
      totalNetIncomeExpense: "Total Income & Expense",
      totalIncome: "Total Income",
      totalExpense: "Total Expense",
      incomeTab: "Income",
      expenseTab: "Expense",
      sortBy: "Sort by:",
      amount: "Amount", // for "Sort by: Amount"
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
      // Modals
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
      // NEW: Period selection translations
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
      selectPeriod: "Select period...", // For initial display of currentPeriod
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
      addressPlaceholder : "လိပ်စာ", // NEW: Address placeholder
      showing: "ပြသနေသည်",
      of: "၏",
      employees: "ဝန်ထမ်းများ",
      fullNameColumn: "အမည်အပြည့်အစုံ",
      employeeIdColumn: "ဝန်ထမ်း ID",
      phoneNumberColumn: "ဖုန်းနံပါတ်",
      addressColumn: "လိပ်စာ", // NEW: Address column
      roleColumn: "ရာထူး",
      joinDateColumn: "ပူးပေါင်းသည့်နေ့",
      statusColumn: "အခြေအနေ",
      actionColumn: "လုပ်ဆောင်ချက်",
      editButton: "ပြင်ဆင်ရန်",
      address: "လိပ်စာ",
      name: "အမည်", // Added missing property
      status: "အခြေအနေ", // Added missing property
      // --- MODAL TRANSLATIONS ---
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
      // --- EDIT/DELETE MODAL TRANSLATIONS ---
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
    // UPDATED: Work Log Page Translations (Added 'all' key)
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
      showing: "ပြသနေသည်",
      of: "၏",
      workLogs: "အလုပ်မှတ်တမ်းများ",
      editButton: "ပြင်ဆင်ရန်",
      deleteButton: "ဖျက်ရန်",
      deleting: "ဖျက်နေသည်...",
      // Modal specific translations for WorkLog
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
      // Status options translations
      statusOnGoing: "ဆောင်ရွက်ဆဲ",
      statusCompleted: "ပြီးစီး",
      statusRejected: "ငြင်းပယ်",
      all: "အားလုံး", // Added 'All' for status filter dropdown
    },
    // UPDATED: Payroll Page Translations (Added new keys for period selection and paid status)
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
      // Bonus/Deduction Modal Translations
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
      // Period selection translations
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
      // NEW: Paid Status translations
      paidStatusColumn: "ပေးချေမှုအခြေအနေ",
      statusPaid: "ပေးပြီး",
      statusUnpaid: "မပေးရသေး",
    },
    // UPDATED: Expense & Income Page Translations (Updated column/placeholder keys)
    expenseIncomePage: {
      totalNetIncomeExpense: "စုစုပေါင်းဝင်ငွေနှင့်အသုံးစရိတ်",
      totalIncome: "စုစုပေါင်းဝင်ငွေ",
      totalExpense: "စုစုပေါင်းအသုံးစရိတ်",
      incomeTab: "ဝင်ငွေ",
      expenseTab: "အသုံးစရိတ်",
      sortBy: "စီစစ်ရန်:",
      amount: "ပမာဏ", // for "Sort by: Amount"
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
      // Modals
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
      // NEW: Period selection translations
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
      selectPeriod: "ကာလရွေးချယ်ပါ...", // For initial display of currentPeriod
    },
  },
};

// Create the context with a default undefined value (will be set by provider)
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component to wrap your application or part of it
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<"English" | "Burmese">("English");

  const translations = allAppTranslations[language];

  const contextValue = {
    language,
    setLanguage,
    translations, // Current language translations
    allTranslations: allAppTranslations, // All translations for potential future use (e.g., in language switcher)
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to easily consume the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// src/pages/ExpenseIncome.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, BarChart, Plus, ChevronDown, Edit, Trash2, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Import services and DTOs
import { incomeService } from '@/services/incomeService';
import { IncomeDto } from '@/dtos/income/IncomeDto';
import { IncomeCreateDto } from '@/dtos/income/IncomeCreateDto';
import { IncomeUpdateDto } from '@/dtos/income/IncomeUpdateDto';

// Import the new specific modals
import AddEditIncomeModal from '../../components/AddEditIncomeModal';
import AddEditExpenseModal from '../../components/AddEditExpenseModal';

// --- Date Utility Functions (Copied/Adapted from Payroll.tsx) ---
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Ensure the date is treated as UTC to avoid timezone issues affecting day calculations
  return new Date(Date.UTC(year, month - 1, day));
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday (1)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
};

const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 6));
  return endOfWeek;
};

const getStartOfMonth = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
};

const getEndOfMonth = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)); // Day 0 of next month is last day of current month
};

const isDateInRange = (dateString: string, startDate: string, endDate: string): boolean => {
  const date = parseDate(dateString);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  // Compare timestamps
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

// --- Data Interfaces ---
interface IncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  note: string;
}

interface ExpenseEntry {
  id: string;
  name: string; // e.g., "Rent"
  amount: number;
  paidTo: string; // specific for expense, changed from category
  date: string; // INSEE-MM-DD
  note: string;
}

// Convert IncomeDto to IncomeEntry for UI compatibility
const convertIncomeDto = (dto: IncomeDto): IncomeEntry => ({
  id: dto._id,
  name: dto.name,
  amount: dto.amount,
  date: dto.date,
  note: dto.note
});


const mockExpenseData: ExpenseEntry[] = [
  { id: 'exp-1', name: 'Office Rent', amount: 200_000, paidTo: 'Landlord', date: '2025-06-01', note: 'Monthly rent' }, // Changed category to paidTo
  { id: 'exp-2', name: 'Electricity Bill', amount: 45_000, paidTo: 'Government', date: '2025-06-10', note: 'June bill' }, // Changed category to paidTo
  { id: 'exp-3', name: 'Employee Salaries', amount: 500_000, paidTo: 'Internal Payroll', date: '2025-05-30', note: 'May salaries' }, // Changed category to paidTo
  { id: 'exp-4', name: 'Raw Material Purchase', amount: 150_000, paidTo: 'Supplier X', date: '2025-06-12', note: 'Plastic pellets' }, // Changed category to paidTo
  { id: 'exp-5', name: 'Internet Bill', amount: 15_000, paidTo: 'Telecom Co.', date: '2025-06-05', note: '' }, // Changed category to paidTo
  { id: 'exp-6', name: 'Water Bill', amount: 10000, paidTo: 'Water Supply', date: '2025-06-07', note: 'June water bill' },
  { id: 'exp-7', name: 'Marketing Campaign', amount: 80000, paidTo: 'Ad Agency', date: '2025-06-14', note: 'Summer campaign' },
  { id: 'exp-8', name: 'Vehicle Maintenance', amount: 25000, paidTo: 'Mechanic Y', date: '2025-06-16', note: 'Oil change and tires' },
  { id: 'exp-9', name: 'Software Subscription', amount: 50000, paidTo: 'Cloud Services Inc.', date: '2025-06-21', note: 'Annual software subscription' }, // Latest date
  { id: 'exp-10', name: 'Office Supplies', amount: 8000, paidTo: 'Stationery Shop', date: '2025-06-18', note: 'Pens, paper, etc.' },
];


// --- Confirm Delete Modal Component (Re-used/Adapted) ---
interface ConfirmDeleteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, type: 'income' | 'expense') => void;
  entryId: string | null;
  entryName: string;
  type: 'income' | 'expense';
}

const ConfirmDeleteEntryModal = ({ isOpen, onClose, onConfirm, entryId, entryName, type }: ConfirmDeleteEntryModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const modalTranslations = translations.expenseIncomePage;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <Trash2 className="mx-auto text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {modalTranslations.confirmDeleteTitle}
        </h2>
        <p className="text-gray-600 mb-6">
          {modalTranslations.confirmDeleteMessage1} <span className="font-semibold text-red-600">{entryName}</span> {modalTranslations.confirmDeleteMessage2}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {modalTranslations.cancelButton}
          </button>
          <button
            onClick={() => {
              if (entryId) {
                console.log(`[UI-ONLY] Confirming deletion of ${type} entry ID: ${entryId} (Name: ${entryName})`);
                onConfirm(entryId, type);
              }
              onClose();
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {modalTranslations.deleteButtonConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main ExpenseIncome Component ---
const ExpenseIncome = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>(mockExpenseData);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false); // Specific income modal
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); // Specific expense modal
  const [selectedIncomeEntryForEdit, setSelectedIncomeEntryForEdit] = useState<IncomeEntry | null>(null); // Specific income edit
  const [selectedExpenseEntryForEdit, setSelectedExpenseEntryForEdit] = useState<ExpenseEntry | null>(null); // Specific expense edit
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [entryToDeleteDetails, setEntryToDeleteDetails] = useState<{ id: string, name: string, type: 'income' | 'expense' } | null>(null);

  // NEW: Period selection states
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'day' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [currentDisplayPeriod, setCurrentDisplayPeriod] = useState<string>(''); // For displaying the chosen period

  const { translations } = useLanguage();
  const pageTranslations = translations.expenseIncomePage;
  const commonTranslations = translations.common;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Load incomes from API
  const loadIncomes = async () => {
    setIsLoading(true);
    try {
      const incomes = await incomeService.getAllIncomes();
      setIncomeEntries(incomes.map(convertIncomeDto));
    } catch (error) {
      console.error('Error loading incomes:', error);
      toast({
        title: "Error",
        description: "Failed to load incomes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial setup and load data
  useEffect(() => {
    const today = new Date();
    const startOfMonth = getStartOfMonth(today);
    const endOfMonth = getEndOfMonth(today);

    setCustomStartDate(formatDate(startOfMonth));
    setCustomEndDate(formatDate(endOfMonth));
    setPeriodType('month');
    setCurrentDisplayPeriod(
      `${pageTranslations.currentPeriod} ${startOfMonth.toLocaleString('default', { month: 'long' })} ${startOfMonth.getFullYear()}`
    );
    
    loadIncomes();
  }, []);

  // Effect to update currentDisplayPeriod when period type or custom dates change
  useEffect(() => {
    const today = new Date();
    let displayPeriodText = '';

    switch (periodType) {
      case 'day':
        displayPeriodText = `${pageTranslations.currentPeriod} ${formatDate(today)}`;
        break;
      case 'week':
        const startOfWeek = getStartOfWeek(today);
        const endOfWeek = getEndOfWeek(today);
        displayPeriodText = `${pageTranslations.currentPeriod} ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
        break;
      case 'month':
        const startOfMonth = getStartOfMonth(today);
        displayPeriodText = `${pageTranslations.currentPeriod} ${startOfMonth.toLocaleString('default', { month: 'long' })} ${startOfMonth.getFullYear()}`;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          displayPeriodText = `${pageTranslations.currentPeriod} ${customStartDate} - ${customEndDate}`;
        } else {
          displayPeriodText = pageTranslations.selectPeriod; // Placeholder if custom dates aren't set
        }
        break;
      default:
        displayPeriodText = pageTranslations.selectPeriod;
        break;
    }
    setCurrentDisplayPeriod(displayPeriodText);
  }, [periodType, customStartDate, customEndDate, pageTranslations]);


  // Filter data based on selected date range
  const getFilteredEntriesByDate = (entries: (IncomeEntry | ExpenseEntry)[]) => {
    let filterStart: string = '';
    let filterEnd: string = '';
    const today = new Date();

    switch (periodType) {
      case 'day':
        filterStart = formatDate(today);
        filterEnd = formatDate(today);
        break;
      case 'week':
        filterStart = formatDate(getStartOfWeek(today));
        filterEnd = formatDate(getEndOfWeek(today));
        break;
      case 'month':
        filterStart = formatDate(getStartOfMonth(today));
        filterEnd = formatDate(getEndOfMonth(today));
        break;
      case 'custom':
        filterStart = customStartDate;
        filterEnd = customEndDate;
        break;
      default:
        // Default to showing all if no specific filter
        return entries;
    }

    if (!filterStart || !filterEnd) {
      return []; // No valid range selected for custom
    }

    return entries.filter(entry =>
      isDateInRange(entry.date, filterStart, filterEnd)
    );
  };

  // Memoized lists for filtered entries (first by date, then by search query)
  const dateFilteredIncomeEntries = useMemo(() => getFilteredEntriesByDate(incomeEntries), [incomeEntries, periodType, customStartDate, customEndDate]);
  const dateFilteredExpenseEntries = useMemo(() => getFilteredEntriesByDate(expenseEntries), [expenseEntries, periodType, customStartDate, customEndDate]);

  // Calculate totals based on date-filtered entries (before search query)
  const totalIncome = dateFilteredIncomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = dateFilteredExpenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalNet = totalIncome - totalExpense;

  // Filter and paginate data based on active tab, search query, and date range
  const combinedFilteredEntries = useMemo(() => {
    let currentTabEntries = activeTab === 'income' ? dateFilteredIncomeEntries : dateFilteredExpenseEntries;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentTabEntries = currentTabEntries.filter(entry =>
        entry.name.toLowerCase().includes(lowerCaseQuery) ||
        entry.amount.toString().includes(lowerCaseQuery) ||
        ('paidTo' in entry && entry.paidTo.toLowerCase().includes(lowerCaseQuery)) ||
        entry.date.includes(lowerCaseQuery) ||
        entry.note.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return currentTabEntries;
  }, [activeTab, dateFilteredIncomeEntries, dateFilteredExpenseEntries, searchQuery]);

  // Paginated entries for display
  const displayedEntries = useMemo(() => {
    return combinedFilteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [combinedFilteredEntries, currentPage, itemsPerPage]);

  // Total count of entries after all filters
  const totalFilteredEntries = useMemo(() => {
    return combinedFilteredEntries.length;
  }, [combinedFilteredEntries]);

  const totalPages = Math.ceil(totalFilteredEntries / itemsPerPage);

  // Reset page when tab, search query, or period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, periodType, customStartDate, customEndDate]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handlers for specific modals
  const handleOpenAddModal = () => {
    if (activeTab === 'income') {
      setSelectedIncomeEntryForEdit(null);
      setIsAddIncomeModalOpen(true);
    } else {
      setSelectedExpenseEntryForEdit(null);
      setIsAddExpenseModalOpen(true);
    }
  };

  const handleOpenEditModal = (entry: IncomeEntry | ExpenseEntry) => {
    if (activeTab === 'income') {
      setSelectedIncomeEntryForEdit(entry as IncomeEntry);
      setIsAddIncomeModalOpen(true);
    } else {
      setSelectedExpenseEntryForEdit(entry as ExpenseEntry);
      setIsAddExpenseModalOpen(true);
    }
  };

  const handleSaveIncomeEntry = async (entry: IncomeEntry, isEditing: boolean) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData: IncomeUpdateDto = {
          name: entry.name,
          amount: entry.amount,
          date: entry.date,
          note: entry.note
        };
        await incomeService.updateIncome(entry.id, updateData);
        toast({
          title: "Success",
          description: "Income updated successfully",
        });
      } else {
        const createData: IncomeCreateDto = {
          name: entry.name,
          amount: entry.amount,
          date: entry.date,
          note: entry.note
        };
        await incomeService.createIncome(createData);
        toast({
          title: "Success",
          description: "Income created successfully",
        });
      }
      await loadIncomes(); // Refresh the list
    } catch (error) {
      console.error('Error saving income:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} income. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExpenseEntry = (entry: ExpenseEntry, isEditing: boolean) => {
    setExpenseEntries(prev =>
      isEditing ? prev.map(exp => (exp.id === entry.id ? entry : exp)) : [...prev, entry]
    );
  };

  const handleConfirmDeleteClick = (entry: IncomeEntry | ExpenseEntry) => {
    setEntryToDeleteDetails({ id: entry.id, name: entry.name, type: activeTab });
    setIsDeleteConfirmModalOpen(true);
  };

  const handleExecuteDelete = async (id: string, type: 'income' | 'expense') => {
    setIsLoading(true);
    try {
      if (type === 'income') {
        await incomeService.deleteIncome(id);
        toast({
          title: "Success",
          description: "Income deleted successfully",
        });
        await loadIncomes(); // Refresh the list
      } else {
        setExpenseEntries(prev => prev.filter(exp => exp.id !== id));
        console.log(`[UI-ONLY] Executed deletion for ${type} entry ID: ${id}`);
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "Failed to delete income. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800">
      <div className="space-y-4">
        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-evenly gap-4 md:gap-6 shadow-sm">
          {/* Stat Item 1: Total Net */}
          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BarChart className="text-purple-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{pageTranslations.totalNetIncomeExpense}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalNet.toLocaleString()}</p>
            </div>
          </div>

          {/* Stat Item 2: Total Income */}
          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-green-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{pageTranslations.totalIncome}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalIncome.toLocaleString()}</p>
            </div>
          </div>

          {/* Stat Item 3: Total Expense */}
          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingDown className="text-red-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{pageTranslations.totalExpense}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area: Tabs, Controls, Table */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Tabs and Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'income' ? 'bg-[#EB5757] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                `}
              >
                {pageTranslations.incomeTab}
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'expense' ? 'bg-[#EB5757] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                `}
              >
                {pageTranslations.expenseTab}
              </button>
            </div>

            {/* Sort by and Add New Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Sort by Dropdown (now positioned first in this group) */}
              <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer w-full sm:w-auto">
                <span className="font-medium text-gray-700">{pageTranslations.sortBy}</span>
                <span className="font-semibold text-gray-900">{pageTranslations.amount}</span>
                <ChevronDown className="w-4 h-4" />
              </div>

               {/* Period Type Dropdown (moved here, next to Sort by) */}
               <div className="relative w-full sm:w-auto">
                <select
                  value={periodType}
                  onChange={(e) => {
                    setPeriodType(e.target.value as 'month' | 'week' | 'day' | 'custom');
                    // Reset custom dates if switching away from custom
                    if (e.target.value !== 'custom') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value="month">{pageTranslations.periodTypeMonth}</option>
                  <option value="week">{pageTranslations.periodTypeWeek}</option>
                  <option value="day">{pageTranslations.periodTypeDay}</option>
                  <option value="custom">{pageTranslations.periodTypeCustom}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Conditional Custom Date Inputs */}
              {periodType === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                  <label htmlFor="startDate" className="sr-only">{pageTranslations.startDateLabel}</label>
                  <input
                    type="date"
                    id="startDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <label htmlFor="endDate" className="sr-only">{pageTranslations.endDateLabel}</label>
                  <input
                    type="date"
                    id="endDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              )}

              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#EB5757] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                {activeTab === 'income' ? pageTranslations.addNewIncome : pageTranslations.addNewExpense}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">{activeTab === 'income' ? pageTranslations.incomeNameColumn : pageTranslations.expenseNameColumn}</th>
                  <th className="py-3 px-4 font-semibold">{pageTranslations.amountColumn}</th>
                  {activeTab === 'expense' && (
                    <th className="py-3 px-4 font-semibold">{pageTranslations.paidToColumn}</th>
                  )}
                  <th className="py-3 px-4 font-semibold">{pageTranslations.dateColumn}</th>
                  <th className="py-3 px-4 font-semibold">{pageTranslations.noteColumn}</th>
                  <th className="py-3 px-4 font-semibold text-center">{pageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === 'expense' ? 6 : 5} className="py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : displayedEntries.length > 0 ? (
                  displayedEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{entry.name}</td>
                      <td className="py-3 px-4 text-gray-700">Ks. {entry.amount.toLocaleString()}</td>
                      {activeTab === 'expense' && (
                        <td className="py-3 px-4 text-gray-700">
                          {'paidTo' in entry ? entry.paidTo : 'N/A'}
                        </td>
                      )}
                      <td className="py-3 px-4 text-gray-700">{entry.date}</td>
                      <td className="py-3 px-4 text-gray-700">{entry.note || pageTranslations.na}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(entry)}
                            disabled={isLoading}
                            className="text-[#007BFF] hover:text-[#0056b3] font-medium p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            title={pageTranslations.editButton}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteClick(entry)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 font-medium p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            title={pageTranslations.deleteButton}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'expense' ? 6 : 5} className="py-8 text-center text-gray-500">
                      {pageTranslations.noEntriesFound}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {pageTranslations.showing} {totalFilteredEntries > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} {pageTranslations.of} {Math.min(currentPage * itemsPerPage, totalFilteredEntries)} {pageTranslations.of} {totalFilteredEntries} {activeTab === 'income' ? pageTranslations.incomeEntries : pageTranslations.expenseEntries}
            </p>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                    page === currentPage ? 'bg-[#EB5757] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
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

      {/* Add/Edit Income Modal */}
      <AddEditIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        incomeEntryToEdit={selectedIncomeEntryForEdit}
        onSave={handleSaveIncomeEntry}
      />

      {/* Add/Edit Expense Modal */}
      <AddEditExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        expenseEntryToEdit={selectedExpenseEntryForEdit}
        onSave={handleSaveExpenseEntry}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteEntryModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleExecuteDelete}
        entryId={entryToDeleteDetails?.id || null}
        entryName={entryToDeleteDetails?.name || 'this entry'}
        type={entryToDeleteDetails?.type || activeTab}
      />
    </div>
  );
};

export default ExpenseIncome;

// src/pages/ExpenseIncome.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, BarChart, Plus, ChevronDown, Edit, Trash2, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';

// Import the new specific modals
import { ExpenseInterfaceImpl } from '@/data/interface-implementation/expense';
import { ExpenseInterface } from '@/domain/interfaces/income-expense/expense/ExpenseInterface';
import { DeleteExpenseUseCase, GetAllExpenseUseCase } from '@/data/usecases/expense.usecase';
import { Expense } from '@/domain/models/income-expense/expense/get-expense.dto';
import { IncomeInterfaceImpl } from '@/data/interface-implementation/income';
import { IncomeInterface } from '@/domain/interfaces/income-expense/income/IncomeInterface';
import { DeleteIncomeUseCase, GetAllIncomesUseCase } from '@/data/usecases/income.usecase';
import { Income } from '@/domain/models/income-expense/income/get-income.dto';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';
import ConfirmDeleteModal from '@/components/income-expense/ConfirmDeleteModal/ConfirmDeleteEntryModal';

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

const expenseInterface: ExpenseInterface = new ExpenseInterfaceImpl();
const incomeInterface: IncomeInterface = new IncomeInterfaceImpl();

const getAllExpenseUseCase = new GetAllExpenseUseCase(expenseInterface);
const getAllIncomeUseCase = new GetAllIncomesUseCase(incomeInterface);
const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseInterface);
const deleteIncomeUseCase = new DeleteIncomeUseCase(incomeInterface);

// --- Main ExpenseIncome Component ---
const ExpenseIncome = () => {
  
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entryToDeleteDetails, setEntryToDeleteDetails] = useState<{ id: string; name: string; type: 'income' | 'expense' } | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false); // Specific income modal
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); // Specific expense modal
  const [selectedIncomeEntryForEdit, setSelectedIncomeEntryForEdit] = useState<Income | null>(null); // Specific income edit
  const [selectedExpenseEntryForEdit, setSelectedExpenseEntryForEdit] = useState<Expense | null>(null); // Specific expense edit

  // NEW: Period selection states
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'day' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const { translations } = useLanguage();
  const pageTranslations = translations.expenseIncomePage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';


  useEffect(() => {
    const loadData = async () => {
    setIsLoading(true);
    try {
      const expensesResp = await getAllExpenseUseCase.execute();
      const incomesResp = await getAllIncomeUseCase.execute();
      setExpenses(Array.isArray(expensesResp) ? expensesResp : []);
      setIncomes(Array.isArray(incomesResp) ? incomesResp : []);
    } catch (e) {
      console.error('Failed to load income/expense:', e);
      setExpenses([]);
      setIncomes([]);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, [getAllExpenseUseCase, getAllIncomeUseCase]);

  // Calculate totals based on date-filtered entries (before search query)
  const totalIncome = incomes.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const totalNet = totalIncome - totalExpense;

  // Filter and paginate data based on active tab, search query, and date range
  const combinedFilteredEntries = useMemo(() => {
    let currentTabEntries = activeTab === 'income' ? incomes : expenses;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentTabEntries = currentTabEntries.filter(entry =>
        entry.title.toLowerCase().includes(lowerCaseQuery) ||
        entry.amount.toString().includes(lowerCaseQuery) ||
        entry.date.includes(lowerCaseQuery) ||
        entry.description.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return currentTabEntries;
  }, [activeTab, incomes, expenses, searchQuery]);

  // Paginated entries for display
  const displayedEntries = useMemo(() => {
    return combinedFilteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [combinedFilteredEntries, currentPage, ITEMS_PER_PAGE]);

  // Total count of entries after all filters
  const totalFilteredEntries = useMemo(() => {
    return combinedFilteredEntries.length;
  }, [combinedFilteredEntries]);

  const totalPages = Math.ceil(totalFilteredEntries / ITEMS_PER_PAGE);

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

  const handleOpenEditModal = (entry: Income | Expense) => {
    if (activeTab === 'income') {
      setSelectedIncomeEntryForEdit(entry as Income);
      setIsAddIncomeModalOpen(true);
    } else {
      setSelectedExpenseEntryForEdit(entry as Expense);
      setIsAddExpenseModalOpen(true);
    }
  };

  const handleConfirmDeleteClick = (entry: Income | Expense) => {
    setEntryToDeleteDetails({ id: entry._id, name: entry.title, type: activeTab });
    setIsDeleteConfirmModalOpen(true);
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
                  <th className="py-3 px-4 font-semibold">{activeTab === 'income' ? pageTranslations.incomeTitleColumn : pageTranslations.expenseTitleColumn}</th>
                  <th className="py-3 px-4 font-semibold">{pageTranslations.amountColumn}</th>
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
                    <tr key={entry._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{entry.title}</td>
                      <td className="py-3 px-4 text-gray-700">Ks. {entry.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-700">{entry.description}</td>
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
              {pageTranslations.showing} {totalFilteredEntries > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} {pageTranslations.of} {Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredEntries)} {pageTranslations.of} {totalFilteredEntries} {activeTab === 'income' ? pageTranslations.incomeEntries : pageTranslations.expenseEntries}
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

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        entryId={entryToDeleteDetails?.id || null}
        entryTitle={entryToDeleteDetails?.name || ''}
        entryType={entryToDeleteDetails?.type || 'income'}
        deleteUseCase={activeTab === 'income' ? deleteIncomeUseCase : deleteExpenseUseCase}
      />
    </div>
  );
};

export default ExpenseIncome;

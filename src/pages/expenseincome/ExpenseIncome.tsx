// src/pages/ExpenseIncome.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Plus, ChevronDown, Edit, Trash2, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';

// Import the new specific modals
import { ExpenseInterfaceImpl } from '@/data/interface-implementation/expense';
import { ExpenseInterface } from '@/domain/interfaces/income-expense/expense/ExpenseInterface';
import { CreateExpenseUseCase, DeleteExpenseUseCase, GetAllExpenseUseCase, GetExpenseByIdUseCase, UpdateExpenseUseCase } from '@/data/usecases/expense.usecase';
import { Expense } from '@/domain/models/income-expense/expense/get-expense.dto';
import { IncomeInterfaceImpl } from '@/data/interface-implementation/income';
import { IncomeInterface } from '@/domain/interfaces/income-expense/income/IncomeInterface';
import { CreateIncomeUseCase, DeleteIncomeUseCase, GetAllIncomesUseCase, GetIncomeByIdUseCase, UpdateIncomeUseCase } from '@/data/usecases/income.usecase';
import { Income } from '@/domain/models/income-expense/income/get-income.dto';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';
import ConfirmDeleteModal from '@/components/income-expense/ConfirmDeleteModal/ConfirmDeleteEntryModal';
import AddEntryModal from '@/components/income-expense/AddEntryModal/AddEntryModal';
import { EditEntryModal } from '@/components/income-expense/EditEntryModal/EditEntryModal';
import { error } from 'console';

const expenseInterface: ExpenseInterface = new ExpenseInterfaceImpl();
const incomeInterface: IncomeInterface = new IncomeInterfaceImpl();

const getAllExpenseUseCase = new GetAllExpenseUseCase(expenseInterface);
const getAllIncomeUseCase = new GetAllIncomesUseCase(incomeInterface);
const getExpenseByIdUseCase = new GetExpenseByIdUseCase(expenseInterface);
const getIncomeByIdUseCase = new GetIncomeByIdUseCase(incomeInterface);
const createExpenseUseCase = new CreateExpenseUseCase(expenseInterface);
const createIncomeUseCase = new CreateIncomeUseCase(incomeInterface);
const updateExpenseUseCase = new UpdateExpenseUseCase(expenseInterface);
const updateIncomeUseCase = new UpdateIncomeUseCase(incomeInterface);
const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseInterface);
const deleteIncomeUseCase = new DeleteIncomeUseCase(incomeInterface);

// Helper function to safely parse date strings
const parseDateStringToDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const DEFAULT_CATEGORIES: Record<'income' | 'expense', string[]> = {
  income: ['Product Sold', 'Investment'],
  expense: ['Supply Purchased', 'Salary', 'Food', 'Transport', 'Utilities']
};

// --- Main ExpenseIncome Component ---
const ExpenseIncome = () => {
  
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [entryToDeleteDetails, setEntryToDeleteDetails] = useState<{ id: string; name: string; type: 'income' | 'expense' } | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<Income | Expense | null>(null);
  const [showCreatedAlert, setShowCreatedAlert] = useState(false);
  const [showEditedAlert, setShowEditedAlert] = useState(false);
  const [showDeletedAlert, setShowDeletedAlert] = useState(false);
  // Categories derived from defaults + per-entry mapping
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({}); // entryId -> category
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // Removed header add-category input; creation happens in modal

  const { translations } = useLanguage();
  const pageTranslations = translations.expenseIncomePage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // LocalStorage helpers
  const mapKey = (type: 'income' | 'expense') => `ei:categoryMap:${type}`;
  const readJson = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  // Load mapping when tab changes
  useEffect(() => {
    const cmap = readJson<Record<string, string>>(mapKey(activeTab), {});
    setCategoryMap(cmap);
    setSelectedCategory('');
  }, [activeTab]);

  // Derived categories for filter: defaults + unique values from mapping (excluding empty/Other)
  const categories = useMemo(() => {
    const defaults = DEFAULT_CATEGORIES[activeTab] || [];
    const values = Object.values(categoryMap)
      .map((v) => (v || '').trim())
      .filter((v) => v.length > 0 && v.toLowerCase() !== 'other');
    const set = new Set<string>([...defaults, ...values]);
    return Array.from(set);
  }, [activeTab, categoryMap]);

  const reloadCategoryMap = useCallback(() => {
    const cmap = readJson<Record<string, string>>(mapKey(activeTab), {});
    setCategoryMap(cmap);
  }, [activeTab]);

  // Fetch initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const expensesResp = await getAllExpenseUseCase.execute();
        const incomesResp = await getAllIncomeUseCase.execute();
        setExpenses(expensesResp.reverse());
        setIncomes(incomesResp.reverse());
      } catch (e) {
        console.error("Failed to load income/expense:", e);
        setExpenses([]);
        setIncomes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals from the full, unfiltered data
  const totalIncome = useMemo(() => incomes.reduce((sum, entry) => sum + entry.amount, 0), [incomes]);
  const totalExpense = useMemo(() => expenses.reduce((sum, entry) => sum + entry.amount, 0), [expenses]);
  const totalNet = totalIncome - totalExpense;

  // Filter and paginate data based on active tab, search query, and date range
  const combinedFilteredEntries = useMemo(() => {
    let currentTabEntries = activeTab === 'income' ? [...incomes] : [...expenses];

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentTabEntries = currentTabEntries.filter(entry =>
        entry.title.toLowerCase().includes(lowerCaseQuery) ||
        entry.amount.toString().includes(lowerCaseQuery) ||
        entry.date.includes(lowerCaseQuery) ||
        entry.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Filter by selected month
    if (selectedMonth) {
      const [selYearStr, selMonthStr] = selectedMonth.split('-');
      const selYear = Number(selYearStr);
      // The month from a month input is 1-indexed (1-12)
      const selMonth = Number(selMonthStr) - 1; // Convert to 0-indexed (0-11) for Date object
      
      if (!Number.isNaN(selYear) && !Number.isNaN(selMonth)) {
        currentTabEntries = currentTabEntries.filter(entry => {
          const entryDate = parseDateStringToDate(entry.date);
          if (!entryDate) return false;
          return entryDate.getFullYear() === selYear && entryDate.getMonth() === selMonth;
        });
      }
    }
    // Filter by category from localStorage mapping
    if (selectedCategory) {
      currentTabEntries = currentTabEntries.filter(entry => categoryMap[entry._id] === selectedCategory);
    }
    return currentTabEntries;
  }, [activeTab, incomes, expenses, searchQuery, selectedMonth, selectedCategory, categoryMap]);

  // Paginated entries for display
  const displayedEntries = useMemo(() => {
    return combinedFilteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [combinedFilteredEntries, currentPage]);

  // Total count of entries after all filters
  const totalFilteredEntries = combinedFilteredEntries.length;
  const totalPages = Math.ceil(totalFilteredEntries / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const refetchExpenses = async () => {
    try {
      const data = await getAllExpenseUseCase.execute();
      setExpenses(data.reverse());
    } catch (e) {
      console.error('Refetch expenses failed', e);
    }
  };
  const refetchIncomes = async () => {
    try {
      const data = await getAllIncomeUseCase.execute();
      setIncomes(data.reverse());
    } catch (e) {
      console.error('Refetch incomes failed', e);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddEntryModalOpen(true);
  };

  const handleOpenEditModal = (entry: Expense | Income) => {
    setSelectedEntryForEdit(entry);
    setIsEditEntryModalOpen(true);
  };

  const handleConfirmDeleteClick = (entry: Income | Expense) => {
    setEntryToDeleteDetails({ id: entry._id, name: entry.title, type: activeTab });
    setIsDeleteConfirmModalOpen(true);
  };

  // Category mapping is assigned at creation time via modal; here we only display

  // Handler for month input change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1); // Reset to the first page when the filter changes
  };

  if (isLoading) return <div className="text-center py-8">{translations.common.loading}...</div>;

  return (
    <div className="font-sans antialiased text-gray-800">
      {showCreatedAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {pageTranslations.createSuccessfully || '{entryType} Created'}
        </div>
      )}
      {showEditedAlert && (                                        
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {pageTranslations.editSuccessfully || '{entryType} Updated'}
        </div>
      )}
      {showDeletedAlert && (
        <div className="fixed top-34 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {pageTranslations.deleteSuccessfully || '{entryType} Deleted'}
        </div>
      )}
      <div className="space-y-4">
        {/* Main Content Area: Tabs, Controls, Table */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Tabs and Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 space-x-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab('income');
                  setCurrentPage(1); // Reset page on tab change
                  setSelectedMonth(''); // Clear month filter on tab change
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'income' ? 'bg-[#EB5757] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                `}
              >
                {pageTranslations.incomeTab}
              </button>
              <button
                onClick={() => {
                  setActiveTab('expense');
                  setCurrentPage(1); // Reset page on tab change
                  setSelectedMonth(''); // Clear month filter on tab change
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'expense' ? 'bg-[#EB5757] text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                `}
              >
                {pageTranslations.expenseTab}
              </button>
            </div>

            {/* Sort by and Add New Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48"
                title="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                title="Filter by month"
              />
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
                  <th className="py-3 px-4 font-semibold">{pageTranslations.categoryColumn}</th>
                  <th className="py-3 px-4 font-semibold">{pageTranslations.noteColumn}</th>
                  <th className="py-3 px-4 font-semibold text-center">{pageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {totalFilteredEntries === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                      {selectedMonth
                        ? (activeTab === 'income'
                            ? 'No income entries found for the selected month.'
                            : 'No expense entries found for the selected month.')
                        : (activeTab === 'income'
                            ? 'No income entries found.'
                            : 'No expense entries found.')}
                    </td>
                  </tr>
                ) : (
                  displayedEntries.map(entry => (
                    <tr key={entry._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{entry.title}</td>
                      <td className="py-3 px-4 text-gray-700">Ks. {entry.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-700">{categoryMap[entry._id] || 'Uncategorized'}</td>
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
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex justify-center items-center gap-2">
              {/* Jump to first */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {(() => {
                const last = totalPages;
                const pages: (number | 'ellipsis')[] = [];
                if (last <= 7) {
                  for (let i = 1; i <= last; i++) pages.push(i);
                } else {
                  const start = Math.max(2, currentPage - 2);
                  const end = Math.min(last - 1, currentPage + 2);
                  pages.push(1);
                  if (start > 2) pages.push('ellipsis');
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < last - 1) pages.push('ellipsis');
                  pages.push(last);
                }
                return pages.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-500">…</span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      onClick={() => handlePageChange(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                        item === currentPage
                          ? 'bg-[#EB5757] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalFilteredEntries === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Jump to last */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalFilteredEntries === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-600 min-w-[90px] text-right">
              Page {totalPages > 0 ? currentPage : 0} of {totalPages || 0}
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
        onUpdate={activeTab === 'income' ? refetchIncomes : refetchExpenses}
      />

      <AddEntryModal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        entryType={activeTab}
        useCase={activeTab === 'income' ? createIncomeUseCase : createExpenseUseCase}
        setShowCreatedAlert={setShowCreatedAlert}
        onUpdate={async () => {
          if (activeTab === 'income') await refetchIncomes(); else await refetchExpenses();
          reloadCategoryMap();
        }}
      />

      <EditEntryModal
        isOpen={isEditEntryModalOpen}
        onClose={() => setIsEditEntryModalOpen(false)}
        entryId={selectedEntryForEdit?._id || null}
        entry={selectedEntryForEdit || null}
        entryType={activeTab}
        useCase={activeTab === 'income' ? updateIncomeUseCase : updateExpenseUseCase}
        showEditAlert={setShowEditedAlert}
        translations={pageTranslations}
        onUpdated={async () => {
          if (activeTab === 'income') await refetchIncomes(); else await refetchExpenses();
          reloadCategoryMap();
        }}
      />
    </div>
  );
};

export default ExpenseIncome;
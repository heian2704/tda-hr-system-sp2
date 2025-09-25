// src/pages/ExpenseIncome.tsx
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Plus, ChevronDown, Edit, Trash2, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
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

  const { translations } = useLanguage();
  const pageTranslations = translations.expenseIncomePage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

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
    return currentTabEntries;
  }, [activeTab, incomes, expenses, searchQuery, selectedMonth]);

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

  // Handler for month input change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1); // Reset to the first page when the filter changes
  };

  if(isLoading || displayedEntries.length === 0) return <div className="text-center py-8">{translations.common.loading}...</div>;

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
                  <th className="py-3 px-4 font-semibold">{pageTranslations.noteColumn}</th>
                  <th className="py-3 px-4 font-semibold text-center">{pageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {displayedEntries.map(entry => (
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
                  ))}
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
                disabled={currentPage === totalPages || totalFilteredEntries === 0}
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
        onUpdate={activeTab === 'income' ? refetchIncomes : refetchExpenses}
      />

      <AddEntryModal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        entryType={activeTab}
        useCase={activeTab === 'income' ? createIncomeUseCase : createExpenseUseCase}
        setShowCreatedAlert={setShowCreatedAlert}
        onUpdate={activeTab === 'income' ? refetchIncomes : refetchExpenses}
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
        onUpdated={activeTab === 'income' ? refetchIncomes : refetchExpenses}
      />
    </div>
  );
};

export default ExpenseIncome;
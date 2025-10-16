import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Calendar,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { WorklogDto } from '@/dtos/worklogs/worklogs.dto';
import { AddWorkLogModal } from '@/components/worklog/addworklogmodal/AddWorkLogModal';
import { ConfirmDeleteModal } from '@/components/worklog/delete-worklog/DeleteWorklogModal';
import { WorklogInterface } from '@/domain/interfaces/worklog/WorklogInterface';
import { WorklogInterfaceImpl } from '@/data/interface-implementation/worklog';
import {
  CreateWorklogUseCase,
  DeleteWorklogUseCase,
  GetAllWorklogUseCase,
  GetWorklogByIdUseCase,
  GetWorklogsByEmployeeIdUseCase,
  UpdateWorklogUseCase
} from '@/data/usecases/worklog.usecase';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { ProductInterface } from '@/domain/interfaces/product/ProductInterface';
import { ProductInterfaceImpl } from '@/data/interface-implementation/product';
import { GetAllEmployeeUseCase, GetEmployeeByIdUseCase } from '@/data/usecases/employee.usecase';
import { GetAllProductsUseCase } from '@/data/usecases/product.usecase';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';
import { UpdateWorklogDto } from '@/domain/models/worklog/update-worklog.dto';
import EditWorkLogModal from '@/components/worklog/editworklogmodal/EditWorklogModal';
import { Worklog } from '@/domain/models/worklog/get-worklog.dto';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

// Simple localStorage cache with TTL
const WL_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const wlGetCache = <T = unknown>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const { ts, data } = parsed as { ts: number; data: T };
    if (typeof ts !== 'number') return null;
    if (Date.now() - ts > WL_CACHE_TTL_MS) return null;
    return data ?? null;
  } catch {
    return null;
  }
};
const wlSetCache = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore quota
  }
};
const wlDelCache = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
};
 
// Use case instances
const worklogInterface: WorklogInterface = new WorklogInterfaceImpl();
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const productInterface: ProductInterface = new ProductInterfaceImpl();
 
const getAllWorklogUseCase = new GetAllWorklogUseCase(worklogInterface);
const getWorklogByEmployeeIdUseCase = new GetWorklogsByEmployeeIdUseCase(worklogInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(employeeInterface);
const getAllProductsUseCase = new GetAllProductsUseCase(productInterface);
const createWorklogUseCase = new CreateWorklogUseCase(worklogInterface);
const updateWorklogUseCase = new UpdateWorklogUseCase(worklogInterface);
const deleteWorklogUseCase = new DeleteWorklogUseCase(worklogInterface);
 
const WorkLog = () => {
  // MMK formatter: "Ks. 000,000" without decimals
  const formatMMK = useCallback((n: number | null | undefined) => {
    const safe = typeof n === 'number' && isFinite(n) ? n : 0;
    return `Ks. ${safe.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }, []);

  const [allWorklogs, setAllWorklogs] = useState<Worklog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [deleteWorklogId, setDeleteWorklogId] = useState<{ id: string } | null>(null);
  const [worklogId, setWorklogId] = useState<string | null>(null);
  const [selectedWorkLogForEdit, setSelectedWorkLogForEdit] = useState<UpdateWorklogDto | undefined>(undefined);
  const [workLogs, setWorkLogs] = useState<WorklogDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreatedAlert, setShowCreatedAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
 
  // State for sorting and dropdown
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'date' | 'quantity' | 'fullname'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
 
  // Search and Date Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
 
  const { translations } = useLanguage();
  const workLogPageTranslations = translations.workLogPage;
 
  // Hybrid data fetch - loads all data initially for filtering, but uses pagination for display
  const fetchAllWorklogs = async (page: number = 1, bypassCache: boolean = false) => {
    setLoading(true);
    try {
      // First, get all worklogs to enable proper filtering
      let allPages: Worklog[] = [];
      if (!bypassCache) {
        const cached = wlGetCache<Worklog[]>('worklog:all');
        if (cached) allPages = cached;
      }
      if (allPages.length === 0) {
        let currentPageNum = 1;
        let hasMore = true;
        while (hasMore) {
          const worklogsPage = await getAllWorklogUseCase.execute(
            ITEMS_PER_PAGE,
            currentPageNum
          );
          const pageData = worklogsPage?.data ?? [];
          allPages = [...allPages, ...pageData];
          if (pageData.length < ITEMS_PER_PAGE || currentPageNum >= (worklogsPage?.totalPages ?? 0)) {
            hasMore = false;
          }
          currentPageNum++;
        }
        wlSetCache('worklog:all', allPages);
      }
 
      setAllWorklogs(allPages);
 
      // Fetch employees and products
      let employeesData: Employee[] = [];
      if (!bypassCache) {
        const cachedEmps = wlGetCache<Employee[]>('worklog:employees');
        if (cachedEmps) employeesData = cachedEmps;
      }
      if (employeesData.length === 0) {
        const employeesResult = await getAllEmployeeUseCase.execute(1000, 1); // adjust page size as needed
        employeesData = employeesResult.data || [];
        wlSetCache('worklog:employees', employeesData);
      }
      const employeesMap = new Map(employeesData.map(e => [e._id, e] as const));
 
      // Fetch missing employees by ID
      const uniqueEmployeeIds = Array.from(new Set(allPages.map(w => w.employeeId)));
      const missingIds = uniqueEmployeeIds.filter(id => !employeesMap.has(id));
      const token = localStorage.getItem('token') || '';
      const fetchedMissing: Employee[] = [];
      
      if (missingIds.length > 0) {
        await Promise.all(
          missingIds.map(async (id) => {
            try {
              const emp = await getEmployeeByIdUseCase.execute({ id, token });
              if (emp) {
                employeesMap.set(emp._id, emp);
                fetchedMissing.push(emp);
              }
            } catch (e) {
              console.error('Failed to fetch employee by id', id, e);
            }
          })
        );
        // Update cache with newly fetched employees
        const merged = [...employeesData, ...fetchedMissing];
        wlSetCache('worklog:employees', merged);
      }
 
      let productsList: Product[] = [];
      if (!bypassCache) {
        const cachedProducts = wlGetCache<Product[]>('worklog:products');
        if (cachedProducts) productsList = cachedProducts;
      }
      if (productsList.length === 0) {
        productsList = await getAllProductsUseCase.execute();
        wlSetCache('worklog:products', productsList);
      }
      const productsMap = new Map(productsList.map(p => [p._id, p] as const));
 
      setEmployees([...employeesData, ...fetchedMissing]);
      setProducts(productsList);
 
      // Convert all worklogs to DTOs for processing
      const fullWorklogInfoList = allPages.map((log) => {
        const employee = employeesMap.get(log.employeeId);
        const product = productsMap.get(log.productId);
        return {
          _id: log._id,
          employeeId: log.employeeId,
          productId: log.productId,
          fullname: employee ? employee.name : "Unknown Employee",
          position: employee ? employee.position : "Unknown Position",
          productName: product ? product.name : "Unknown Product",
          quantity: log.quantity,
          totalPrice: log.totalPrice,
          updatedAt: log.updatedAt,
        } as WorklogDto;
      });
 
      setWorkLogs(fullWorklogInfoList);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching work logs:", error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    void fetchAllWorklogs(1);
  }, []);
 
  // Handle search by employee name
  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.toLowerCase();
    if (!trimmedQuery) {
      // If no search query, reload all data
      await fetchAllWorklogs(1);
      return;
    }
 
    // Filter current worklogs by employee name
    const filtered = workLogs.filter(log =>
      log.fullname?.toLowerCase().includes(trimmedQuery)
    );
    
    // If we have results from current data, use them
    if (filtered.length > 0) {
      // Calculate pagination for filtered results
      const filteredTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      setTotalPages(filteredTotalPages);
      setCurrentPage(1);
      return;
    }
 
    // Otherwise, fetch by employee ID
    try {
      const employees = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, 1, trimmedQuery);
      const employeeData = employees.data || [];
      
      if (employeeData.length > 0) {
        const employeeId = employeeData[0]._id;
        const worklogs = await getWorklogByEmployeeIdUseCase.execute(employeeId);
        const worklogsData = worklogs || [];
        
        const filteredWorklogs = worklogsData.map(log => {
          const employee = employeeData.find(e => e._id === log.employeeId);
          const product = products.find(p => p._id === log.productId);
          return {
            _id: log._id,
            employeeId: log.employeeId,
            productId: log.productId,
            fullname: employee ? employee.name : "Unknown Employee",
            position: employee ? employee.position : "Unknown Position",
            productName: product ? product.name : "Unknown Product",
            quantity: log.quantity,
            totalPrice: log.totalPrice,
            updatedAt: log.updatedAt,
          } as WorklogDto;
        });
 
        setWorkLogs(filteredWorklogs);
        setTotalPages(Math.ceil(worklogsData.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error searching worklogs:', error);
    }
  }, [workLogs, products]);
 
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
  // Apply search, date filter, and sorting
  const filteredAndSortedWorkLogs = useMemo(() => {
    let filtered = [...workLogs];
 
    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((w) => {
        const date = w.updatedAt ? new Date(w.updatedAt) : null;
        const iso = date ? format(date, 'yyyy-MM-dd') : "";
        const dmy = date ? format(date, 'dd/MM/yyyy') : "";
        
        return (
          w.fullname?.toLowerCase().includes(q) ||
          w.position?.toLowerCase().includes(q) ||
          w.productName?.toLowerCase().includes(q) ||
          String(w.quantity).includes(q) ||
          String(w.totalPrice).includes(q) ||
          iso.includes(q) ||
          dmy.includes(q)
        );
      });
    }
 
    // Apply date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((w) => {
        if (!w.updatedAt) return false;
        
        const logDate = typeof w.updatedAt === 'string' ? parseISO(w.updatedAt) : w.updatedAt;
        let isInRange = true;
 
        if (dateFilter.startDate && dateFilter.endDate) {
          const start = startOfDay(parseISO(dateFilter.startDate));
          const end = endOfDay(parseISO(dateFilter.endDate));
          isInRange = isWithinInterval(logDate, { start, end });
        } else if (dateFilter.startDate) {
          const start = startOfDay(parseISO(dateFilter.startDate));
          isInRange = logDate >= start;
        } else if (dateFilter.endDate) {
          const end = endOfDay(parseISO(dateFilter.endDate));
          isInRange = logDate <= end;
        }
 
        return isInRange;
      });
    }
 
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === "date") {
        const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return sortDirection === "asc" ? at - bt : bt - at;
      }
      if (sortField === "quantity") {
        return sortDirection === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
      }
      // fullname
      const cmp = (a.fullname ?? "").localeCompare(b.fullname ?? "");
      return sortDirection === "asc" ? cmp : -cmp;
    });
 
    return filtered;
  }, [workLogs, searchQuery, dateFilter, sortField, sortDirection]);
 
  // Calculate pagination for filtered results
  const paginatedWorkLogs = useMemo(() => {
    const totalFiltered = filteredAndSortedWorkLogs.length;
    const calculatedTotalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
    setTotalPages(calculatedTotalPages);
 
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedWorkLogs.slice(startIndex, endIndex);
  }, [filteredAndSortedWorkLogs, currentPage]);
 
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
 
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };
 
  const handleOpenEditModal = (workLog: WorklogDto) => {
    const workLogToEdit: UpdateWorklogDto = {
      employeeId: workLog.employeeId,
      productId: workLog.productId,
      quantity: workLog.quantity
    };
    setWorklogId(workLog._id);
    setSelectedWorkLogForEdit(workLogToEdit);
    setIsEditModalOpen(true);
  };
 
  const handleConfirmDeleteClick = (workLog: WorklogDto) => {
    setDeleteWorklogId({ id: workLog._id });
    setIsDeleteConfirmModalOpen(true);
  };
 
  const handleSortChange = (field: 'date' | 'quantity' | 'fullname') => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setIsSortDropdownOpen(false);
  };
 
  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };
 
  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };
 
  const hasDateFilter = dateFilter.startDate || dateFilter.endDate;
 
  if (loading) return <div className="text-center py-8">{translations.common.loading}...</div>;
 
  return (
    <div className="font-sans antialiased text-gray-800">
      {showCreatedAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {workLogPageTranslations.createdSuccessfully || 'Worklog Created'}
        </div>
      )}
      {showEditAlert && (                                        
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {workLogPageTranslations.updatedSuccessfully || 'Worklog Updated'}
        </div>
      )}
      <div className="space-y-4">
        {/* Table Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">{workLogPageTranslations.workLogsTitle}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={workLogPageTranslations.searchPlaceholder || "Search employees..."}
                  className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
 
              {/* Date Filter Dropdown */}
              <div className="relative" ref={dateFilterRef}>
                <button
                  onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                  className={`flex items-center justify-between px-4 py-2 border rounded-lg text-sm cursor-pointer w-full sm:w-auto ${
                    hasDateFilter ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {hasDateFilter ? 'Date Filtered' : 'Date Filter'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {isDateFilterOpen && (
                  <div className="absolute mt-1 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </div>
                      {hasDateFilter && (
                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={clearDateFilter}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Clear Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
 
              {/* Sort By Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer w-full sm:w-auto"
                >
                  <span className="text-sm text-gray-700">{workLogPageTranslations.sortBy}</span>
                  <span className="font-semibold text-gray-900 ml-2">
                    {sortField === 'date' && workLogPageTranslations.date}
                    {sortField === 'quantity' && workLogPageTranslations.quantityColumn}
                    {sortField === 'fullname' && workLogPageTranslations.fullNameColumn}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <button
                      onClick={() => handleSortChange('date')}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'date' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {workLogPageTranslations.date} {sortField === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                    <button
                      onClick={() => handleSortChange('quantity')}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'quantity' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {workLogPageTranslations.quantityColumn} {sortField === 'quantity' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                    <button
                      onClick={() => handleSortChange('fullname')}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'fullname' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {workLogPageTranslations.fullNameColumn} {sortField === 'fullname' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#EB5757] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                {workLogPageTranslations.addNewWorkLog}
              </button>
            </div>
          </div>
 
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.fullNameColumn}</th>
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.roleColumn}</th>
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.productNameColumn}</th>
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.quantityColumn}</th>
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.totalPriceColumn}</th>
                  <th className="py-3 px-4 font-semibold">{workLogPageTranslations.date}</th>
                  <th className="py-3 px-4 font-semibold text-center">{workLogPageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      {workLogPageTranslations.noData || 'No work logs found'}
                    </td>
                  </tr>
                ) : (
                  paginatedWorkLogs.map(log => (
                    <tr key={log._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{log.fullname}</td>
                      <td className="py-3 px-4 text-gray-700">{log.position}</td>
                      <td className="py-3 px-4 text-gray-700">{log.productName}</td>
                      <td className="py-3 px-4 text-gray-700">{log.quantity}</td>
                      <td className="py-3 px-4 text-gray-700">{formatMMK(log.totalPrice as number)}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {log.updatedAt
                          ? format(
                              typeof log.updatedAt === 'string'
                                ? parseISO(log.updatedAt)
                                : log.updatedAt,
                              'dd/MM/yyyy'
                            )
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(log)}
                            className="text-[#007BFF] hover:text-[#0056b3] font-medium p-1 rounded-full hover:bg-gray-100"
                            title={workLogPageTranslations.editButton}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteClick(log)}
                            className="text-red-500 hover:text-red-700 font-medium p-1 rounded-full hover:bg-gray-100"
                            title={workLogPageTranslations.deleteButton}
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
            <div />
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
                const pages: (number | 'ellipsis')[] = [];
                const last = totalPages;
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Jump to last */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
            {/* Page summary label */}
            <div className="text-sm text-gray-600 min-w-[90px] text-right">
              Page {totalPages > 0 ? currentPage : 0} of {totalPages || 0}
            </div>
          </div>
        </div>
      </div>
 
      {/* Add Work Log Modal */}
      <AddWorkLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        employees={employees}
        products={products}
        createWorklogUseCase={createWorklogUseCase}
        setShowCreatedAlert={setShowCreatedAlert}
        onUpdate={() => { wlDelCache('worklog:all'); wlDelCache('worklog:employees'); wlDelCache('worklog:products'); void fetchAllWorklogs(currentPage, true); }}
      />
 
      <EditWorkLogModal
        worklogid={worklogId}
        workLogToEdit={selectedWorkLogForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employees={employees}
        products={products}
        updateWorklogUseCase={updateWorklogUseCase}
        setShowEditAlert={setShowEditAlert}
        onUpdate={() => { wlDelCache('worklog:all'); void fetchAllWorklogs(currentPage, true); }}
      />
 
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        workLogId={deleteWorklogId?.id || null}
        deleteWorklogUseCase={deleteWorklogUseCase}
        onUpdate={() => { wlDelCache('worklog:all'); void fetchAllWorklogs(currentPage, true); }}
      />
    </div>
  );
};
 
export default WorkLog;
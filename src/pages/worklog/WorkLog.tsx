import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  ChevronDown, 
  Edit, 
  Trash2,
  ChevronLeft, 
  ChevronRight,
  Search
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
// TokenedRequest type is inferred inline when calling the use case
import { Worklog } from '@/domain/models/worklog/get-worklog.dto';
import { get } from 'http';
import { set } from 'date-fns';
// (no date-fns imports)

// use get all worklogs hook
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
  const [initworklogs, setInitWorklogs] = useState<Worklog[]>([]);
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

  // New state for sorting and dropdown - Consistent with Employee page
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'date' | 'quantity' | 'fullname'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const { translations } = useLanguage();
  const workLogPageTranslations = translations.workLogPage;

  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllWorklogs = async (page: number) => {
    setLoading(true);
    try {
      const freshWorklogsPage = await getAllWorklogUseCase.execute(
        ITEMS_PER_PAGE,
        page
      );
      const freshWorklogs = freshWorklogsPage?.data ?? [];
      console.log("Fetched worklogs:", freshWorklogs);
      if (!Array.isArray(freshWorklogs) || freshWorklogs.length === 0) {
        setWorkLogs([]); // Set empty array if no worklogs
        setTotalPages(freshWorklogsPage?.totalPages ?? 0);
        setCurrentPage(page);
        return;
      }

      setInitWorklogs(freshWorklogs);

      // Start with current page of employees
      const employeesPage = await getAllEmployeeUseCase.execute(
        ITEMS_PER_PAGE,
        page
      );
      const employeesData = employeesPage.data || [];
      const employeesMap = new Map(employeesData.map(e => [e._id, e] as const));

      // Fetch any employees not present on the page by ID so names show up
      const uniqueEmployeeIds = Array.from(new Set(freshWorklogs.map(w => w.employeeId)));
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
      }

      const products = await getAllProductsUseCase.execute();
      const productsMap = new Map(products.map(p => [p._id, p] as const));

      const fullWorklogInfoList = freshWorklogs.map((log) => {
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

      setEmployees([...employeesData, ...fetchedMissing]);
      setProducts(products);
      setWorkLogs(fullWorklogInfoList);
      setTotalPages(freshWorklogsPage.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching work logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchAllWorklogs(currentPage);
  }, [currentPage]);

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.toLowerCase();
    if(!trimmedQuery) return null;

    const employees = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, 1, trimmedQuery);
    const employeeData = employees.data || [];
    const employeeId = employeeData[0]?._id;
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

    if(worklogs.length > 10) {
      setTotalPages(worklogs.length / ITEMS_PER_PAGE);
    }
    else {
      setTotalPages(1);
    }

    setWorkLogs(filteredWorklogs);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortDropdownRef]);

  const filteredWorkLogs = useMemo(() => {
    let list = workLogs;
    if (!searchQuery) return list;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((w) => {
        const date = w.updatedAt ? new Date(w.updatedAt) : null;
        const iso = date ? date.toISOString().slice(0, 10) : "";
        const dmy = date
          ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
          : "";
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
    return list;
  }, [workLogs, searchQuery]);

  const sortedWorkLogs = useMemo(() => {
    const arr = [...filteredWorkLogs];
    arr.sort((a, b) => {
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
    return arr;
  }, [filteredWorkLogs, sortField, sortDirection]);


  useEffect(() => {
    setCurrentPage(currentPage);
  }, [searchQuery, sortField, sortDirection, currentPage]); // Reset page when search or sort changes

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
              {/* Sort By Dropdown - Consistent with Employee page */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer w-full sm:w-auto"
                >
                  <span className="font-medium text-gray-700">{workLogPageTranslations.sortBy}</span>
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
                  <th className="py-3 px-4 font-semibold text-center">{workLogPageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {sortedWorkLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      {workLogPageTranslations.noData || 'No work logs found'}
                    </td>
                  </tr>
                ) : (
                sortedWorkLogs.map(log => (
                      <tr key={log._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{log.fullname}</td>
                        <td className="py-3 px-4 text-gray-700">{log.position}</td>
                        <td className="py-3 px-4 text-gray-700">{log.productName}</td>
                        <td className="py-3 px-4 text-gray-700">{log.quantity}</td>
                        <td className="py-3 px-4 text-gray-700">{log.totalPrice}</td>
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
        onUpdate={() => { void fetchAllWorklogs(currentPage); }}
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
        onUpdate={() => { void fetchAllWorklogs(currentPage); }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        workLogId={deleteWorklogId?.id || null}
        deleteWorklogUseCase={deleteWorklogUseCase}
        onUpdate={() => { void fetchAllWorklogs(currentPage); }}
      />
    </div>
  );
};

export default WorkLog;
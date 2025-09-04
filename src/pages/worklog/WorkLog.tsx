import { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  Plus, 
  ChevronDown, 
  Edit, 
  Trash2,
  ChevronLeft, 
  ChevronRight, 
  Box 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { worklogData } from '@/dtos/worklog/worklogData';
import { AddWorkLogModal } from '@/components/worklog/addworklogmodal/AddWorkLogModal';
import { ConfirmDeleteModal } from '@/components/worklog/delete-worklog/DeleteWorklogModal';
import { WorklogInterface } from '@/domain/interfaces/worklog/WorklogInterface';
import { WorklogInterfaceImpl } from '@/data/interface-implementation/worklog';
import { 
  CreateWorklogUseCase, 
  DeleteWorklogUseCase, 
  GetAllWorklogUseCase, 
  UpdateWorklogUseCase 
} from '@/data/usecases/worklog.usecase';
import { useGetAllWorklogs } from '@/hooks/worklog/get-all-worklog.hook';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { ProductInterface } from '@/domain/interfaces/product/ProductInterface';
import { ProductInterfaceImpl } from '@/data/interface-implementation/product';
import { GetAllEmployeeUseCase } from '@/data/usecases/employee.usecase';
import { GetAllProductsUseCase } from '@/data/usecases/product.usecase';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';
import { UpdateWorklogDto } from '@/domain/models/worklog/update-worklog.dto';
import EditWorkLogModal from '@/components/worklog/editworklogmodal/EditWorklogModal';

// use get all worklogs hook
const worklogInterface: WorklogInterface = new WorklogInterfaceImpl();
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const productInterface: ProductInterface = new ProductInterfaceImpl();

const getAllWorklogUseCase = new GetAllWorklogUseCase(worklogInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllProductsUseCase = new GetAllProductsUseCase(productInterface);
const createWorklogUseCase = new CreateWorklogUseCase(worklogInterface);
const updateWorklogUseCase = new UpdateWorklogUseCase(worklogInterface);
const deleteWorklogUseCase = new DeleteWorklogUseCase(worklogInterface);

interface WorkLogProps {
  currentPath?: string;
}

const WorkLog = ({ currentPath }: WorkLogProps) => {
  const { worklogs, error, loading } = useGetAllWorklogs(getAllWorklogUseCase);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [deleteWorklogId, setDeleteWorklogId] = useState<{ id: string } | null>(null);
  const [worklogId, setWorklogId] = useState<string | null>(null);
  const [selectedWorkLogForEdit, setSelectedWorkLogForEdit] = useState<UpdateWorklogDto | undefined>(undefined);
  const [workLogs, setWorkLogs] = useState<worklogData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]); 
  const [showCreatedAlert, setShowCreatedAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);

  // New state for sorting and dropdown - Consistent with Employee page
  const [sortField, setSortField] = useState<'date' | 'quantity' | 'fullname'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);


  const { translations } = useLanguage();
  const workLogPageTranslations = translations.workLogPage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const refetchWorklogs = async () => {
    try {
      // fetch latest worklogs
      const freshWorklogs = await getAllWorklogUseCase.execute();
      if (!Array.isArray(freshWorklogs) || freshWorklogs.length === 0) {
        setWorkLogs([]);
        return;
      }

      // ensure we have employees & products
      const [employeesResp, productsResp] = await Promise.all([
        getAllEmployeeUseCase.execute(),
        getAllProductsUseCase.execute()
      ]);

      const fullWorklogInfoList = (freshWorklogs || []).map(log => {
        const employee = Array.isArray(employeesResp) ? employeesResp.find((emp: Employee) => emp._id === log.employeeId) : undefined;
        const product = Array.isArray(productsResp) ? productsResp.find((prod: Product) => prod._id === log.productId) : undefined;

        return {
          _id: log._id,
          employeeId: log.employeeId,
          productId: log.productId,
          fullname: employee ? employee.name : 'Unknown Employee',
          position: employee ? employee.position : 'Unknown Position',
          productName: product ? product.name : 'Unknown Product',
          quantity: log.quantity,
          totalPrice: log.totalPrice,
          updatedAt: log.updatedAt,
        } as worklogData;
      });

      setEmployees(Array.isArray(employeesResp) ? employeesResp : []);
      setProducts(Array.isArray(productsResp) ? productsResp : []);
      setWorkLogs(fullWorklogInfoList);
    } catch (err) {
      console.error('Refetch worklogs failed:', err);
    }
  };

  useEffect(() => {
    const fetchAllWorklogs = async () => {
      try {
        if (loading || error) {
          return;
        }

        if (worklogs.length === 0) {
          setWorkLogs([]); // Set empty array if no worklogs
          return;
        }
        const employees = await getAllEmployeeUseCase.execute();
        const products = await getAllProductsUseCase.execute();

        const fullWorklogInfoList = worklogs.map(log => {
          const employee = employees.find(emp => emp._id === log.employeeId);
          const product = products.find(prod => prod._id === log.productId);

          return {
            _id: log._id,
            employeeId: log.employeeId,
            productId: log.productId,
            fullname: employee ? employee.name : 'Unknown Employee',
            position: employee ? employee.position : 'Unknown Position',
            productName: product ? product.name : 'Unknown Product',
            quantity: log.quantity,
            totalPrice: log.totalPrice,
            updatedAt: log.updatedAt,
          } as worklogData;
        });

        setEmployees(employees);
        setProducts(products);
        setWorkLogs(fullWorklogInfoList);
      } catch (error) {
        console.error('Error fetching work logs:', error);
      }
    };

    fetchAllWorklogs();
  }, [worklogs, loading, error]);

  // Handle clicks outside the dropdown to close it
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

  // Filter work logs based on search query
  const filteredWorkLogs = workLogs.filter(log => {
    const matchesSearchQuery =
      log.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.quantity.toString().includes(searchQuery) ||
      log.totalPrice.toString().includes(searchQuery);
    return matchesSearchQuery;
  });

  // Sort filtered worklogs based on sortOption
  const sortedWorkLogs = [...filteredWorkLogs].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'date':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case 'fullname':
        aValue = a.fullname.toLowerCase();
        bValue = b.fullname.toLowerCase();
        break;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalWorkLogs = sortedWorkLogs.length;
  const totalQuantityProduced = sortedWorkLogs.reduce((sum, log) => sum + log.quantity, 0);
  const totalCompletedWorklogs = sortedWorkLogs.length;

  const totalPages = Math.ceil(totalWorkLogs / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWorkLogs = sortedWorkLogs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection]); // Reset page when search or sort changes

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (workLog: worklogData) => {
    const workLogToEdit: UpdateWorklogDto = {
      employeeId: workLog.employeeId,
      productId: workLog.productId,
      quantity: workLog.quantity
    };
    setWorklogId(workLog._id);
    setSelectedWorkLogForEdit(workLogToEdit);
    setIsEditModalOpen(true);
  };

  const handleConfirmDeleteClick = (workLog: worklogData) => {
    setDeleteWorklogId({ id: workLog._id });
    setIsDeleteConfirmModalOpen(true);
  };

  // New handler for sort option change
  const handleSortChange = (field: 'date' | 'quantity' | 'fullname') => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setIsSortDropdownOpen(false); // Close dropdown after selection
  };

  const displaySortValue = {
    'date': workLogPageTranslations.date,
    'quantity': workLogPageTranslations.quantityColumn,
    'fullname': workLogPageTranslations.fullNameColumn,
  }[sortField];

  if (loading || currentWorkLogs.length === 0) return <div className="text-center py-8">{translations.common.loading}...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{translations.common.error}: {error}</div>;

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
        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-evenly gap-4 md:gap-6 shadow-sm">
          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ClipboardList className="text-red-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{workLogPageTranslations.totalWorkLogs}</p>
              <p className="text-3xl font-bold mt-1">{totalWorkLogs}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ClipboardList className="text-green-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{workLogPageTranslations.totalCompletedWorklogs}</p>
              <p className="text-3xl font-bold mt-1">{totalCompletedWorklogs}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Box className="text-blue-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{workLogPageTranslations.totalQuantityProduced}</p>
              <p className="text-3xl font-bold mt-1">{totalQuantityProduced.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">{workLogPageTranslations.workLogsTitle}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
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
                  <th className="py-3 px-4 font-semibold text-center">{workLogPageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {currentWorkLogs.map(log => (
                      <tr key={log._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{log.fullname}</td>
                        <td className="py-3 px-4 text-gray-700">{log.position}</td>
                        <td className="py-3 px-4 text-gray-700">{log.productName}</td>
                        <td className="py-3 px-4 text-gray-700">{log.quantity}</td>
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
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {workLogPageTranslations.showing} {startIndex + 1} of {Math.min(endIndex, totalWorkLogs)} of {workLogs.length} {workLogPageTranslations.workLogs}
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

      {/* Add Work Log Modal */}
      <AddWorkLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        employees={employees}
        products={products}
        createWorklogUseCase={createWorklogUseCase}
        setShowCreatedAlert={setShowCreatedAlert}
        onUpdate={refetchWorklogs}
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
        onUpdate={refetchWorklogs}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        workLogId={deleteWorklogId?.id || null}
        deleteWorklogUseCase={deleteWorklogUseCase}
        onUpdate={refetchWorklogs}
      />
    </div>
  );
};

export default WorkLog;
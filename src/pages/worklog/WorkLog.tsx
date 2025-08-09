import React, { useState, useEffect, useRef } from 'react';
import { Users, ClipboardList, DollarSign, Plus, ChevronDown, Edit, Trash2, X, ChevronLeft, ChevronRight, Box } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { ProductService } from '@/services/ProductService';
import { employeeService } from '@/services/employeeService';
import { worklogService } from '@/services/worklogService';
import { worklogData } from '@/dtos/worklog/worklogData';
import { AddWorkLogModal } from '@/components/worklog/addworklogmodal/AddWorkLogModal';
import { toast } from 'react-hot-toast';
import { ConfirmDeleteModal } from '@/components/worklog/delete-worklog/DeleteWorklogModal';
import { WorklogInterface } from '@/domain/interfaces/worklog/WorklogInterface';
import { WorklogInterfaceImpl } from '@/data/interface-implementation/worklog';
import { GetAllWorklogUseCase } from '@/data/usecases/worklog.usecase';
import { useGetAllWorklogs } from '@/hooks/worklog/get-all-worklog.hook';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { ProductInterface } from '@/domain/interfaces/product/ProductInterface';
import { ProductInterfaceImpl } from '@/data/interface-implementation/product';
import { GetAllEmployeeUseCase } from '@/data/usecases/employee.usecase';
import { GetAllProductsUseCase } from '@/data/usecases/product.usecase';
import { TokenedRequest } from '@/domain/models/common/header-param';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';

// use get all worklogs hook
const worklogInterface: WorklogInterface = new WorklogInterfaceImpl();
const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const productInterface: ProductInterface = new ProductInterfaceImpl();

const getAllWorklogUseCase = new GetAllWorklogUseCase(worklogInterface);
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);
const getAllProductsUseCase = new GetAllProductsUseCase(productInterface);

interface WorkLogProps {
  currentPath?: string;
}

const WorkLog = ({ currentPath }: WorkLogProps) => {
  const { worklogs, error, loading } = useGetAllWorklogs(getAllWorklogUseCase);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [workLogToDeleteDetails, setWorkLogToDeleteDetails] = useState<{ id: string } | null>(null);
  const [selectedWorkLogForEdit, setSelectedWorkLogForEdit] = useState<worklogData | undefined>(undefined);
  const [workLogs, setWorkLogs] = useState<worklogData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]); 

  const { translations } = useLanguage();
  const workLogPageTranslations = translations.workLogPage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';


  // Fetch all data on component mount
  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const [employeeData, productData, worklogData] = await Promise.all([
  //         employeeService.getAllEmployees(),
  //         ProductService.getAllProducts(),
  //         worklogService.getAllWorklogs()
  //       ]);

  //       setEmployees(employeeData);
  //       setProducts(productData);

  //       // Transform worklog data to include employee and product details
  //       const transformedWorkLogs = worklogData.map(log => {
  //         const employee = employeeData.find(emp => emp._id === log.employeeId);
  //         const product = productData.find(prod => prod._id === log.productId);
          
  //         return {
  //           _id: log._id,
  //           employeeId: log.employeeId,
  //           productId: log.productId,
  //           fullname: employee ? employee.name : 'Unknown Employee',
  //           position: employee ? employee.position : 'Unknown Position',
  //           productName: product ? product.name : 'Unknown Product',
  //           quantity: log.quantity,
  //           totalPrice: log.totalPrice,
  //           updatedAt: log.updatedAt,
  //         } as worklogData;
  //       });

  //       setWorkLogs(transformedWorkLogs);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
  //       console.error('Failed to fetch data:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAllData();
  // }, []);

  useEffect(() => {
    const fetchAllWorklogs = async () => {
      try {
        if (loading || error) {
          return;
        }
        console.log('worklogs: ', worklogs);

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

  const totalWorkLogs = filteredWorkLogs.length;
  const totalQuantityProduced = filteredWorkLogs.reduce((sum, log) => sum + log.quantity, 0);
  const totalCompletedWorklogs = filteredWorkLogs.length;

  const totalPages = Math.ceil(totalWorkLogs / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWorkLogs = filteredWorkLogs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => {
    setSelectedWorkLogForEdit(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (workLog: worklogData) => {
    setSelectedWorkLogForEdit(workLog);
    setIsAddModalOpen(true);
  };

  const handleSaveWorkLog = async (workLogData: any) => {
    try {
      // Refresh the worklog list to get updated data
      const [employeeData, productData, worklogData] = await Promise.all([
        employeeService.getAllEmployees(),
        ProductService.getAllProducts(),
        worklogService.getAllWorklogs()
      ]);

      // Transform worklog data to include employee and product details
      const transformedWorkLogs = worklogData.map(log => {
        const employee = employeeData.find(emp => emp._id === log.employeeId);
        const product = productData.find(prod => prod._id === log.productId);
        
        return {
          _id: log._id,
          employeeId: log.employeeId,
          productId: log.productId,
          fullname: employee ? employee.name : 'Unknown Employee',
          position: employee ? employee.position : 'Unknown Position',
          productName: product ? product.name : 'Unknown Product',
          quantity: log.quantity,
          // totalPrice: log.totalPrice,
          // updatedAt: log.updatedAt,
        } as worklogData;
      });

      setWorkLogs(transformedWorkLogs);
    } catch (error) {
      console.error('Error refreshing work logs:', error);
      toast.error("Failed to refresh work log list.");
    }
  };

  const handleConfirmDeleteClick = (workLog: worklogData) => {
    setWorkLogToDeleteDetails({ id: workLog._id });
    setIsDeleteConfirmModalOpen(true);
  };

  const handleExecuteDelete = async (id: string) => {
    try {
      await worklogService.deleteWorkLog(id);
      setWorkLogs(prevLogs => prevLogs.filter(log => log._id !== id));
      toast.success("Work log deleted successfully!");
    } catch (error) {
      console.error('Error deleting work log:', error);
      toast.error("Failed to delete work log. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-8">{translations.common.loading}...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{translations.common.error}: {error}</div>;

  return (
    <div className="font-sans antialiased text-gray-800">
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
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer w-full sm:w-auto">
                <span className="font-medium text-gray-700">{workLogPageTranslations.sortBy}</span>
                <span className="font-semibold text-gray-900">{workLogPageTranslations.date}</span>
                <ChevronDown className="w-4 h-4" />
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
                    {/* <td className="py-3 px-4 text-gray-700">{log.totalPrice}</td>
                    <td className="py-3 px-4 text-gray-700">{new Date(log.updatedAt).toLocaleDateString()}</td> */}
                    {/* NEW: Dropdown for Status in each table row */}
                    {/* <td className="py-3 px-4 text-left">
                      
                    </td> */}
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
              {workLogPageTranslations.showing} {startIndex + 1} {workLogPageTranslations.of} {Math.min(endIndex, totalWorkLogs)} {workLogPageTranslations.of} {totalWorkLogs} {workLogPageTranslations.workLogs}
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
        workLogToEdit={selectedWorkLogForEdit}
        onSave={handleSaveWorkLog}
        employees={employees}
        products={products}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleExecuteDelete}
        workLogId={workLogToDeleteDetails?.id || null}
      />
    </div>
  );
};

export default WorkLog;

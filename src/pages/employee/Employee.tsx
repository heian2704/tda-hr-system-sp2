import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, ChevronLeft, ChevronRight, ChevronDown, Check, X, Edit, Trash2, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AddEmployeeModal from '@/components/employee/create_employee/AddEmployeeModal';
import ConfirmDeleteModal from '@/components/employee/delete_employee/ConfirmDeleteModal';
import EditEmployeeModal from "@/components/employee/update_employee/EditEmployeeModal";
import { EmpStatus } from '@/constants/employee-status.enum';
import { CreateEmployeeDto } from '@/domain/models/employee/create-employee.dto';
import StatusChanger from '@/components/employee/update_employee_status/StatusChangerModal'
import { GetAllEmployeeUseCase } from '@/data/usecases/employee.usecase';
import { useGetAllEmployees } from '@/hooks/employee/get-all-employee.hook';
import type { Employee } from '@/domain/models/employee/get-employee.model';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { ITEMS_PER_PAGE } from '@/constants/page-utils';
import { Employees } from '@/domain/models/employee/get-employees.model';

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);

const Employee = () => {
  const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [employeeToDeleteDetails, setEmployeeToDeleteDetails] = useState<{ id: string, name: string } | null>(null);
  const [selectedEmployeeForAdd, setSelectedEmployeeForAdd] = useState<CreateEmployeeDto | undefined>(undefined);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | undefined>(undefined);
  const { translations } = useLanguage();
  const employeePageTranslations = translations.employeePage;
  const [showEditedAlert, setShowEditedAlert] = useState(false);
  const [showDeletedAlert, setShowDeletedAlert] = useState(false);
  const [showCreatedAlert, setShowCreatedAlert] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'joinedDate' | 'name' | 'status'>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(undefined);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Update list and total pages when API data changes
  useEffect(() => {
    setEmployeeList(employees?.data ?? []);
    setTotalPages(employees?.totalPages ?? 0);
  }, [employees]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const refetchEmployees = async (page: number) => {
    try{
      const q = (searchQuery || '').toLowerCase();
      const refetchedEmps = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, page, q || undefined);
      const empList = refetchedEmps.data || [];
      setEmployeeList(empList);
      setTotalPages(refetchedEmps.totalPages || 0);
    } catch (error) {
      console.error('Error refetching employees:', error);
    }
  };
  
  const handlePageChange = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clampedPage);
    // fetch the selected page
    refetchEmployees(clampedPage);
  };

  const handleOpenAddModal = () => {
    setSelectedEmployeeForAdd(undefined);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setSelectedEmployeeForEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleConfirmDeleteClick = (employee: Employee) => {
    setEmployeeToDeleteDetails({ id: employee._id, name: employee.name });
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const lowercase = query.toLowerCase();
    const employees = await getAllEmployeeUseCase.execute(ITEMS_PER_PAGE, 1, lowercase);
    const employeeList = employees?.data ?? [];
    setEmployeeList(employeeList);
    setTotalPages(employees?.totalPages ?? 0);
    setCurrentPage(1);
  };

  function statusClasses(s?: string) {
		const v = (s || "").toLowerCase();
		if (v === EmpStatus.ACTIVE) return "bg-green-400 text-green-700";
		if (v === EmpStatus.ON_LEAVE) return "bg-red-400 text-red-700";
		return "bg-gray-100 text-gray-700";
	}

  const handleSortChange = (field: 'joinedDate' | 'name' | 'status') => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEmployees = [...employeeList].sort((a, b) => {

    if (!sortField || !sortDirection) return 0;
    let aValue: number | string;
    let bValue: number | string;
    const order = { active: 1, on_leave: 2 };

    switch (sortField) {
      case 'joinedDate':
        aValue = new Date(a.joinedDate || 0).getTime();
        bValue = new Date(b.joinedDate || 0).getTime();
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = order[a.status] || 99;
        bValue = order[b.status] || 99;
        break;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <div className="text-center py-8">{translations.common.loading}...</div>;
  if (!loading && sortedEmployees.length === 0) return <div className="text-center py-8">{'No employees found.'}</div>;
  if (error) return <div className="text-center py-8 text-red-600">{translations.common.error}: {error}</div>;

  return (
    <div className="font-sans antialiased text-gray-800">
      {showCreatedAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {employeePageTranslations.createSuccessfully || '{entryType} Created'}
        </div>
      )}
      {showEditedAlert && (                                        
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {employeePageTranslations.editSuccessfully || '{entryType} Updated'}
        </div>
      )}
      {showDeletedAlert && (
        <div className="fixed top-34 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {employeePageTranslations.deleteSuccessfully || '{entryType} Deleted'}
        </div>
      )}
      <div className="space-y-4">
        {/* Table Header/Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">{employeePageTranslations.employees}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search box */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer w-full sm:w-auto"
                >
                  <span className="font-medium text-gray-700">{employeePageTranslations.sortBy}</span>
                  <span className="font-semibold text-gray-900 ml-2">
                    {sortField === 'joinedDate' && employeePageTranslations.joinDate}
                    {sortField === 'name' && 'Name'}
                    {sortField === 'status' && 'Status'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <button
                      onClick={() => { handleSortChange('joinedDate'); setIsSortDropdownOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'joinedDate' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {employeePageTranslations.joinDate} {sortField === 'joinedDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                    <button
                      onClick={() => { handleSortChange('name'); setIsSortDropdownOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'name' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {employeePageTranslations.name} {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                    <button
                      onClick={() => { handleSortChange('status'); setIsSortDropdownOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortField === 'status' ? 'font-bold bg-gray-100' : ''} hover:bg-gray-100`}
                    >
                      {employeePageTranslations.status} {sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#EB5757] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                {employeePageTranslations.addNewEmployee}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold"></th>
                  <th className="py-3 px-4 font-semibold">{employeePageTranslations.fullNameColumn}</th>
                  <th className="py-3 px-4 font-semibold">{employeePageTranslations.phoneNumberColumn}</th>
                  <th className="py-3 px-4 font-semibold">{employeePageTranslations.address}</th>
                  <th className="py-3 px-4 font-semibold">{employeePageTranslations.roleColumn}</th>
                  <th className="py-3 px-4 font-semibold">{employeePageTranslations.joinDateColumn}</th>
                  <th className="py-3 px-4 font-semibold text-center">{employeePageTranslations.status}</th>
                  <th className="py-3 px-4 font-semibold text-center">{employeePageTranslations.actionColumn}</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map(emp => (
                  <tr key={emp._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {/* show color circle instead of emoji */}
                      <span className={`inline-block w-3 h-3 rounded-full ${statusClasses(emp.status)}`}></span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{emp.phoneNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.address}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.position}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {emp.joinedDate?.split("T", 1)[0] || 'N/A'}
                    </td>
                    {/* <td className="py-3 px-4 text-center">
                      <StatusChanger
                        employeeId={emp._id}
                        employeeName={emp.name}
                        currentStatus={emp.status}
                        translations={{
                          ...employeePageTranslations,
                          deleteButton: String(employeePageTranslations.deleteButton),
                          editButton: String(employeePageTranslations.editButton),
                        }}
                        onUpdate={refetchEmployees}
                      />
                    </td>  */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center h-7 min-w-[110px] px-3 rounded-full text-xs font-medium whitespace-nowrap ${statusClasses(emp.status)}`}
                      >
                        {emp.status || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="text-[#007BFF] hover:text-[#0056b3] font-medium p-1 rounded-full hover:bg-gray-100"
                          title={String(employeePageTranslations.editButton)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleConfirmDeleteClick(emp)}
                          className="text-red-500 hover:text-red-700 font-medium p-1 rounded-full hover:bg-gray-100"
                          title={String(employeePageTranslations.deleteButton)}
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
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Jump to last */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
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

      {/* Add/Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        addEmployeeDto={
          selectedEmployeeForAdd  
        }
        showCreateAlert={setShowCreatedAlert}
        onUpdate={() => { void refetchEmployees(currentPage); }}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employeeId={selectedEmployeeForEdit?._id || ''}
        editEmployeeDto={selectedEmployeeForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => { void refetchEmployees(currentPage); }}
        showEditedAlert={setShowEditedAlert}
      />


      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        employeeId={employeeToDeleteDetails?.id || null}
        employeeName={employeeToDeleteDetails?.name || ''}
        onUpdate={() => { void refetchEmployees(currentPage); }}
        showDeleteAlert={setShowDeletedAlert}
      />
    </div>
  );
};

export default Employee;
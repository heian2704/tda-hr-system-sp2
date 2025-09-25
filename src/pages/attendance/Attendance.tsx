import React, { useState, useEffect, useMemo } from "react";
import { Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle, Users, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Employee from "../employee/Employee";
import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";
import { ITEMS_PER_PAGE } from "@/constants/page-utils";

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);

const Attendance = () => {
  const { translations } = useLanguage();
  const { employees, loading, error } = useGetAllEmployees(getAllEmployeeUseCase);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [employeesData, setEmployeesData] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [employeeToActOn, setEmployeeToActOn] = useState(null);
  const [message, setMessage] = useState(null);
  
  const attendancePage = translations.attendancePage;
  // Filter for only active employees from the prop
  const activeEmployees = useMemo(() => {
    // We check if employees is an array before filtering
    if (!Array.isArray(employees)) return [];
    return employees.filter(emp => emp.isActive);
  }, [employees]);

  useEffect(() => {
    setTotalEmployees(employees.total || 0);
    // This simulates fetching attendance data for the selected date
    const getAttendanceForDate = (dateString, allEmployees) => {
      const today = new Date().toISOString().slice(0, 10);
      if (dateString === today) {
        return allEmployees.map(emp => {
          const isPresent = Math.random() > 0.3;
          return {
            ...emp,
            status: isPresent ? "present" : "absent",
            clockIn: isPresent ? "08:30 AM" : null,
            clockOut: isPresent ? "05:00 PM" : null,
            duration: isPresent ? "8.5 hrs" : null,
          };
        });
      } else {
        return allEmployees.map(emp => ({
          ...emp,
          status: "absent",
          clockIn: null,
          clockOut: null,
          duration: null
        }));
      }
    };
    
    // Update attendance data whenever active employees or the date changes
    if (activeEmployees.length > 0) {
      setEmployeesData(getAttendanceForDate(date, activeEmployees));
    } else {
      setEmployeesData([]);
    }
  }, [date, activeEmployees]);
  
  // const totalPresent = employeesData.filter(emp => emp.status === "present").length;
  // const totalAbsent = totalEmployees - totalPresent;
  const totalPages = employees.totalPages || 1;

  // --- Handlers ---
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDayChange = (direction) => {
    const currentDate = new Date(date);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setDate(newDate.toISOString().slice(0, 10));
    setSelectedEmployees(new Set());
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(employeesData.map(emp => emp._id));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (id) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleTimeModalOpen = (action, employee = null, isBulk = false) => {
    setModalAction(action);
    setModalType(isBulk ? 'bulk' : 'single');
    setEmployeeToActOn(employee);
    setIsTimeModalOpen(true);
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const pad = (num) => num < 10 ? '0' + num : num;
    return `${pad(hours)}:${pad(minutes)}`;
  };

  const handleTimeSubmit = (time) => {
    const now = new Date();
    const formattedTime = time || formatTime(now);

    if (modalType === 'single') {
      const employee = employeeToActOn;
      const newEmployeesData = employeesData.map(emp =>
        emp._id === employee._id ? { ...emp, [modalAction]: formattedTime, status: 'present' } : emp
      );
      setEmployeesData(newEmployeesData);
      showMessage(`${modalAction === 'clockIn' ? 'Clocked in' : 'Clocked out'} ${employee.name} at ${formattedTime}.`);
    } else {
      const newEmployeesData = employeesData.map(emp =>
        selectedEmployees.has(emp._id) ? { ...emp, [modalAction]: formattedTime, status: 'present' } : emp
      );
      setEmployeesData(newEmployeesData);
      showMessage(`${modalAction === 'clockIn' ? 'Bulk Clocked In' : 'Bulk Clocked Out'} ${selectedEmployees.size} employees at ${formattedTime}.`);
      setSelectedEmployees(new Set());
    }

    setIsTimeModalOpen(false);
    setEmployeeToActOn(null);
  };


  return (
    <div className="font-sans antialiased text-gray-800 p-4">
      {/* Message Box */}
      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {message}
        </div>
      )}

      {/* Attendance Stats Section */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-evenly gap-4 md:gap-6 shadow-sm">
        <div className="flex items-center gap-4 flex-grow md:flex-grow-0 w-full">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="text-red-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{attendancePage.totalEmployees}</p>
            <p className="text-3xl font-bold mt-1">{totalEmployees}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-grow md:flex-grow-0 w-full">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="text-green-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{attendancePage.present}</p>
            <p className="text-3xl font-bold mt-1">{totalPresent}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-grow md:flex-grow-0 w-full">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="text-gray-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{attendancePage.absent}</p>
            <p className="text-3xl font-bold mt-1">{totalAbsent}</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Table Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{attendancePage.attendanceTitle}</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDayChange(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedEmployees(new Set());
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
              />
              <button
                onClick={() => handleDayChange(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                aria-label="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleTimeModalOpen('clockIn', null, true)}
              disabled={selectedEmployees.size === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${
                selectedEmployees.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              <Clock className="w-4 h-4" />
              {attendancePage.bulkClockIn} ({selectedEmployees.size})
            </button>
            <button
              onClick={() => handleTimeModalOpen('clockOut', null, true)}
              disabled={selectedEmployees.size === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${
                selectedEmployees.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
              }`}
            >
              <Clock className="w-4 h-4" />
              {attendancePage.bulkClockOut} ({selectedEmployees.size})
            </button>
          </div>
        </div>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" />
                <span>{attendancePage.loading}</span>
            </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 font-semibold">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedEmployees.size > 0 && selectedEmployees.size === employeesData.length}
                    className="form-checkbox h-4 w-4 text-red-600 rounded-sm transition duration-150 ease-in-out"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Employee Name</th>
                <th className="py-3 px-4 font-semibold text-center">{attendancePage.clockInPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{attendancePage.clockOutPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{attendancePage.durationPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{attendancePage.actions}</th>
              </tr>
            </thead>
            <tbody>
              {employeeList.length > 0 ? (
                employeeList.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp._id)}
                        onChange={() => handleSelectEmployee(emp._id)}
                        className="form-checkbox h-4 w-4 text-red-600 rounded-sm transition duration-150 ease-in-out"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{emp.name}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{emp.clockIn || '--'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{emp.clockOut || '--'}</td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700">{emp.duration || '--'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTimeModalOpen('clockIn', emp)}
                          className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                          title={attendancePage.clockIn}
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => handleTimeModalOpen('clockOut', emp)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title={attendancePage.clockOut}
                        >
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={24} className="mb-2" />
                      {attendancePage.noData}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            {attendancePage.showing} {totalEmployees > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalEmployees)} {attendancePage.of} {totalEmployees} {attendancePage.employees}
          </p>
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

      {/* Time Selection Modal */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 md:w-1/3">
            <div className="text-lg font-bold mb-4">{attendancePage.selectTime}</div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {modalType === 'single' ? `Selecting time for ${employeeToActOn.name}` : `Selecting time for ${selectedEmployees.size} employees`}
              </p>
              <input
                type="time"
                id="time"
                name="time"
                defaultValue={formatTime(new Date())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsTimeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {translations.cancel}
              </button>
              <button
                onClick={() => handleTimeSubmit((document.getElementById('time') as HTMLInputElement).value)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {translations.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
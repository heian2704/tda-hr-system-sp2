import React, { useState, useEffect, useMemo } from "react";
import { Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle, Users, Loader2 } from "lucide-react";

// The `useLanguage` hook and translations are mocked here for UI purposes
const useLanguage = () => {
  const translations = {
    English: {
      attendanceTitle: "Employee Attendance",
      totalEmployees: "Total Employees",
      present: "Present",
      absent: "Absent",
      clockInPlaceholder: "Clock In",
      clockOutPlaceholder: "Clock Out",
      durationPlaceholder: "Duration",
      actions: "Actions",
      clockIn: "Clock In",
      clockOut: "Clock Out",
      markAsPresent: "Mark as Present",
      markAsAbsent: "Mark as Absent",
      bulkActions: "Bulk Actions",
      selectAll: "Select All",
      showing: "Showing",
      of: "of",
      employees: "employees",
      noData: "No attendance data found for this date. Click Clock In to get started.",
      selectTime: "Select Time",
      confirm: "Confirm",
      cancel: "Cancel",
      bulkClockIn: "Bulk Clock In",
      bulkClockOut: "Bulk Clock Out",
      loading: "Loading employees...",
    },
    Burmese: {
      attendanceTitle: "ဝန်ထမ်း တက်ရောက်မှု",
      totalEmployees: "စုစုပေါင်း ဝန်ထမ်း",
      present: "ပစ္စုပ္ပန်",
      absent: "မရှိ",
      clockInPlaceholder: "နာရီ စတင်ဝင်ရောက်",
      clockOutPlaceholder: "နာရီ ထွက်ခွာ",
      durationPlaceholder: "ကြာချိန်",
      actions: "လုပ်ဆောင်မှုများ",
      clockIn: "နာရီ စတင်ဝင်ရောက်",
      clockOut: "နာရီ ထွက်ခွာ",
      markAsPresent: "ပစ္စုပ္ပန်အဖြစ် မှတ်သားပါ",
      markAsAbsent: "မရှိအဖြစ် မှတ်သားပါ",
      bulkActions: "အစုလိုက် လုပ်ဆောင်ချက်များ",
      selectAll: "အားလုံးရွေးပါ",
      showing: "ပြသနေသည်",
      of: "၏",
      employees: "ဝန်ထမ်းများ",
      noData: "ဤရက်စွဲအတွက် တက်ရောက်မှုဒေတာမတွေ့ပါ။ နာရီစတင်ဝင်ရောက်ရန် ကလစ်နှိပ်ပါ။",
      selectTime: "အချိန်ရွေးပါ",
      confirm: "အတည်ပြုပါ",
      cancel: "ပယ်ဖျက်ပါ",
      bulkClockIn: "အစုလိုက် နာရီစတင်ဝင်ရောက်",
      bulkClockOut: "အစုလိုက် နာရီထွက်ခွာ",
      loading: "ဝန်ထမ်းများကို တင်နေသည်...",
    },
  };
  const [language, setLanguage] = useState("English");
  const t = translations[language];
  return { language, setLanguage, translations: t };
};

// This hook is now self-contained within this file.
const useEmployeeData = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      setIsLoading(true);
      // Simulating a data fetch from an API or shared context
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEmployees = [
        { _id: "1", name: "Zaw Myo", isActive: true },
        { _id: "2", name: "Aung Aung", isActive: true },
        { _id: "3", name: "Su Su", isActive: true },
        { _id: "4", name: "Myo Min", isActive: true },
        { _id: "5", name: "Hla Hla", isActive: true },
        { _id: "6", name: "Ko Ko", isActive: false },
        { _id: "7", name: "Thin Thin", isActive: true },
        { _id: "8", name: "Moe Moe", isActive: true },
        { _id: "9", name: "Kyaw Kyaw", isActive: false },
        { _id: "10", name: "Nyein Nyein", isActive: true },
        { _id: "11", name: "Lwin Lwin", isActive: true },
        { _id: "12", name: "Soe Soe", isActive: true },
        { _id: "13", name: "Win Win", isActive: true },
        { _id: "14", name: "Chit Chit", isActive: true },
        { _id: "15", name: "Pyae Pyae", isActive: false },
        { _id: "16", name: "San San", isActive: true },
        { _id: "17", name: "Hnin Hnin", isActive: true },
        { _id: "18", name: "Zin Zin", isActive: true },
        { _id: "19", name: "Lay Lay", isActive: true },
        { _id: "20", name: "Tin Tin", isActive: true },
      ];
      setEmployees(mockEmployees);
      setIsLoading(false);
    };
    fetchAllEmployees();
  }, []);

  return { employees, isLoading };
};

// --- LocalStorage helpers for attendance ---
const ATTENDANCE_STORAGE_KEY = 'attendanceRecords';

const readAttendanceStorage = () => {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAttendanceStorage = (data) => {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // noop
  }
};

const ensureDayRecords = (storage, date, activeEmployees) => {
  const day = storage[date] || {};
  let changed = false;
  // Add missing active employees with defaults
  activeEmployees.forEach((emp) => {
    if (!day[emp._id]) {
      day[emp._id] = { status: 'absent', clockIn: null, clockOut: null, duration: null };
      changed = true;
    }
  });
  // Remove records for employees no longer active
  Object.keys(day).forEach((id) => {
    if (!activeEmployees.find((e) => e._id === id)) {
      delete day[id];
      changed = true;
    }
  });
  if (changed) storage[date] = day;
  return { storage, day, changed };
};

const computeDuration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return null;
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return (isNaN(h) || isNaN(m)) ? null : h * 60 + m;
  };
  const start = toMinutes(clockIn);
  const end = toMinutes(clockOut);
  if (start == null || end == null) return null;
  const diff = Math.max(0, end - start);
  const hours = (diff / 60);
  return `${hours.toFixed(1)} hrs`;
};

const Attendance = () => {
  const { translations } = useLanguage();
  const { employees, isLoading: isDataLoading } = useEmployeeData();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [employeesData, setEmployeesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set<string>());
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [employeeToActOn, setEmployeeToActOn] = useState(null);
  const [message, setMessage] = useState(null);

  const itemsPerPage = 10;
  
  // Filter for only active employees from the prop
  const activeEmployees = useMemo(() => {
    // We check if employees is an array before filtering
    if (!Array.isArray(employees)) return [];
    return employees.filter(emp => emp.isActive);
  }, [employees]);

  useEffect(() => {
    // Load attendance from localStorage; seed defaults if missing; sync with active employees
    if (!Array.isArray(activeEmployees) || activeEmployees.length === 0) {
      setEmployeesData([]);
      return;
    }
    const storage = readAttendanceStorage();
    const { storage: updatedStorage, day, changed } = ensureDayRecords(storage, date, activeEmployees);
    if (changed) writeAttendanceStorage(updatedStorage);

    // Build employeesData by merging activeEmployees with stored day records
    const merged = activeEmployees.map(emp => {
      const rec = day[emp._id] || { status: 'absent', clockIn: null, clockOut: null, duration: null };
      return { ...emp, ...rec };
    });
    setEmployeesData(merged);
  }, [date, activeEmployees]);
  
  const totalEmployees = employeesData.length;
  const totalPresent = employeesData.filter(emp => emp.status === "present").length;
  const totalAbsent = totalEmployees - totalPresent;
  const totalPages = Math.max(1, Math.ceil(totalEmployees / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEmployees);
  const currentEmployees = employeesData.slice(startIndex, endIndex);

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
      const newEmployeesData = employeesData.map(emp => {
        if (emp._id !== employee._id) return emp;
        const updated = { ...emp, [modalAction]: formattedTime, status: 'present' };
        const dur = computeDuration(updated.clockIn, updated.clockOut);
        return { ...updated, duration: dur };
      });
      setEmployeesData(newEmployeesData);
      showMessage(`${modalAction === 'clockIn' ? 'Clocked in' : 'Clocked out'} ${employee.name} at ${formattedTime}.`);
      // Persist to localStorage
      const storage = readAttendanceStorage();
      const { storage: updatedStorage } = ensureDayRecords(storage, date, employeesData);
      const day = updatedStorage[date] || {};
      const rec = day[employee._id] || { status: 'absent', clockIn: null, clockOut: null, duration: null };
      const nextRec = { ...rec, [modalAction]: formattedTime, status: 'present' };
      nextRec.duration = computeDuration(nextRec.clockIn, nextRec.clockOut);
      updatedStorage[date] = { ...day, [employee._id]: nextRec };
      writeAttendanceStorage(updatedStorage);
    } else {
      const newEmployeesData = employeesData.map(emp => {
        if (!selectedEmployees.has(emp._id)) return emp;
        const updated = { ...emp, [modalAction]: formattedTime, status: 'present' };
        const dur = computeDuration(updated.clockIn, updated.clockOut);
        return { ...updated, duration: dur };
      });
      setEmployeesData(newEmployeesData);
      showMessage(`${modalAction === 'clockIn' ? 'Bulk Clocked In' : 'Bulk Clocked Out'} ${selectedEmployees.size} employees at ${formattedTime}.`);
      // Persist to localStorage for each selected employee
      const storage = readAttendanceStorage();
      const { storage: updatedStorage } = ensureDayRecords(storage, date, employeesData);
      const day = updatedStorage[date] || {};
      selectedEmployees.forEach((id) => {
        const rec = day[id] || { status: 'absent', clockIn: null, clockOut: null, duration: null };
        const nextRec = { ...rec, [modalAction]: formattedTime, status: 'present' };
        nextRec.duration = computeDuration(nextRec.clockIn, nextRec.clockOut);
        day[id] = nextRec;
      });
      updatedStorage[date] = day;
      writeAttendanceStorage(updatedStorage);
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

      {/* Main Attendance Table Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{translations.attendanceTitle}</h2>
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
              {translations.bulkClockIn} ({selectedEmployees.size})
            </button>
            <button
              onClick={() => handleTimeModalOpen('clockOut', null, true)}
              disabled={selectedEmployees.size === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${
                selectedEmployees.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
              }`}
            >
              <Clock className="w-4 h-4" />
              {translations.bulkClockOut} ({selectedEmployees.size})
            </button>
          </div>
        </div>
        
        {isDataLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" />
                <span>{translations.loading}</span>
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
                <th className="py-3 px-4 font-semibold text-center">{translations.clockInPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{translations.clockOutPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{translations.durationPlaceholder}</th>
                <th className="py-3 px-4 font-semibold text-center">{translations.actions}</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((emp) => (
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
                          title={translations.clockIn}
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => handleTimeModalOpen('clockOut', emp)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title={translations.clockOut}
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
                      {translations.noData}
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
            {translations.showing} {totalEmployees > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalEmployees)} {translations.of} {totalEmployees} {translations.employees}
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
            <div className="text-lg font-bold mb-4">{translations.selectTime}</div>
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
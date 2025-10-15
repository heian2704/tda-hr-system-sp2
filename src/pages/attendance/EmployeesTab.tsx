import React, { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useGetAllEmployees } from "@/hooks/employee/get-all-employee.hook";
import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { EmployeeInterface } from "@/domain/interfaces/employee/EmployeeInterface";
import { EmployeeInterfaceImpl } from "@/data/interface-implementation/employee";
import EmployeeStatusSelect from "@/components/employee/update_employee_status/EmployeeStatusSelect";
import AddManualAttendanceModal from "@/components/attendance/add-manual-attendance/AddManualAttendanceModal";
import BulkEmployeeStatusUpdateBar from "@/components/employee/update_employee_status/BulkEmployeeStatusUpdateBar";
import AddManualAttendanceBulkModal from "@/components/attendance/add-manual-attendance/AddManualAttendanceBulkModal";
import { useLanguage } from "@/contexts/LanguageContext";

const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
const getAllEmployeeUseCase = new GetAllEmployeeUseCase(employeeInterface);

const EmployeesTab: React.FC = () => {
  const { translations } = useLanguage();
  const t = translations.attendancePage;
  const { employees: employeesResp, loading: empLoading, error: empError } = useGetAllEmployees(getAllEmployeeUseCase);
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [empSearch, setEmpSearch] = useState("");
  const [empDate, setEmpDate] = useState<string>("");
  const [showEmpStatusAlert, setShowEmpStatusAlert] = useState(false);
  const hideFlagTimer = useRef<number | null>(null);

  // Employees tab: filter by name and joined date
  const employeesFiltered = useMemo(() => {
    const employeesAll = (employeesResp?.data ?? []);
    let list = employeesAll;
    const q = empSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(e => e.name?.toLowerCase().includes(q));
    }
    if (empDate) {
      const target = new Date(empDate);
      if (!isNaN(target.getTime())) {
        const start = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
        list = list.filter(e => {
          const jd = e.joinedDate ? new Date(e.joinedDate) : null;
          return jd && !isNaN(jd.getTime()) && jd >= start && jd <= end;
        });
      }
    }
    return list;
  }, [employeesResp?.data, empSearch, empDate]);

  return (
    <div className="mt-4">
      {showEmpStatusAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Employee status updated successfully.
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
  <h2 className="text-xl font-semibold text-gray-900">{t.attendanceTitle || "Employee Attendance"}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <BulkEmployeeStatusUpdateBar
            selectedIds={[...selectedEmpIds]}
            currentStatusById={Object.fromEntries(employeesFiltered.map(e => [e._id, e.status]))}
            onApplied={(newStatus) => {
              // update local statuses for selected ids
              if (employeesResp?.data) {
                for (const emp of employeesResp.data) {
                  if (selectedEmpIds.has(emp._id)) {
                    emp.status = newStatus;
                  }
                }
              }
              setSelectedEmpIds(new Set());
              setShowEmpStatusAlert(true);
              if (hideFlagTimer.current) window.clearTimeout(hideFlagTimer.current);
              hideFlagTimer.current = window.setTimeout(() => setShowEmpStatusAlert(false), 3000);
            }}
          />
          <AddManualAttendanceBulkModal
            selectedIds={[...selectedEmpIds]}
            disabled={selectedEmpIds.size === 0}
            onCreated={() => {
              setShowEmpStatusAlert(true);
              if (hideFlagTimer.current) window.clearTimeout(hideFlagTimer.current);
              hideFlagTimer.current = window.setTimeout(() => setShowEmpStatusAlert(false), 3000);
            }}
          />
          <div className="relative w-full md:w-80">
            <input
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              placeholder={t.searchByNamePlaceholder || "Search employee by name..."}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={empDate}
              onChange={(e) => setEmpDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </div>
      </div>

  {empLoading && <div className="text-center py-8">{t.loading}</div>}
  {empError && <div className="text-center py-8 text-red-600">{empError}</div>}
      {!empLoading && !empError && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all employees on page"
                    checked={employeesFiltered.length > 0 && employeesFiltered.every((e) => selectedEmpIds.has(e._id))}
                    onChange={(e) => {
                      const next = new Set(selectedEmpIds);
                      if (e.target.checked) employeesFiltered.forEach((r) => next.add(r._id));
                      else employeesFiltered.forEach((r) => next.delete(r._id));
                      setSelectedEmpIds(next);
                    }}
                  />
                </th>
                <th className="py-3 px-4 font-semibold">{translations.employeePage.fullNameColumn}</th>
                <th className="py-3 px-4 font-semibold">{translations.employeePage.phoneNumberColumn}</th>
                <th className="py-3 px-4 font-semibold">{translations.employeePage.addressColumn}</th>
                <th className="py-3 px-4 font-semibold">{translations.employeePage.roleColumn}</th>
                <th className="py-3 px-4 font-semibold">{t.statusColumn || translations.employeePage.statusColumn}</th>
              </tr>
            </thead>
            <tbody>
              {(employeesResp?.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-gray-500">{t.noEmployeesFound || "No employees found."}</td>
                </tr>
              ) : (
                employeesFiltered.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedEmpIds.has(emp._id)}
                        onChange={(e) => {
                          const next = new Set(selectedEmpIds);
                          if (e.target.checked) next.add(emp._id);
                          else next.delete(emp._id);
                          setSelectedEmpIds(next);
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{emp.name}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.phoneNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.address}</td>
                    <td className="py-3 px-4 text-gray-700">{emp.position}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <EmployeeStatusSelect
                          employeeId={emp._id}
                          value={emp.status}
                          compact
                          onUpdated={(ns) => {
                            // update local list item
                            if (employeesResp?.data) {
                              emp.status = ns;
                            }
                            setShowEmpStatusAlert(true);
                            if (hideFlagTimer.current) window.clearTimeout(hideFlagTimer.current);
                            hideFlagTimer.current = window.setTimeout(() => setShowEmpStatusAlert(false), 3000);
                          }}
                        />
                        <AddManualAttendanceModal
                          employeeId={emp._id}
                          employeeName={emp.name}
                          onCreated={() => {
                            // Optionally refetch attendances; here we just show a toast banner for consistency
                            setShowEmpStatusAlert(true);
                            if (hideFlagTimer.current) window.clearTimeout(hideFlagTimer.current);
                            hideFlagTimer.current = window.setTimeout(() => setShowEmpStatusAlert(false), 3000);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;

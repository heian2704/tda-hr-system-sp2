import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, FileText, Plus, ChevronDown, Edit, X, ChevronLeft, ChevronRight, Calculator, Minus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { PayrollDto } from '@/dtos/payroll/PayrollDto';
import { EmployeeResponse } from '@/dtos/employee/EmployeeResponse';
import { PayrollService } from '@/services/PayrollService';
import { employeeService } from '@/services/employeeService';
import { PayrollData } from '@/dtos/payroll/PayrollData';

// --- Date Utility Functions ---
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
};

const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 6));
  return endOfWeek;
};

const getStartOfMonth = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
};

const getEndOfMonth = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
};

const isDateInRange = (dateString: string, startDate: string, endDate: string): boolean => {
  const date = parseDate(dateString);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

//// --- Enhanced Payroll Entry Interface ---
/*interface PayrollDto {
  id: string;
  employeeId: string;
  fullName: string;
  position: string;
  totalQuantity: number;
  totalSalary: number;
  bonusDeduction: number;
  netSalary: number;
  period: Date;
  paidStatus: 'Paid' | 'Unpaid';
}*/

//// --- Bonus/Deduction Modal Component ---
// interface BonusDeductionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   payrollEntry: PayrollDto | null;
//   onSave: (id: string, newBonusDeduction: number, note: string) => void;
// }

// const BonusDeductionModal = ({ isOpen, onClose, payrollEntry, onSave }: BonusDeductionModalProps) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   const { translations } = useLanguage();
//   const modalTranslations = translations.payrollPage;

//   const [amount, setAmount] = useState<string>('');
//   const [type, setType] = useState<'bonus' | 'deduction'>('bonus');
//   const [note, setNote] = useState<string>('');

//   useEffect(() => {
//     if (isOpen && payrollEntry) {
//       if (payrollEntry.bonusDeduction !== 0) {
//         const absAmount = Math.abs(payrollEntry.bonusDeduction);
//         setAmount(absAmount.toString());
//         setType(payrollEntry.bonusDeduction > 0 ? 'bonus' : 'deduction');
//       } else {
//         setAmount('');
//         setType('bonus');
//       }
//       setNote('');
//     }
//   }, [isOpen, payrollEntry]);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     }
//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen || !payrollEntry) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const numAmount = parseFloat(amount);
//     if (isNaN(numAmount) || numAmount < 0) {
//       alert(modalTranslations.invalidAmount);
//       return;
//     }

//     const finalAmount = type === 'bonus' ? numAmount : -numAmount;
//     onSave(payrollEntry.id, finalAmount, note);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//           aria-label="Close modal"
//         >
//           <X size={24} />
//         </button>

//         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//           {modalTranslations.addBonusDeductionTitle} ({payrollEntry.fullName})
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.type}</label>
//             <div className="flex gap-4">
//               <label className="inline-flex items-center">
//                 <input
//                   type="radio"
//                   name="type"
//                   value="bonus"
//                   checked={type === 'bonus'}
//                   onChange={() => setType('bonus')}
//                   className="form-radio text-[#FF6767] focus:ring-[#FF6767]"
//                 />
//                 <span className="ml-2 text-gray-700">{modalTranslations.bonus}</span>
//               </label>
//               <label className="inline-flex items-center">
//                 <input
//                   type="radio"
//                   name="type"
//                   value="deduction"
//                   checked={type === 'deduction'}
//                   onChange={() => setType('deduction')}
//                   className="form-radio text-[#FF6767] focus:ring-[#FF6767]"
//                 />
//                 <span className="ml-2 text-gray-700">{modalTranslations.deduction}</span>
//               </label>
//             </div>
//           </div>
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.amount}</label>
//             <input
//               type="number"
//               id="amount"
//               placeholder="e.g., 5000"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
//               required
//               min="0"
//               step="any"
//             />
//           </div>
//           <div>
//             <label htmlFor="note" className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.notePlaceholder} ({modalTranslations.optional})</label>
//             <textarea
//               id="note"
//               placeholder={modalTranslations.notePlaceholder}
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-y min-h-[80px]"
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
//             >
//               {modalTranslations.cancelButton}
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
//             >
//               {modalTranslations.saveButton}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// --- Main Payroll Component ---
const Payroll = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [payrollEntries, setPayrollEntries] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBonusDeductionModalOpen, setIsBonusDeductionModalOpen] = useState(false);
  const [selectedPayrollEntry, setSelectedPayrollEntry] = useState<PayrollDto | null>(null);

  // Period selection states
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'day' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [currentDisplayPeriod, setCurrentDisplayPeriod] = useState<string>('');

  const { translations } = useLanguage();
  const payrollPageTranslations = translations.payrollPage;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Fetch payroll and employee data
  useEffect(() => {
    const fetchPayrollData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [payrollData, employeeData] = await Promise.all([
          PayrollService.getAllPayrolls(),
          employeeService.getAllEmployees()
        ]);

        // Create employee map for quick lookup
        const employeeMap = new Map(employeeData.map(emp => [emp._id, emp]));

        // Transform payroll data to include employee details
        const transformedPayrollData: PayrollData[] = payrollData.map(payroll => {
          const employee = employeeMap.get(payroll.employeeId) as EmployeeResponse;

          return {
            _id: payroll._id,
            employeeId: payroll.employeeId,
            fullName: employee ? employee.name : '',
            position: employee ? employee.position : '',
            totalQuantity: payroll.totalQuantity,
            totalSalary: payroll.totalSalary,
            period: new Date(payroll.period)
          };
        });

        setPayrollEntries(transformedPayrollData);

        // Set default period to current month
        const today = new Date();
        const startOfMonth = getStartOfMonth(today);
        const endOfMonth = getEndOfMonth(today);

        setCustomStartDate(formatDate(startOfMonth));
        setCustomEndDate(formatDate(endOfMonth));
        setPeriodType('month');
        setCurrentDisplayPeriod(
          `${payrollPageTranslations.currentPeriod} ${startOfMonth.toLocaleString('default', { month: 'long' })} ${startOfMonth.getFullYear()}`
        );

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching payroll data');
        console.error('Failed to fetch payroll data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [payrollPageTranslations]);

  // Update display period when period type or custom dates change
  useEffect(() => {
    const today = new Date();
    let displayPeriodText = '';

    switch (periodType) {
      case 'day':
        displayPeriodText = `${payrollPageTranslations.currentPeriod} ${formatDate(today)}`;
        break;
      case 'week':
        const startOfWeek = getStartOfWeek(today);
        const endOfWeek = getEndOfWeek(today);
        displayPeriodText = `${payrollPageTranslations.currentPeriod} ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
        break;
      case 'month':
        const startOfMonth = getStartOfMonth(today);
        displayPeriodText = `${payrollPageTranslations.currentPeriod} ${startOfMonth.toLocaleString('default', { month: 'long' })} ${startOfMonth.getFullYear()}`;
        break;
      // case 'custom':
      //   if (customStartDate && customEndDate) {
      //     displayPeriodText = `${payrollPageTranslations.currentPeriod} ${customStartDate} - ${customEndDate}`;
      //   } else {
      //     displayPeriodText = payrollPageTranslations.selectPeriod || 'Select period...';
      //   }
      //   break;
      // default:
      //   displayPeriodText = payrollPageTranslations.selectPeriod || 'Select period...';
      //   break;
    }
    setCurrentDisplayPeriod(displayPeriodText);
  }, [periodType, customStartDate, customEndDate, payrollPageTranslations]);

  // Filter payroll entries based on period and search query
  const filteredPayrollEntries = useMemo(() => {
    let filtered = payrollEntries;

    // Filter by period
    if (periodType !== 'custom' || (customStartDate && customEndDate)) {
      let filterStart: string = '';
      let filterEnd: string = '';
      const today = new Date();

      switch (periodType) {
        case 'day':
          filterStart = formatDate(today);
          filterEnd = formatDate(today);
          break;
        case 'week':
          filterStart = formatDate(getStartOfWeek(today));
          filterEnd = formatDate(getEndOfWeek(today));
          break;
        case 'month':
          filterStart = formatDate(getStartOfMonth(today));
          filterEnd = formatDate(getEndOfMonth(today));
          break;
        case 'custom':
          filterStart = customStartDate;
          filterEnd = customEndDate;
          break;
      }

      if (filterStart && filterEnd) {
        filtered = filtered.filter(entry => {
          const entryDate = formatDate(entry.period);
          return isDateInRange(entryDate, filterStart, filterEnd);
        });
      }
    }

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.fullName.toLowerCase().includes(lowerCaseQuery) ||
        entry.position.toLowerCase().includes(lowerCaseQuery) ||
        entry.employeeId.toLowerCase().includes(lowerCaseQuery) ||
        String(entry.totalQuantity).includes(lowerCaseQuery) ||
        String(entry.totalSalary).includes(lowerCaseQuery)
      );
    }

    return filtered;
  }, [payrollEntries, periodType, customStartDate, customEndDate, searchQuery]);

  // // Calculate totals
  const totalNetPayroll = filteredPayrollEntries.reduce((sum, entry) => sum + entry.totalSalary, 0);
  // const totalBonus = filteredPayrollEntries.reduce((sum, entry) => sum + (entry.bonusDeduction > 0 ? entry.bonusDeduction : 0), 0);
  // const totalDeduction = filteredPayrollEntries.reduce((sum, entry) => sum + (entry.bonusDeduction < 0 ? Math.abs(entry.bonusDeduction) : 0), 0);

  // Pagination
  const totalEntries = filteredPayrollEntries.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayrollEntries = filteredPayrollEntries.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, periodType, customStartDate, customEndDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleOpenBonusDeductionModal = (entry: PayrollDto) => {
  //   setSelectedPayrollEntry(entry);
  //   setIsBonusDeductionModalOpen(true);
  // };

  // const handleSaveBonusDeduction = (id: string, newBonusDeduction: number, note: string) => {
  //   setPayrollEntries(prevEntries =>
  //     prevEntries.map(entry => {
  //       if (entry._id === id) {
  //         const updatedEntry = {
  //           ...entry,
  //           bonusDeduction: newBonusDeduction,
  //           netSalary: entry.totalSalary + newBonusDeduction,
  //         };
  //         return updatedEntry;
  //       }
  //       return entry;
  //     })
  //   );
  //   console.log(`[UI-ONLY] Updated bonus/deduction for ${id}: ${newBonusDeduction}, Note: ${note}`);
  // };

  // const handlePaidStatusChange = (id: string, newStatus: 'Paid' | 'Unpaid') => {
  //   setPayrollEntries(prevEntries =>
  //     prevEntries.map(entry =>
  //       entry._id === id ? { ...entry, paidStatus: newStatus } : entry
  //     )
  //   );
  //   console.log(`[UI-ONLY] Updated paid status for ${id} to: ${newStatus}`);
  // };

  if (loading) return <div className="text-center py-8">{translations.common.loading}...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{translations.common.error}: {error}</div>;

  return (
    <div className="font-sans antialiased text-gray-800">
      <div className="space-y-4">
        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-evenly gap-4 md:gap-6 shadow-sm">
          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calculator className="text-red-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{payrollPageTranslations.totalNetPayroll}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalNetPayroll.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            {/* <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="text-green-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{payrollPageTranslations.totalBonus}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalBonus.toLocaleString()}</p>
            </div> */}
          </div>

          <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto w-full">
            {/* <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Minus className="text-blue-500 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{payrollPageTranslations.totalDeduction}</p>
              <p className="text-3xl font-bold mt-1">Ks. {totalDeduction.toLocaleString()}</p>
            </div> */}
          </div>
        </div>

        {/* Table Header/Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">{payrollPageTranslations.allPayrollTitle}</h2>
              <p className="text-sm text-gray-500">
                {currentDisplayPeriod}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Period Type Dropdown */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={periodType}
                  onChange={(e) => {
                    setPeriodType(e.target.value as 'month' | 'week' | 'day' | 'custom');
                    if (e.target.value !== 'custom') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <option value="month">{payrollPageTranslations.periodTypeMonth}</option>
                  <option value="week">{payrollPageTranslations.periodTypeWeek}</option>
                  <option value="day">{payrollPageTranslations.periodTypeDay}</option>
                  <option value="custom">{payrollPageTranslations.periodTypeCustom}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Custom Date Inputs */}
              {periodType === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              )}

              <button
                onClick={() => alert("Export functionality not implemented.")}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#4CAF50] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                {payrollPageTranslations.exportButton}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">{payrollPageTranslations.fullNameColumn}</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">{payrollPageTranslations.totalQuantityColumn}</th>
                  <th className="py-3 px-4 font-semibold">{payrollPageTranslations.totalSalaryColumn}</th>
                  {/* <th className="py-3 px-4 font-semibold text-center">{payrollPageTranslations.bonusDeductionColumn}</th>
                  <th className="py-3 px-4 font-semibold">{payrollPageTranslations.netSalaryColumn}</th>
                  <th className="py-3 px-4 font-semibold">{payrollPageTranslations.paidStatusColumn}</th> */}
                </tr>
              </thead>
              <tbody>
                {currentPayrollEntries.map(entry => (
                  <tr key={entry._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{entry.fullName}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.position}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.totalQuantity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-700">Ks. {entry.totalSalary.toLocaleString()}</td>
                    {/* <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenBonusDeductionModal(entry)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${entry.bonusDeduction > 0 ? 'bg-green-100 text-green-800' :
                            entry.bonusDeduction < 0 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-600'}
                          hover:opacity-80 transition-opacity flex items-center justify-center mx-auto
                        `}
                      >
                        {entry.bonusDeduction > 0 ? `+ ${entry.bonusDeduction.toLocaleString()} Ks` :
                         entry.bonusDeduction < 0 ? `- ${Math.abs(entry.bonusDeduction).toLocaleString()} Ks` :
                         payrollPageTranslations.none}
                        <Edit size={14} className="ml-1" />
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">Ks. {entry.netSalary.toLocaleString()}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="relative">
                        <select
                          value={entry.paidStatus}
                          onChange={(e) => handlePaidStatusChange(entry.id, e.target.value as 'Paid' | 'Unpaid')}
                          className={`
                            w-full px-2 py-1 border rounded-full text-xs font-semibold appearance-none focus:outline-none focus:ring-1 focus:ring-red-300 pr-6
                            ${entry.paidStatus === 'Paid' ? 'bg-green-100 text-green-800 border-green-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'}
                          `}
                        >
                          <option value="Unpaid">{payrollPageTranslations.statusUnpaid}</option>
                          <option value="Paid">{payrollPageTranslations.statusPaid}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {payrollPageTranslations.showing} {startIndex + 1} {payrollPageTranslations.of} {Math.min(endIndex, totalEntries)} {payrollPageTranslations.of} {totalEntries} {payrollPageTranslations.payrollEntries}
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

      {/* Bonus/Deduction Modal */}
      {/* <BonusDeductionModal
        isOpen={isBonusDeductionModalOpen}
        onClose={() => setIsBonusDeductionModalOpen(false)}
        payrollEntry={selectedPayrollEntry}
        onSave={handleSaveBonusDeduction}
      /> */}
    </div>
  );
};

export default Payroll;
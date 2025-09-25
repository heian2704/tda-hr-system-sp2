import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const exportToCsv = (data, payrollPageTranslations) => {
    const headers = [
      payrollPageTranslations.fullNameColumn,
      payrollPageTranslations.roleColumn,
      payrollPageTranslations.totalQuantityColumn,
      payrollPageTranslations.totalSalaryColumn,
      payrollPageTranslations.periodColumn,
    ];
    const headerRow = headers.join(',') + '\n';
  
    const csvRows = data.map(entry => {
      const values = [
        entry.fullName,
        entry.position,
        entry.totalQuantity,
        entry.totalSalary,
        `"${entry.period.toLocaleDateString()}"`
      ];
      return values.join(',');
    });
  
    const csvString = headerRow + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
  
    if ((navigator as any).msSaveBlob) { // IE 10+
      (navigator as any).msSaveBlob(blob, 'payroll.csv');
    } else {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'payroll.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  export function yearMonthToQueryParam(year: number, month: number): string{
    return `month=${month}&year=${year}`;
  }

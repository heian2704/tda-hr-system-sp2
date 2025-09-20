import { Employee } from "@/domain/models/employee/get-employee.model";

export function employeeFilter(emp: Employee[], searchQuery: string): Employee[] {
    const filteredEmployees = emp.filter(emp => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
    
        const nameMatch = emp.name?.toLowerCase().includes(q);
        const idMatch = emp._id?.toLowerCase().includes(q);
        const addrMatch = (emp.address ?? "").toLowerCase().includes(q);
        const posMatch = (emp.position ?? "").toLowerCase().includes(q);
        const phoneMatch = (emp.phoneNumber ?? "").includes(searchQuery.trim());
    
        let dateMatch = false;
        if (emp.joinedDate) {
          const d = new Date(emp.joinedDate);
          if (!isNaN(d.getTime())) {
            const pad = (n: number) => String(n).padStart(2, "0");
            const y = d.getFullYear();
            const m = pad(d.getMonth() + 1);
            const day = pad(d.getDate());
            const iso = `${y}-${m}-${day}`; // 2025-09-20
            const ddmmyyyy = `${day}/${m}/${y}`; // 20/09/2025
            const mmddyyyy = `${m}/${day}/${y}`; // 09/20/2025
            const local = d.toLocaleDateString().toLowerCase();
            dateMatch =
              iso.includes(q) ||
              ddmmyyyy.includes(q) ||
              mmddyyyy.includes(q) ||
              local.includes(q);
          }
        }
    
        return nameMatch || idMatch || addrMatch || posMatch || phoneMatch || dateMatch;
      });
    return filteredEmployees;
}
export interface Attendance {
    _id: string;
    employeeId: string;
    checkInTime: string;
    checkOutTime?: string;
    attendanceStatus: string;
}
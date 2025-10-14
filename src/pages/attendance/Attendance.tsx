import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeesTab from "./EmployeesTab";
import AttendanceListTab from "./AttendanceListTab";

const AttendancePage: React.FC = () => {
	return (
		<div className="font-sans antialiased text-gray-800">
			<div className="bg-white rounded-2xl p-4 shadow-sm">
				<Tabs defaultValue="employees" className="w-full">
					<TabsList className="inline-flex gap-1 rounded-lg bg-gray-100 p-1">
						<TabsTrigger
							value="employees"
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors data-[state=active]:bg-[#EB5757] data-[state=active]:text-white data-[state=active]:shadow"
						>
							Employees
						</TabsTrigger>
						<TabsTrigger
							value="attendance"
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors data-[state=active]:bg-[#EB5757] data-[state=active]:text-white data-[state=active]:shadow"
						>
							Attendance
						</TabsTrigger>
					</TabsList>

					<TabsContent value="employees">
						<EmployeesTab />
					</TabsContent>

					<TabsContent value="attendance">
						<AttendanceListTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default AttendancePage;


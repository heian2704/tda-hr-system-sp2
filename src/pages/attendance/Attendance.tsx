import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeesTab from "./EmployeesTab";
import AttendanceListTab from "./AttendanceListTab";

const AttendancePage: React.FC = () => {
	return (
		<div className="font-sans antialiased text-gray-800">
			<div className="bg-white rounded-2xl p-4 shadow-sm">
				<Tabs defaultValue="employees" className="w-full">
					<TabsList>
						<TabsTrigger value="employees">Employees</TabsTrigger>
						<TabsTrigger value="attendance">Attendance</TabsTrigger>
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


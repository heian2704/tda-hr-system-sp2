import React, { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { GetAllApplicationUseCase } from "@/data/usecases/application.usecase";
import { useGetAllApplications } from "@/hooks/application/get-all-application.hook";
import { ChevronLeft, ChevronRight, Search, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ApplicationStatusSelect from "@/components/application/update_application_status/ApplicationStatusSelect";
import BulkStatusUpdateBar from "@/components/application/update_application_status/BulkStatusUpdateBar";
import { useLanguage } from "@/contexts/LanguageContext";

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const getAllApplicationUseCase = new GetAllApplicationUseCase(applicationInterface);

// moved ApplicationsMap into ./components/ApplicationsMap

const ApplicationList: React.FC = () => {
	const { applications, loading, error, refetch } = useGetAllApplications(getAllApplicationUseCase);
	const { translations } = useLanguage();
	const [currentPage, setCurrentPage] = useState(1);
	const [query, setQuery] = useState("");
	const [filterDate, setFilterDate] = useState<string>("");
	const [mapOpen, setMapOpen] = useState(false);
	const [mapAddress, setMapAddress] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
	const [showStatusEditAlert, setShowStatusEditAlert] = useState(false);
	const hideFlagTimer = useRef<number | null>(null);

	const showUpdatedFlag = () => {
		setShowStatusEditAlert(true);
		if (hideFlagTimer.current) window.clearTimeout(hideFlagTimer.current);
		hideFlagTimer.current = window.setTimeout(() => setShowStatusEditAlert(false), 3000);
	};

	// Always work with an array to avoid null access during initial render
	const data = useMemo(() => applications ?? [], [applications]);

	const filtered = useMemo(() => {
		if (!query.trim()) return data;
		const q = query.toLowerCase();
		return data.filter((a) =>
			[
				a.name,
				a.phoneNumber,
				a.address,
				a.information,
				a.position,
				a.status,
				a.attendanceStatus,
				a.date,
			]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q))
		);
	}, [data, query]);

	const hasDateFilter = !!filterDate;

	const filteredByDate = useMemo(() => {
		if (!hasDateFilter) return filtered;
		const target = new Date(filterDate);
		if (isNaN(target.getTime())) return filtered;
		const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
		const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
		return filtered.filter((a) => {
			const base: string | undefined = (a as { date?: string; createdAt?: string }).date || (a as { date?: string; createdAt?: string }).createdAt;
			if (!base) return false;
			const d = new Date(base);
			if (isNaN(d.getTime())) return false;
			return d >= startOfDay && d <= endOfDay;
		});
	}, [filtered, filterDate, hasDateFilter]);

	const effectiveList = hasDateFilter ? filteredByDate : filtered;
	const totalPages = Math.ceil(effectiveList.length / ITEMS_PER_PAGE) || 1;
	const pageSlice = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return effectiveList.slice(start, start + ITEMS_PER_PAGE);
	}, [effectiveList, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [query]);

	useEffect(() => {
		setCurrentPage(1);
	}, [filterDate]);

	if (loading) return <div className="text-center py-8">Loading applications...</div>;
	if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

	return (
		<div className="font-sans antialiased text-gray-800">
			<div className="bg-white rounded-2xl p-4 shadow-sm">
				{showStatusEditAlert && (
					<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
						{translations?.employeePage?.statusUpdate || "Status updated successfully."}
					</div>
				)}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
					<h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
					<div className="flex items-center gap-3 w-full md:w-auto">
						<div className="relative w-full md:w-80">
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search name, phone, position..."
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
							/>
							<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						</div>
						<div className="flex gap-2">
							<input
								type="date"
								value={filterDate}
								onChange={(e) => setFilterDate(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
							/>
						</div>
						<BulkStatusUpdateBar
							selectedIds={[...selected]}
							currentStatusById={Object.fromEntries(pageSlice.map(a => [a._id, a.status || ""]))}
							onApplied={(ns: string) => {
								refetch();
								setSelected(new Set());
								showUpdatedFlag();
							}}
						/>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
								<th className="py-3 px-4 w-10">
									<input
										type="checkbox"
										aria-label="Select all on page"
										checked={pageSlice.length > 0 && pageSlice.every((r) => selected.has(r._id))}
										onChange={(e) => {
											const next = new Set(selected);
											if (e.target.checked) pageSlice.forEach((r) => next.add(r._id));
											else pageSlice.forEach((r) => next.delete(r._id));
											setSelected(next);
										}}
									/>
								</th>
								<th className="py-3 px-4 font-semibold">Name</th>
								<th className="py-3 px-4 font-semibold">Phone</th>
								<th className="py-3 px-4 font-semibold">Position</th>
								<th className="py-3 px-4 font-semibold">Application Status</th>
								<th className="py-3 px-4 font-semibold">Date</th>
								<th className="py-3 px-4 font-semibold">Address</th>
							</tr>
						</thead>
						<tbody>
							{pageSlice.length === 0 ? (
								<tr>
									<td colSpan={8} className="py-6 px-4 text-center text-gray-500">
										{query ? "No applications match your search." : "No applications found."}
									</td>
								</tr>
							) : (
								pageSlice.map((a) => (
									<tr key={a._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
										<td className="py-3 px-4">
											<input
												type="checkbox"
												checked={selected.has(a._id)}
												onChange={(e) => {
													const next = new Set(selected);
													if (e.target.checked) next.add(a._id);
													else next.delete(a._id);
													setSelected(next);
												}}
											/>
										</td>
										<td className="py-3 px-4 font-medium text-gray-900">{a.name}</td>
										<td className="py-3 px-4 text-gray-700">{a.phoneNumber}</td>
										<td className="py-3 px-4 text-gray-700">{a.position}</td>
										<td className="py-3 px-4">
											<ApplicationStatusSelect
												applicationId={a._id}
												value={a.status}
												compact
												onUpdated={() => {
													refetch();
													showUpdatedFlag();
												}}
											/>
										</td>
										<td className="py-3 px-4 text-gray-700">{new Date(a.date).toLocaleDateString()}</td>
										<td className="py-3 px-4 text-gray-700 max-w-md">
											{a.address && a.address.trim().length > 0 ? (
												<button
													type="button"
													onClick={() => {
														setMapAddress(a.address!);
														setMapOpen(true);
													}}
													className="inline-flex items-center gap-1 text-[#007BFF] hover:underline max-w-full"
													title={`View on map: ${a.address}`}
												>
													<MapPin className="w-4 h-4" />
													<span className="truncate max-w-[18rem] text-left">{a.address}</span>
												</button>
											) : (
												<span className="text-gray-500">-</span>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between mt-4">
					<div className="flex justify-center items-center gap-2">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
									page === currentPage
										? "bg-[#EB5757] text-white"
										: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
								}`}
							>
								{page}
							</button>
						))}
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages || filtered.length === 0}
							className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Address Map Dialog */}
				<Dialog open={mapOpen} onOpenChange={setMapOpen}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle>Location</DialogTitle>
						</DialogHeader>
						<div className="rounded-lg overflow-hidden border">
							<AspectRatio ratio={16 / 9}>
								<iframe
									title={`Map for ${mapAddress}`}
									className="w-full h-full"
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
									allowFullScreen
								/>
							</AspectRatio>
						</div>
						<div className="mt-2 text-sm text-gray-600 truncate">{mapAddress}</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default ApplicationList;


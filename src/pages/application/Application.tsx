import React, { useEffect, useMemo, useState } from "react";
import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { GetAllApplicationUseCase } from "@/data/usecases/application.usecase";
import { useGetAllApplications } from "@/hooks/application/get-all-application.hook";
import { ChevronLeft, ChevronRight, Search, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsMap, { type AppItem } from "./components/ApplicationsMap";
import ApplicationStatusSelect from "@/components/application/update_application_status/ApplicationStatusSelect";

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const getAllApplicationUseCase = new GetAllApplicationUseCase(applicationInterface);

// moved ApplicationsMap into ./components/ApplicationsMap

const ApplicationList: React.FC = () => {
	const { applications, loading, error } = useGetAllApplications(getAllApplicationUseCase);
	const [currentPage, setCurrentPage] = useState(1);
	const [query, setQuery] = useState("");
	const [mapOpen, setMapOpen] = useState(false);
	const [mapAddress, setMapAddress] = useState<string>("");
	const [tab, setTab] = useState<'list' | 'map'>('list');

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

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
	const pageSlice = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filtered.slice(start, start + ITEMS_PER_PAGE);
	}, [filtered, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [query]);

	if (loading) return <div className="text-center py-8">Loading applications...</div>;
	if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

	return (
		<div className="font-sans antialiased text-gray-800">
			{/** Control Tabs to know when Map is visible */}
			<Tabs value={tab} onValueChange={(v) => setTab(v as 'list' | 'map')} className="space-y-4">
				<TabsList>
					<TabsTrigger value="list">List</TabsTrigger>
					<TabsTrigger value="map">Map</TabsTrigger>
				</TabsList>

				<TabsContent value="list" className="space-y-4">
					<div className="bg-white rounded-2xl p-4 shadow-sm">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
							<h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
							<div className="relative w-full md:w-80">
								<input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search name, phone, position..."
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
								/>
								<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							</div>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
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
											<td colSpan={7} className="py-6 px-4 text-center text-gray-500">
												{query ? "No applications match your search." : "No applications found."}
											</td>
										</tr>
									) : (
										pageSlice.map((a) => (
											<tr key={a._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
												<td className="py-3 px-4 font-medium text-gray-900">{a.name}</td>
												<td className="py-3 px-4 text-gray-700">{a.phoneNumber}</td>
												<td className="py-3 px-4 text-gray-700">{a.position}</td>
												<td className="py-3 px-4">
													<ApplicationStatusSelect
														applicationId={a._id}
														value={a.status}
														compact
														onUpdated={(ns) => {
															// Optimistically update the UI without refetch
															a.status = ns || a.status;
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
					</div>

					{/* Map Dialog */}
					<Dialog open={mapOpen} onOpenChange={setMapOpen}>
						<DialogContent className="max-w-3xl">
							<DialogHeader>
								<DialogTitle>Location</DialogTitle>
							</DialogHeader>
							<div className="rounded-md overflow-hidden">
								<AspectRatio ratio={16 / 9}>
									{mapAddress ? (
										<iframe
											title="Google Maps"
											className="w-full h-full border-0"
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
											src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
										/>
									) : null}
								</AspectRatio>
							</div>
						</DialogContent>
					</Dialog>
				</TabsContent>

				<TabsContent value="map">
					<ApplicationsMap active={tab === 'map'} applications={(applications ?? []) as AppItem[]} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default ApplicationList;


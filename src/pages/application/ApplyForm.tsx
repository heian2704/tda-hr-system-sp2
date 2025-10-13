import { AppStatus } from "@/constants/application-status.enum";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { CreateApplicationUseCase } from "@/data/usecases/application.usecase";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { useCreateApplication } from "@/hooks/application/create-application.hook";
import React, { useState } from "react";

const STORAGE_KEY = "jobApplications";

// const STATUS_OPTIONS = Object.values(AppStatus);

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const createApplicationUseCase = new CreateApplicationUseCase(applicationInterface);

const ApplyForm: React.FC = () => {
	const { create, loading, error, createdApplication } = useCreateApplication(createApplicationUseCase);

	type FormState = CreateApplicationDto;
	const initialForm: FormState = {
		name: "",
		phoneNumber: "",
		address: "",
		information: "",
		position: "",
		status: AppStatus.APPLIED,
		date: "",
	};

	const [form, setForm] = useState<FormState>(initialForm);
	const [submitting, setSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value } as FormState));
	};

	const resetForm = () => {
		setForm(initialForm);
	};

	const readApps = (): CreateApplicationDto[] => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? (JSON.parse(raw) as CreateApplicationDto[]) : [];
		} catch {
			return [];
		}
	};

	const writeApps = (apps: CreateApplicationDto[]) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
		} catch {
			// ignore
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;

		// Basic validation (date is generated automatically)
		if (!form.name.trim() || !form.phoneNumber.trim() || !form.position.trim()) {
			return; // You can show an inline error if desired
		}

		setSubmitting(true);
		try {
            const token = localStorage.getItem("token");
            const useTokenRequest = { token } as BearerTokenedRequest;
			const createAppDto: CreateApplicationDto = {
				name: form.name,
				phoneNumber: form.phoneNumber,
				address: form.address,
				information: form.information,
				position: form.position,
				status: form.status || AppStatus.APPLIED,
				date: new Date().toISOString(),
			};
			console.log("Submitting application:", createAppDto);
            await create(useTokenRequest, createAppDto);
			// Persist submitted form locally regardless of createdApplication timing
			const apps = readApps();
			apps.push({ ...createAppDto });
			writeApps(apps);
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2500);
			resetForm();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="font-sans antialiased text-gray-800 p-4">
			{showSuccess && (
				<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
					Application submitted successfully.
				</div>
			)}

			<div className="max-w-3xl mx-auto">
				<div className="bg-white rounded-2xl p-6 shadow-sm">
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900">Job Application</h2>
						<p className="text-gray-500 mt-1">Fill in your information to apply for the position.</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
								<input
									name="name"
									type="text"
									value={form.name}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
									placeholder="e.g. John Doe"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
								<input
									name="phoneNumber"
									type="tel"
									value={form.phoneNumber}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
									placeholder="e.g. 09-xxxxxxx"
									required
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
								<input
									name="address"
									type="text"
									value={form.address}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
									placeholder="Street, City, State"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
								<input
									name="position"
									type="text"
									value={form.position}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
									placeholder="e.g. Operator"
									required
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-600 mb-1">Additional Information</label>
								<textarea
									name="information"
									value={form.information}
									onChange={handleChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-y min-h-[100px]"
									placeholder="Tell us about your experience, availability, etc."
								/>
							</div>
						</div>

						<div className="flex items-center justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={resetForm}
								className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
								disabled={submitting}
							>
								Reset
							</button>
							<button
								type="submit"
								className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
								disabled={submitting}
							>
								{submitting ? "Submitting..." : "Submit Application"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ApplyForm;


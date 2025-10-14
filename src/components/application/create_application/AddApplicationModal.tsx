import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApplicationInterface } from "@/domain/interfaces/application/ApplicationInterface";
import { ApplicationInterfaceImpl } from "@/data/interface-implementation/application";
import { CreateApplicationUseCase } from "@/data/usecases/application.usecase";
import { useCreateApplication } from "@/hooks/application/create-application.hook";
import type { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import type { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { AppStatus } from "@/constants/application-status.enum";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // parent can refetch
};

const applicationInterface: ApplicationInterface = new ApplicationInterfaceImpl();
const createApplicationUseCase = new CreateApplicationUseCase(applicationInterface);

const initialForm: CreateApplicationDto = {
  name: "",
  phoneNumber: "",
  address: "",
  information: "",
  position: "",
  status: AppStatus.APPLIED,
  date: new Date().toISOString(),
};

const AddApplicationModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const { create, loading } = useCreateApplication(createApplicationUseCase);
  const [form, setForm] = useState<CreateApplicationDto>(initialForm);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if(name === '' && value === '') return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const req: BearerTokenedRequest = { token } as BearerTokenedRequest;
    // Ensure date is ISO
    const dto: CreateApplicationDto = { ...form, date: new Date(form.date || Date.now()).toISOString() };
    await create(req, dto);
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="relative bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>

  <h2 className="text-2xl font-bold text-center mb-6">{translations?.applicationPage?.createButton || 'Create Application'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.applicationPage?.nameColumn || 'Name'}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder={translations?.applicationApplyPage?.fullNamePlaceholder || 'e.g. John Doe'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.applicationApplyPage?.phoneNumberLabel || 'Phone Number'}</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder={translations?.applicationApplyPage?.phoneNumberPlaceholder || 'e.g. 09-xxxxxxx'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.applicationApplyPage?.addressLabel || 'Address'}</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder={translations?.applicationApplyPage?.addressPlaceholder || 'Street, City, State'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.applicationApplyPage?.infoLabel || 'Additional Information'}</label>
            <textarea
              name="information"
              value={form.information}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder={translations?.applicationApplyPage?.infoPlaceholder || 'Tell us about your experience, availability, etc.'}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value=''>Select Status</option>
                <option value={AppStatus.ACCEPTED}>Accept</option>
                <option value={AppStatus.REJECTED}>Reject</option>
              </select>
            </div> */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.applicationApplyPage?.positionLabel || 'Position'}</label>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder={translations?.applicationApplyPage?.positionPlaceholder || 'e.g. Operator'}
            />
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{translations?.payrollPage?.date || 'Date'}</label>
              <input
                name="date"
                type="date"
                value={form.date ? new Date(form.date).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {translations?.employeePage?.cancelButton || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#EB5757] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              {loading ? (translations?.employeePage?.saving || 'Saving...') : (translations?.applicationPage?.createButton || 'Create Application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApplicationModal;

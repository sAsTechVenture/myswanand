"use client";
import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  CalendarCheck,
  Upload,
} from "lucide-react";

export default function ApplySwanandCardForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData(e.currentTarget);

  // convert age to number (backend still needs this)
  const age = formData.get("age");
  if (age) formData.set("age", String(Number(age)));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/health-cards/apply`,
    {
      method: "POST",
      credentials: "include",
      body: formData, // ✅ NO headers here
    }
  );

  setLoading(false);

  if (res.ok) onSuccess();
  else alert("Something went wrong");
};


  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl bg-white p-4 shadow-md"
    >
      {/* TOP ICON STRIP */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <TopIcon icon={<ShieldCheck size={18} />} text="Health Protection" />
        <TopIcon icon={<FileText size={18} />} text="Policy Coverage" />
        <TopIcon icon={<CalendarCheck size={18} />} text="Scheduled Account" />
      </div>

      {/* APPLICATION FORM TITLE */}
      <p className="text-center text-xs font-semibold text-[#5E2E85]">
        Application Form
      </p>

      {/* CARD TYPE */}
      <div className="rounded-xl bg-[#EDE6F6] p-3">
        <p className="mb-2 text-xs font-medium text-gray-700">
          Select Health Card Type*
        </p>
        <div className="flex gap-2">
          <RadioCard label="Individual" value="INDIVIDUAL" />
          <RadioCard label="Family" value="FAMILY" />
        </div>
      </div>

      {/* NAME */}
      <Field label="Full Name Of Health Card Holder*" placeholder="Enter Full Name" name="Enter Full Name" required />

      {/* AGE + DOB */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" name="age" placeholder="Age" type="number" required />
        <Field label="DOB" name="dateOfBirth" type="date" required />
      </div>

      {/* ADDRESS */}
      <Section title="Address Details">
        <Field name="Flat No/House No" placeholder="Flat No" />
        <Field name="BuildingName" placeholder="Building/Society Name" />
        <Field name="Area/Locality" placeholder="Area Name" />
        <Field name="City" placeholder="Name of City" />
      </Section>

      {/* CONTACT */}
      <Section title="Contact Information">
        <Field name="contactNumber" placeholder="Contact Number" required />
        <Field
          name="emergencyContact"
          placeholder="Emergency Contact"
          required
        />
      </Section>

      {/* PHOTO UPLOAD  */}
      <div className="rounded-xl border-2 border-dashed border-[#D8C7EE] p-6 text-center">
  <Upload className="mx-auto mb-2 text-[#5E2E85]" />
  <p className="mb-2 text-xs text-gray-500">
    Upload Card Holder Photo
  </p>

  <input
    type="file"
    name="photo"
    accept="image/*"
    required
    className="mx-auto block text-xs"
  />
</div>

      {/* SUBMIT */}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-[#5E2E85] py-3 text-sm font-semibold text-white"
      >
        {loading ? "Submitting..." : "SUBMIT APPLICATION"}
      </button>

      <p className="text-center text-[10px] text-gray-400">
        By submitting this form, you agree to the terms & conditions
      </p>

      {/* NEED HELP */}
      <div className="rounded-xl bg-[#5E2E85] p-4 text-center text-white">
        <p className="text-sm font-semibold">Need Help?</p>
        <p className="mt-1 text-xs">Contact us for assistance</p>
        <div className="mt-3 rounded-lg bg-white py-2 text-sm font-medium text-[#5E2E85]">
          Email: info@swanandpathology.com
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="rounded-xl bg-[#EAF7F2] p-3 text-center text-[10px] text-gray-600">
        Click proceed to continue your application
      </div>
    </form>
  );
}

/* -------------------- UI HELPERS -------------------- */

function TopIcon({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-xl bg-[#EDE6F6] p-2">
      <div className="mx-auto mb-1 w-fit text-[#5E2E85]">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

function RadioCard({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-1 items-center justify-between rounded-lg bg-white px-3 py-2 text-xs">
      {label}
      <input type="radio" name="cardType" value={value} required />
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#5E2E85]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-[11px] text-gray-700">
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#5E2E85]"
      />
    </div>
  );
}

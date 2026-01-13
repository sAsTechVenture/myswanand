"use client";
import { useState } from "react";

export default function ApplySwanandCardForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = Object.fromEntries(
      new FormData(e.currentTarget)
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/health-cards/apply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );

    setLoading(false);
    if (res.ok) onSuccess();
    else alert("Something went wrong");
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow-lg"
    >
      <select name="cardType" required className="input">
        <option value="">Select Card Type</option>
        <option value="INDIVIDUAL">Individual</option>
        <option value="FAMILY">Family</option>
      </select>

      <input name="fullName" placeholder="Full Name" required className="input" />
      <input name="age" type="number" required className="input" />
      <input name="dateOfBirth" type="date" required className="input" />

      <input name="flatNumber" placeholder="Flat No" className="input" />
      <input name="buildingName" placeholder="Building Name" className="input" />
      <input name="areaName" placeholder="Area Name" className="input" />
      <input name="city" placeholder="City" className="input" />

      <input name="contactNumber" placeholder="Contact Number" required className="input" />
      <input name="emergencyContact" placeholder="Emergency Contact" required className="input" />
      <input name="relationship" placeholder="Relationship (if family)" className="input" />

      <button disabled={loading} className="btn-primary w-full">
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}

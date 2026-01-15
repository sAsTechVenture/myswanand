"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApplySwanandCardForm from "@/app/swanand-card/apply/ApplySwanandCardForm";
import { colors } from "@/config/theme";

export default function SwanandCardApplyPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl bg-white p-8 shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">
            ✅ Application Submitted
          </h2>
          <p className="text-gray-600 mb-6">
            Our team will review your Swanand Card application shortly.
          </p>

          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10"
      style={{ backgroundColor: colors.primaryLightest }}
    >
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Swanand Card Application
        </h1>

        <ApplySwanandCardForm onSuccess={() => setSuccess(true)} />
      </div>
    </div>
  );
}
       
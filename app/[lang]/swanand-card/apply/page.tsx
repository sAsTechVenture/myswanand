"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/lib/hooks/useLocalizedRouter";
import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import ApplySwanandCardForm from "./ApplySwanandCardForm";
import { colors } from "@/config/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SwanandCardApplyPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const localizedRouter = useLocalizedRouter();
  const [success, setSuccess] = useState(false);

  // Helper function to get translation
  const t = (key: string): string => {
    if (!dictionary) return key;
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-10 px-4"
        style={{ backgroundColor: colors.primaryLightest }}
      >
        <Card className="p-8 shadow-lg text-center max-w-md w-full">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16" style={{ color: colors.primary }} />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: colors.black }}
          >
            Application Submitted
          </h2>
          <p className="text-gray-600 mb-6">
            Our team will review your Swanand Card application shortly. You will be notified once it is processed.
          </p>

          <Button
            onClick={() => localizedRouter.push("/")}
            className="w-full"
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10"
      style={{ backgroundColor: colors.primaryLightest }}
    >
      <div className="mx-auto max-w-2xl px-4">
        <h1 
          className="mb-6 text-center text-3xl font-bold"
          style={{ color: colors.primary }}
        >
          {t('common.swanandCardApplication')}
        </h1>

        <ApplySwanandCardForm onSuccess={() => setSuccess(true)} />
      </div>
    </div>
  );
}
       
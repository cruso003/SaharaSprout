"use client"

import { FarmProvider } from "@/lib/context/farm-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FarmProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </FarmProvider>
  );
}

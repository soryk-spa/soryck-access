import { DashboardLayout } from "@/components/dashboard-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      title="Panel de Administración"
      showSearch={true}
    >
      {children}
    </DashboardLayout>
  );
}

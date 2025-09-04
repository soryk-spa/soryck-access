import { DashboardLayout } from "@/components/dashboard-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-inter">
      <DashboardLayout 
        title="Panel de Administración"
        showSearch={true}
      >
        {children}
      </DashboardLayout>
    </div>
  );
}

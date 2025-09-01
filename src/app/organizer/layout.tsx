import { DashboardLayout } from "@/components/dashboard-layout";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      title="Gestión de Organizador"
      showSearch={true}
    >
      {children}
    </DashboardLayout>
  );
}

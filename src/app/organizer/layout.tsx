import { DashboardLayout } from "@/components/dashboard-layout";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      title="Gestión de Asientos"
      showSearch={true}
    >
      {children}
    </DashboardLayout>
  );
}

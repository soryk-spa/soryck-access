import { DashboardLayout } from "@/components/dashboard-layout";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-roboto">
      <DashboardLayout 
        title="Gestión de Organizador"
        showSearch={true}
      >
        {children}
      </DashboardLayout>
    </div>
  );
}

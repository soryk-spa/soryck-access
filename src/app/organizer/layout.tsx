import { DashboardLayout } from "@/components/dashboard-layout";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      title="Panel del Organizador"
      showSearch={true}
    >
      {children}
    </DashboardLayout>
  );
}

import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SorykPass",
  description: "Panel de control principal",
};

export default function OrganizerDashboardPage() {
  // Redirect to the unified main dashboard
  redirect("/dashboard");
}

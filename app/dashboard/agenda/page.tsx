import { redirect } from "next/navigation";

export default function DashboardAgendaRedirect() {
  redirect("/dashboard/calendar");
}

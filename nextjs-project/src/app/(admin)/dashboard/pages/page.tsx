import { redirect } from "next/navigation";

export default function DashboardPages() {

    redirect("/dashboard/pages/home");

    return null;
};
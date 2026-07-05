import { redirect } from "next/navigation";
export default function LegacyRedirect({ params }) {
  redirect(`/super-admin/organisations/${params.schoolId}/admins`);
}

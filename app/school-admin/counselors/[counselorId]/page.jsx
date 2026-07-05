import { redirect } from "next/navigation";
export default function LegacyRedirect({ params }) {
  redirect(`/org-admin/support-staff/${params.counselorId}`);
}

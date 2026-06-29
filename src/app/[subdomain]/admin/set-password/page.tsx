import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { setPassword } from "@/features/admin/auth/actions";
import { SetPasswordForm } from "@/features/admin/auth/set-password-form";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SetPasswordPage({ params }: PageProps) {
  const { subdomain } = await params;

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/admin/login");
  }

  return <SetPasswordForm setPasswordAction={setPassword.bind(null, subdomain)} />;
}

import { signIn, requestPasswordReset } from "@/features/admin/auth/actions";
import { LoginForm } from "@/features/admin/auth/login-form";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function AdminLoginPage({ params }: PageProps) {
  const { subdomain } = await params;

  return (
    <LoginForm
      subdomain={subdomain}
      signInAction={signIn.bind(null, subdomain)}
      resetAction={requestPasswordReset}
    />
  );
}

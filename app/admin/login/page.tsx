import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdminEmail } from "@/lib/adminAuth";
import AdminLoginForm from "./login-form";

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    console.error("Gagal memeriksa sesi admin:", error.message);
  }

  if (user && isAdminEmail(user.email)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminLoginForm
      initialError={
        user
          ? "Akun ini tidak terdaftar sebagai administrator. Gunakan akun admin yang diizinkan."
          : undefined
      }
    />
  );
}

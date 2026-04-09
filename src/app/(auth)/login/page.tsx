import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Ten21
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestion de tienda
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

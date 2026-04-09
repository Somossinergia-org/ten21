import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { Role } from "@prisma/client";

const defaultPageByRole: Record<Role, string> = {
  JEFE: "/dashboard",
  ALMACEN: "/reception",
  REPARTO: "/vehicles",
};

export default async function Home() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(defaultPageByRole[session.user.role]);
}

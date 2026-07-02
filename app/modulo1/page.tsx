import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Modulo1Client } from "@/components/Modulo1Client";

export default async function Modulo1Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <Modulo1Client />;
}

import { serviceSupabase } from "./supabase";

export async function isAdmin(userId: string) {
  const { data, error } = await serviceSupabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) return false;

  return data?.role === "admin";
}
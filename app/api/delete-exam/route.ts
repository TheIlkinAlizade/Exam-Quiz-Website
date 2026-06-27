import { NextRequest, NextResponse } from "next/server";
import { createUserClient, serviceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2. User client (for auth only)
    const userClient = createUserClient(token);

    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Check admin role
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Parse body
    const { examId } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 });
    }

    // 5. DELETE using SERVICE ROLE (bypasses RLS)
    const { error: qErr } = await serviceSupabase
      .from("questions")
      .delete()
      .eq("exam_id", examId);

    if (qErr) throw qErr;

    const { error: eErr } = await serviceSupabase
      .from("exams")
      .delete()
      .eq("id", examId);

    if (eErr) throw eErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete exam error:", err);

    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
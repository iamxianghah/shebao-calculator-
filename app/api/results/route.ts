import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("employee_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: "获取数据失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "处理请求失败",
      },
      { status: 500 }
    );
  }
}

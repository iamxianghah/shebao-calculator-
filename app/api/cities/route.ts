import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { parseCitiesExcel } from "@/lib/excel";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "无效的数据格式" },
        { status: 400 }
      );
    }

    // 将数组转换回 ArrayBuffer
    const buffer = new Uint8Array(data).buffer;

    // 解析 Excel
    const parseResult = parseCitiesExcel(buffer);
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 400 }
      );
    }

    // 清空旧数据
    const { error: deleteError } = await supabase
      .from("cities")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "清空旧数据失败" },
        { status: 500 }
      );
    }

    // 插入新数据
    const { error: insertError } = await supabase
      .from("cities")
      .insert(parseResult.data);

    if (insertError) {
      return NextResponse.json(
        { success: false, error: "插入数据失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: parseResult.data.length,
    });
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

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("cities").select("*");

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

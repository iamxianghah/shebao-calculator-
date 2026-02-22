import { NextRequest, NextResponse } from "next/server";
import { calculateAndStoreResults } from "@/lib/calculate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityName } = body;

    if (!cityName) {
      return NextResponse.json(
        { success: false, error: "请提供城市名称" },
        { status: 400 }
      );
    }

    const result = await calculateAndStoreResults(cityName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "计算失败",
      },
      { status: 500 }
    );
  }
}

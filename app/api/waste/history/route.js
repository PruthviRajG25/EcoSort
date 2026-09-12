import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import WastePrediction from "@/models/WastePrediction";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = user ? { userId: user._id } : {};

    const [history, total] = await Promise.all([
      WastePrediction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WastePrediction.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          history,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            limit,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waste History Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch waste history" },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import WastePrediction from "@/models/WastePrediction";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { condition } = body;

    await connectToDatabase();

    const prediction = await WastePrediction.findByIdAndUpdate(
      id,
      { condition },
      { new: true }
    );

    if (!prediction) {
      return NextResponse.json(
        { success: false, error: { message: "Prediction not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          prediction,
          recommendation: prediction.recommendation,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Condition Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update condition" } },
      { status: 500 }
    );
  }
}

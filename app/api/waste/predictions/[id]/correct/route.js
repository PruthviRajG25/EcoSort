import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import WastePrediction from "@/models/WastePrediction";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { correctedCategory } = body;

    await connectToDatabase();

    const prediction = await WastePrediction.findByIdAndUpdate(
      id,
      { category: correctedCategory },
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submit Correction Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to submit correction" } },
      { status: 500 }
    );
  }
}

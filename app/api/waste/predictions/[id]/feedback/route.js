import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { wasUseful, comment } = body;

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully.",
        data: {
          predictionId: id,
          wasUseful,
          comment,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to submit feedback" } },
      { status: 500 }
    );
  }
}

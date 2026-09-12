import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            ecoPoints: user.ecoPoints || 150,
            ecoLevel: user.ecoLevel || "Eco Pioneer",
            profileImage: user.profileImage || "",
            createdAt: user.createdAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Internal server error" },
      },
      { status: 500 }
    );
  }
}

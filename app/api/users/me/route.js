import { NextResponse } from "next/server";
import { getCurrentUser, clearAuthCookies } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import WastePrediction from "@/models/WastePrediction";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const scanCount = await WastePrediction.countDocuments({ userId: user._id });

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
            totalScans: scanCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    await connectToDatabase();
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return NextResponse.json(
      {
        success: true,
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to update profile" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    await connectToDatabase();
    await User.findByIdAndDelete(user._id);
    await WastePrediction.deleteMany({ userId: user._id });

    const response = NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete account" } },
      { status: 500 }
    );
  }
}

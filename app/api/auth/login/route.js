import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { signToken, setAuthCookies } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Email and password are required." },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Incorrect email or password. Please verify your credentials." },
        },
        { status: 401 }
      );
    }

    const token = signToken(user._id.toString());

    const userPayload = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      ecoPoints: user.ecoPoints || 150,
      ecoLevel: user.ecoLevel || "Eco Pioneer",
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userPayload,
          token,
        },
      },
      { status: 200 }
    );

    await setAuthCookies(response, token);
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || "Authentication failed. Please try again." },
      },
      { status: 500 }
    );
  }
}

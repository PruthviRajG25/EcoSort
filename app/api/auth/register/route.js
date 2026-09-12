import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { signToken, setAuthCookies } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Name, email, and password are required." },
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Password must be at least 6 characters long." },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "An account with this email already exists. Please log in." },
        },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      ecoPoints: 150,
      ecoLevel: "Eco Pioneer",
    });

    const token = signToken(newUser._id.toString());

    // Prepare response
    const userPayload = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      ecoPoints: newUser.ecoPoints,
      ecoLevel: newUser.ecoLevel,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userPayload,
          token,
        },
      },
      { status: 201 }
    );

    await setAuthCookies(response, token);
    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || "Failed to create account. Please try again." },
      },
      { status: 500 }
    );
  }
}

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import User from "@/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ecosort_jwt_secret_key_production_2026_super_secure_987654321";

export function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function setAuthCookies(response, token) {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60; // 7 days

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  response.cookies.set("ecosort_authenticated", "true", {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearAuthCookies(response) {
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set("ecosort_authenticated", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getCurrentUser(request) {
  try {
    let token = null;

    // Check Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check cookies
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id).select("-password");
    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;

    if (!adminUsername || !adminPassword || !authSecret) {
      console.error("Missing admin authentication environment variables.");

      return NextResponse.json(
        { error: "Admin login is not configured on the server." },
        { status: 500 },
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(authSecret);

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Unable to process admin login." },
      { status: 500 },
    );
  }
}

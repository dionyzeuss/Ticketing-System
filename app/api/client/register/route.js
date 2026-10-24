import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Validate required fields
    if (!name || !email || typeof password !== "string") {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Check whether the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Do not create a session here.
    // The client must log in separately.

    return NextResponse.json(
      {
        message: "Account created successfully. Please log in.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Client registration error:", error);

    return NextResponse.json(
      {
        error: "Registration failed. Check the server terminal for details.",
      },
      { status: 500 },
    );
  }
}

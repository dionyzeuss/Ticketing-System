import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/client-auth";

export async function GET() {
  try {
    const user = await getClientSession();

    if (!user) {
      return NextResponse.json(
        { error: "You are not logged in." },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get client session error:", error);

    return NextResponse.json(
      { error: "Unable to check your session." },
      { status: 500 },
    );
  }
}

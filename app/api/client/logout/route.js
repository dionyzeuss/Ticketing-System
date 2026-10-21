import { NextResponse } from "next/server";
import { destroyClientSession } from "@/lib/client-auth";

export async function POST() {
  try {
    await destroyClientSession();

    return NextResponse.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Client logout error:", error);

    return NextResponse.json({ error: "Unable to log out." }, { status: 500 });
  }
}

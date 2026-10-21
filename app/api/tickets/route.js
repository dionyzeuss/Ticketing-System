
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);

    return NextResponse.json(
      { error: "Failed to fetch tickets." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim();
    const priority = body.priority;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const allowedPriorities = ["Low", "Medium", "High", "Critical"];

    if (!allowedPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket:", error);

    return NextResponse.json(
      { error: "Failed to create ticket." },
      { status: 500 }
    );
  }
}

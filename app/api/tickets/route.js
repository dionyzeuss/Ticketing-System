//it-support-system\app\api\tickets\route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET: Retrieve all tickets, including the client who submitted each ticket
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);

    return NextResponse.json(
      { error: "Failed to fetch tickets." },
      { status: 500 },
    );
  }
}

// POST: Create a ticket from the admin dashboard
export async function POST(request) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const allowedPriorities = ["Low", "Medium", "High", "Critical"];
    const priority = body.priority;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 },
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        { error: "Title must be 150 characters or fewer." },
        { status: 400 },
      );
    }

    if (!allowedPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Failed to create ticket:", error);

    return NextResponse.json(
      { error: "Failed to create ticket." },
      { status: 500 },
    );
  }
}

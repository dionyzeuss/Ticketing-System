import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";

// GET: Retrieve tickets belonging to the logged-in client
export async function GET() {
  try {
    const user = await getClientSession();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to view your tickets." },
        { status: 401 },
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        clientId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Fetch client tickets error:", error);

    return NextResponse.json(
      { error: "Unable to load tickets." },
      { status: 500 },
    );
  }
}

// POST: Submit a new support ticket
export async function POST(request) {
  try {
    const user = await getClientSession();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to submit a ticket." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const allowedPriorities = ["Low", "Medium", "High", "Critical"];

    const priority = allowedPriorities.includes(body.priority)
      ? body.priority
      : "Medium";

    if (!title || !description) {
      return NextResponse.json(
        { error: "Please enter a title and description." },
        { status: 400 },
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        { error: "The title must be 150 characters or fewer." },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        clientId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Ticket submitted successfully.",
        ticket,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create client ticket error:", error);

    return NextResponse.json(
      { error: "Unable to submit your ticket." },
      { status: 500 },
    );
  }
}

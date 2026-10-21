import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const allowedStatuses = ["Open", "In Progress", "Resolved"];
const allowedPriorities = ["Low", "Medium", "High", "Critical"];

const allowedAssignees = [
  "Unassigned",
  "Domnic Escalante",
  "IT Support Staff 2",
  "IT Support Staff 3",
];

async function getTicketId(params) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return null;
  }

  return ticketId;
}

// GET: Retrieve one ticket
export async function GET(request, { params }) {
  try {
    const ticketId = await getTicketId(params);

    if (!ticketId) {
      return NextResponse.json(
        { error: "Invalid ticket ID." },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Failed to fetch ticket:", error);

    return NextResponse.json(
      { error: "Failed to fetch ticket." },
      { status: 500 },
    );
  }
}

// PATCH: Update ticket details or status
export async function PATCH(request, { params }) {
  try {
    const ticketId = await getTicketId(params);

    if (!ticketId) {
      return NextResponse.json(
        { error: "Invalid ticket ID." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const data = {};

    if ("title" in body) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { error: "Title is required." },
          { status: 400 },
        );
      }

      data.title = body.title.trim();
    }

    if ("description" in body) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return NextResponse.json(
          { error: "Description is required." },
          { status: 400 },
        );
      }

      data.description = body.description.trim();
    }

    if ("priority" in body) {
      if (!allowedPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority." },
          { status: 400 },
        );
      }

      data.priority = body.priority;
    }

    if ("status" in body) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid ticket status." },
          { status: 400 },
        );
      }

      data.status = body.status;
    }

    if ("assignedTo" in body) {
      if (
        typeof body.assignedTo !== "string" ||
        !allowedAssignees.includes(body.assignedTo)
      ) {
        return NextResponse.json(
          { error: "Invalid assigned staff member." },
          { status: 400 },
        );
      }

      data.assignedTo = body.assignedTo;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update." },
        { status: 400 },
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    console.error("Failed to update ticket:", error);

    return NextResponse.json(
      { error: "Failed to update ticket." },
      { status: 500 },
    );
  }
}

// DELETE: Permanently delete one ticket
export async function DELETE(request, { params }) {
  try {
    const ticketId = await getTicketId(params);

    if (!ticketId) {
      return NextResponse.json(
        { error: "Invalid ticket ID." },
        { status: 400 },
      );
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({
      message: "Ticket deleted successfully.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    console.error("Failed to delete ticket:", error);

    return NextResponse.json(
      { error: "Failed to delete ticket." },
      { status: 500 },
    );
  }
}

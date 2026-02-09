import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PATCH - Update log
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const { id, logId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify log belongs to project
    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (!log || log.projectId !== id) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Update log
    const updatedLog = await prisma.log.update({
      where: { id: logId },
      data: { content },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error updating log:", error);
    return NextResponse.json(
      { error: "Failed to update log" },
      { status: 500 },
    );
  }
}

// DELETE - Delete log
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const { id, logId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify log belongs to project
    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (!log || log.projectId !== id) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Delete log
    await prisma.log.delete({
      where: { id: logId },
    });

    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { error: "Failed to delete log" },
      { status: 500 },
    );
  }
}

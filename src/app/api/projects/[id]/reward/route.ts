import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Add reward
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Reward description is required" },
        { status: 400 },
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: { reward: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if project is completed
    // if (project.status !== "complete") {
    //   return NextResponse.json(
    //     { error: "Can only add rewards to completed projects" },
    //     { status: 400 },
    //   );
    // }

    // Check if reward already exists
    if (project.reward) {
      return NextResponse.json(
        { error: "Project already has a reward" },
        { status: 400 },
      );
    }

    // Create reward
    const reward = await prisma.reward.create({
      data: {
        description,
        projectId: id,
      },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: "Failed to create reward" },
      { status: 500 },
    );
  }
}

// PATCH - Edit reward (requires password verification)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, password } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Reward description is required" },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: { reward: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!project.reward) {
      return NextResponse.json(
        { error: "No reward found for this project" },
        { status: 404 },
      );
    }

    // Update reward
    const updatedReward = await prisma.reward.update({
      where: { id: project.reward.id },
      data: { description },
    });

    return NextResponse.json(updatedReward);
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 },
    );
  }
}

// DELETE - Delete reward (requires password verification)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: { reward: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!project.reward) {
      return NextResponse.json(
        { error: "No reward found for this project" },
        { status: 404 },
      );
    }

    // Delete reward
    await prisma.reward.delete({
      where: { id: project.reward.id },
    });

    return NextResponse.json({ message: "Reward deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return NextResponse.json(
      { error: "Failed to delete reward" },
      { status: 500 },
    );
  }
}

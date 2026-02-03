import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
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

    if (project.status !== "complete") {
      return NextResponse.json(
        { error: "Can only add rewards to completed projects" },
        { status: 400 },
      );
    }

    if (project.reward) {
      return NextResponse.json(
        { error: "Project already has a reward" },
        { status: 400 },
      );
    }

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

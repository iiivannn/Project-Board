import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
      select: {
        id: true,
        username: true,
        theme: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 },
    );
  }
}

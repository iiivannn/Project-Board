import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import PublicTopBar from "@/components/PublicTopBar";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard/tasks");
  }

  return (
    <>
      <PublicTopBar variant="landing" />
      <div className="landing">
        <div className="landing-hero">
          <div className="landing-badge">Project Management</div>
          <h1 className="landing-title">Project Board</h1>
          <p className="landing-subtitle">
            Organize your work with a visual kanban board. Track tasks, manage
            projects, and collaborate — all in one place.
          </p>
          <div className="landing-actions">
            <Link href="/login" className="landing-btn landing-btn--primary">
              Sign In
            </Link>
            <Link href="/register" className="landing-btn landing-btn--outline">
              Create Account
            </Link>
          </div>
        </div>

        <div className="landing-features">
          <div className="landing-feature">
            <h3>Kanban Boards</h3>
            <p>
              Visualize your workflow with customizable columns and
              drag-and-drop cards.
            </p>
          </div>
          <div className="landing-feature">
            <h3>Multiple Projects</h3>
            <p>
              Switch between projects instantly and keep all your work
              organized.
            </p>
          </div>
          <div className="landing-feature">
            <h3>Fast & Simple</h3>
            <p>
              A clean interface focused on getting things done without the
              clutter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

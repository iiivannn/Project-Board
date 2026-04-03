import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import PublicTopBar from "@/components/PublicTopBar";
import { ClipboardList, ListChecks, Gift } from "lucide-react";
import Image from "next/image";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard/tasks");
  }

  return (
    <>
      <PublicTopBar variant="landing" />

      <main className="landing">
        <section className="landing-hero">
          <h1 className="landing-title">Turn your plans into progress</h1>
          <p className="landing-subtitle">
            Track projects, monitor progress, and deliver outcomes.
          </p>
          <div className="landing-actions">
            <Link href="/login" className="landing-btn landing-btn--primary">
              Open Project Board
            </Link>
          </div>
        </section>

        <section className="landing-overview">
          <div className="landing-section-badge">Overview</div>
          <h2 className="landing-section-title">
            Building momentum in each project
          </h2>
          <div className="landing-pillars">
            <div className="landing-pillar">
              <ClipboardList className="landing-pillar__icon" />
              <p>
                Establish your ideas into actionable plans with clear status
                tracking.
              </p>
            </div>
            <div className="landing-pillar">
              <ListChecks className="landing-pillar__icon" />
              <p>Track progress by logging completed tasks.</p>
            </div>
            <div className="landing-pillar">
              <Gift className="landing-pillar__icon" />
              <p>Reward project completion to build productive habits.</p>
            </div>
          </div>
          <div className="landing-screenshot-frame">
            <Image
              src="/project-board-tasks.png"
              alt="Project Board Tasks Page"
              width={1920}
              height={1080}
              sizes="(max-width: 768px) 100vw, 90vw"
              quality={90}
              className="landing-screenshot"
            />
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-section-badge">Features</div>
          <h2 className="landing-section-title">
            Building progress and completing projects
          </h2>
          <div className="landing-features-container">
            <div className="landing-features-wrapper">
              <div className="landing-feature-card">
                <div className="landing-feature-card__preview landing-feature-card__preview--amber">
                  <Image
                    src="/project-feature-card.png"
                    alt="Project Cards"
                    width={1920}
                    height={1080}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    quality={90}
                    className="landing-feature-img"
                  />
                </div>
                <div className="landing-feature-card__body">
                  <h3>Project Cards</h3>
                  <p>
                    Organize projects as interactive cards that you can drag,
                    drop, and click to view detailed information.
                  </p>
                </div>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-card__preview landing-feature-card__preview--cyan">
                  <Image
                    src="/project-feature-log.png"
                    alt="Project Logs"
                    width={1920}
                    height={1080}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    quality={90}
                    className="landing-feature-img"
                  />
                </div>
                <div className="landing-feature-card__body">
                  <h3>Track Completed Tasks</h3>
                  <p>
                    Log completed and upcoming tasks for each project, with the
                    ability to edit and update your task history as work
                    progresses.
                  </p>
                </div>
              </div>
            </div>

            <div className="landing-features-wrapper">
              <div className="landing-feature-card">
                <div className="landing-feature-card__preview landing-feature-card__preview--indigo">
                  <Image
                    src="/project-feature-rewards.png"
                    alt="Project Rewards"
                    width={1920}
                    height={1080}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    quality={90}
                    className="landing-feature-img"
                  />{" "}
                </div>
                <div className="landing-feature-card__body">
                  <h3>Manage Rewards</h3>
                  <p>
                    Set rewards for completing projects to reinforce positive
                    habits and maintain motivation throughout your workflow.
                  </p>
                </div>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-card__preview landing-feature-card__preview--green">
                  <Image
                    src="/project-feature-theme.png"
                    alt="Light Theme"
                    width={1920}
                    height={1080}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    quality={90}
                    className="landing-feature-img"
                  />
                </div>
                <div className="landing-feature-card__body">
                  <h3>Theme Switching</h3>
                  <p>
                    Easily switch between light and dark themes for a
                    comfortable workspace experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-footer">
          <div className="landing-footer__brand">
            <Image
              src="/project-board-logo.png"
              alt="Project Board Logo"
              width={24}
              height={24}
            />
            <span>Project Board</span>
          </div>
          <div className="landing-footer__tagline">
            Turn ideas into reality, one project at a time
          </div>
          <Link href="/login" className="landing-btn landing-btn--primary">
            Start Now
          </Link>
        </section>
      </main>
    </>
  );
}

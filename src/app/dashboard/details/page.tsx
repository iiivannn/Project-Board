"use client";

import { useState, useEffect } from "react";

type Reward = {
  id: string;
  description: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function DetailsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      try {
        const res = await fetch("/api/rewards");
        const data = await res.json();
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRewards();
  }, []);

  if (loading) {
    return <div className="loading">Loading rewards...</div>;
  }

  return (
    <div className="rewards-page">
      <h1>Project Rewards</h1>

      {rewards.length === 0 ? (
        <div className="empty-state">
          <p>
            No rewards yet! Complete projects and add rewards to see them here.
          </p>
        </div>
      ) : (
        <div className="rewards-table">
          <div className="table-header">
            <div className="header-cell">Project</div>
            <div className="header-cell">Reward</div>
            <div className="header-cell">Date Completed</div>
          </div>

          <div className="table-body">
            {rewards.map((reward) => (
              <div key={reward.id} className="table-row">
                <div className="table-cell">
                  <h3>{reward.project.title}</h3>
                  <p>{reward.project.description}</p>
                </div>
                <div className="table-cell reward-cell">
                  <span className="reward-badge">🎁 {reward.description}</span>
                </div>
                <div className="table-cell date-cell">
                  {new Date(reward.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

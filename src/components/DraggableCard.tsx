import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logs: { id: string; content: string; createdAt: string }[];
  reward: { id: string; description: string; createdAt: string } | null;
};

export default function DraggableCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`project-card ${project.status} ${isDragging ? "dragging" : ""}`}
      onClick={onClick}
    >
      <h3>{project.title}</h3>
      <p>{project.description}</p>

      {/* Show log count if there are logs */}
      {project.logs.length > 0 && (
        <span className="log-count">{project.logs.length} log(s)</span>
      )}

      {/* Show reward badge if exists */}
      {project.reward && (
        <span className="reward-badge">🎁 {project.reward.description}</span>
      )}
    </div>
  );
}

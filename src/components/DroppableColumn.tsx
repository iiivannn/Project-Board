import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableCard from "./DraggableCard";

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

export default function DroppableColumn({
  id,
  title,
  projects,
  onCardClick,
  headerButton,
}: {
  id: string;
  title: string;
  projects: Project[];
  onCardClick: (project: Project) => void;
  headerButton?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`column ${isOver ? "drag-over" : ""}`}>
      <div className="column-header">
        <h2>{title}</h2>
        {headerButton}
      </div>

      <div className="column-content">
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.length === 0 ? (
            <div className="empty-column">
              {isOver ? "Drop here" : `No ${title.toLowerCase()} projects`}
            </div>
          ) : (
            projects.map((project) => (
              <DraggableCard
                key={project.id}
                project={project}
                onClick={() => onCardClick(project)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface NoteCardProps {
  note: Note;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  similarity?: number;
}

export function NoteCard({ note, isActive, onClick, onDelete, similarity }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
        "hover:bg-sidebar-accent/50 hover:shadow-sm",
        isActive 
          ? "bg-sidebar-accent shadow-md border-border/50 scale-[1.02]" 
          : "bg-transparent text-sidebar-foreground/80"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className={cn(
          "font-semibold text-sm line-clamp-1",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {note.title || "Untitled Note"}
        </h3>
        {note.createdAt && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {note.content || "No content..."}
      </p>

      {/* Similarity score badge for search results */}
      {similarity !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/70 transition-all duration-500" 
              style={{ width: `${Math.min(similarity * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-primary/70">
            {(similarity * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 bottom-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

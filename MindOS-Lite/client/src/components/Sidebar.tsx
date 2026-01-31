import { useState } from "react";
import { useNotes, useCreateNote, useDeleteNote, useGenerateSummary, useSearchNotes } from "@/hooks/use-notes";
import { Plus, Search, BrainCircuit, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { NoteCard } from "./NoteCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import ReactMarkdown from "react-markdown";

interface SidebarProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function Sidebar({ selectedId, onSelect }: SidebarProps) {
  const { data: notes, isLoading } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const generateSummary = useGenerateSummary();
  const searchNotes = useSearchNotes();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleCreate = () => {
    createNote.mutate(
      { title: "New Note", content: "" },
      {
        onSuccess: (newNote) => onSelect(newNote.id),
      }
    );
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote.mutate(id);
      if (selectedId === id) onSelect(0); // Deselect
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    searchNotes.mutate(searchQuery, {
      onSuccess: (data) => setSearchResults(data),
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const displayNotes = searchResults || notes || [];

  return (
    <aside className="w-80 border-r border-border/50 bg-sidebar flex flex-col h-screen glass">
      {/* Header Area */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight">MindOS</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleCreate}
            disabled={createNote.isPending}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your brain..."
            className="pl-9 pr-8 bg-background/50 border-border/50 focus:bg-background transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* AI Actions */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group"
          onClick={() => {
            generateSummary.mutate();
            setShowSummary(true);
          }}
        >
          <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          Generate Weekly Summary
        </Button>
      </div>

      {/* Note List */}
      <ScrollArea className="flex-1 px-3 pb-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">Syncing mind...</p>
            </div>
          ) : displayNotes.length === 0 ? (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <p className="text-sm">No notes found.</p>
              {searchQuery ? (
                <Button variant="link" onClick={clearSearch} className="text-xs h-auto p-0 mt-2">
                  Clear search
                </Button>
              ) : (
                <p className="text-xs mt-1">Click + to start thinking.</p>
              )}
            </div>
          ) : (
            displayNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isActive={selectedId === note.id}
                onClick={() => onSelect(note.id)}
                onDelete={(e) => handleDelete(e, note.id)}
                similarity={note.similarity}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Weekly AI Summary
            </DialogTitle>
            <DialogDescription>
              A synthesized overview of your thoughts and notes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
            {generateSummary.isPending ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Analyzing your neural network...</p>
              </div>
            ) : generateSummary.isError ? (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                Failed to generate summary. Please try again.
              </div>
            ) : (
              <ReactMarkdown>{generateSummary.data?.summary || "No insights available."}</ReactMarkdown>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

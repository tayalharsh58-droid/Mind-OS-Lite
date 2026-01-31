import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Fetch all notes
export function useNotes() {
  return useQuery({
    queryKey: [api.notes.list.path],
    queryFn: async () => {
      const res = await fetch(api.notes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      return api.notes.list.responses[200].parse(data);
    },
  });
}

// Fetch single note
export function useNote(id: number | null) {
  return useQuery({
    queryKey: [api.notes.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.notes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch note");
      const data = await res.json();
      return api.notes.get.responses[200].parse(data);
    },
  });
}

// Create Note
export function useCreateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.notes.create.input>) => {
      const res = await fetch(api.notes.create.path, {
        method: api.notes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create note");
      }
      return api.notes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path] });
      toast({ title: "Note created", description: "Your new thought has been saved." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

// Delete Note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.notes.delete.path, { id });
      const res = await fetch(url, { 
        method: api.notes.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path] });
      toast({ title: "Trash emptied", description: "Note successfully deleted." });
    },
  });
}

// Search Notes
export function useSearchNotes() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(api.notes.search.path, {
        method: api.notes.search.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      return api.notes.search.responses[200].parse(data);
    },
  });
}

// Chat with Notes
export function useChatWithNotes() {
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(api.notes.chat.path, {
        method: api.notes.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      return api.notes.chat.responses[200].parse(data);
    },
  });
}

// Generate Summary
export function useGenerateSummary() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.notes.summary.path, {
        method: api.notes.summary.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Summary generation failed");
      const data = await res.json();
      return api.notes.summary.responses[200].parse(data);
    },
  });
}

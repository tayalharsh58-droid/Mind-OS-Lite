import { z } from 'zod';
import { insertNoteSchema, notes, searchSchema, chatSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes',
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/notes/:id',
      responses: {
        200: z.custom<typeof notes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes',
      input: insertNoteSchema,
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/notes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    search: {
      method: 'POST' as const,
      path: '/api/search',
      input: searchSchema,
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect & { similarity: number }>()),
      },
    },
    chat: {
      method: 'POST' as const,
      path: '/api/chat',
      input: chatSchema,
      responses: {
        200: z.object({ answer: z.string() }),
      },
    },
    summary: {
      method: 'POST' as const,
      path: '/api/summary',
      responses: {
        200: z.object({ summary: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

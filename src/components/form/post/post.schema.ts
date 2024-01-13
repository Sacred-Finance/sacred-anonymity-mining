import { z } from 'zod'

export const transformStringToOutputData = (str: string) => {
  // todo this needs more work
  return {
    time: Date.now(),
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: str,
        },
      },
    ],
    version: '2.22.2',
  }
}

// Combine the schemas for post creation
export const PostCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less').optional(),
  content: z.object({
    time: z.number(),
    blocks: z.array(
      z.object({
        type: z.string(),
        data: z.object({
          text: z.string().min(1, 'Comment is required').max(1000, 'Comment must be 1000 characters or less'),
        }),
      })
    ),
    version: z.string(),
  }),
})

export type PostCreationType = z.infer<typeof PostCreationSchema>

export const CommentCreationSchema = z.object({
  content: z.object({
    time: z.number(),
    blocks: z.array(
      z.object({
        type: z.string(),
        data: z.object({
          text: z.string().min(1, 'Comment is required').max(1000, 'Comment must be 1000 characters or less'),
        }),
      })
    ),
    version: z.string(),
  }),
})

export type CommentCreationType = z.infer<typeof CommentCreationSchema>

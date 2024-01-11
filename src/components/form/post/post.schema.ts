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
export const PostCreationSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less').optional(),
    content: z.object({
      time: z.number(),
      blocks: z.array(
        z.object({
          type: z.string(),
          data: z.object({
            text: z.string(),
          }),
        })
      ),
      version: z.string(),
    }),
  })
  .refine(
    data => {
      if (data.content) {
        try {
          // Attempt to transform the string into an OutputData object
          const outputData = transformStringToOutputData(data.content)
          // Perform additional validation if necessary
          // For example, check if outputData has the required blocks property
          return !!outputData
        } catch {
          // If transformation fails, return false to indicate invalid content
          return false
        }
      }
      // If content is not provided, it's valid (because it's optional)
      return true
    },
    {
      message: 'Content must be a valid JSON string that conforms to the OutputData structure',
      path: ['content'],
    }
  )

export type PostCreationType = z.infer<typeof PostCreationSchema>

export const CommentCreationSchema = z.object({
  content: z.object({
    time: z.number(),
    blocks: z.array(
      z.object({
        type: z.string(),
        data: z.object({
          text: z.string(),
        }),
      })
    ),
    version: z.string(),
  }),
})

export type CommentCreationType = z.infer<typeof CommentCreationSchema>

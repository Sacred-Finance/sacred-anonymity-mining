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
    title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less'),
    content: z.object({
      time: z.number(),
      blocks: z.array(
        z.object({
          type: z.string(),
          data: z.object({
            text: z.string().min(1, 'Content is required').max(1000, 'Content must be 1000 characters or less'),
          }),
        })
      ),
      version: z.string(),
    }),
  })
  .refine(
    data => {
      console.log('weeeee', data)
      if (data.content) {
        try {
          console.log(data.content)
          // Attempt to transform the string into an OutputData object
          const outputData = data.content.blocks

          if (outputData.length < 1) {
            return false
          }
          if (outputData.length > 1000) {
            return false
          }

          if (outputData) {
            if (outputData.reduce((acc, curr) => acc + curr.data.text.length, 0) > 1000) {
              return false
            }
            if (outputData.reduce((acc, curr) => acc + curr.data.text.length, 0) < 1) {
              return false
            }
          }

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

export const CommentCreationSchema = z
  .object({
    content: z.object({
      time: z.number(),
      blocks: z
        .array(
          z.object({
            type: z.string(),
            data: z.object({
              text: z.string().min(1, 'Comment is required').max(1000, 'Comment must be 1000 characters or less'),
            }),
          })
        )
        .min(1, 'Comment is required'),
      version: z.string(),
    }),
  })
  .refine(
    data => {
      if (data.content) {
        try {
          console.log(data.content)
          // Attempt to transform the string into an OutputData object
          const outputData = data.content.blocks

          if (outputData.length < 1) {
            return false
          }
          if (outputData.length > 1000) {
            return false
          }

          if (outputData) {
            if (outputData.reduce((acc, curr) => acc + curr.data.text.length, 0) > 1000) {
              return false
            }
            if (outputData.reduce((acc, curr) => acc + curr.data.text.length, 0) < 1) {
              return false
            }
          }

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

export type CommentCreationType = z.infer<typeof CommentCreationSchema>

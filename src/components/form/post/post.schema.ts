import { z } from 'zod'

const nonEmptyTextBlock = z.object({
  text: z.string().min(1), // Ensure text is not empty
})

const textBlock = z.object({
  text: z.string(),
})

const headerBlock = textBlock.extend({
  level: z.number(),
})

const paragraphBlock = nonEmptyTextBlock.extend({
  tunes: z.boolean().optional(),
})

const checklistBlock = z.object({
  items: z.array(
    z.object({
      text: z.string(),
      checked: z.boolean(),
    })
  ),
})

const delimiterBlock = z.object({})

const embedBlock = z.object({
  service: z.string(),
  source: z.string(),
  embed: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const inlineCodeBlock = z.object({
  code: z.string(),
})

const listBlock = z.object({
  style: z.string(),
  data: z.array(
    z.object({
      text: z.string(),
    })
  ),
})

const markerBlock = textBlock

const quoteBlock = textBlock.extend({
  caption: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
})

const rawBlock = z.object({
  html: z.string(),
})

const tableBlock = z.object({
  content: z.array(z.array(z.string())),
})

const warningBlock = z.object({
  title: z.string(),
  message: z.string(),
})

const underlineBlock = textBlock

const imageBlock = z.object({
  url: z.string(),
  // Add additional properties for the image data if needed
})

const blockUnion = z.union([
  headerBlock,
  paragraphBlock,
  checklistBlock,
  delimiterBlock,
  embedBlock,
  inlineCodeBlock,
  listBlock,
  markerBlock,
  quoteBlock,
  rawBlock,
  tableBlock,
  warningBlock,
  underlineBlock,
  imageBlock,
])

export const PostCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less').optional(),
  description: z.object({
    time: z.number(),
    blocks: z
      .array(
        z.object({
          type: z.string(),
          data: blockUnion,
        })
      )
      .nonempty(),
    version: z.string(),
  }),
})

export type PostCreationType = z.infer<typeof PostCreationSchema>

export const CommentCreationSchema = z.object({
  description: z.object({
    time: z.number(),
    blocks: z
      .array(
        z.object({
          type: z.string(),
          data: blockUnion, // This now uses nonEmptyTextBlock to ensure that text is not empty
        })
      )
      .nonempty(), // Ensure there's at least one block
    version: z.string(),
  }),
})

export type CommentCreationType = z.infer<typeof CommentCreationSchema>

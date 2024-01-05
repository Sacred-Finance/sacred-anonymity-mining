import * as z from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 5 // 5MB
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const fileSchema = z
  .any()
  .refine(file => typeof window !== 'undefined' && file instanceof File, 'Must be a file')
  .refine(file => file.size <= MAX_FILE_SIZE, {
    message: 'Max image size is 5MB.',
  })
  .refine(file => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type), {
    message: 'Only .jpg, .jpeg, .png, .gif and .webp formats are supported.',
  })
  .optional()

export const groupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required'),
  description: z.string().min(10, 'Description is required'),
  tags: z.array(z.string()).max(5, 'Maximum of 5 tags allowed').optional(),
  bannerFile: fileSchema,
  logoFile: fileSchema,
})

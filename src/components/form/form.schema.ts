import * as z from 'zod'
const groupNameSchema = z.string().min(1, 'Group name is required')
const groupDescriptionSchema = z.string().min(1, 'Description is required')
const tagsSchema = z
  .array(z.string())
  .max(5, 'Maximum of 5 tags allowed')
  .optional()

const MAX_FILE_SIZE = 1024 * 1024 * 5
const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const fileSchema = z
  .any()
  .refine(files => {
    return files?.size <= MAX_FILE_SIZE
  }, `Max image size is 5MB.`)
  .refine(
    files => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported.'
  )
  .optional()
  .nullable()

const bannerFileSchema = fileSchema
const logoFileSchema = fileSchema

export const groupSchema = z.object({
  groupName: groupNameSchema,
  description: groupDescriptionSchema,
  tags: tagsSchema,
  bannerFile: bannerFileSchema,
  logoFile: logoFileSchema,
})

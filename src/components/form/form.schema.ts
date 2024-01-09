import * as z from 'zod'
import type { UseFormReturn } from 'react-hook-form'

const MAX_FILE_SIZE = 1024 * 1024 * 5 // 5MB
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const fileSchema = z
  .any()
  .refine(file => typeof window !== 'undefined' && file instanceof File, 'Must be a file')
  .refine(file => file?.size <= MAX_FILE_SIZE, {
    message: 'Max image size is 5MB.',
  })
  .refine(file => ACCEPTED_IMAGE_MIME_TYPES.includes(file?.type), {
    message: 'Only .jpg, .jpeg, .png, .gif and .webp formats are supported.',
  })
  .optional()

export const CreateGroupSchema = z.object({
  groupName: z.string().min(5, 'Group name is required'),
  description: z.string().min(10, 'Description should be at least 10 characters long'),
  tags: z.array(z.string()).max(5, 'Maximum of 5 tags allowed').optional(),
  tokenRequirements: z
    .array(
      z.object({
        minAmount: z.string().min(0.0000000000000001, 'Token amount should be greater than 0'),
        decimals: z.number().min(0, 'Token decimals is required'),
        chainId: z.number().min(1, 'Chain ID is required'),
        address: z.string().min(1, 'Token address is required'),
        name: z.string().min(1, 'Token name is required'),
        logoURI: z.string().min(1, 'Token logo is required'),
        symbol: z.string().min(1, 'Token symbol is required'),
      })
    )
    .optional(),
  bannerFile: fileSchema,
  logoFile: fileSchema,
  reqMandatory: z.boolean().optional(),
})

export const EditGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required').readonly().optional(),
  description: z.string().min(10, 'Description is required').optional(),
  tags: z.array(z.string()).max(5, 'Maximum of 5 tags allowed').optional(),
  bannerFile: fileSchema.optional(),
  logoFile: fileSchema.optional(),
})
export type ImageFile = File & {
  preview?: string
}

export type FormReturnType = UseFormReturn<z.infer<typeof EditGroupSchema | typeof CreateGroupSchema>>

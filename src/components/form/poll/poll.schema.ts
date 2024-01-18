import { z } from 'zod'

// Define a schema for the poll options
const pollOptionSchema = z.string().min(1, 'Option cannot be empty')

// Create a schema for numeric rating if selected
const numericRatingSchema = z
  .object({
    rateScaleFrom: z.string().min(0, 'Rate scale start must be 0 or more'),
    rateScaleTo: z.string().min(1, 'Rate scale end must be at least 1'),
  })
  .refine(data => parseInt(data?.rateScaleTo) > parseInt(data?.rateScaleFrom), {
    message: 'Rate scale end must be greater than rate scale start',
  })
  .optional()

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

// Combine the schemas for poll creation
export const PollCreationSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less'),
    description: z.string().min(1, 'description is required'),
    options: z
      .array(pollOptionSchema)
      .min(2, 'At least two options required')
      .max(10, 'No more than 10 options allowed'),
    duration: z.custom(
      value => {
        const duration = parseInt(value as string)
        return !isNaN(duration)
      },
      { message: 'Duration must be a number' }
    ),
    pollType: z.custom(
      value => {
        const pollType = parseInt(value as string)
        return !isNaN(pollType)
      },
      { message: 'Poll type must be a number' }
    ),
    numericRating: z.optional(numericRatingSchema),
  })
  .refine(
    data => {
      if (data.description) {
        try {
          // Attempt to transform the string into an OutputData object
          const outputData = transformStringToOutputData(data.description)
          // Perform additional validation if necessary
          // For example, check if outputData has the required blocks property
          return !!outputData.blocks
        } catch {
          // If transformation fails, return false to indicate invalid description
          return false
        }
      }
      // If description is not provided, it's valid (because it's optional)
      return true
    },
    {
      message: 'Description must be a valid JSON string that conforms to the OutputData structure',
      path: ['description'],
    }
  )
  .refine(
    data => {
      // Only run the check if pollType is 'Numeric Rating'
      if (data.pollType == 2) {
        console.log(data.numericRating)
        // Ensure numericRating is not undefined and meets the criteria
        return data.numericRating && data.numericRating.rateScaleTo > data.numericRating.rateScaleFrom
      }
      // If pollType is not 'Numeric Rating', don't run the check
      return true
    },
    {
      message:
        'Numeric rating fields are required for Numeric Rating poll type and rate scale end must be greater than rate scale start',
      path: ['numericRating.rateScaleFrom'],
    }
  )

export type PollCreationType = z.infer<typeof PollCreationSchema>

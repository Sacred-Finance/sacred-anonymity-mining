import { useForm } from 'react-hook-form'
import axios from 'axios'

const PostToTopic = ({ topicId }) => {
  const { register, handleSubmit, reset, errors } = useForm()

  const onSubmit = async data => {
    try {
      const response = await axios.post('/api/discourse/postToTopic', {
        topic_id: topicId,
        raw: data.content,
      })

      // Handle success (e.g., show a success message, clear the form, etc.)
      reset()
    } catch (error) {
      // Handle error (e.g., show an error message)
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <div className="mt-1">
          <textarea
            id="content"
            name="content"
            // ref={register({ required: true })}
            className="focus:border-indigo-500 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/*{errors.content && <span className="text-red-500 text-sm">This field is required</span>}*/}
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Post
      </button>
    </form>
  )
}

export default PostToTopic

import Link from 'next/link'
import _ from 'lodash'

export const PostTitle = ({ title, id, onPostPage, post }) => {
  if (onPostPage) {
    return (
      <h1 className="sticky top-0  text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {_.startCase(post.title || `Post ${post.id}`)}
      </h1>
    )
  }

  return (
    <Link
      href={`/communities/${post.groupId}/post/${post.id}`}
      className="prose-sm !line-clamp-2 flex items-center gap-4 text-lg font-semibold text-gray-700 hover:text-blue-600 hover:underline dark:text-gray-200 dark:hover:text-blue-400"
      onClick={e => {
        if (onPostPage) {
          e.preventDefault()
        }
      }}
    >
      {_.startCase(post.title || `Post ${post.id}`)}
    </Link>
  )
}

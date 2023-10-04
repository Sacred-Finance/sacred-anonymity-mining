import Link from 'next/link'

export const PostTitle = ({ title, id, onPostPage, post }) => {
  if (onPostPage) {
    return <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
  }

  return (
    <Link
      href={`/communities/${post.groupId}/post/${post.id}`}
      className="flex items-center gap-4 text-xl font-semibold text-gray-700 hover:text-blue-600 hover:underline dark:text-gray-200 dark:hover:text-blue-400"
      onClick={e => {
        if (onPostPage) {
          e.preventDefault()
        }
      }}
    >
      {id} {post.title}
    </Link>
  )
}

import React from 'react'
import parse from 'html-react-parser'

// PostContent component
export const PostContent = ({ post }) => (
  <div className="rounded-lg bg-white p-6 shadow-md transition-colors duration-300 dark:bg-gray-900">
    <Cooked post={post} />

    {post?.link_counts?.length > 0 && (
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Links:
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-blue-500 dark:text-blue-400">
          {post.link_counts.map((link, linkIndex) => (
            <li key={linkIndex} className="flex items-center">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-blue-600 hover:underline dark:hover:text-blue-300"
              >
                {link.title || link.url}
              </a>
              <span className="ml-2 px-2 text-sm text-gray-500 dark:text-gray-400">
                {link.clicks} clicks
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

// Cooked component
function Cooked(props: { post: any }) {
  return (
    <div className="mb-4 leading-relaxed text-gray-800 dark:text-gray-300">
      {props?.post?.cooked ? parse(props?.post?.cooked) : null}
    </div>
  )
}

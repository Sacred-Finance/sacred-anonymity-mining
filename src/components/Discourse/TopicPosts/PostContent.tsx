import React from 'react'
import parse from 'html-react-parser'

export const PostContent = ({ post }) => (
  <div className="rounded border border-gray-600 bg-white  p-4 transition-colors duration-1000">
    <Cooked post={post} />

    {post?.link_counts?.length > 0 && (
      <div className="">
        <h3 className="text-lg font-semibold">Links:</h3>
        <ul className="list-inside list-disc space-y-1 text-blue-500">
          {post.link_counts.map((link, linkIndex) => (
            <li key={linkIndex}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {link.title || link.url}
              </a>
              <span className="px-2 text-sm text-gray-500">({link.clicks} clicks)</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

function Cooked(props: { post: any }) {
  return <span className="cooked text-base leading-normal">{parse(props.post.cooked)}</span>
}

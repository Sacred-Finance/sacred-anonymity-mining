import { useEffect, useState } from 'react'

export const useFetchReplies = posts => {
  const [postsWithReplies, setPostsWithReplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReplies = async () => {
      if (!posts) return
      // Filter out the posts that have replies
      const postsWithReplyCount = posts.filter(post => !post.hidden && !post.deleted_at && post.reply_count > 0)

      // Fetch the replies for each post that has them
      const fetchRepliesPromises = postsWithReplyCount.map(post =>
        fetch(`/api/discourse/${post.id}/replies`).then(res => res.json())
      )

      // Use Promise.all to wait for all the fetch promises to resolve
      const repliesArrays = await Promise.all(fetchRepliesPromises)

      // Merge the replies into the corresponding posts
      repliesArrays.forEach((replies, index) => {
        postsWithReplyCount[index].replies = replies
      })

      // Create a new array that replaces the original posts with their corresponding updated versions with replies
      const mergedPosts = posts.map(post => {
        const updatedPost = postsWithReplyCount.find(p => p.id === post.id)
        return updatedPost || post
      })

      setPostsWithReplies(mergedPosts)
      setLoading(false)
    }

    fetchReplies()
  }, [posts])

  return { postsWithReplies, loading }
}

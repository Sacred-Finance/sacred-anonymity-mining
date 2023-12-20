import { Post } from '@components/Discourse/types'

// nestPosts takes an array of posts and returns a nested array of posts
// the purpose of this function is to make it easier to render a thread of posts
// where each post has a replies array of posts that are replies to it
export function nestPosts(posts: Post[]): Post[] {
  let postMap: { [key: number]: Post & { replies?: Post[] } } = {}

  // First pass to create a map for easy access and add an empty replies array
  for (let post of posts) {
    postMap[post.post_number] = { ...post, replies: [] }
  }

  // Second pass to populate the replies array based on reply_to_post_number
  for (let postNumber in postMap) {
    let post = postMap[postNumber]
    let replyTo = post.reply_to_post_number
    if (replyTo && postMap[replyTo]) {
      postMap[replyTo].replies!.push(post)
    }
  }

  // Filter out posts that are already nested as replies
  return Object.values(postMap).filter(post => !post.reply_to_post_number)
}

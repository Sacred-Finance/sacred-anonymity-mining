import fetch from 'node-fetch'

export default async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data')
    // Assuming you want to keep the info property in the error
    ;(error as any).info = await res.json()
    ;(error as any).status = res.status
    throw error
  }

  return res.json()
}

export function getGroupWithPostData(groupId: string | string[] | undefined) {
  // if array throw error
  if (Array.isArray(groupId)) throw new Error('groupId must be a string or undefined')
  if (groupId === undefined) return null
  return !isNaN(groupId) ? `/api/groupWithPostData?groupId=${groupId}` : null
}

export function getGroupWithPostAndCommentData(
  groupId: string | string[] | undefined,
  postId: string | string[] | undefined
) {
  return !isNaN(groupId) ? `/api/groupWithPostAndCommentData?groupId=${groupId}&postId=${postId}` : null
}

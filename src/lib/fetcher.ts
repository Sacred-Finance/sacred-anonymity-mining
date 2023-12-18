import fetch from 'node-fetch'

export default async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data')
    ;(error as { info?: string }).info = await res.text()
    ;(error as { status?: number }).status = res.status
    throw error
  }

  return (await res.json()) as Promise<T>
}

// GroupWithPostDataResponse
export function GroupPostAPI(
  groupId: string | string[] | undefined
): string | { error: string } | null {
  // if array throw error
  if (Array.isArray(groupId)) {
    throw new Error('groupId must be a string or undefined')
  }
  if (groupId === undefined) {
    return null
  }
  return `/api/groupWithPostData?groupId=${groupId}`
}

export function GroupPostCommentAPI(
  groupId: string | string[] | undefined,
  postId: string | string[] | undefined
) {
  if (Array.isArray(groupId) || Array.isArray(postId)) {
    throw new Error('groupId and postId must be a string or undefined')
  }
  if (groupId === undefined || postId === undefined) {
    return null
  }
  return `/api/groupWithPostAndCommentData?groupId=${groupId}&postId=${postId}`
}

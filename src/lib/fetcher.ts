import fetch from 'node-fetch'

export default async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data');
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
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

export function getDiscourseData(groupId: number | string | string[] | undefined) {
  return !isNaN(groupId) ? `/api/discourse/${groupId}` : null
}

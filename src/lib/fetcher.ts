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

export function getDiscourseData(groupId: number | string | string[] | undefined, post_ids?: number[] | null) {
  if (!isNaN(Number(groupId))) {
    let url = `/api/discourse/${groupId}`;
    if (post_ids && post_ids.length > 0) {
      // Format the post_ids as query parameters
      const postIdsQuery = post_ids.map((id) => `post_ids[]=${id}`).join('&');
      url += `?${postIdsQuery}`;
    }
    return url;
  }
  return null;
}




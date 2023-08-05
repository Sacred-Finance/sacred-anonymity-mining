

// User.ts
export interface User {
  id: number
  username: string
  name: string
  avatar_template: string
  admin: boolean
  moderator: boolean
  trust_level: number
}

// Topic.ts
export interface Topic {
  id: number
  title: string
  fancy_title: string
  slug: string
  posts_count: number
  reply_count: number
  highest_post_number: number
  image_url: string | null
  created_at: string
  last_posted_at: string
  bumped: boolean
  bumped_at: string
  archetype: string
  unseen: boolean
  last_read_post_number: number
  unread: number
  new_posts: number
  unread_posts: number
  pinned: boolean
  unpinned: boolean | null
  visible: boolean
  closed: boolean
  archived: boolean
  notification_level: number
  bookmarked: boolean
  liked: boolean
  tags: string[]
  tags_descriptions: Record<string, string>
  views: number
  like_count: number
  has_summary: boolean
  last_poster_username: string
  category_id: number
  pinned_globally: boolean
  featured_link: string | null
  has_accepted_answer: boolean
  posters: Poster[]
  post_stream: PostStream
}

// Poster.ts
export interface Poster {
  extras: string
  description: string
  user_id: number
  primary_group_id: number | null
  flair_group_id: number | null
}

// TopicList.ts
export interface TopicList {
  can_create_topic: boolean
  per_page: number
  top_tags: string[]
  topics: Topic[]
}

// Data.ts
export interface Data {
  users: User[]
  primary_groups: any[] // replace any[] with proper type when known
  flair_groups: any[] // replace any[] with proper type when known
  topic_list: TopicList
}

interface PostStream {
  posts: {
    flair_color: null
    moderator: boolean
    wiki: boolean
    trust_level: number
    score: number
    can_see_hidden_post: boolean
    can_view_edit_history: boolean
    reviewable_score_count: number
    actions_summary: (
      | { can_act: boolean; id: number }
    )[]
    incoming_link_count: number
    can_delete: boolean
    post_type: number
    topic_accepted_answer: boolean
    id: number
    mentioned_users: any[]
    readers_count: number
    read: boolean
    edit_reason: null
    cooked: string
    can_accept_answer: boolean
    reply_count: number
    reply_to_post_number: null
    version: number
    deleted_at: null
    user_id: number
    can_recover: boolean
    name: string
    user_title: null
    post_number: number
    can_unaccept_answer: boolean
    hidden: boolean
    can_wiki: boolean
    created_at: string
    admin: boolean
    updated_at: string
    topic_id: number
    quote_count: number
    avatar_template: string
    bookmarked: boolean
    reads: number
    can_edit: boolean
    staff: boolean
    flair_url: null
    flair_bg_color: null
    reviewable_score_pending_count: number
    user_cakedate: string
    reviewable_id: number
    primary_group_name: null
    accepted_answer: boolean
    link_counts: (
      | { internal: boolean; reflection: boolean; clicks: number; title?: string; url: string }
    )[]
    flair_group_id: null
    user_deleted: boolean
    yours: boolean
    topic_slug: string
    flair_name: null
    username: string
    display_username: string
  }[]
  stream: number[]
}

interface SpecificTopic {
  post_stream: {
    stream: number[]
    posts: {
      flair_color: null
      moderator: boolean
      wiki: boolean
      trust_level: number
      score: number
      can_see_hidden_post: boolean
      can_view_edit_history: boolean
      reviewable_score_count: number
      actions_summary: (
        | { can_act: boolean; id: number }
      )[]
      incoming_link_count: number
      can_delete: boolean
      post_type: number
      topic_accepted_answer: boolean
      id: number
      mentioned_users: any[]
      readers_count: number
      read: boolean
      edit_reason: null
      cooked: string
      can_accept_answer: boolean
      reply_count: number
      reply_to_post_number: null
      version: number
      deleted_at: null
      user_id: number
      can_recover: boolean
      name: string
      user_title: null
      post_number: number
      can_unaccept_answer: boolean
      hidden: boolean
      can_wiki: boolean
      created_at: string
      admin: boolean
      updated_at: string
      topic_id: number
      quote_count: number
      avatar_template: string
      bookmarked: boolean
      reads: number
      can_edit: boolean
      staff: boolean
      flair_url: null
      flair_bg_color: null
      reviewable_score_pending_count: number
      user_cakedate: string
      reviewable_id: number
      primary_group_name: null
      accepted_answer: boolean
      link_counts: (
        | { internal: boolean; reflection: boolean; clicks: number; title?: string; url: string }
      )[]
      flair_group_id: null
      user_deleted: boolean
      yours: boolean
      topic_slug: string
      flair_name: null
      username: string
      display_username: string
    }[]
  }
  timeline_lookup: number[][]
  suggested_topics: {
    unpinned: boolean
    pinned: boolean
    unread: number
    featured_link: null
    created_at: string
    new_posts: number
    bumped: boolean
    title: string
    last_read_post_number: number
    liked: boolean
    archived: boolean
    fancy_title: string
    category_id: number
    id: number
    tags_descriptions: {}
    bumped_at: string
    slug: string
    views: number
    last_posted_at: string
    visible: boolean
    like_count: number
    image_url: null
    unread_posts: number
    bookmarked: boolean
    posters: {
      extras: string
      description: string
      user: { name: string; id: number; avatar_template: string; username: string }
    }[]
    reply_count: number
    has_accepted_answer: boolean
    tags: any[]
    archetype: string
    highest_post_number: number
    closed: boolean
    notification_level: number
    unseen: boolean
    posts_count: number
  }[]
  tags: any[]
  tags_descriptions: {}
  id: number
  title: string
  fancy_title: string
  posts_count: number
  created_at: string
  views: number
  reply_count: number
  like_count: number
  last_posted_at: string
  visible: boolean
  closed: boolean
  archived: boolean
  has_summary: boolean
  archetype: string
  slug: string
  category_id: number
  word_count: number
  deleted_at: null
  user_id: number
  featured_link: null
  pinned_globally: boolean
  pinned_at: null
  pinned_until: null
  image_url: null
  slow_mode_seconds: number
  draft: null
  draft_key: string
  draft_sequence: number
  posted: boolean
  unpinned: null
  pinned: boolean
  current_post_number: number
  highest_post_number: number
  last_read_post_number: number
  last_read_post_id: number
  deleted_by: null
  has_deleted: boolean
  actions_summary: (
    | { hidden: boolean; count: number; can_act: boolean; id: number }
  )[]
  chunk_size: number
  bookmarked: boolean
  bookmarks: any[]
  topic_timer: null
  message_bus_last_id: number
  participant_count: number
  show_read_indicator: boolean
  thumbnails: null
  slow_mode_enabled_until: null
  summarizable: boolean
  details: {
    last_poster: { name: string; id: number; avatar_template: string; username: string }
    can_reply_as_new_topic: boolean
    can_edit: boolean
    can_invite_via_email: boolean
    can_pin_unpin_topic: boolean
    can_flag_topic: boolean
    created_by: { name: string; id: number; avatar_template: string; username: string }
    can_remove_allowed_users: boolean
    can_split_merge_topic: boolean
    can_moderate_category: boolean
    can_invite_to: boolean
    notifications_reason_id: number
    can_delete: boolean
    can_remove_self_id: number
    can_toggle_topic_visibility: boolean
    notification_level: number
    can_edit_staff_notes: boolean
    can_create_post: boolean
    can_archive_topic: boolean
    can_convert_topic: boolean
    can_close_topic: boolean
    can_move_posts: boolean
    can_review_topic: boolean
    participants: {
      flair_color: null
      moderator: boolean
      admin: boolean
      trust_level: number
      flair_url: null
      flair_bg_color: null
      primary_group_name: null
      name: string
      id: number
      post_count: number
      flair_group_id: null
      avatar_template: string
      flair_name: null
      username: string
    }[]
  }
}


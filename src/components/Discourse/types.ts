

// User.ts
export interface User {
    id: number;
    username: string;
    name: string;
    avatar_template: string;
    admin: boolean;
    moderator: boolean;
    trust_level: number;
}

// Topic.ts
export interface Topic {
    id: number;
    title: string;
    fancy_title: string;
    slug: string;
    posts_count: number;
    reply_count: number;
    highest_post_number: number;
    image_url: string | null;
    created_at: string;
    last_posted_at: string;
    bumped: boolean;
    bumped_at: string;
    archetype: string;
    unseen: boolean;
    last_read_post_number: number;
    unread: number;
    new_posts: number;
    unread_posts: number;
    pinned: boolean;
    unpinned: boolean | null;
    visible: boolean;
    closed: boolean;
    archived: boolean;
    notification_level: number;
    bookmarked: boolean;
    liked: boolean;
    tags: string[];
    tags_descriptions: Record<string, string>;
    views: number;
    like_count: number;
    has_summary: boolean;
    last_poster_username: string;
    category_id: number;
    pinned_globally: boolean;
    featured_link: string | null;
    has_accepted_answer: boolean;
    posters: Poster[];
}

// Poster.ts
export  interface Poster {
    extras: string;
    description: string;
    user_id: number;
    primary_group_id: number | null;
    flair_group_id: number | null;
}

// TopicList.ts
export interface TopicList {
    can_create_topic: boolean;
    per_page: number;
    top_tags: string[];
    topics: Topic[];
}

// Data.ts
export interface Data {
    users: User[];
    primary_groups: any[]; // replace any[] with proper type when known
    flair_groups: any[]; // replace any[] with proper type when known
    topic_list: TopicList;
}

# TopicPosts Component

The `TopicPosts` component is responsible for displaying a list of posts within a given topic. It handles the rendering of individual posts, user interaction for expanding or collapsing post content, and the ability to reply to posts.

## Overview

- **Props**: The component accepts a `topic` object of the type `Topic`, which contains details about the posts and related information.
- **State**:
  - `expandedPosts`: Keeps track of the indexes of posts that are currently expanded.
  - `postEditorData`: Stores the editor data for each post, enabling interaction with the new post form.
- **Child Components**:
  - `StatsDivider`: Renders a visual divider.
  - `ExpandCollapsePostButton`: Renders a button to expand or collapse post content.
  - `StatsBadge`: Renders individual statistics badges.

## Features

### Displaying Posts

- Iterates through the `topic.post_stream.posts` and renders each post.
- Posts that are marked as hidden or deleted are filtered out.
- Each post displays the user's avatar, username, posting time, reply button, and statistics like replies, reads, and score.

### Expanding and Collapsing Posts

- Users can expand or collapse individual posts by clicking the "Expand" or "Close" button.
- The expansion state of each post is controlled through the `expandedPosts` array.

### Replying to Posts

- Users can reply to individual posts using the `NewPostForm`.
- The reply form includes a text editor and submit functionality.

### Rendering Links

- Any links contained within a post are extracted and rendered separately with their respective click counts.

## Usage

```jsx
import TopicPosts from 'path-to-component/TopicPosts';
import { Topic } from '@components/Discourse/types';

const MyComponent = ({ topic }) => (
  <TopicPosts topic={topic} />
);
```


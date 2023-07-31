import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TopicPosts = ({ topicId }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`/api/discourse/topicPosts?topic_id=${topicId}`);
                setPosts(response.data.post_stream.posts);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPosts();
    }, [topicId]);

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div key={post.id} className="p-4 border rounded shadow">
                    <h2 className="text-xl font-bold">{post.name}</h2>
                    <ReactMarkdown plugins={[remarkGfm]}>{post.cooked}</ReactMarkdown>
                </div>
            ))}
        </div>
    );
};

export default TopicPosts;

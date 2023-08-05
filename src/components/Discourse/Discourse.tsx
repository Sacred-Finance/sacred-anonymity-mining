import axios from 'axios';
import { useState, useEffect } from 'react';

type PostData = {
    id: number,
    name: string,
    username: string,
    cooked: string,
    created_at: string,
};

const DiscoursePost = ({ postId }: { postId: number }) => {
    const [postData, setPostData] = useState<PostData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/discourse/${postId}`);
                setPostData(response.data.post_stream.posts[0]);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPost();
    }, [postId]);

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!postData) {
        return <div>No data found for this post.</div>
    }

    return (
        <div className=" mx-auto p-4 mt-6 bg-white rounded shadow-md">
            <div className="mb-4">
                <div className="font-bold text-xl mb-2">Author: {postData.name} (@{postData.username})</div>
                <p className="text-gray-700 text-base">Posted at: {new Date(postData.created_at).toLocaleString()}</p>
            </div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: postData.cooked }} />
        </div>
    );
};

export default DiscoursePost;

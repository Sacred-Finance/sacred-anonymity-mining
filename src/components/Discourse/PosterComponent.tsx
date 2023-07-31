// Poster.tsx
import React from 'react';
import {Poster} from "@components/Discourse/types";



const PosterComponent: React.FC<{ poster: Poster }> = ({ poster }) => (
    <div className="flex items-center space-x-2 p-2 border-b">
        <img src={poster.user.avatar_template} alt="Poster's Avatar" className="w-8 h-8 rounded-full" />
        <div className="font-bold">{poster.user.username}</div>
        <div className="text-sm text-gray-500">Posts: {poster.extras.posts}</div>
    </div>
);

export default PosterComponent;

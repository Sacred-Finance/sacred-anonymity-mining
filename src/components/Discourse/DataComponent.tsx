import React from 'react';
import {Data} from "@components/Discourse/types";
import UserComponent from "@components/Discourse/UserComponent";
import TopicListComponent from "@components/Discourse/TopicListComponent";



const DataComponent: React.FC<{ data: Data }> = ({ data }) => (
    <div className="p-4">
        <div className="mb-4">
            <h1 className="font-bold text-2xl mb-2">Users</h1>
            {data.users.map(user => <UserComponent key={user.id} user={user} />)}
        </div>
        <div>
            <h1 className="font-bold text-2xl mb-2">Topics</h1>
            <TopicListComponent topicList={data.topic_list} />
        </div>
    </div>
);

export default DataComponent;

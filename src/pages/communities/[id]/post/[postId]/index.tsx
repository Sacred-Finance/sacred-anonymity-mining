import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function Community() {
    const router = useRouter();
    return (
        <div>
            {router.query.id}
            <br/>
            {router.query.postId}
        </div>
    );
}

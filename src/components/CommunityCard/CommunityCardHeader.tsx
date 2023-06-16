import React, { useState } from "react";
import { useLocalCommunity } from "./CommunityCard";

export const CommunityCardHeader = () => {
    const community = useLocalCommunity();
    const [bannerLoaded, setBannerLoaded] = useState(false);
    const [bannerError, setBannerError] = useState(false);

    const handleBannerLoad = () => {
        setBannerLoaded(true);
    };

    const handleBannerError = () => {
        setBannerError(true);
    };

    const bannerSrc =
        community?.banner && !bannerError
            ? `https://ipfs.io/ipfs/${community.banner}`
            : undefined;

    return (
        <div className="relative">
            {bannerSrc ? (
                <img
                    className="w-full h-32 rounded-t-lg object-cover"
                    src={bannerSrc}
                    alt={community?.name}
                    onLoad={handleBannerLoad}
                    onError={handleBannerError}
                />
            ) : (
                <div
                    className="flex items-center justify-center w-full h-32 text-xl font-semibold text-white bg-blue-600 rounded-t-lg"
                >
                    {community?.name}
                </div>
            )}

            <img
                className="absolute w-24 h-24 mt-4 ml-4 transform -translate-y-1/2 border-4 border-white rounded-full shadow-lg"
                src={`https://ipfs.io/ipfs/${community.logo}`}
                alt={""}
            />
        </div>
    );
};

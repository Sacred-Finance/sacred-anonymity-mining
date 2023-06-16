import React from "react";
import { useTranslation } from "next-i18next";
import { ToolTip } from "./HOC/ToolTip";
import {TrashIcon} from "@heroicons/react/20/solid";

interface RemoveGroupProps {
    onClick: () => void;
    hidden: boolean;
}

const RemoveGroup: React.FC<RemoveGroupProps> = ({ onClick, hidden }) => {
    const { t } = useTranslation();

    return (
        <>
            <ToolTip
                type="primary"
                title={t("toolTip.removeCommunity.title")}
                message={t("toolTip.removeCommunity.message") as string}
            >
                <button
                    id="edit-community-button"
                    className={`absolute right-10 ${
                        hidden ? "hidden" : "flex"
                    } items-center justify-center p-2 rounded-full bg-transparent text-gray-500 hover:bg-purple-600 hover:text-white transition duration-300`}
                    onClick={onClick}
                    aria-label="edit community"
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </ToolTip>
        </>
    );
};

export default RemoveGroup;

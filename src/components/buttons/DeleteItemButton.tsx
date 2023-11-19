import React, { useState } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { useTranslation } from 'react-i18next';
import { useRemoveItemFromForumContract } from '@/hooks/useRemoveItemFromForumContract';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { ContentType } from '@/lib/model';
import { CustomModal } from '@components/CustomModal';
import { TrashIcon } from "@heroicons/react/20/solid";

const DeleteItemButton = ({ itemId, itemType, groupId, isAdminOrModerator }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { deleteItem } = useRemoveItemFromForumContract(groupId, itemId, isAdminOrModerator, setIsSubmitting);
    const router = useRouter();
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const onDelete = async () => {
        setIsSubmitting(true);
        try {
            const result = await deleteItem(itemId, itemType);
            toast.success(t('alert.deleteSuccess'));
            setIsSubmitting(false);

            if (itemType === ContentType.POST || itemType === ContentType.POLL) {
                router.push(`/communities/${groupId}`);
            }
            console.log(result);
        } catch (error) {
            console.log(error);
            toast.error(error.message ?? error);
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirmation = () => {
        setIsModalOpen(false);
        onDelete();
    };

    return (
        <>
            <PrimaryButton
                isLoading={isSubmitting}
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => setIsModalOpen(true)}
                startIcon={<TrashIcon className="h-5 w-5" />}
            >
                {t('button.delete')}
            </PrimaryButton>

            <CustomModal
                isOpen={isModalOpen}
                setIsOpen={isOpen => {
                    setIsModalOpen(isOpen);
                    setDeleteConfirmation('');
                }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 text-center">
                        <TrashIcon className="mx-auto h-12 w-12 text-red-500" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Are you sure you want to delete this?</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>

                        <input
                            className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                            onChange={e => setDeleteConfirmation(e.target.value)}
                            placeholder='Type "delete" to confirm'
                        />
                    </div>
                    <div className="flex justify-end space-x-2 p-6 bg-gray-100 dark:bg-gray-700 rounded-b-lg">
                        <PrimaryButton
                            onClick={() => {
                                setIsModalOpen(false);
                                setDeleteConfirmation('');
                            }}
                            className="bg-gray-500 text-white hover:bg-gray-600"
                        >
                            {t('button.cancel')}
                        </PrimaryButton>
                        <PrimaryButton
                            disabled={deleteConfirmation !== 'delete'}
                            onClick={handleDeleteConfirmation}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            Delete
                        </PrimaryButton>
                    </div>
                </div>
            </CustomModal>
        </>
    );
};

export default DeleteItemButton;

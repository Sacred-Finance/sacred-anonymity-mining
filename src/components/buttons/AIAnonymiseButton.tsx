import React from 'react'
import { useGPTServerAnalysis } from '../../hooks/useGPTServerAnalysis' // Import the custom hook
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'
import { EditorJsType } from '@components/NewPostForm'
import { CancelButton } from '@components/buttons/CancelButton'

interface AnonymizeButtonProps {
  postData: EditorJsType;
  postTitle?: string;
  setDescription: (value: EditorJsType) => void;
  refToUpdateOnChange: React.MutableRefObject<() => void>;
}

function convertEditorJsTypeToString(postData: EditorJsType) {
  let result = '';
  for (let i = 0; i < postData?.blocks?.length; i++) {
    result += postData.blocks[i].data.text;
  }
  return result;
}

const AnonymizeButton: React.FC<AnonymizeButtonProps> = ({
                                                           postData,
                                                           postTitle,
                                                           setDescription,
                                                           refToUpdateOnChange,
                                                         }) => {
  const [analysis] = useGPTServerAnalysis([{
    postData: convertEditorJsTypeToString(postData),
    template: Template.Anonymize,
  }]);
  const { isLoading, data, error, fetchData } = analysis;
  const [showModal, setShowModal] = React.useState(!isLoading && data);

  const toggleModal = () => {
    setShowModal(!showModal);
  }

  React.useEffect(() => {
    if (data) {
      console.log(data);
      setShowModal(true);
    }
  }, [data]);

  const useThis = () => {
    setDescription(description => ({
      time: description.time,
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: data.anonymized,
          },
        },
      ],
      version: description.version,
    }));

    refToUpdateOnChange?.current?.render?.({
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: data.anonymized,
          },
        },
      ],
    });

    toggleModal();
  };

  return (
    <div
      className="relative"
      onClick={() => {
        if (showModal) {
          toggleModal()
        }
      }}
    >
      <PrimaryButton
        onClick={data ? toggleModal : fetchData}
        disabled={isLoading || postData?.blocks?.length < 1}
        title={
          postData?.blocks?.length < 5
            ? 'Post content too short to summarize'
            : data
            ? 'View summary'
            : 'Summarize post'
        }
        endIcon={<SparklesIcon className={clsx('h-5 w-5', data ? 'text-white' : 'text-blue-500')} height={20} />}
        isLoading={isLoading}
        className={clsx(
          'flex items-center gap-2 rounded px-2 py-1 text-blue-500 outline outline-2  outline-blue-500 hover:bg-blue-600 hover:text-white focus:outline-none',
          data ? 'bg-blue-500 text-white' : ''
        )}
      >
        {data ? 'Anonymized' : 'Anonymize'}
      </PrimaryButton>

      {showModal && (
        <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="relative w-1/2 overflow-y-auto rounded-lg bg-white p-8 text-center"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <button onClick={toggleModal} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
              Close
            </button>

            <span className={'text-xl font-bold '}>{!postTitle ? 'Anonymized Text' : postTitle}</span>
            <br />
            <br />
            {error && (
              <>
                <div className="text-red-500">{error}</div>
                <div className="text-gray-500">Please try again later.</div>
              </>
            )}

            <div className={'flex'}>
              <div className={'flex flex-col'}>
                Original
                <EditorJsRenderer
                  data={data ? convertEditorJsTypeToString(postData) : 'Loading summary...'}
                  isHtml={true}
                />
              </div>
              <div className={'flex flex-col'}>
                Anonymized
                <EditorJsRenderer data={data ? data.anonymized : 'Loading summary...'} isHtml={true} />
              </div>
            </div>
            <CancelButton
              className="float-left border transition-colors duration-150"
              onClick={() => {
                toggleModal()
                fetchData()
              }}
            >
              Retry Anonymization
            </CancelButton>
            <PrimaryButton
              className="float-right border border-gray-300 bg-primary-500 text-white transition-colors duration-150"
              disabled={!data?.anonymized}
              onClick={useThis}
            >
              Use This
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnonymizeButton

import React, { memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import clsx from 'clsx';
import { CircularLoader } from '@components/JoinCommunityButton';
import { EDITOR_TOOLS } from './editor-tool';

type Props = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
  placeholder?: string;
  className?: string;
  editorRef?: React.MutableRefObject<EditorJS>;
  readOnly?: boolean;
  divProps?: any;
};

const EditorBlock = (props: Props) => {
  const {
    data,
    onChange,
    holder,
    divProps = {},
    editorRef,
    placeholder,
    readOnly
  } = props;

  const [isReady, setIsReady] = useState(false);
  const ref = useRef<EditorJS>();

  // Imperative handle for external interactions
  useImperativeHandle(editorRef, () => ({
    clear() {
      ref.current?.clear();
    },
    destroy() {
      ref.current?.destroy();
    },
    render(data: OutputData): Promise<void> {
      return ref.current ? ref.current.render(data) : Promise.resolve();
    },
    isReady() {
      return ref.current ? (ref.current.isReady as unknown as Promise<void>) : Promise.resolve();
    },
  }));

  // Handle editor read-only and focus status
  useEffect(() => {
    if (!ref.current) return;

    if (!readOnly) {
      setTimeout(() => ref.current?.focus(true), 200);
    } else {
      setTimeout(() => {
        if (data?.blocks && ref.current?.render) {
          ref.current.render(data);
        }
      }, 0);
    }

    if (!data?.blocks) {
      setTimeout(() => ref.current?.clear(), 200);
    }
  }, [readOnly, data?.blocks, ref.current]);

  // Initialize EditorJS
  useEffect(() => {
    if (!ref.current && holder) {
      const editor = new EditorJS({
        holder,
        inlineToolbar: true,
        hideToolbar: false,
        tools: { ...EDITOR_TOOLS },
        readOnly,
        placeholder: placeholder || 'Start writing your post...',
        data,
        async onChange(api) {
          if (!readOnly) {
            const savedData = await api.saver.save();
            onChange(savedData);
          }
        },
        onReady() {
          if (readOnly) {
            const el = document.getElementById(holder);
            const inputs = el?.getElementsByTagName('input') || [];
            const textareas = el?.getElementsByTagName('textarea') || [];

            [...inputs, ...textareas].forEach(input => input.setAttribute('readonly', 'readonly'));
          }
          setIsReady(true);
        },
      });

      ref.current = editor;
    }


    // return () => ref?.current?.destroy?.();
  }, []);

  return (
      <>
        <div
            {...divProps}
            className={clsx(isReady ? 'h-full w-full text-black dark:text-white prose' : 'hidden', divProps.className)}
            id={holder}
        />
        {!isReady && <CircularLoader className={'h-12'} />}
      </>
  );
};

export default memo(EditorBlock);

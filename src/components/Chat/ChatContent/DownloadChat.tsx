import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import PopupModal from '@components/PopupModal';
import {
  chatToMarkdown,
  downloadImg,
  downloadMarkdown,
  // downloadPDF,
  htmlToImg,
} from '@utils/chat';
import ImageIcon from '@icon/ImageIcon';
import PdfIcon from '@icon/PdfIcon';
import MarkdownIcon from '@icon/MarkdownIcon';
import JsonIcon from '@icon/JsonIcon';

import useChatHistoryApi from '@hooks/useChatHistoryApi';

import downloadFile from '@utils/downloadFile';

const DownloadChat = React.memo(
  ({ saveRef }: { saveRef: React.RefObject<HTMLDivElement> }) => {
    const chatHistoryApi = useChatHistoryApi();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    return (
      <>
        <button
          className='btn btn-neutral'
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {t('downloadChat')}
        </button>
        {isModalOpen && (
          <PopupModal
            setIsModalOpen={setIsModalOpen}
            title={t('downloadChat') as string}
            cancelButton={false}
          >
            <div className='p-6 border-b border-gray-200 dark:border-gray-600 flex gap-4'>
              <button
                className='btn btn-neutral gap-2'
                onClick={async () => {
                  if (saveRef && saveRef.current) {
                    const imgData = await htmlToImg(saveRef.current);
                    downloadImg(
                      imgData,
                      `${
                        chatHistoryApi.activeChatThread()?.title.trim() ??
                        'download'
                      }.png`
                    );
                  }
                }}
              >
                <ImageIcon />
                Image
              </button>
              {/* <button
                className='btn btn-neutral gap-2'
                onClick={async () => {
                  if (saveRef && saveRef.current) {
                    const imgData = await htmlToImg(saveRef.current);
                    downloadPDF(
                      imgData,
                      useStore.getState().theme,
                      `${
                        useStore
                          .getState()
                          .chats?.[
                            useStore.getState().currentChatIndex
                          ].title.trim() ?? 'download'
                      }.pdf`
                    );
                  }
                }}
              >
                <PdfIcon />
                PDF
              </button> */}
              <button
                className='btn btn-neutral gap-2'
                onClick={async () => {
                  if (saveRef && saveRef.current) {
                    const chatThread = chatHistoryApi.activeChatThread();
                    if (chatThread) {
                      const markdown = chatToMarkdown(chatThread);
                      downloadMarkdown(
                        markdown,
                        `${chatThread.title.trim() ?? 'download'}.md`
                      );
                    }
                  }
                }}
              >
                <MarkdownIcon />
                Markdown
              </button>
              <button
                className='btn btn-neutral gap-2'
                onClick={async () => {
                  const chatThread = chatHistoryApi.activeChatThread();
                  if (chatThread) {
                    downloadFile([chatThread], chatThread.title);
                  }
                }}
              >
                <JsonIcon />
                JSON
              </button>
            </div>
          </PopupModal>
        )}
      </>
    );
  }
);

export default DownloadChat;

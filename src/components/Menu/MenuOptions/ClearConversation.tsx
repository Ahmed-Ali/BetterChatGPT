import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PopupModal from '@components/PopupModal';
import DeleteIcon from '@icon/DeleteIcon';
import useChatHistoryApi from '@hooks/useChatHistoryApi';
import { _defaultEmptyChatHistory } from '@constants/chat';
import { use } from 'i18next';

const ClearConversation = () => {
  const { t } = useTranslation();

  const chatHistoryApi = useChatHistoryApi();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    chatHistoryApi.resetChatHistoryToSingleDefaultChatThread();
  };

  return (
    <>
      <button
        className='btn btn-neutral'
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <DeleteIcon />
        {t('clearConversation')}
      </button>
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('warning') as string}
          message={t('clearConversationWarning') as string}
          handleConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default ClearConversation;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import { ChatHistoryListInterface } from '@type/chat';

import useChatHistoryApi from '@hooks/useChatHistoryApi';

import TickIcon from '@icon/TickIcon';

const CloneChat = React.memo(() => {
  const { t } = useTranslation();

  const chatHistoryApi = useChatHistoryApi();

  const [cloned, setCloned] = useState<boolean>(false);

  const cloneChat = () => {
    if (!chatHistoryApi.isChatHistoryEmpty()) {
      chatHistoryApi.cloneActiveChatThread();
      window.setTimeout(() => {
        setCloned(false);
      }, 3000);
    }
  };

  return (
    <button className='btn btn-neutral flex gap-1' onClick={cloneChat}>
      {cloned ? (
        <>
          <TickIcon /> {t('cloned')}
        </>
      ) : (
        <>{t('cloneChat')}</>
      )}
    </button>
  );
});

export default CloneChat;

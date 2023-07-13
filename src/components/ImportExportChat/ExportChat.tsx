import React from 'react';
import { useTranslation } from 'react-i18next';

import useStore from '@store/store';

import downloadFile from '@utils/downloadFile';
import { getToday } from '@utils/date';
import useChatHistoryApi from '@hooks/useChatHistoryApi';

import { ExportV2 } from '@type/export';

const ExportChat = () => {
  const { t } = useTranslation();
  const chatHistoryApi = useChatHistoryApi();

  return (
    <div className='mt-6'>
      <div className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
        {t('export')} (JSON)
      </div>
      <button
        className='btn btn-small btn-primary'
        onClick={() => {
          const fileData: ExportV2 = {
            chatHistory: chatHistoryApi.history(),
            version: 2,
          };
          downloadFile(fileData, getToday());
        }}
      >
        {t('export')}
      </button>
    </div>
  );
};
export default ExportChat;

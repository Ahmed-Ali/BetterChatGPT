import React from 'react';

import PlusIcon from '@icon/PlusIcon';

import useChatHistoryApi from '@hooks/useChatHistoryApi';

const NewMessageButton = React.memo(
  ({ messageIndex }: { messageIndex: number }) => {
    const chatHistoryApi = useChatHistoryApi();

    const addMessage = () => {
      if (chatHistoryApi.noActiveChatThread()) {
        chatHistoryApi.prependNewChatThread(chatHistoryApi.rootPath());
      } else {
        chatHistoryApi.setActiveChatThreadMessage(
          {
            content: '',
            role: 'user',
          },
          messageIndex + 1
        );
      }
    };

    return (
      <div className='h-0 w-0 relative' key={messageIndex}>
        <div
          className='absolute top-0 right-0 translate-x-1/2 translate-y-[-50%] text-gray-600 dark:text-white cursor-pointer bg-gray-200 dark:bg-gray-600/80 rounded-full p-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-800/80 transition-bg duration-200'
          onClick={addMessage}
        >
          <PlusIcon />
        </div>
      </div>
    );
  }
);

export default NewMessageButton;

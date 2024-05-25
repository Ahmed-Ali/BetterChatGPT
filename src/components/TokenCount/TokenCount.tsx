import useStore, { StoreState } from '@store/store';
import React, { useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { modelCost } from '@constants/chat';
import countTokens from '@utils/messageUtils';

const TokenCount = React.memo(() => {
  const [tokenCount, setTokenCount] = useState<number>(0);
  const generating = useStore((state) => state.generating);
  const isValidCurrentIndex = (state: StoreState) => state.chats && state.chats.length > 0 && state.chats.length < state.currentChatIndex;
  const messages = useStore(
    (state) =>
      state.chats && state.chats.length > 0 && state.chats.length < state.currentChatIndex ? state.chats[state.currentChatIndex].messages : [],
    shallow
  );

  const model = useStore((state) =>
    state.chats && state.chats.length > 0 && state.chats.length < state.currentChatIndex
      ? state.chats[state.currentChatIndex].config.model
      : 'gpt-3.5-turbo'
  );

  const cost = useMemo(() => {
    const price =
      modelCost[model].prompt.price *
      (tokenCount / modelCost[model].prompt.unit);
    return price.toPrecision(3);
  }, [model, tokenCount]);

  useEffect(() => {
    if (!generating) setTokenCount(countTokens(messages, model));
  }, [messages, generating]);

  return (
    <div className='absolute top-[-16px] right-0'>
      <div className='text-xs italic text-gray-900 dark:text-gray-300'>
        Tokens: {tokenCount} (${cost})
      </div>
    </div>
  );
});

export default TokenCount;

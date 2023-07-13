import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';

import ChatFolder from './ChatFolder';
import ChatHistory from './ChatHistory';
import ChatSearch from './ChatSearch';

import { ChatHistoryItem } from '@type/chat';
import { isChatFolder } from '@utils/chat';

import useChatHistoryApi from '@hooks/useChatHistoryApi';

const ChatHistoryItemComponent = ({ item }: { item: ChatHistoryItem }) => {
  if (isChatFolder(item)) {
    return <ChatFolder folder={item} key={item.id} />;
  }
  return (
    <ChatHistory title={item.title} chatPath={item.path} key={`${item.id}`} />
  );
};

const ChatHistoryList = () => {
  const chatHistoryApi = useChatHistoryApi();
  const chatHistory = useStore((state) => state.chatHistory);
  const activeChatPath = useStore((state) => state.activeChatPath);

  const [isHover, setIsHover] = useState<boolean>(false);
  const [chatItems, setChatItems] = useState<ChatHistoryItem[]>([]);
  const [filter, setFilter] = useState<string>('');

  const filterRef = useRef<string>(filter);

  const updateFolders = useRef(() => {
    const filteredChatItems = chatHistoryApi.filteredChatHistoryChildrenByTitle(
      filterRef.current,
      true
    );

    setChatItems(filteredChatItems);
  }).current;

  useEffect(() => {
    updateFolders();
  }, [chatHistory]);

  useEffect(() => {
    if (chatHistoryApi.noActiveChatThread()) {
      return;
    }
    chatHistoryApi.setChatFolderExpanded(activeChatPath, true);
    document.title =
      chatHistoryApi.getChatThreadTitle(activeChatPath) ?? document.title;
  }, [activeChatPath]);

  useEffect(() => {
    filterRef.current = filter;
    updateFolders();
  }, [filter]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      e.stopPropagation();
      setIsHover(false);

      const chatPath = e.dataTransfer
        .getData('chatPath')
        .split(',')
        .map(Number);
      chatHistoryApi.moveChatThreadToFolder(
        chatPath,
        chatHistoryApi.rootPath(),
        false
      );
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHover(true);
  };

  const handleDragLeave = () => {
    setIsHover(false);
  };

  const handleDragEnd = () => {
    setIsHover(false);
  };

  return (
    <div
      className={`flex-col flex-1 overflow-y-auto hide-scroll-bar border-b border-white/20 ${
        isHover ? 'bg-gray-800/40' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <ChatSearch filter={filter} setFilter={setFilter} />
      <div className='flex flex-col gap-2 text-gray-100 text-sm'>
        {chatItems.map((item) => ChatHistoryItemComponent({ item }))}
      </div>
      <div className='w-full h-10' />
    </div>
  );
};

export default ChatHistoryList;

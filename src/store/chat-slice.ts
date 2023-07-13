import { StoreSlice } from './store';
import {
  ChatHistoryListInterface,
  ChatInterface,
  FolderCollection,
  MessageInterface,
} from '@type/chat';

import { _defaultEmptyChatHistory } from '@constants/chat';

export interface ChatSlice {
  messages: MessageInterface[];
  chats?: ChatInterface[];
  currentChatIndex: number;
  chatHistory: ChatHistoryListInterface;
  activeChatPath: number[];
  generating: boolean;
  error: string;
  folders: FolderCollection;
  setMessages: (messages: MessageInterface[]) => void;
  setChats: (chats: ChatInterface[]) => void;
  setCurrentChatIndex: (currentChatIndex: number) => void;
  setChatHistory: (chatHistory: ChatHistoryListInterface) => void;
  setActiveChatPath: (activeChatPath: number[]) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string) => void;
  setFolders: (folders: FolderCollection) => void;
}

export const createChatSlice: StoreSlice<ChatSlice> = (set, get) => ({
  messages: [],
  currentChatIndex: -1,
  chatHistory: _defaultEmptyChatHistory,
  activeChatPath: [],
  generating: false,
  error: '',
  folders: {},

  setMessages: (messages: MessageInterface[]) => {
    set((prev: ChatSlice) => ({
      ...prev,
      messages: messages,
    }));
  },
  setChats: (chats: ChatInterface[]) => {
    set((prev: ChatSlice) => ({
      ...prev,
      chats: chats,
    }));
  },
  setCurrentChatIndex: (currentChatIndex: number) => {
    set((prev: ChatSlice) => ({
      ...prev,
      currentChatIndex: currentChatIndex,
    }));
  },
  setChatHistory: (chatHistory: ChatHistoryListInterface) => {
    set((prev: ChatSlice) => ({
      ...prev,
      chatHistory: chatHistory,
    }));
  },
  setActiveChatPath: (activeChatPath: number[]) => {
    set((prev: ChatSlice) => ({
      ...prev,
      activeChatPath: activeChatPath,
    }));
  },
  setGenerating: (generating: boolean) => {
    set((prev: ChatSlice) => ({
      ...prev,
      generating: generating,
    }));
  },
  setError: (error: string) => {
    set((prev: ChatSlice) => ({
      ...prev,
      error: error,
    }));
  },
  setFolders: (folders: FolderCollection) => {
    set((prev: ChatSlice) => ({
      ...prev,
      folders: folders,
    }));
  },
});

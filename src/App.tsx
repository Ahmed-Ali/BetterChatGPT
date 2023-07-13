import { useEffect } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useChatHistoryApi from '@hooks/useChatHistoryApi';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';
import { createUpdatedChatHistoryFromLegacyChats } from '@utils/chat';

function App() {
  const chatHistoryApi = useChatHistoryApi();

  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);

  const defaultChatConfig = useStore((state) => state.defaultChatConfig);

  const legacyChatFolders = useStore((state) => state.folders);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    // legacy local storage
    const oldChats = localStorage.getItem('chats');
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      // legacy local storage
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      // legacy local storage
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }

    if (oldChats) {
      // legacy local storage
      // TODO: there is implicit assumption
      // that the legacy local storage
      // was before folders were introduced
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          const updatedChatHistory = createUpdatedChatHistoryFromLegacyChats(
            chats,
            legacyChatFolders,
            defaultChatConfig
          );
          chatHistoryApi.setChatHistory(
            updatedChatHistory,
            chatHistoryApi.getRootPathWithChildIndex(0)
          );
        } else {
          chatHistoryApi.appendAndActivateNewChatThread(
            chatHistoryApi.rootPath()
          );
        }
      } catch (e: unknown) {
        console.log(e);
        if (chatHistoryApi.fullyInitialized()) {
          chatHistoryApi.appendAndActivateNewChatThread(
            chatHistoryApi.rootPath()
          );
        }
      }
      localStorage.removeItem('chats');
    } else {
      // existing local storage
      if (chatHistoryApi.isChatHistoryEmpty()) {
        chatHistoryApi.appendAndActivateNewChatThread(
          chatHistoryApi.rootPath()
        );
      } else {
        chatHistoryApi.resetActiveChatPathIfInvalid();
      }
    }
  }, []);

  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
      <Toast />
    </div>
  );
}

export default App;

import html2canvas from 'html2canvas';

import {
  ChatInterface,
  ChatHistoryItem,
  ChatFolderInterface,
  FolderCollection,
  ConfigInterface,
  ChatHistoryListInterface,
  ChatThreadInterface,
} from '@type/chat';

import { _defaultEmptyChatHistory } from '@constants/chat';

// Function to convert HTML to an image using html2canvas
export const htmlToImg = async (html: HTMLDivElement) => {
  const needResize = window.innerWidth >= 1024;
  const initialWidth = html.style.width;
  if (needResize) {
    html.style.width = '1023px';
  }
  const canvas = await html2canvas(html);
  if (needResize) html.style.width = initialWidth;
  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
};

// Function to download the image as a file
export const downloadImg = (imgData: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = imgData;
  link.download = fileName;
  link.click();
  link.remove();
};

// Function to convert a chat object to markdown format
export const chatToMarkdown = (chat: ChatInterface) => {
  let markdown = `# ${chat.title}\n\n`;
  chat.messages.forEach((message) => {
    markdown += `### **${message.role}**:\n\n${message.content}\n\n---\n\n`;
  });
  return markdown;
};

// Function to download the markdown content as a file
export const downloadMarkdown = (markdown: string, fileName: string) => {
  const link = document.createElement('a');
  const markdownFile = new Blob([markdown], { type: 'text/markdown' });
  link.href = URL.createObjectURL(markdownFile);
  link.download = fileName;
  link.click();
  link.remove();
};

export const isChatFolder = (
  item: ChatHistoryItem
): item is ChatFolderInterface => {
  return 'children' in item;
};

export const createUpdatedChatHistoryFromLegacyChats = (
  legacyChats: ChatInterface[],
  legacyFolders: FolderCollection,
  defaultChatConfig: ConfigInterface
): ChatHistoryListInterface => {
  const chatHistory: ChatHistoryListInterface = JSON.parse(
    JSON.stringify(_defaultEmptyChatHistory)
  );
  chatHistory.config = { ...defaultChatConfig };
  const foldersCollection: {
    [folderId: string]: ChatFolderInterface;
  } = {};

  legacyChats.forEach((chat) => {
    if (chat.folder) {
      if (!foldersCollection[chat.folder]) {
        // first time to see this folder
        const {
          order: _,
          name,
          ...oldFolderStructure
        } = legacyFolders[chat.folder];

        const updatedFolderStructure = {
          title: name,
          config: { ...defaultChatConfig },
          children: [],
          path: [chatHistory.children.length],
          ...oldFolderStructure,
        };

        foldersCollection[chat.folder] = updatedFolderStructure;

        chatHistory.children.push(updatedFolderStructure);
      }

      const chatHistoryFolder = foldersCollection[chat.folder];
      const chatHistoryThread: ChatHistoryItem = {
        ...chat,
        path: [...chatHistoryFolder.path, chatHistoryFolder.children.length],
      };
      chatHistoryFolder.children.push(chatHistoryThread);
    } else {
      const chatHistoryThread: ChatHistoryItem = {
        ...chat,
        path: [chatHistory.children.length],
      };
      chatHistory.children.push(chatHistoryThread);
    }
  });

  return chatHistory;
};

export const findChatPathById = (
  root: ChatHistoryListInterface,
  chatId: string
) => {
  const findChat = (
    parent: ChatFolderInterface,
    chatId: string
  ): number[] | null => {
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (child.id === chatId) return child.path;
      if (isChatFolder(child)) {
        const path = findChat(child, chatId);
        if (path) return path;
      }
    }
    return null;
  };

  return findChat(root, chatId);
};

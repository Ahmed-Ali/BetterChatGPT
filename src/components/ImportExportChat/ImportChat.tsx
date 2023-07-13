import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import useStore from '@store/store';

import {
  isLegacyImport,
  validateAndFixChats,
  validateExportV1,
  isValidExportV2,
} from '@utils/import';

import { ChatInterface, Folder, FolderCollection } from '@type/chat';
import { ExportBase } from '@type/export';
import { createUpdatedChatHistoryFromLegacyChats } from '@utils/chat';

import useChatHistoryApi from '@hooks/useChatHistoryApi';

const ImportChat = () => {
  const { t } = useTranslation();
  const chatHistoryApi = useChatHistoryApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const handleFileUpload = () => {
    if (!inputRef || !inputRef.current) return;
    const file = inputRef.current.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target?.result as string;

        try {
          const parsedData = JSON.parse(data);
          if (isLegacyImport(parsedData)) {
            if (validateAndFixChats(parsedData)) {
              // import new folders
              const folderNameToIdMap: Record<string, string> = {};
              const parsedFolders: string[] = [];

              parsedData.forEach((data) => {
                const folder = data.folder;
                if (folder) {
                  if (!parsedFolders.includes(folder)) {
                    parsedFolders.push(folder);
                    folderNameToIdMap[folder] = uuidv4();
                  }
                  data.folder = folderNameToIdMap[folder];
                }
              });

              const newFolders: FolderCollection = parsedFolders.reduce(
                (acc, curr, index) => {
                  const id = folderNameToIdMap[curr];
                  const _newFolder: Folder = {
                    id,
                    name: curr,
                    expanded: false,
                    order: index,
                  };
                  return { [id]: _newFolder, ...acc };
                },
                {}
              );

              // increment the order of existing folders
              const offset = parsedFolders.length;

              let updatedFolders = useStore.getState().folders;
              Object.values(updatedFolders).forEach((f) => (f.order += offset));
              updatedFolders = { ...newFolders, ...updatedFolders };

              // import chats
              const prevChatHistory = chatHistoryApi.clonedChatHistory();
              const importedChatHistory =
                createUpdatedChatHistoryFromLegacyChats(
                  parsedData,
                  updatedFolders,
                  useStore.getState().defaultChatConfig
                );
              if (prevChatHistory.children.length > 0) {
                chatHistoryApi.setChatHistory(
                  {
                    ...prevChatHistory,
                    children: [
                      ...prevChatHistory.children,
                      ...importedChatHistory.children,
                    ],
                  },
                  chatHistoryApi.activeChatPath()
                );
              } else {
                chatHistoryApi.setChatHistory(
                  importedChatHistory,
                  chatHistoryApi.activeChatPath()
                );
              }
              setAlert({ message: 'Succesfully imported!', success: true });
            } else {
              setAlert({
                message: 'Invalid chats data format',
                success: false,
              });
            }
          } else {
            switch ((parsedData as ExportBase).version) {
              case 1:
                if (validateExportV1(parsedData)) {
                  // import folders
                  parsedData.folders;
                  // increment the order of existing folders
                  const offset = Object.keys(parsedData.folders).length;

                  let updatedFolders = useStore.getState().folders;
                  Object.values(updatedFolders).forEach(
                    (f) => (f.order += offset)
                  );

                  updatedFolders = { ...parsedData.folders, ...updatedFolders };

                  // import chats
                  if (parsedData.chats) {
                    const importedChatHistory =
                      createUpdatedChatHistoryFromLegacyChats(
                        parsedData.chats,
                        updatedFolders,
                        useStore.getState().defaultChatConfig
                      );
                    const prevChatHistory = chatHistoryApi.clonedChatHistory();
                    if (prevChatHistory.children.length > 0) {
                      chatHistoryApi.setChatHistory(
                        {
                          ...prevChatHistory,
                          children: [
                            ...prevChatHistory.children,
                            ...importedChatHistory.children,
                          ],
                        },
                        chatHistoryApi.activeChatPath()
                      );
                    } else {
                      chatHistoryApi.setChatHistory(
                        importedChatHistory,
                        chatHistoryApi.activeChatPath()
                      );
                    }
                  }

                  setAlert({ message: 'Succesfully imported!', success: true });
                } else {
                  setAlert({
                    message: 'Invalid format',
                    success: false,
                  });
                }
                break;

              case 2:
                if (isValidExportV2(parsedData)) {
                  const prevChatHistory = chatHistoryApi.clonedChatHistory();
                  if (prevChatHistory.children.length > 0) {
                    chatHistoryApi.setChatHistory(
                      {
                        ...prevChatHistory,
                        children: [
                          ...prevChatHistory.children,
                          ...parsedData.chatHistory.children,
                        ],
                      },
                      chatHistoryApi.activeChatPath()
                    );
                  } else {
                    chatHistoryApi.setChatHistory(
                      parsedData.chatHistory,
                      chatHistoryApi.activeChatPath()
                    );
                  }
                  setAlert({ message: 'Succesfully imported!', success: true });
                } else {
                  setAlert({
                    message: 'Invalid format',
                    success: false,
                  });
                }
            }
          }
        } catch (error: unknown) {
          setAlert({ message: (error as Error).message, success: false });
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
        {t('import')} (JSON)
      </label>
      <input
        className='w-full text-sm file:p-2 text-gray-800 file:text-gray-700 dark:text-gray-300 dark:file:text-gray-200 rounded-md cursor-pointer focus:outline-none bg-gray-50 file:bg-gray-100 dark:bg-gray-800 dark:file:bg-gray-700 file:border-0 border border-gray-300 dark:border-gray-600 placeholder-gray-900 dark:placeholder-gray-300 file:cursor-pointer'
        type='file'
        ref={inputRef}
      />
      <button
        className='btn btn-small btn-primary mt-3'
        onClick={handleFileUpload}
      >
        {t('import')}
      </button>
      {alert && (
        <div
          className={`relative py-2 px-3 w-full mt-3 border rounded-md text-gray-600 dark:text-gray-100 text-sm whitespace-pre-wrap ${
            alert.success
              ? 'border-green-500 bg-green-500/10'
              : 'border-red-500 bg-red-500/10'
          }`}
        >
          {alert.message}
        </div>
      )}
    </>
  );
};

export default ImportChat;

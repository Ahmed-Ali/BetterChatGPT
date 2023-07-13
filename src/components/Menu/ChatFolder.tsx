import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';

import DownChevronArrow from '@icon/DownChevronArrow';
import FolderIcon from '@icon/FolderIcon';
import {
  ChatHistoryItem,
  ChatFolderInterface,
  ChatHistoryListInterface,
} from '@type/chat';

import ChatHistory from './ChatHistory';
import NewChat from './NewChat';
import EditIcon from '@icon/EditIcon';
import DeleteIcon from '@icon/DeleteIcon';
import CrossIcon from '@icon/CrossIcon';
import TickIcon from '@icon/TickIcon';
import ColorPaletteIcon from '@icon/ColorPaletteIcon';
import RefreshIcon from '@icon/RefreshIcon';

import { folderColorOptions } from '@constants/color';

import useHideOnOutsideClick from '@hooks/useHideOnOutsideClick';
import useChatHistoryApi from '@hooks/useChatHistoryApi';

import { isChatFolder } from '@utils/chat';

const ChatHistoryItemComponent = ({ item }: { item: ChatHistoryItem }) => {
  if (isChatFolder(item)) {
    return <ChatFolder folder={item} key={item.id} />;
  }
  return (
    <ChatHistory title={item.title} chatPath={item.path} key={`${item.id}`} />
  );
};

const ChatFolder = ({ folder }: { folder: ChatFolderInterface }) => {
  const chatHistoryApi = useChatHistoryApi();

  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const [_folderName, _setFolderName] = useState<string>(folder.title);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);

  const [showPalette, setShowPalette, paletteRef] = useHideOnOutsideClick();

  const editTitle = () => {
    chatHistoryApi.setChatFolderTitle(folder.path, _folderName);
    setIsEdit(false);
  };

  const deleteFolder = () => {
    chatHistoryApi.deleteChatFolder(folder.path);
    setIsDelete(false);
  };

  const updateColor = (_color?: string) => {
    chatHistoryApi.setChatFolderColor(folder.path, _color);
    setShowPalette(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editTitle();
    }
  };

  const handleTick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isEdit) editTitle();
    else if (isDelete) deleteFolder();
  };

  const handleCross = () => {
    setIsDelete(false);
    setIsEdit(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      e.stopPropagation();
      setIsHover(false);
      const chatPath = e.dataTransfer
        .getData('chatPath')
        .split(',')
        .map(Number);

      chatHistoryApi.moveChatThreadToFolder(chatPath, folder.path, true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHover(true);
  };

  const handleDragLeave = () => {
    setIsHover(false);
  };

  const toggleExpanded = () => {
    chatHistoryApi.mutateChatFolder(folder.path, (folder) => {
      folder.expanded = !folder.expanded;
    });
  };

  useEffect(() => {
    if (inputRef && inputRef.current) inputRef.current.focus();
  }, [isEdit]);

  return (
    <div
      className={`w-full transition-colors group/folder ${
        isHover ? 'bg-gray-800/40' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        style={{ background: folder.color || '' }}
        className={`${
          folder.color ? '' : 'hover:bg-gray-850'
        } transition-colors flex py-2 pl-2 pr-1 items-center gap-3 relative rounded-md break-all cursor-pointer parent-sibling`}
        onClick={toggleExpanded}
        ref={folderRef}
        onMouseEnter={() => {
          if (folder.color && folderRef.current)
            folderRef.current.style.background = `${folder.color}dd`;
          if (gradientRef.current) gradientRef.current.style.width = '0px';
        }}
        onMouseLeave={() => {
          if (folder.color && folderRef.current)
            folderRef.current.style.background = folder.color;
          if (gradientRef.current) gradientRef.current.style.width = '1rem';
        }}
      >
        <FolderIcon className='h-4 w-4' />
        <div className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative'>
          {isEdit ? (
            <input
              type='text'
              className='focus:outline-blue-600 text-sm border-none bg-transparent p-0 m-0 w-full'
              value={_folderName}
              onChange={(e) => {
                _setFolderName(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
          ) : (
            _folderName
          )}
          {isEdit || (
            <div
              ref={gradientRef}
              className='absolute inset-y-0 right-0 w-4 z-10 transition-all'
              style={{
                background:
                  folder.color &&
                  `linear-gradient(to left, ${
                    folder.color || 'var(--color-900)'
                  }, rgb(32 33 35 / 0))`,
              }}
            />
          )}
        </div>
        <div
          className='flex text-gray-300'
          onClick={(e) => e.stopPropagation()}
        >
          {isDelete || isEdit ? (
            <>
              <button className='p-1 hover:text-white' onClick={handleTick}>
                <TickIcon />
              </button>
              <button className='p-1 hover:text-white' onClick={handleCross}>
                <CrossIcon />
              </button>
            </>
          ) : (
            <>
              <div
                className='relative md:hidden group-hover/folder:md:inline'
                ref={paletteRef}
              >
                <button
                  className='p-1 hover:text-white'
                  onClick={() => {
                    setShowPalette((prev) => !prev);
                  }}
                >
                  <ColorPaletteIcon />
                </button>
                {showPalette && (
                  <div className='absolute left-0 bottom-0 translate-y-full p-2 z-20 bg-gray-900 rounded border border-gray-600 flex flex-col gap-2 items-center'>
                    <>
                      {folderColorOptions.map((c) => (
                        <button
                          key={c}
                          style={{ background: c }}
                          className={`hover:scale-90 transition-transform h-4 w-4 rounded-full`}
                          onClick={() => {
                            updateColor(c);
                          }}
                        />
                      ))}
                      <button
                        onClick={() => {
                          updateColor();
                        }}
                      >
                        <RefreshIcon />
                      </button>
                    </>
                  </div>
                )}
              </div>

              <button
                className='p-1 hover:text-white md:hidden group-hover/folder:md:inline'
                onClick={() => setIsEdit(true)}
              >
                <EditIcon />
              </button>
              <button
                className='p-1 hover:text-white md:hidden group-hover/folder:md:inline'
                onClick={() => setIsDelete(true)}
              >
                <DeleteIcon />
              </button>
              <button className='p-1 hover:text-white' onClick={toggleExpanded}>
                <DownChevronArrow
                  className={`${
                    folder.expanded ? 'rotate-180' : ''
                  } transition-transform`}
                />
              </button>
            </>
          )}
        </div>
      </div>
      <div className='ml-3 pl-1 border-l-2 border-gray-700 flex flex-col gap-1 parent'>
        {folder.expanded && <NewChat parentPath={folder.path} />}
        {folder.expanded &&
          folder.children.map((item) => ChatHistoryItemComponent({ item }))}
      </div>
    </div>
  );
};

export default ChatFolder;

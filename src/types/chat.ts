import { Prompt } from './prompt';
import { Theme } from './theme';

export type Role = 'user' | 'assistant' | 'system';
export const roles: Role[] = ['user', 'assistant', 'system'];

export interface MessageInterface {
  role: Role;
  content: string;
}

export interface ChatInterface {
  id: string;
  title: string;
  folder?: string;
  messages: MessageInterface[];
  config: ConfigInterface;
  titleSet: boolean;
}

export interface ConfigInterface {
  model: ModelOptions;
  max_tokens: number;
  temperature: number;
  presence_penalty: number;
  top_p: number;
  frequency_penalty: number;
}

export interface ChatHistoryInterface {
  title: string;
  index: number;
  id: string;
}

export interface ChatHistoryFolderInterface {
  [folderId: string]: ChatHistoryInterface[];
}

export interface FolderCollection {
  [folderId: string]: Folder;
}

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  order: number;
  color?: string;
}

// Updated history structure
// to allow nested folders

export interface HistoryItemInterface {
  id: string;
  title: string;
  config: ConfigInterface;
  // will be used to traverse the chat history tree
  path: number[];
}

export interface ChatThreadInterface extends HistoryItemInterface {
  messages: MessageInterface[];
  titleSet: boolean;
}

export interface ChatFolderInterface extends HistoryItemInterface {
  children: ChatHistoryItem[];
  expanded: boolean;
  color?: string;
}

export type ChatHistoryItem = ChatFolderInterface | ChatThreadInterface;

// Root folder
export type ChatHistoryListInterface = ChatFolderInterface;

export type ModelOptions =
  | 'gpt-4'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k';
// | 'gpt-3.5-turbo-0301';
// | 'gpt-4-0314'
// | 'gpt-4-32k-0314'

export type TotalTokenUsed = {
  [model in ModelOptions]?: {
    promptTokens: number;
    completionTokens: number;
  };
};
export interface LocalStorageInterfaceV0ToV1 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  theme: Theme;
}

export interface LocalStorageInterfaceV1ToV2 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
}

export interface LocalStorageInterfaceV2ToV3 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
}
export interface LocalStorageInterfaceV3ToV4 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV4ToV5 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV5ToV6 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiKey: string;
  apiFree: boolean;
  apiFreeEndpoint: string;
  apiEndpoint?: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
}

export interface LocalStorageInterfaceV6ToV7 {
  chats: ChatInterface[];
  currentChatIndex: number;
  apiFree?: boolean;
  apiKey: string;
  apiEndpoint: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideMenuOptions: boolean;
  firstVisit: boolean;
  hideSideMenu: boolean;
}

export interface LocalStorageInterfaceV7oV8
  extends LocalStorageInterfaceV6ToV7 {
  foldersName: string[];
  foldersExpanded: boolean[];
  folders: FolderCollection;
}

export interface LocalStorageInterfaceV8ToV9 {
  /*
    deprecated - exists only to support migration to V9.
    Use chatHistory instead. This property will be removed from future releases
   */
  chats: ChatInterface[];
  /*
    deprecated - exists only to support migration to V9.
    Use the hierarchy of chatHistory instead.
    This property will be removed from future releases
   */
  folders: FolderCollection;

  /*
    deprecated - exists only to support migration to V9.
    Use activeChatPath instead.
    This property will be removed from future releases
   */
  currentChatIndex: number /* deprecated - exists only to support migration without compiler errors. Will be removed from future releases */;

  /*
    deprecated - exists only to support migration to V9.
    Default config will be set on the chatHistory instance
    Folders and chat threads will inherit their parent's config.
    This property will be removed from future releases
   */
  defaultChatConfig: ConfigInterface;

  chatHistory: ChatHistoryListInterface;
  activeChatPath: number[];
  apiFree?: boolean;
  apiKey: string;
  apiEndpoint: string;
  theme: Theme;
  autoTitle: boolean;
  prompts: Prompt[];

  defaultSystemMessage: string;
  hideMenuOptions: boolean;
  firstVisit: boolean;
  hideSideMenu: boolean;
}

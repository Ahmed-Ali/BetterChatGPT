import {
  ChatHistoryListInterface,
  ChatHistoryItem,
  ChatFolderInterface,
  ChatThreadInterface,
  ConfigInterface,
  MessageInterface,
} from '@type/chat';
import { v4 as uuidv4 } from 'uuid';
import useStore from '@store/store';
import { use } from 'i18next';

const useChatHistoryApi = (): ChatHistoryApi => {
  return new ChatHistoryApi();
};

export default useChatHistoryApi;

type ChatItemUnionType = Omit<ChatFolderInterface & ChatThreadInterface, 'id'>;
type ChatFolderPropertiesType = Omit<ChatFolderInterface, 'id'>;
type ChatThreadPropertiesType = Omit<ChatThreadInterface, 'id'>;
type ChatMessagePropertiesType = Omit<MessageInterface, 'id'>;

type SetChatItemProperty<T extends keyof ChatItemUnionType> = (
  itemPath: number[],
  property: T,
  value: ChatItemUnionType[T]
) => void;

export class ChatHistoryApi {
  emptyPath = [];

  rootPath = () => useStore.getState().chatHistory.path;
  history = () => useStore.getState().chatHistory;
  activeChatPath = () => useStore.getState().activeChatPath;

  setChatHistory = (
    chatHistory: ChatHistoryListInterface,
    activePath: number[]
  ): void => {
    this.updateChatFolderChildrenPaths(chatHistory);
    useStore.getState().setChatHistory(chatHistory);
    if (this.isValidChatPath(chatHistory, activePath)) {
      useStore.getState().setActiveChatPath(activePath);
    } else {
      const firstChat = this.findFirstChatThread(this.history());
      useStore.getState().setActiveChatPath(firstChat?.path ?? this.emptyPath);
    }
  };

  nextChatItemChildPath = (parent: ChatFolderInterface): number[] => {
    return [...parent.path, parent.children.length];
  };

  clonedChatHistory = (): ChatHistoryListInterface => {
    return JSON.parse(JSON.stringify(useStore.getState().chatHistory));
  };

  setActiveChatPath = useStore.getState().setActiveChatPath;

  getRootPathWithChildIndex = (childIndex: number): number[] => {
    return [...this.rootPath(), childIndex];
  };

  isChatHistoryEmpty = (): boolean => {
    return !this.hasAtLeastNChatThreads(this.history(), 1);
  };

  resetChatHistoryToSingleDefaultChatThread = (): void => {
    const clonedChatHistory = this.clonedChatHistory();
    clonedChatHistory.children = [];
    const newChat = this.insertAndReturnDefaultChatThread(
      clonedChatHistory,
      clonedChatHistory.path,
      0
    );
    useStore.getState().setChatHistory(clonedChatHistory);
    useStore.getState().setActiveChatPath(newChat.path);
  };

  appendAndActivateNewChatThread = (parentPath: number[]): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const newChat = this.insertAndReturnDefaultChatThread(
      clonedChatHistory,
      parentPath,
      clonedChatHistory.children.length
    );

    useStore.getState().setChatHistory(clonedChatHistory);
    useStore.getState().setActiveChatPath(newChat.path);
  };

  prependNewChatThread = (parentPath: number[]): void => {
    const clonedChatHistory = this.clonedChatHistory();
    this.insertAndReturnDefaultChatThread(clonedChatHistory, parentPath, 0);
    const activeChatPath = this.activeChatPath();
    // if the activeChatPath was inside this folder
    // we need to shift it by 1 to account for the newly
    // inserted chat thread
    useStore.getState().setChatHistory(clonedChatHistory);
    const activeChatPathParent = activeChatPath.slice(0, -1);
    if (activeChatPathParent === parentPath) {
      useStore
        .getState()
        .setActiveChatPath([
          ...activeChatPathParent,
          activeChatPath[activeChatPath.length - 1] + 1,
        ]);
    }
  };

  noActiveChatThread = (): boolean => {
    return this.activeChatPath() === this.emptyPath;
  };

  activeChatThread = (): ChatThreadInterface | null => {
    return this.findChatThreadByPath(this.history(), this.activeChatPath());
  };

  setActiveChatThreadMessage = (
    message: MessageInterface,
    messageIndex: number
  ): void => {
    this.setChatMessage(this.activeChatPath(), message, messageIndex);
  };

  appendMessageToActiveChatThread = (message: MessageInterface): void => {
    const activeChatThread = this.activeChatThread();
    if (activeChatThread) {
      this.setChatMessage(
        this.activeChatPath(),
        message,
        activeChatThread.messages.length
      );
    }
  };

  bulkAppendChatThreads = (chatThreads: ChatThreadInterface[]): void => {
    const clonedChatHistory = this.clonedChatHistory();

    clonedChatHistory.children.push(...chatThreads);

    useStore.getState().setChatHistory(clonedChatHistory);
  };

  setActiveChatThreadMessageRole = (
    role: MessageInterface['role'],
    messageIndex: number
  ): void => {
    this.setChatThreadMessageRole(this.activeChatPath(), role, messageIndex);
  };

  deleteActiveChatThreadMessage = (messageIndex: number): void => {
    this.deleteChatThreadMessage(this.activeChatPath(), messageIndex);
  };

  deleteActiveChatThreadLastMessage = (): void => {
    const activeChatThread = this.activeChatThread();
    if (activeChatThread) {
      this.deleteActiveChatThreadMessage(activeChatThread.messages.length - 1);
    }
  };

  moveActiveChatThreadMessage = (
    messageIndex: number,
    direction: 'up' | 'down'
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const activeChatThread = this.findChatThreadByPath(
      clonedChatHistory,
      this.activeChatPath()
    );
    if (activeChatThread) {
      const newIndex = direction === 'up' ? messageIndex - 1 : messageIndex + 1;
      const tmp = activeChatThread.messages[newIndex];

      activeChatThread.messages[newIndex] =
        activeChatThread.messages[messageIndex];
      activeChatThread.messages[messageIndex] = tmp;
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  setActiveChatThreadMessageContent = (
    messageIndex: number,
    content: string
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const activeChatThread = this.findChatThreadByPath(
      clonedChatHistory,
      this.activeChatPath()
    );
    if (activeChatThread) {
      activeChatThread.messages[messageIndex].content = content;
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  deleteActiveChatThreadMessagesAfterIndex = (messageIndex: number): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const activeChatThread = this.findChatThreadByPath(
      clonedChatHistory,
      this.activeChatPath()
    );
    if (activeChatThread) {
      activeChatThread.messages.splice(messageIndex + 1);
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  private deleteChatThreadMessage = (
    path: number[],
    messageIndex: number
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const chatThread = this.findChatThreadByPath(clonedChatHistory, path);
    if (chatThread) {
      chatThread.messages.splice(messageIndex, 1);
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  private setChatMessage = (
    path: number[],
    message: MessageInterface,
    messageIndex: number
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const chatThread = this.findChatThreadByPath(clonedChatHistory, path);
    if (chatThread) {
      chatThread.messages.splice(messageIndex, 0, message);
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  private setChatThreadMessageRole = (
    path: number[],
    role: MessageInterface['role'],
    messageIndex: number
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const chatThread = this.findChatThreadByPath(clonedChatHistory, path);
    if (chatThread) {
      chatThread.messages[messageIndex].role = role;
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  setChatThreadTitle = (path: number[], title: string): void => {
    this.setChatThreadProperty(path, 'title', title);
  };

  getChatThreadTitle(path: number[]): string | null {
    const chatThread = this.findChatThreadByPath(this.history(), path);
    return chatThread?.title ?? null;
  }

  resetActiveChatPathIfInvalid = (): void => {
    const activeChatPath = useStore.getState().activeChatPath;
    if (!this.isValidChatPath(this.history(), activeChatPath)) {
      const firstChild = this.findFirstChatThread(this.history());
      if (firstChild) {
        useStore.getState().setActiveChatPath(firstChild.path);
      } else {
        useStore.getState().setActiveChatPath(this.emptyPath);
      }
    }
  };

  setConfigForActiveChatThread = (config: ConfigInterface): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const activeChatPath = useStore.getState().activeChatPath;
    const chatThread = this.findChatThreadByPath(
      clonedChatHistory,
      activeChatPath
    );
    if (chatThread) {
      chatThread.config = config;
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  setConfigForActiveChatThreadIfNotSet = (): void => {
    const activeChatThread = this.findChatThreadByPath(
      this.history(),
      this.activeChatPath()
    );
    if (activeChatThread && !activeChatThread.config) {
      this.setConfigForActiveChatThread(this.history().config);
    }
  };

  cloneActiveChatThread = (): void => {
    const chatThread = this.findChatThreadByPath(
      this.history(),
      this.activeChatPath()
    );
    if (chatThread) {
      const newChat = JSON.parse(JSON.stringify(chatThread));
      newChat.id = uuidv4();
      newChat.title = this.findFirstAvailableChatTitle(
        chatThread.path,
        `Copy of ${newChat.title}`
      );

      const clonedChatHistory = this.clonedChatHistory();
      const parent =
        this.findChatItemParent(chatThread, clonedChatHistory) ??
        clonedChatHistory;
      parent.children.unshift(newChat);
      this.updateChatFolderChildrenPaths(parent);
      useStore.getState().setChatHistory(clonedChatHistory);
      useStore.getState().setActiveChatPath(chatThread.path);
    }
  };

  deleteChatThread = (
    path: number[],
    addDefaultChatIfDeletingLastChat: boolean
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const parent =
      this.findChatItemParentByPath(clonedChatHistory, path) ??
      clonedChatHistory;
    parent.children.splice(path[path.length - 1], 1);
    this.updateChatFolderChildrenPaths(parent, path[path.length - 1]);
    if (addDefaultChatIfDeletingLastChat && parent.children.length === 0) {
      this.insertAndReturnDefaultChatThread(parent, parent.path, 0);
    }
    useStore.getState().setChatHistory(clonedChatHistory);

    // update activeChatPath if it is a descendant of the deleted chat thread
    if (path === this.activeChatPath().slice(0, path.length)) {
      const firstChild = this.findFirstChatThread(parent);
      if (firstChild) {
        useStore.getState().setActiveChatPath(firstChild.path);
      } else {
        useStore.getState().setActiveChatPath(this.emptyPath);
      }
    }
  };

  filteredChatHistoryChildrenByTitle = (
    title: string,
    keepActiveChatThread: boolean
  ): ChatHistoryItem[] => {
    const activeChatPath = this.activeChatPath();
    return this.filteredChatItemsByPredicate(this.history(), (chatThread) => {
      return (
        (keepActiveChatThread && chatThread.path === activeChatPath) ||
        chatThread.title.includes(title)
      );
    });
  };

  private filteredChatItemsByPredicate = (
    parent: ChatFolderInterface,
    predicate: (thread: ChatThreadInterface) => boolean = () => true
  ): ChatHistoryItem[] => {
    const filteredItems: ChatHistoryItem[] = [];
    for (let chatItem of parent.children) {
      if (this.isChatFolder(chatItem)) {
        const filteredSubItems = this.filteredChatItemsByPredicate(
          chatItem,
          predicate
        );
        if (filteredSubItems.length > 0) {
          // this is just to avoid
          // serializing/deserializing grand children
          // that we won't use
          const { children, ...itemProperties } = chatItem;
          // clone the parent folder and add the filtered children
          const clonedItem = JSON.parse(JSON.stringify(itemProperties));
          clonedItem.children = filteredSubItems;
          filteredItems.push(clonedItem);
        }
      } else if (predicate(chatItem)) {
        filteredItems.push(chatItem);
      }
    }
    return filteredItems;
  };

  deleteChatFolder = (path: number[]): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const parent = this.findChatItemParentByPath(clonedChatHistory, path);
    if (parent) {
      parent.children.splice(path[path.length - 1], 1);
      this.updateChatFolderChildrenPaths(parent, path[path.length - 1]);
      useStore.getState().setChatHistory(clonedChatHistory);

      // update activeChatPath if it is a descendant of the deleted folder
      if (path === this.activeChatPath().slice(0, path.length)) {
        const firstChild = this.findFirstChatThread(clonedChatHistory);
        if (firstChild) {
          useStore.getState().setActiveChatPath(firstChild.path);
        } else {
          useStore.getState().setActiveChatPath(this.emptyPath);
        }
      }
    }
  };

  setChatFolderTitle = (path: number[], title: string): void => {
    this.setChatFolderProperty(path, 'title', title);
  };

  setChatFolderColor = (path: number[], color?: string): void => {
    this.setChatFolderProperty(path, 'color', color);
  };

  setChatFolderExpanded = (path: number[], expanded: boolean): void => {
    this.setChatFolderProperty(path, 'expanded', expanded);
  };

  moveChatThreadToFolder = (
    chatThreadPath: number[],
    folderPath: number[],
    expandFolder: boolean
  ) => {
    const clonedChatHistory = this.clonedChatHistory();
    const chatThread = this.findChatThreadByPath(
      clonedChatHistory,
      chatThreadPath
    );
    const folder = this.findChatFolderByPath(clonedChatHistory, folderPath);
    if (chatThread && folder) {
      const parent = this.findChatItemParent(chatThread, clonedChatHistory);
      if (parent) {
        parent.children.splice(chatThreadPath[chatThreadPath.length - 1], 1);
        this.updateChatFolderChildrenPaths(
          parent,
          chatThreadPath[chatThreadPath.length - 1]
        );
      }
      chatThread.path = [...folderPath, folder.children.length];
      folder.children.push(chatThread);

      if (expandFolder) {
        folder.expanded = true;
      }

      useStore.getState().setChatHistory(clonedChatHistory);
      if (chatThreadPath === this.activeChatPath()) {
        useStore.getState().setActiveChatPath(chatThread.path);
      }
    }
  };

  mutateChatFolder = (
    path: number[],
    mutate: (folder: ChatFolderInterface) => void
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const folder = this.findChatFolderByPath(clonedChatHistory, path);
    if (folder) {
      mutate(folder);
      useStore.getState().setChatHistory(clonedChatHistory);
      const activeChatPath = this.activeChatPath();
      if (folder.path !== path && path === activeChatPath.slice(0, -1)) {
        useStore
          .getState()
          .setActiveChatPath([
            ...folder.path,
            activeChatPath[activeChatPath.length - 1],
          ]);
      }
    }
  };

  mutateChatThread = (
    path: number[],
    mutate: (thread: ChatThreadInterface) => void
  ): void => {
    const clonedChatHistory = this.clonedChatHistory();
    const thread = this.findChatThreadByPath(clonedChatHistory, path);
    if (thread) {
      mutate(thread);
      useStore.getState().setChatHistory(clonedChatHistory);
      if (thread.path !== path && path === this.activeChatPath()) {
        useStore.getState().setActiveChatPath(thread.path);
      }
    }
  };

  fullyInitialized = (): boolean => {
    const h = this.history();
    return (
      h.config !== undefined &&
      this.isChatFolder(h) &&
      Array.isArray(h.children)
    );
  };

  private setChatFolderProperty: SetChatItemProperty<
    keyof ChatFolderPropertiesType
  > = (itemPath, property, value) => {
    const item = this.findChatItemByPath(this.history(), itemPath);
    if (item && this.isChatFolder(item)) {
      this.setChatItemProperty(itemPath, property, value);
    }
  };

  private setChatThreadProperty: SetChatItemProperty<
    keyof ChatThreadPropertiesType
  > = (itemPath, property, value) => {
    const item = this.findChatItemByPath(this.history(), itemPath);
    if (item && !this.isChatFolder(item)) {
      this.setChatItemProperty(itemPath, property, value);
    }
  };

  private setChatItemProperty: SetChatItemProperty<keyof ChatItemUnionType> = (
    itemPath,
    property,
    value
  ) => {
    if (this.chatItemPropertyNeedsUpdating(itemPath, property, value)) {
      return;
    }

    const clonedChatHistory = this.clonedChatHistory();
    const chatItem = this.findChatItemByPath(clonedChatHistory, itemPath);

    if (chatItem) {
      (chatItem as any)[property as string] = value;
      useStore.getState().setChatHistory(clonedChatHistory);
    }
  };

  private chatItemPropertyNeedsUpdating = (
    itemPath: number[],
    propertyName: string,
    newValue: any
  ) => {
    const chatItem = this.findChatItemByPath(this.history(), itemPath);
    if (chatItem && Object.hasOwnProperty.call(chatItem, propertyName)) {
      const v = (chatItem as any)[propertyName];
      return v !== newValue;
    }
    return false;
  };

  private insertAndReturnDefaultChatThread = (
    root: ChatHistoryListInterface,
    parentPath: number[],
    insertIndex: number
  ) => {
    const parent = this.findChatFolderByPath(root, parentPath) ?? root;
    const newChat = this.generateDefaultChat(
      [...parent.path, parent.children.length],
      parent.config
    );
    parent.children.splice(insertIndex, 0, newChat);
    this.updateChatFolderChildrenPaths(parent, insertIndex);
    return newChat;
  };

  private generateDefaultChat = (
    path: number[],
    config: ConfigInterface,
    title?: string
  ): ChatThreadInterface => ({
    id: uuidv4(),
    title: title ? title : this.findFirstAvailableChatTitle(path, 'New Chat'),
    messages:
      useStore.getState().defaultSystemMessage.length > 0
        ? [
            {
              role: 'system',
              content: useStore.getState().defaultSystemMessage,
            },
          ]
        : [],
    config: { ...config },
    titleSet: false,
    path: path,
  });

  private findFirstAvailableChatTitle = (
    chatThreadPath: number[],
    prefix: string
  ): string => {
    const chatHistory = useStore.getState().chatHistory;
    const parent =
      this.findChatItemParentByPath(chatHistory, chatThreadPath) ?? chatHistory;
    const existingTitles = new Set(
      parent.children
        .filter((ci) => !this.isChatFolder(ci))
        .map((ci) => ci.title)
    );
    let title = `${prefix} 1`;
    let i = 1;
    while (existingTitles.has(title)) {
      i++;
      title = `${prefix} ${i}`;
    }
    return title;
  };

  private isChatFolder = (
    item: ChatHistoryItem
  ): item is ChatFolderInterface => {
    return 'children' in item;
  };

  private findChatItemParent = (
    item: ChatHistoryItem,
    root: ChatHistoryListInterface
  ): ChatFolderInterface | null => {
    if (item.path.length === 0) return null; // item is the root
    let parent: ChatFolderInterface = root;
    for (let i = 0; i < item.path.length - 1; i++) {
      parent = parent.children[item.path[i]] as ChatFolderInterface;
    }
    return parent;
  };

  private findChatItemByPath = (
    root: ChatHistoryListInterface,
    path: number[]
  ): ChatHistoryItem | null => {
    if (path.length === 0) return root;
    let parent = root;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        this.isChatFolder(parent) === false ||
        path[i] >= parent.children.length
      )
        return null;
      parent = parent.children[path[i]] as ChatFolderInterface;
    }
    if (
      this.isChatFolder(parent) === false ||
      path[path.length - 1] >= parent.children.length
    ) {
      return null;
    }

    return parent.children[path[path.length - 1]];
  };

  private findChatThreadByPath = (
    root: ChatHistoryListInterface,
    path: number[]
  ): ChatThreadInterface | null => {
    const chatItem = this.findChatItemByPath(root, path);
    if (!chatItem || this.isChatFolder(chatItem)) return null;
    return chatItem;
  };

  private findChatFolderByPath = (
    root: ChatHistoryListInterface,
    path: number[]
  ): ChatFolderInterface | null => {
    const chatItem = this.findChatItemByPath(root, path);
    if (!chatItem || !this.isChatFolder(chatItem)) return null;
    return chatItem;
  };

  private findChatItemParentByPath = (
    root: ChatHistoryListInterface,
    path: number[]
  ): ChatFolderInterface | null => {
    if (path.length === 0) return null;
    return this.findChatFolderByPath(root, path.slice(0, -1));
  };

  private updateChatFolderChildrenPaths = (
    folder: ChatFolderInterface,
    startIndex = 0
  ) => {
    for (let i = startIndex; i < folder.children.length; i++) {
      const child = folder.children[i];
      child.path = [...folder.path, i];
      if (this.isChatFolder(child)) {
        this.updateChatFolderChildrenPaths(child); // Recursively update paths of all descendants
      }
    }
  };

  private isValidChatPath = (
    root: ChatFolderInterface,
    path: number[]
  ): boolean => {
    return !!this.findChatItemByPath(root, path);
  };

  private chatTitleExists = (
    chatItem: ChatHistoryItem,
    title: string
  ): boolean => {
    if (chatItem.title === title) {
      return true;
    } else if (this.isChatFolder(chatItem)) {
      return chatItem.children.some((ci) => this.chatTitleExists(ci, title));
    } else {
      return false;
    }
  };

  private findAllChatThreads = (
    parent: ChatFolderInterface
  ): ChatThreadInterface[] => {
    const threads: ChatThreadInterface[] = [];
    parent.children.forEach((child) => {
      if (this.isChatFolder(child)) {
        threads.push(...this.findAllChatThreads(child));
      } else {
        threads.push(child);
      }
    });
    return threads;
  };

  private hasAtLeastNChatThreads = (
    parent: ChatFolderInterface,
    minChatThreads: number
  ): boolean => {
    const threads: ChatThreadInterface[] = [];
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (this.isChatFolder(child)) {
        threads.push(...this.findAllChatThreads(child));
      } else {
        threads.push(child);
      }
      if (threads.length >= minChatThreads) return true;
    }
    return false;
  };

  private findFirstChatThread = (
    parent: ChatFolderInterface
  ): ChatThreadInterface | null => {
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      if (this.isChatFolder(child)) {
        const thread = this.findFirstChatThread(child);
        if (thread) return thread;
      } else {
        return child;
      }
    }
    return null;
  };

  private numberOfChatThreads = (parent: ChatFolderInterface): number => {
    return this.findAllChatThreads(parent).length;
  };

  private isRootChatHistoryPath = (path: number[]) => {
    return path.length === 0;
  };
}

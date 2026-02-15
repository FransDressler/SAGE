import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Subject, Source, ChatInfo, SourceType } from "../lib/api";
import * as api from "../lib/api";

export type ToolPanel = "quiz" | "podcast" | "smartnotes" | "flashcards" | "transcriber" | "mindmap" | null;

export type ViewingSource = { sourceId: string; page?: number; scrollToHeading?: string } | null;

type SubjectContextValue = {
  subject: Subject | null;
  sources: Source[];
  chats: ChatInfo[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  activePanel: ToolPanel;
  setActivePanel: (p: ToolPanel) => void;
  viewingSource: ViewingSource;
  openSource: (sourceId: string, opts?: { page?: number; heading?: string }) => void;
  closeSource: () => void;
  loadSubject: (id: string) => Promise<void>;
  uploadSources: (files: File[], sourceType?: SourceType) => Promise<string[] | undefined>;
  removeSource: (sourceId: string) => Promise<void>;
  refreshSources: () => Promise<void>;
  refreshChats: () => Promise<void>;
  updateSystemPrompt: (prompt: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
};

const SubjectContext = createContext<SubjectContextValue | null>(null);

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [viewingSource, setViewingSource] = useState<ViewingSource>(null);

  const loadSubject = useCallback(async (id: string) => {
    const res = await api.getSubject(id);
    setSubject({ ...res.subject, sourceCount: res.sources.length });
    setSources(res.sources.map(s => ({ ...s, sourceType: s.sourceType || "material" })));
    const chatRes = await api.getChats(id);
    setChats(chatRes.chats);
    setActiveChatId(null);
    setActivePanel(null);
    setViewingSource(null);
  }, []);

  const refreshSources = useCallback(async () => {
    if (!subject) return;
    const res = await api.getSubject(subject.id);
    setSources(res.sources.map(s => ({ ...s, sourceType: s.sourceType || "material" })));
    setSubject(prev => prev ? { ...prev, sourceCount: res.sources.length } : null);
  }, [subject]);

  const refreshChats = useCallback(async () => {
    if (!subject) return;
    const res = await api.getChats(subject.id);
    setChats(res.chats);
  }, [subject]);

  const uploadSourcesFn = useCallback(async (files: File[], sourceType?: SourceType): Promise<string[] | undefined> => {
    if (!subject) return;
    const res = await api.uploadSources(subject.id, files, sourceType);
    await refreshSources();
    return res.warnings;
  }, [subject, refreshSources]);

  const removeSourceFn = useCallback(async (sourceId: string) => {
    if (!subject) return;
    await api.removeSource(subject.id, sourceId);
    await refreshSources();
  }, [subject, refreshSources]);

  const updateSystemPrompt = useCallback(async (prompt: string) => {
    if (!subject) return;
    const subjectId = subject.id;
    const res = await api.updateSubjectPrompt(subjectId, prompt);
    setSubject(prev => prev?.id === subjectId ? { ...prev, systemPrompt: res.subject.systemPrompt } : prev);
  }, [subject?.id]);

  const renameChatFn = useCallback(async (chatId: string, title: string) => {
    if (!subject) return;
    await api.renameChat(subject.id, chatId, title);
    await refreshChats();
  }, [subject, refreshChats]);

  const openSource = useCallback((sourceId: string, opts?: { page?: number; heading?: string }) => {
    setViewingSource({ sourceId, page: opts?.page, scrollToHeading: opts?.heading });
  }, []);

  const closeSource = useCallback(() => {
    setViewingSource(null);
  }, []);

  const deleteChatFn = useCallback(async (chatId: string) => {
    if (!subject) return;
    await api.deleteChat(subject.id, chatId);
    await refreshChats();
  }, [subject, refreshChats]);

  return (
    <SubjectContext.Provider
      value={{
        subject,
        sources,
        chats,
        activeChatId,
        setActiveChatId,
        activePanel,
        setActivePanel,
        viewingSource,
        openSource,
        closeSource,
        loadSubject,
        uploadSources: uploadSourcesFn,
        removeSource: removeSourceFn,
        refreshSources,
        refreshChats,
        updateSystemPrompt,
        renameChat: renameChatFn,
        deleteChat: deleteChatFn,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubject() {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error("useSubject must be used within SubjectProvider");
  return ctx;
}

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Subject, Source, ChatInfo, SourceType } from "../lib/api";
import * as api from "../lib/api";

export type ToolPanel = "quiz" | "podcast" | "smartnotes" | "flashcards" | "transcriber" | "mindmap" | null;

type SubjectContextValue = {
  subject: Subject | null;
  sources: Source[];
  chats: ChatInfo[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  activePanel: ToolPanel;
  setActivePanel: (p: ToolPanel) => void;
  loadSubject: (id: string) => Promise<void>;
  uploadSources: (files: File[], sourceType?: SourceType) => Promise<string[] | undefined>;
  removeSource: (sourceId: string) => Promise<void>;
  refreshSources: () => Promise<void>;
  refreshChats: () => Promise<void>;
  updateSystemPrompt: (prompt: string) => Promise<void>;
};

const SubjectContext = createContext<SubjectContextValue | null>(null);

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);

  const loadSubject = useCallback(async (id: string) => {
    const res = await api.getSubject(id);
    setSubject({ ...res.subject, sourceCount: res.sources.length });
    setSources(res.sources.map(s => ({ ...s, sourceType: s.sourceType || "material" })));
    const chatRes = await api.getChats(id);
    setChats(chatRes.chats);
    setActiveChatId(null);
    setActivePanel(null);
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
        loadSubject,
        uploadSources: uploadSourcesFn,
        removeSource: removeSourceFn,
        refreshSources,
        refreshChats,
        updateSystemPrompt,
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

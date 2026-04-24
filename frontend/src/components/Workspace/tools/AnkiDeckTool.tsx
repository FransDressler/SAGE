import { useEffect, useState, useCallback, useRef } from "react";
import { useSubject } from "../../../context/SubjectContext";
import {
  listAnkiCards, addAnkiCard, editAnkiCard, deleteAnkiCard, deleteAllAnkiCards,
  generateAnkiCards, connectAnkiStream, exportAnkiDeckUrl,
  getStudyPlan,
  ankiwebStatus, ankiwebLogin, ankiwebSetDeckName, ankiwebDisconnect, ankiwebSync,
  getStudyQueue, reviewAnkiCard,
  type AnkiCard, type AnkiDeckEvent, type StudyPlan, type StudyPlanTopic, type StudyPlanSubtopic, type StudyStats,
} from "../../../lib/api";

type GroupedCards = Map<string, { topic: StudyPlanTopic; subtopics: Map<string, { subtopic: StudyPlanSubtopic; cards: AnkiCard[] }> }>;

function groupCardsByPlan(cards: AnkiCard[], plan: StudyPlan | null): { grouped: GroupedCards; untagged: AnkiCard[] } {
  const grouped: GroupedCards = new Map();
  const untagged: AnkiCard[] = [];

  if (plan) {
    for (const t of plan.topics) {
      const subMap = new Map<string, { subtopic: StudyPlanSubtopic; cards: AnkiCard[] }>();
      for (const s of t.subtopics) {
        subMap.set(s.id, { subtopic: s, cards: [] });
      }
      grouped.set(t.id, { topic: t, subtopics: subMap });
    }
  }

  for (const card of cards) {
    if (card.topicId && grouped.has(card.topicId)) {
      const topicGroup = grouped.get(card.topicId)!;
      if (card.subtopicId && topicGroup.subtopics.has(card.subtopicId)) {
        topicGroup.subtopics.get(card.subtopicId)!.cards.push(card);
      } else {
        untagged.push(card);
      }
    } else {
      untagged.push(card);
    }
  }

  return { grouped, untagged };
}

export default function AnkiDeckTool() {
  const { subject } = useSubject();
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editTags, setEditTags] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualFront, setManualFront] = useState("");
  const [manualBack, setManualBack] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState("");
  const [genCount, setGenCount] = useState(5);
  const [genPrompt, setGenPrompt] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showDeckMenu, setShowDeckMenu] = useState(false);
  const deckMenuRef = useRef<HTMLDivElement>(null);
  const closerRef = useRef<(() => void) | null>(null);

  // AnkiWeb sync state
  const [ankiConnected, setAnkiConnected] = useState(false);
  const [ankiUsername, setAnkiUsername] = useState("");
  const [ankiDeckName, setAnkiDeckName] = useState("");
  const [ankiLastSync, setAnkiLastSync] = useState<number | undefined>();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginDeck, setLoginDeck] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");
  const [editingDeckName, setEditingDeckName] = useState(false);
  const [tempDeckName, setTempDeckName] = useState("");

  // Study mode state
  const [tab, setTab] = useState<"cards" | "study">("cards");
  const [studyQueue, setStudyQueue] = useState<AnkiCard[]>([]);
  const [studyStats, setStudyStats] = useState<StudyStats>({ newCount: 0, learningCount: 0, dueCount: 0 });
  const [studyIdx, setStudyIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyLoading, setStudyLoading] = useState(false);
  const [studySessionDone, setStudySessionDone] = useState(0);

  useEffect(() => {
    if (!subject) return;
    setLoading(true);
    Promise.all([
      listAnkiCards(subject.id).catch(() => ({ cards: [], lastGenerated: undefined })),
      getStudyPlan(subject.id).catch(() => ({ plan: null })),
      ankiwebStatus(subject.id).catch((): { ok: true; connected: false; username?: string; deckName?: string; lastSync?: number } => ({ ok: true, connected: false })),
    ]).then(([deckRes, planRes, syncRes]) => {
      setCards(deckRes.cards || []);
      setPlan(planRes.plan || null);
      if (planRes.plan?.topics?.length) {
        setExpandedTopics(new Set(planRes.plan.topics.map(t => t.id)));
      }
      setAnkiConnected(syncRes.connected);
      setAnkiUsername(syncRes.username || "");
      setAnkiDeckName(syncRes.deckName || "");
      setAnkiLastSync(syncRes.lastSync);
      if (!syncRes.connected) setLoginDeck(planRes.plan?.topics?.[0]?.title || subject.name || "PageLM");
    }).finally(() => setLoading(false));

    return () => { if (closerRef.current) { closerRef.current(); closerRef.current = null; } };
  }, [subject?.id]);

  const handleGenerate = useCallback(async () => {
    if (!subject || generating) return;
    setGenerating(true);
    setGenProgress("Starting...");
    try {
      const opts: any = { count: genCount };
      if (selectedTopicId) opts.topicId = selectedTopicId;
      if (selectedSubtopicId) opts.subtopicId = selectedSubtopicId;
      if (genPrompt.trim()) opts.prompt = genPrompt.trim();

      const res = await generateAnkiCards(subject.id, opts);
      const { close } = connectAnkiStream(res.generationId, (ev: AnkiDeckEvent) => {
        if (ev.type === "phase") setGenProgress(ev.detail || ev.value || "Generating...");
        if (ev.type === "cards") {
          setCards(prev => [...prev, ...(ev.cards || [])]);
          setGenProgress("");
          setGenerating(false);
        }
        if (ev.type === "error") { setGenProgress(""); setGenerating(false); }
        if (ev.type === "done") { closerRef.current = null; }
      });
      closerRef.current = close;
    } catch {
      setGenerating(false);
      setGenProgress("");
    }
  }, [subject, generating, genCount, selectedTopicId, selectedSubtopicId, genPrompt]);

  const handleAddManual = async () => {
    if (!subject || !manualFront.trim() || !manualBack.trim()) return;
    try {
      const res = await addAnkiCard(subject.id, {
        front: manualFront.trim(),
        back: manualBack.trim(),
        tags: manualTags.split(",").map(t => t.trim()).filter(Boolean),
        topicId: selectedTopicId || undefined,
        subtopicId: selectedSubtopicId || undefined,
      });
      setCards(prev => [res.card, ...prev]);
      setManualFront("");
      setManualBack("");
      setManualTags("");
    } catch {}
  };

  // Close deck menu on click outside
  useEffect(() => {
    if (!showDeckMenu) return;
    const handler = (e: MouseEvent) => {
      if (deckMenuRef.current && !deckMenuRef.current.contains(e.target as Node)) setShowDeckMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDeckMenu]);

  const handleDeleteAll = async () => {
    if (!subject) return;
    if (!confirm("Delete ALL Anki cards? This cannot be undone.")) return;
    setShowDeckMenu(false);
    try {
      await deleteAllAnkiCards(subject.id);
      setCards([]);
    } catch {}
  };

  const handleRegenerateAll = async () => {
    if (!subject || generating) return;
    if (!confirm("Delete all existing cards and regenerate from scratch?")) return;
    setShowDeckMenu(false);
    try {
      await deleteAllAnkiCards(subject.id);
      setCards([]);
    } catch {}
    // Trigger full generation
    setGenerating(true);
    setGenProgress("Starting regeneration...");
    try {
      const res = await generateAnkiCards(subject.id, { count: genCount });
      const { close } = connectAnkiStream(res.generationId, (ev: AnkiDeckEvent) => {
        if (ev.type === "phase") setGenProgress(ev.detail || ev.value || "Generating...");
        if (ev.type === "cards") {
          setCards(prev => [...prev, ...(ev.cards || [])]);
          setGenProgress("");
          setGenerating(false);
        }
        if (ev.type === "error") { setGenProgress(""); setGenerating(false); }
        if (ev.type === "done") { closerRef.current = null; }
      });
      closerRef.current = close;
    } catch {
      setGenerating(false);
      setGenProgress("");
    }
  };

  const handleEdit = async (cardId: string) => {
    if (!subject) return;
    try {
      const res = await editAnkiCard(subject.id, cardId, {
        front: editFront,
        back: editBack,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setCards(prev => prev.map(c => c.id === cardId ? res.card : c));
      setEditingCard(null);
    } catch {}
  };

  const handleDelete = async (cardId: string) => {
    if (!subject) return;
    try {
      await deleteAnkiCard(subject.id, cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      setConfirmDelete(null);
    } catch {}
  };

  const startEdit = (card: AnkiCard) => {
    setEditingCard(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditTags(card.tags.join(", "));
  };

  // --- AnkiWeb handlers ---
  const handleLogin = async () => {
    if (!subject || !loginUser.trim() || !loginPass.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      await ankiwebLogin(subject.id, loginUser.trim(), loginPass.trim(), loginDeck.trim() || "PageLM");
      setAnkiConnected(true);
      setAnkiUsername(loginUser.trim());
      setAnkiDeckName(loginDeck.trim() || "PageLM");
      setShowLoginForm(false);
      setLoginPass("");
    } catch (e: any) {
      setLoginError(e?.message || "Login fehlgeschlagen");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!subject) return;
    await ankiwebDisconnect(subject.id).catch(() => {});
    setAnkiConnected(false);
    setAnkiUsername("");
    setAnkiDeckName("");
    setAnkiLastSync(undefined);
  };

  const handleSaveDeckName = async () => {
    if (!subject || !tempDeckName.trim()) return;
    await ankiwebSetDeckName(subject.id, tempDeckName.trim()).catch(() => {});
    setAnkiDeckName(tempDeckName.trim());
    setEditingDeckName(false);
  };

  const handleSync = useCallback(async () => {
    if (!subject || syncing) return;
    setSyncing(true);
    setSyncProgress("Starte Sync...");
    try {
      const res = await ankiwebSync(subject.id);
      const { close } = connectAnkiStream(res.syncId, (ev) => {
        if (ev.type === "phase") setSyncProgress(ev.detail || ev.value || "Syncing...");
        if (ev.type === "done") {
          setSyncing(false);
          setSyncProgress("");
          setAnkiLastSync(Date.now());
        }
        if (ev.type === "error") {
          setSyncing(false);
          setSyncProgress("Sync fehlgeschlagen: " + (("error" in ev && ev.error) || ""));
        }
      });
      closerRef.current = close;
    } catch {
      setSyncing(false);
      setSyncProgress("");
    }
  }, [subject, syncing]);

  const loadStudyQueue = useCallback(async () => {
    if (!subject) return;
    setStudyLoading(true);
    try {
      const res = await getStudyQueue(subject.id);
      setStudyQueue(res.queue || []);
      setStudyStats(res.stats);
      setStudyIdx(0);
      setShowAnswer(false);
    } catch {}
    setStudyLoading(false);
  }, [subject]);

  useEffect(() => {
    if (tab === "study") loadStudyQueue();
  }, [tab, loadStudyQueue]);

  const handleReview = useCallback(async (rating: "again" | "hard" | "good" | "easy") => {
    if (!subject || studyIdx >= studyQueue.length) return;
    const card = studyQueue[studyIdx];
    try {
      const res = await reviewAnkiCard(subject.id, card.id, rating);
      setStudyStats(res.stats);
      setCards(prev => prev.map(c => c.id === card.id ? res.card : c));
    } catch {}
    setShowAnswer(false);
    setStudySessionDone(prev => prev + 1);
    if (studyIdx + 1 < studyQueue.length) {
      setStudyIdx(prev => prev + 1);
    } else {
      // Session done — reload queue for any remaining cards
      loadStudyQueue();
      setStudySessionDone(0);
    }
  }, [subject, studyIdx, studyQueue, loadStudyQueue]);

  const filteredCards = search
    ? cards.filter(c => c.front.toLowerCase().includes(search.toLowerCase()) || c.back.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    : cards;

  const { grouped, untagged } = groupCardsByPlan(filteredCards, plan);

  const subtopicsForTopic = plan?.topics.find(t => t.id === selectedTopicId)?.subtopics || [];

  if (loading) return <div className="p-4 text-center text-stone-500 text-sm">Loading Anki Deck...</div>;

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-200">Anki Deck</h3>
          <p className="text-xs text-stone-500">{cards.length} card{cards.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1.5">
          {ankiConnected && (
            <button
              onClick={handleSync}
              disabled={syncing || cards.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white"
            >
              {syncing ? "Syncing..." : "Sync"}
            </button>
          )}
          <a
            href={subject ? exportAnkiDeckUrl(subject.id) : "#"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cards.length > 0 ? "bg-teal-700 hover:bg-teal-600 text-white" : "bg-stone-800 text-stone-600 pointer-events-none"}`}
            download
          >
            .apkg
          </a>
          {/* 3-dot menu */}
          <div className="relative" ref={deckMenuRef}>
            <button
              onClick={() => setShowDeckMenu(v => !v)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="More options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showDeckMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={handleRegenerateAll}
                  disabled={generating || !plan}
                  className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Regenerate entire deck
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={cards.length === 0}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  Delete all cards
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-stone-900/50 rounded-lg">
        <button
          onClick={() => setTab("cards")}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "cards" ? "bg-stone-800 text-stone-200" : "text-stone-500 hover:text-stone-300"}`}
        >
          Karten
        </button>
        <button
          onClick={() => setTab("study")}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "study" ? "bg-teal-800 text-teal-200" : "text-stone-500 hover:text-stone-300"}`}
        >
          Lernen
          {(studyStats.dueCount + studyStats.newCount) > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-teal-700/50">{studyStats.dueCount + studyStats.newCount + studyStats.learningCount}</span>
          )}
        </button>
      </div>

      {/* Study Mode */}
      {tab === "study" && (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="flex gap-3 text-xs">
            <span className="text-blue-400">Neu: {studyStats.newCount}</span>
            <span className="text-orange-400">Lernen: {studyStats.learningCount}</span>
            <span className="text-green-400">Fällig: {studyStats.dueCount}</span>
            {studySessionDone > 0 && <span className="text-stone-500 ml-auto">{studySessionDone} beantwortet</span>}
          </div>

          {studyLoading ? (
            <div className="text-center text-stone-500 text-xs py-8">Lade Karten...</div>
          ) : studyQueue.length === 0 || studyIdx >= studyQueue.length ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-2xl">&#10003;</div>
              <div className="text-sm text-stone-300">Alles erledigt!</div>
              <div className="text-xs text-stone-500">Keine Karten fällig. Komm später wieder.</div>
              <button onClick={loadStudyQueue} className="mt-2 px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors">
                Neu laden
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${((studyIdx) / studyQueue.length) * 100}%` }} />
              </div>
              <div className="text-[11px] text-stone-500 text-right">{studyIdx + 1} / {studyQueue.length}</div>

              {/* Card */}
              <div className="rounded-xl border border-stone-700 bg-stone-900/80 overflow-hidden">
                {/* Front */}
                <div className="p-4 min-h-[80px]">
                  <div className="text-[10px] uppercase tracking-wider text-stone-600 mb-2">Frage</div>
                  <div className="text-sm text-stone-200 whitespace-pre-wrap">{studyQueue[studyIdx].front}</div>
                </div>

                {/* Answer */}
                {showAnswer ? (
                  <div className="p-4 border-t border-stone-700 bg-stone-900/50 min-h-[80px]">
                    <div className="text-[10px] uppercase tracking-wider text-stone-600 mb-2">Antwort</div>
                    <div className="text-sm text-stone-300 whitespace-pre-wrap">{studyQueue[studyIdx].back}</div>
                    {studyQueue[studyIdx].imageUrl && (
                      <img src={studyQueue[studyIdx].imageUrl} alt="" className="mt-2 max-w-full max-h-[150px] rounded border border-stone-700" />
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-3 border-t border-stone-700 text-xs text-teal-400 hover:bg-stone-800/50 transition-colors font-medium"
                  >
                    Antwort zeigen
                  </button>
                )}
              </div>

              {/* Rating buttons */}
              {showAnswer && (
                <div className="grid grid-cols-4 gap-1.5">
                  <button onClick={() => handleReview("again")} className="py-2.5 rounded-lg text-xs font-medium bg-red-900/40 hover:bg-red-800/50 text-red-300 border border-red-800/30 transition-colors">
                    <div>Nochmal</div>
                    <div className="text-[10px] text-red-400/60 mt-0.5">&lt;1 min</div>
                  </button>
                  <button onClick={() => handleReview("hard")} className="py-2.5 rounded-lg text-xs font-medium bg-orange-900/30 hover:bg-orange-800/40 text-orange-300 border border-orange-800/30 transition-colors">
                    <div>Schwer</div>
                    <div className="text-[10px] text-orange-400/60 mt-0.5">{Math.max(1, Math.round((studyQueue[studyIdx].interval || 0) * 1.2))}d</div>
                  </button>
                  <button onClick={() => handleReview("good")} className="py-2.5 rounded-lg text-xs font-medium bg-green-900/30 hover:bg-green-800/40 text-green-300 border border-green-800/30 transition-colors">
                    <div>Gut</div>
                    <div className="text-[10px] text-green-400/60 mt-0.5">{Math.max(1, Math.round((studyQueue[studyIdx].interval || 0) * ((studyQueue[studyIdx].ease || 2500) / 1000)))}d</div>
                  </button>
                  <button onClick={() => handleReview("easy")} className="py-2.5 rounded-lg text-xs font-medium bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 border border-blue-800/30 transition-colors">
                    <div>Einfach</div>
                    <div className="text-[10px] text-blue-400/60 mt-0.5">{Math.max(1, Math.round((studyQueue[studyIdx].interval || 0) * ((studyQueue[studyIdx].ease || 2500) / 1000) * 1.3))}d</div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "cards" && <>
      {/* AnkiWeb Sync Section */}
      <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">AnkiWeb</div>
          {ankiConnected ? (
            <button onClick={handleDisconnect} className="text-[11px] text-stone-600 hover:text-red-400 transition-colors">
              Trennen
            </button>
          ) : (
            <button onClick={() => setShowLoginForm(!showLoginForm)} className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors">
              Verknüpfen
            </button>
          )}
        </div>

        {ankiConnected ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-stone-300">{ankiUsername}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500">Stapel:</span>
              {editingDeckName ? (
                <div className="flex gap-1 flex-1">
                  <input
                    value={tempDeckName}
                    onChange={e => setTempDeckName(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded px-2 py-0.5 text-xs text-stone-200 outline-none focus:border-teal-600"
                    onKeyDown={e => e.key === "Enter" && handleSaveDeckName()}
                  />
                  <button onClick={handleSaveDeckName} className="text-teal-400 hover:text-teal-300 text-[11px]">OK</button>
                  <button onClick={() => setEditingDeckName(false)} className="text-stone-500 hover:text-stone-300 text-[11px]">X</button>
                </div>
              ) : (
                <button
                  onClick={() => { setTempDeckName(ankiDeckName); setEditingDeckName(true); }}
                  className="text-stone-200 hover:text-teal-400 transition-colors"
                  title="Stapelname ändern"
                >
                  {ankiDeckName}
                </button>
              )}
            </div>
            {ankiLastSync && (
              <div className="text-[11px] text-stone-600">
                Letzter Sync: {new Date(ankiLastSync).toLocaleString("de-DE")}
              </div>
            )}
            {syncProgress && (
              <div className="text-[11px] text-blue-400">{syncProgress}</div>
            )}
          </div>
        ) : showLoginForm ? (
          <div className="space-y-2">
            <input
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              placeholder="AnkiWeb Benutzername"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600"
            />
            <input
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              type="password"
              placeholder="Passwort"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <input
              value={loginDeck}
              onChange={e => setLoginDeck(e.target.value)}
              placeholder="Stapelname (z.B. Physik)"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600"
            />
            {loginError && <div className="text-[11px] text-red-400">{loginError}</div>}
            <button
              onClick={handleLogin}
              disabled={loginLoading || !loginUser.trim() || !loginPass.trim()}
              className="w-full py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {loginLoading ? "Verbinde..." : "Verbinden"}
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-stone-600">
            Nicht verbunden. Verknüpfe dein AnkiWeb-Konto um Karten direkt zu synchronisieren.
          </div>
        )}
      </div>

      {/* No study plan warning */}
      {!plan && (
        <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/40 text-amber-300 text-xs">
          Kein Lernplan vorhanden. Erstelle zuerst einen Lernplan, um Karten nach Themen zu strukturieren.
        </div>
      )}

      {/* Generate by Topic */}
      {plan && (
        <div className="space-y-2 p-3 rounded-lg bg-stone-900/50 border border-stone-800">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Karten generieren</div>
          <textarea
            data-gen-prompt
            value={genPrompt}
            onChange={e => setGenPrompt(e.target.value)}
            placeholder="Fokus: z.B. Formeln, Verständnisfragen, Klausurvorbereitung, Abrufübung..."
            rows={2}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-teal-600 resize-none placeholder:text-stone-600"
          />
          <div className="flex gap-2">
            <select
              value={selectedTopicId}
              onChange={e => { setSelectedTopicId(e.target.value); setSelectedSubtopicId(""); }}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-200 outline-none focus:border-teal-600"
            >
              <option value="">Alle Themen</option>
              {plan.topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            {subtopicsForTopic.length > 0 && (
              <select
                value={selectedSubtopicId}
                onChange={e => setSelectedSubtopicId(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-200 outline-none focus:border-teal-600"
              >
                <option value="">Alle Unterthemen</option>
                {subtopicsForTopic.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-stone-500">Anzahl:</label>
            <select
              value={genCount}
              onChange={e => setGenCount(Number(e.target.value))}
              className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 outline-none"
            >
              {[3, 5, 8, 10, 15].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {generating ? genProgress || "Generating..." : "Generieren"}
            </button>
          </div>
        </div>
      )}

      {/* Manual add */}
      <div className="space-y-2">
        <button
          onClick={() => setShowManualAdd(!showManualAdd)}
          className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
        >
          {showManualAdd ? "- Manuell hinzufügen ausblenden" : "+ Karte manuell hinzufügen"}
        </button>
        {showManualAdd && (
          <div className="space-y-2 p-3 rounded-lg bg-stone-900/50 border border-stone-800">
            <textarea
              value={manualFront}
              onChange={e => setManualFront(e.target.value)}
              placeholder="Vorderseite (Frage)..."
              rows={2}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600 resize-none"
            />
            <textarea
              value={manualBack}
              onChange={e => setManualBack(e.target.value)}
              placeholder="Rückseite (Antwort)..."
              rows={2}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600 resize-none"
            />
            <input
              value={manualTags}
              onChange={e => setManualTags(e.target.value)}
              placeholder="Tags (kommagetrennt)..."
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600"
            />
            <button
              onClick={handleAddManual}
              disabled={!manualFront.trim() || !manualBack.trim()}
              className="w-full py-1.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {cards.length > 0 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suchen..."
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-teal-600"
        />
      )}

      {/* Card list grouped by topic/subtopic */}
      {plan && Array.from(grouped.entries()).map(([topicId, { topic, subtopics }]) => {
        const topicCardCount = Array.from(subtopics.values()).reduce((acc, s) => acc + s.cards.length, 0);
        if (topicCardCount === 0 && search) return null;
        const isExpanded = expandedTopics.has(topicId);

        return (
          <div key={topicId} className="rounded-lg border border-stone-800 overflow-hidden">
            <button
              onClick={() => setExpandedTopics(prev => {
                const next = new Set(prev);
                if (next.has(topicId)) next.delete(topicId); else next.add(topicId);
                return next;
              })}
              className="w-full flex items-center justify-between px-3 py-2 bg-stone-900/70 hover:bg-stone-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-3 h-3 text-stone-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-xs font-medium text-stone-200">{topic.title}</span>
              </div>
              <span className="text-[11px] text-stone-500">{topicCardCount} cards</span>
            </button>

            {isExpanded && Array.from(subtopics.entries()).map(([subId, { subtopic, cards: subCards }]) => {
              if (subCards.length === 0 && search) return null;
              const subExpanded = expandedSubs.has(subId);

              return (
                <div key={subId} className="border-t border-stone-800/50">
                  <button
                    onClick={() => setExpandedSubs(prev => {
                      const next = new Set(prev);
                      if (next.has(subId)) next.delete(subId); else next.add(subId);
                      return next;
                    })}
                    className="w-full flex items-center justify-between px-5 py-1.5 bg-stone-900/40 hover:bg-stone-800/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <svg className={`w-2.5 h-2.5 text-stone-600 transition-transform ${subExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      <span className="text-xs text-stone-300">{subtopic.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTopicId(topicId);
                          setSelectedSubtopicId(subId);
                          setGenCount(5);
                          document.querySelector<HTMLTextAreaElement>("[data-gen-prompt]")?.focus();
                        }}
                        className="text-[10px] text-teal-600 hover:text-teal-400 transition-colors px-1"
                        title="Mehr Karten für dieses Unterthema generieren"
                      >
                        + Mehr
                      </button>
                      <span className="text-[11px] text-stone-600">{subCards.length}</span>
                    </div>
                  </button>

                  {subExpanded && subCards.map(card => (
                    <CardRow
                      key={card.id}
                      card={card}
                      editing={editingCard === card.id}
                      editFront={editFront}
                      editBack={editBack}
                      editTags={editTags}
                      confirmDelete={confirmDelete === card.id}
                      onStartEdit={() => startEdit(card)}
                      onSetEditFront={setEditFront}
                      onSetEditBack={setEditBack}
                      onSetEditTags={setEditTags}
                      onSaveEdit={() => handleEdit(card.id)}
                      onCancelEdit={() => setEditingCard(null)}
                      onConfirmDelete={() => setConfirmDelete(card.id)}
                      onDelete={() => handleDelete(card.id)}
                      onCancelDelete={() => setConfirmDelete(null)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Untagged cards */}
      {untagged.length > 0 && (
        <div className="rounded-lg border border-stone-800 overflow-hidden">
          <div className="px-3 py-2 bg-stone-900/70 text-xs font-medium text-stone-400">
            Ungetaggt ({untagged.length})
          </div>
          {untagged.map(card => (
            <CardRow
              key={card.id}
              card={card}
              editing={editingCard === card.id}
              editFront={editFront}
              editBack={editBack}
              editTags={editTags}
              confirmDelete={confirmDelete === card.id}
              onStartEdit={() => startEdit(card)}
              onSetEditFront={setEditFront}
              onSetEditBack={setEditBack}
              onSetEditTags={setEditTags}
              onSaveEdit={() => handleEdit(card.id)}
              onCancelEdit={() => setEditingCard(null)}
              onConfirmDelete={() => setConfirmDelete(card.id)}
              onDelete={() => handleDelete(card.id)}
              onCancelDelete={() => setConfirmDelete(null)}
            />
          ))}
        </div>
      )}

      {cards.length === 0 && !loading && (
        <div className="text-center text-stone-600 text-xs py-6">
          Noch keine Karten. Generiere Karten aus deinem Lernplan oder füge manuell hinzu.
        </div>
      )}
      </>}
    </div>
  );
}

type CardRowProps = {
  card: AnkiCard;
  editing: boolean;
  editFront: string;
  editBack: string;
  editTags: string;
  confirmDelete: boolean;
  onStartEdit: () => void;
  onSetEditFront: (v: string) => void;
  onSetEditBack: (v: string) => void;
  onSetEditTags: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onConfirmDelete: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
};

function CardRow({
  card, editing, editFront, editBack, editTags, confirmDelete,
  onStartEdit, onSetEditFront, onSetEditBack, onSetEditTags, onSaveEdit, onCancelEdit,
  onConfirmDelete, onDelete, onCancelDelete,
}: CardRowProps) {
  const [expanded, setExpanded] = useState(false);

  if (editing) {
    return (
      <div className="px-5 py-2 border-t border-stone-800/30 space-y-1.5 bg-stone-900/30">
        <textarea value={editFront} onChange={e => onSetEditFront(e.target.value)} rows={2}
          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-teal-600 resize-none" />
        <textarea value={editBack} onChange={e => onSetEditBack(e.target.value)} rows={2}
          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-teal-600 resize-none" />
        <input value={editTags} onChange={e => onSetEditTags(e.target.value)} placeholder="Tags..."
          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-teal-600" />
        <div className="flex gap-1.5">
          <button onClick={onSaveEdit} className="px-2 py-1 text-[11px] bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors">Speichern</button>
          <button onClick={onCancelEdit} className="px-2 py-1 text-[11px] bg-stone-700 hover:bg-stone-600 text-stone-300 rounded transition-colors">Abbrechen</button>
        </div>
      </div>
    );
  }

  if (confirmDelete) {
    return (
      <div className="px-5 py-2 border-t border-stone-800/30 flex items-center justify-between bg-red-900/10">
        <span className="text-xs text-stone-300">Diese Karte löschen?</span>
        <div className="flex gap-1.5">
          <button onClick={onDelete} className="px-2 py-1 text-[11px] bg-red-700 hover:bg-red-600 text-white rounded transition-colors">Löschen</button>
          <button onClick={onCancelDelete} className="px-2 py-1 text-[11px] bg-stone-700 hover:bg-stone-600 text-stone-300 rounded transition-colors">Abbrechen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group px-5 py-2 border-t border-stone-800/30 hover:bg-stone-800/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 min-w-0 text-left">
          <p className="text-xs text-stone-200 line-clamp-2">{card.front}</p>
          {expanded && (
            <div className="mt-1.5">
              <p className="text-xs text-stone-400 whitespace-pre-wrap">{card.back}</p>
              {card.imageUrl && (
                <img src={card.imageUrl} alt="" className="mt-1.5 max-w-[200px] max-h-[120px] rounded border border-stone-700" />
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            {card.sourceType === "exercise" && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-900/30 text-amber-400 border border-amber-800/30">Klausur</span>
            )}
            {card.sourceType === "material" && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-900/30 text-blue-400 border border-blue-800/30">Vorlesung</span>
            )}
            {card.tags.filter(t => t !== "Klausur" && t !== "Vorlesung").slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-stone-800 text-stone-400">{tag}</span>
            ))}
          </div>
        </button>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onStartEdit} className="p-1 rounded text-stone-600 hover:text-teal-400 hover:bg-teal-900/20 transition-colors" title="Bearbeiten">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button onClick={onConfirmDelete} className="p-1 rounded text-stone-600 hover:text-red-400 hover:bg-red-900/20 transition-colors" title="Löschen">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

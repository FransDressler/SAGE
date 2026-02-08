import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getModels, type ProviderInfo } from "../lib/api";

type ModelChoice = { provider: string; model: string };

type ModelContextValue = {
  providers: ProviderInfo[];
  loading: boolean;
  chatModel: ModelChoice;
  setChatModel: (m: ModelChoice) => void;
};

const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatModel, setChatModel] = useState<ModelChoice>({ provider: "", model: "" });

  useEffect(() => {
    getModels()
      .then((res) => {
        setProviders(res.providers);
        if (res.defaultProvider) {
          const def = res.providers.find((p) => p.id === res.defaultProvider);
          setChatModel({
            provider: res.defaultProvider,
            model: def?.defaultModel || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ModelContext.Provider value={{ providers, loading, chatModel, setChatModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModels() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModels must be used within ModelProvider");
  return ctx;
}

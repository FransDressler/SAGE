import { useModels } from "../../context/ModelContext";

type Props = {
  value: string;
  onChange: (provider: string, model: string) => void;
  className?: string;
};

export default function ModelSelector({ value, onChange, className = "" }: Props) {
  const { providers, loading } = useModels();

  if (loading || providers.length < 2) return null;

  return (
    <select
      value={value}
      onChange={(e) => {
        const p = providers.find((p) => p.id === e.target.value);
        if (p) onChange(p.id, p.defaultModel);
      }}
      className={`bg-stone-900 border border-stone-800 rounded-md px-2 py-1 text-xs text-stone-300 outline-none ${className}`}
    >
      {providers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

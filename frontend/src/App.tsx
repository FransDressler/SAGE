import { Outlet } from "react-router-dom";
import { SubjectProvider } from "./context/SubjectContext";
import { ModelProvider } from "./context/ModelContext";

export default function App() {
  return (
    <SubjectProvider>
      <ModelProvider>
        <div className="bg-stone-900 text-bone min-h-screen">
          <Outlet />
        </div>
      </ModelProvider>
    </SubjectProvider>
  );
}

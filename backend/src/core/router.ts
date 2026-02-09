import { subjectRoutes } from "./routes/subjects";
import { chatRoutes } from "./routes/chat";
import { quizRoutes } from "./routes/quiz";
import { flashcardRoutes } from "./routes/flashcards";
import { smartnotesRoutes } from "./routes/notes";
import { podcastRoutes } from "./routes/podcast";
import { transcriberRoutes } from "./routes/transcriber";
import { mindmapRoutes } from "./routes/mindmap";
import { examRoutes } from "./routes/exam";
import { modelsRoutes } from "./routes/models";
import { websearchRoutes } from "./routes/websearch";
import { subjectGraphRoutes } from "./routes/subjectgraph";

export function registerRoutes(app: any) {
  modelsRoutes(app);
  subjectRoutes(app);
  chatRoutes(app);
  quizRoutes(app);
  podcastRoutes(app);
  flashcardRoutes(app);
  smartnotesRoutes(app);
  transcriberRoutes(app);
  mindmapRoutes(app);
  examRoutes(app);
  websearchRoutes(app);
  subjectGraphRoutes(app);
}

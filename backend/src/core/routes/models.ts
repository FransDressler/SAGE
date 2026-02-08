import { getAvailableProviders } from "../../utils/llm/models";
import { config } from "../../config/env";

export function modelsRoutes(app: any) {
  app.get("/models", (_req: any, res: any) => {
    const providers = getAvailableProviders();
    res.send({ ok: true, providers, defaultProvider: config.provider });
  });
}

import fs from "fs"
import path from "path"
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage } from "@langchain/core/messages"
import { config } from "../../config/env"
import type { MathpixImage } from "../parser/mathpix"

const CONCURRENCY = 5
const MODEL = "gpt-4.1-mini"

const PROMPT =
  "What is this diagram or image depicting? State only what it is for and what it shows, in 1-2 sentences. " +
  "Be specific about the subject matter (e.g. 'Energy level diagram for beta-minus decay showing...'). " +
  "Do not describe visual styling or layout."

function mimeFromExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".gif") return "image/gif"
  if (ext === ".webp") return "image/webp"
  return "image/jpeg"
}

async function describeOne(
  model: ChatOpenAI,
  imagePath: string,
  filename: string
): Promise<string | null> {
  try {
    const stat = fs.statSync(imagePath)
    if (stat.size > 5 * 1024 * 1024) return null
    const data = fs.readFileSync(imagePath)
    const b64 = data.toString("base64")
    const mime = mimeFromExt(filename)

    const msg = new HumanMessage({
      content: [
        { type: "text", text: PROMPT },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ],
    })

    const res = await model.invoke([msg])
    const text = typeof res.content === "string" ? res.content : ""
    return text.trim() || null
  } catch (err: any) {
    console.warn(`[describeImages] Failed for ${filename}:`, err?.message)
    return null
  }
}

/**
 * Use a cheap vision model to generate alt-text descriptions for extracted images.
 * Returns a Map of filename → description. Skips silently if no OpenAI key is configured.
 */
export async function describeImages(
  images: MathpixImage[],
  imagesDir: string
): Promise<Map<string, string>> {
  const descriptions = new Map<string, string>()

  const apiKey = config.openai || config.openai_embed
  if (!apiKey) {
    console.log("[describeImages] No OpenAI API key configured, skipping image descriptions")
    return descriptions
  }

  if (!images.length) return descriptions

  const model = new ChatOpenAI({
    modelName: MODEL,
    openAIApiKey: apiKey,
    maxTokens: 150,
    temperature: 0.3,
  })

  console.log(`[describeImages] Describing ${images.length} images with ${MODEL}...`)

  // Process in batches of CONCURRENCY
  for (let i = 0; i < images.length; i += CONCURRENCY) {
    const batch = images.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(img => {
        const imgPath = path.join(imagesDir, img.filename)
        return describeOne(model, imgPath, img.filename)
      })
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      if (result.status === "fulfilled" && result.value) {
        descriptions.set(batch[j].filename, result.value)
      }
    }
  }

  console.log(`[describeImages] Generated ${descriptions.size}/${images.length} descriptions`)
  return descriptions
}

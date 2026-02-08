import { randomUUID } from "crypto";
import db from "../database/keyv";

export type ChatMeta = { id: string; title: string; at: number };
export type ChatMsg = { role: "user" | "assistant"; content: any; at: number; sources?: Array<{ sourceFile: string; sourceId?: string; pageNumber?: number; heading?: string }> };

export async function mkChat(subjectId: string, t: string) {
  const id = randomUUID();
  const c: ChatMeta = { id, title: t.slice(0, 60), at: Date.now() };
  await db.set(`subject:${subjectId}:chat:${id}`, c);
  await db.set(`subject:${subjectId}:msgs:${id}`, [] as ChatMsg[]);
  const idx = ((await db.get(`subject:${subjectId}:chat:index`)) as string[]) || [];
  idx.unshift(id);
  await db.set(`subject:${subjectId}:chat:index`, idx.slice(0, 1000));
  return c;
}

export async function getChat(subjectId: string, id: string) {
  const a = await db.get(`subject:${subjectId}:chat:${id}`);
  return a;
}

export async function addMsg(subjectId: string, id: string, m: ChatMsg) {
  const a = ((await db.get(`subject:${subjectId}:msgs:${id}`)) as ChatMsg[]) || [];
  a.push(m);
  await db.set(`subject:${subjectId}:msgs:${id}`, a);
  const c = (await db.get(`subject:${subjectId}:chat:${id}`)) as ChatMeta;
  if (c) {
    c.at = Date.now();
    await db.set(`subject:${subjectId}:chat:${id}`, c);
  }
}

export async function listChats(subjectId: string, n = 50) {
  const idx = ((await db.get(`subject:${subjectId}:chat:index`)) as string[]) || [];
  const out: ChatMeta[] = [];
  for (const id of idx.slice(0, n)) {
    const c = (await db.get(`subject:${subjectId}:chat:${id}`)) as ChatMeta | undefined;
    if (c) out.push(c);
  }
  return out.sort((x, y) => y.at - x.at);
}

export async function getMsgs(subjectId: string, id: string) {
  const a = ((await db.get(`subject:${subjectId}:msgs:${id}`)) as ChatMsg[]) || [];
  return a;
}

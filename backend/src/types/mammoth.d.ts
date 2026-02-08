declare module "mammoth" {
  interface MammothResult {
    value: string
    messages: any[]
  }
  interface MammothInput {
    buffer?: Buffer | ArrayBuffer
    path?: string
  }
  function extractRawText(input: MammothInput): Promise<MammothResult>
  function convertToMarkdown(input: MammothInput): Promise<MammothResult>
  function convertToHtml(input: MammothInput): Promise<MammothResult>
  export { extractRawText, convertToMarkdown, convertToHtml }
  export default { extractRawText, convertToMarkdown, convertToHtml }
}

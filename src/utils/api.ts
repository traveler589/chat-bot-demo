import OpenAI from "openai";

// 记录上下文
const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

// 实例
let openai;

/**
 * 检查apikey是否正确
 * @returns
 */
export const checkKey = (apiKey) => {
  openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    // 允许浏览器访问
    dangerouslyAllowBrowser: true,
  });

  return openai.chat.completions.create({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [{ role: "user", content: "Hi" }],
  });
};

// 聊天请求
export async function getAnswer(
  content: string,
  onStream: (raw: string, stream?) => void
) {
  let raw = "";

  onStream(raw);

  messages.push({ role: "user", content });

  const stream = await openai.chat.completions.create({
    model: "mistralai/mistral-7b-instruct:free",
    messages,
    stream: true,
  });

  onStream(raw, stream);

  // 角色
  let role;

  for await (const chunk of stream) {
    raw += chunk.choices[0]?.delta?.content || "";

    role = chunk.choices[0]?.delta.role;

    onStream(raw, stream);
  }

  messages.push({ role, content: raw });
}

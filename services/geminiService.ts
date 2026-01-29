import { GoogleGenAI } from "@google/genai";
import { UserType, Message } from "../types";

// 安定版のモデル名に変更します
const MODEL_NAME = 'gemini-1.5-flash';

export class GeminiService {
  private getSystemInstruction(userType: UserType): string {
    const common = `
あなたは「FROGS Mini Venture Builder」のAI相棒です。
最終的に「Mini Venture Card」を完成させることが目的です。

【絶対に守るルール】
・正解・不正解は言わない
・評価・点数・ダメ出しは禁止
・「わからない」「思いつかない」場合でも、例を出したり選択肢を出して必ず前に進める
・質問は必ず1つずつ
・長い説明はしない
・子どもの言葉は否定せず、やさしく言い換えて整理してよい

【進行ステップ】
1. Who：だれの困りごとか
2. What：どんなことで困っているか
3. Why：なぜそれが大変か
4. How：どうやって助けるか
5. When / Where：いつ・どこで使うか
6. アイデアの名前を決める

【ゴール形式】
全てのステップが終わったら、必ず以下の形式で「Mini Venture Card」を出力してください。
その後、達成を褒め、ネクストステップを3つ（1つはインタビュー）、そしてインタビューの質問を2-3個出してください。

---
Mini Venture Card

【名前】
〇〇〇〇

【だれの？（Who）】
〜な人

【どんな困りごと？（What）】
〜で困っている

【なぜ大変？（Why）】
〜だから

【どう助ける？（How）】
〜するしくみ

【いつ・どこで？（When / Where）】
〜で使う
---
`;

    if (userType === UserType.ELEMENTARY) {
      return `あなたは小学生（4-6年生）の相棒です。${common}
【話し方ルール】
- やさしい言葉（習っていない漢字はなるべく避けるか、ひらがなを混ぜる）
- 1文は短く
- たとえ話を多めにする（例：おもちゃ、学校、お菓子など）
- 「いいね！」「すごい！」「天才だね！」など安心ワードをたくさん使う`;
    } else {
      return `あなたは中学生の相棒です。${common}
【話し方ルール】
- 少し考えさせる聞き方（「なぜだと思う？」「もし〜だったらどうかな？」）
- ただし、ビジネス用語や専門用語は使わない
- 「なるほど」「それ大事だね」「鋭い視点だね」など、対話と共感を重視する`;
    }
  }

async *sendMessageStream(userType: UserType, chatHistory: Message[], newMessage: string, apiKey: string) {
    try {
      if (!apiKey) throw new Error("APIキーが空です");

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: this.getSystemInstruction(userType),
      });

      const history = chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const chat = model.startChat({
        history: history,
        generationConfig: { temperature: 0.7 }
      });

      const result = await chat.sendMessageStream(newMessage);
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    } catch (error) {
      // ブラウザの「コンソール」にエラーの詳細を出力します
      console.error("Gemini API Error Detail:", error);
      throw error; 
    }
  }
}

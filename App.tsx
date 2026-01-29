import React, { useState, useRef, useEffect } from 'react';
import { UserType, Message, VentureCardData } from './types';
import { GeminiService } from './services/geminiService';
import Bubble from './components/Bubble';
import VentureCard from './components/VentureCard';
import { Send, Loader2, Sparkles, Home, ChevronRight, Key, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(UserType.NONE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCardFinished, setIsCardFinished] = useState(false);
  const [cardData, setCardData] = useState<VentureCardData | null>(null);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const geminiServiceRef = useRef<GeminiService>(new GeminiService());

  // 起動時に保存されているキーがあれば読み込む
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim().length > 10) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      setIsKeySaved(true);
    } else {
      alert("正しいAPIキーを入力してね！");
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleUserTypeSelect = async (type: UserType) => {
    setUserType(type);
    const initialPrompt = type === UserType.ELEMENTARY 
      ? "こんにちは！これから一緒に新しいアイデアを考えよう！まずは、誰か困っている人を見つけるところから始めるよ。準備はいいかな？"
      : "こんにちは！今日は君だけのビジネスアイデアを作っていこう。社会の課題を見つける第一歩として、まずは「誰の」役に立ちたいかから考えてみよう。準備はできてる？";
    
    setMessages([{ role: 'model', text: initialPrompt }]);
  };

  const parseCard = (text: string) => {
    const cardMatch = text.match(/---[\s\S]*?Mini Venture Card[\s\S]*?---/);
    if (!cardMatch) return null;

    const content = cardMatch[0];
    const name = content.match(/【名前】\n(.*?)\n/)?.[1] || "";
    const who = content.match(/【だれの？（Who）】\n(.*?)\n/)?.[1] || "";
    const what = content.match(/【どんな困りごと？（What）】\n(.*?)\n/)?.[1] || "";
    const why = content.match(/【なぜ大変？（Why）】\n(.*?)\n/)?.[1] || "";
    const how = content.match(/【どう助ける？（How）】\n(.*?)\n/)?.[1] || "";
    const whenWhere = content.match(/【いつ・どこで？（When \/ Where）】\n(.*?)\n/)?.[1] || "";

    const afterCard = text.split('---').pop() || "";
    const steps = afterCard.match(/\d\.\s?(.*)/g)?.map(s => s.replace(/^\d\.\s?/, '')) || [];
    const questions = afterCard.match(/「(.*?)」/g)?.map(q => q.replace(/[「」]/g, '')) || [];

    return {
      card: { name, who, what, why, how, whenWhere },
      steps: steps.slice(0, 3),
      questions: questions.slice(0, 3)
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let fullResponse = '';
      // 修正: geminiServiceにAPIキーを渡すように変更
      const stream = geminiServiceRef.current.sendMessageStream(userType, messages, userMessage, apiKey);
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
          return newMessages;
        });
      }

      const parsed = parseCard(fullResponse);
      if (parsed) {
        setCardData(parsed.card);
        setNextSteps(parsed.steps);
        setInterviewQuestions(parsed.questions);
        setIsCardFinished(true);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "ごめんね、エラーが起きちゃった。APIキーが正しいか確認してみてね。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // APIキーが保存されていない場合の入力画面
  if (!isKeySaved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border-4 border-white text-center">
          <div className="bg-amber-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
             <Key className="text-white w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">準備をしよう！</h2>
          <p className="text-gray-600 mb-6 leading-relaxed text-sm">
            このアプリを動かすには、Google AI Studio で取得した「APIキー」が必要だよ。
          </p>
          
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI Studio の APIキーを貼り付けてね"
            className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-500 outline-none mb-4 text-center"
          />

          <button
            onClick={handleSaveKey}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95 mb-6"
          >
            このキーでスタート！
          </button>

          <div className="space-y-2">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-amber-600 hover:underline">
              APIキーを新しく作る <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 以下、UserType.NONE の初期画面とメインチャット画面は元のコードを維持
  if (userType === UserType.NONE) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border-4 border-white transform transition-all hover:scale-[1.01]">
          <div className="bg-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg rotate-3">
             <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">FROGS</h1>
          <p className="text-lg text-center text-green-700 font-semibold mb-8">Mini Venture Builder</p>
          
          <p className="text-gray-600 text-center mb-8">君は今、何年生かな？<br/>あてはまるほうを選んでね！</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleUserTypeSelect(UserType.ELEMENTARY)}
              className="flex items-center justify-between bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-2xl transition-all shadow-md active:scale-95 group"
            >
              <div className="text-left">
                <span className="text-sm opacity-80 block">たのしく、やさしく</span>
                <span className="text-xl">小学生</span>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleUserTypeSelect(UserType.MIDDLE_SCHOOL)}
              className="flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-8 rounded-2xl transition-all shadow-md active:scale-95 group"
            >
              <div className="text-left">
                <span className="text-sm opacity-80 block">じっくり、対話しよう</span>
                <span className="text-xl">中学生</span>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <button 
            onClick={() => { localStorage.removeItem('GEMINI_API_KEY'); window.location.reload(); }}
            className="mt-8 w-full text-xs text-gray-400 hover:text-gray-600 underline"
          >
            APIキーをやり直す
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <header className="bg-white border-b-2 border-green-100 py-3 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 text-white p-1 rounded-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-green-800 leading-none">Mini Venture Builder</h1>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
              {userType === UserType.ELEMENTARY ? 'Elementary Mode' : 'Middle School Mode'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => {
            if(confirm("最初に戻る？（考えた内容は消えちゃうよ）")) window.location.reload();
          }}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Home size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, idx) => (
            <Bubble key={idx} role={msg.role} text={msg.text} />
          ))}
          
          {isCardFinished && cardData && (
            <VentureCard 
              data={cardData} 
              nextSteps={nextSteps}
              interviewQuestions={interviewQuestions}
            />
          )}

          {isLoading && (
             <div className="flex justify-start mb-4">
               <div className="bg-white border-2 border-green-200 p-4 rounded-2xl rounded-tl-none">
                 <Loader2 className="animate-spin text-green-500" />
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {!isCardFinished && (
        <footer className="p-4 bg-white border-t-2 border-green-100 shrink-0">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ここに メッセージを かいてね..."
              className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-green-200 focus:border-green-500 focus:outline-none text-lg shadow-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 top-2 bottom-2 w-12 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !isLoading ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      )}

      {isCardFinished && (
        <footer className="p-4 bg-green-100 border-t-2 border-green-200 text-center text-green-800 font-bold shrink-0">
          🎉 おめでとう！カードが完成したよ！
        </footer>
      )}
    </div>
  );
};

export default App;
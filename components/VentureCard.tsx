
import React, { useRef, useState } from 'react';
import { VentureCardData } from '../types';
import { Download, CheckCircle, Lightbulb, Users, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface VentureCardProps {
  data: VentureCardData;
  nextSteps: string[];
  interviewQuestions: string[];
}

const VentureCard: React.FC<VentureCardProps> = ({ data, nextSteps, interviewQuestions }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Matches original size at scale 2
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MiniVentureCard_${data.name || 'idea'}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDFのダウンロードに失敗しました。もう一度試してみてね！');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          <span>PDFでダウンロードする</span>
        </button>
      </div>

      <div 
        ref={cardRef}
        className="bg-white border-4 border-green-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden max-w-2xl mx-auto"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-6 border-b-2 border-green-100 pb-4">
          <h2 className="text-3xl font-bold text-green-700">Mini Venture Card</h2>
          <div className="bg-green-600 text-white p-2 rounded-full">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-xs font-bold text-green-500 uppercase tracking-wider">アイデアの名前</label>
            <div className="text-2xl font-bold text-gray-800 mt-1">{data.name}</div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-green-50 p-4 rounded-xl border border-green-100">
              <label className="text-xs font-bold text-green-600 uppercase tracking-wider">だれの？ (Who)</label>
              <p className="text-gray-700 mt-1 font-medium">{data.who}</p>
            </section>
            
            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">困りごと (What)</label>
              <p className="text-gray-700 mt-1 font-medium">{data.what}</p>
            </section>
          </div>

          <section className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <label className="text-xs font-bold text-amber-600 uppercase tracking-wider">なぜ大変？ (Why)</label>
            <p className="text-gray-700 mt-1 font-medium">{data.why}</p>
          </section>

          <section className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <label className="text-xs font-bold text-purple-600 uppercase tracking-wider">どう助ける？ (How)</label>
            <p className="text-gray-700 mt-1 font-medium">{data.how}</p>
          </section>

          <section className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <label className="text-xs font-bold text-rose-600 uppercase tracking-wider">いつ・どこで？ (When / Where)</label>
            <p className="text-gray-700 mt-1 font-medium">{data.whenWhere}</p>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <Lightbulb size={24} />
            <h3 className="text-xl font-bold">次のステップ</h3>
          </div>
          <ul className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-gray-700">
                <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <Users size={24} />
            <h3 className="text-xl font-bold">インタビューで聞いてみよう</h3>
          </div>
          <div className="space-y-4">
            {interviewQuestions.map((q, i) => (
              <div key={i} className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-gray-700 italic">
                「{q}」
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentureCard;

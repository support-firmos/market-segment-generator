// components/ResearchResult.tsx
export default function ResearchResult({ content, onReset }: { content: string, onReset: () => void }) {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-[#f7f8f8]">Market Research</h2>
          <button 
            onClick={onReset}
            className="bg-[#1A1A1A] text-[#f7f8f8] px-4 py-2 rounded-lg"
          >
            New Research
          </button>
        </div>
        
        <div className="bg-[#141414] p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-[#f7f8f8]">{content}</pre>
        </div>
      </div>
    );
  }
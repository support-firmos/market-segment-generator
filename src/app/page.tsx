// src/app/page.tsx
'use client';

import { useState } from 'react';
import ResearchForm from '@/components/ResearchForm';
import ResearchResult from '@/components/ResearchResult';

interface FormData {
  industry: string;
}

export default function Home() {
  const [generatedResearch, setGeneratedResearch] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateResearch = async (formData: FormData) => {
    setError(null);
    setIsGenerating(true);
    setGeneratedResearch('');
    setProgressStatus('Identifying target segments...');

    try {
      // First prompt: Get initial target segments
      const initialResponse = await fetch('/api/generate-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: formData.industry }),
      });

      if (!initialResponse.ok) {
        throw new Error(`Failed to generate initial segments: ${initialResponse.status}`);
      }

      const initialData = await initialResponse.json();
      
      if (!initialData.result) {
        throw new Error('No result returned from segment generation');
      }
      
      const initialSegments = initialData.result;
      
      // Display interim results
      setGeneratedResearch(initialSegments);
      setProgressStatus('Enhancing segment documentation...');

      // We'll try the second API call, but if it fails, we'll still have the initial results
      try {
        // Second prompt: Get enhanced documentation for each segment
        const enhancedResponse = await fetch('/api/enhance-segments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            industry: formData.industry,
            segments: initialSegments 
          }),
        });

        if (!enhancedResponse.ok) {
          throw new Error(`Failed to enhance segments: ${enhancedResponse.status}`);
        }

        const enhancedData = await enhancedResponse.json();
        
        if (enhancedData.result) {
          setGeneratedResearch(enhancedData.result);
        } else {
          // Keep the initial results if enhancement fails
          setError('Could not enhance the segments, but showing initial results.');
        }
      } catch (enhanceError) {
        console.error('Error enhancing segments:', enhanceError);
        setError('Could not enhance the segments further, but initial results are available.');
        // We keep the initial results
      }
      
    } catch (error) {
      console.error('Error generating research:', error);
      setError('An error occurred while generating the market research. Please try again.');
      setGeneratedResearch(null);
    } finally {
      setIsGenerating(false);
      setProgressStatus('');
    }
  };

  const resetGenerator = () => {
    setGeneratedResearch(null);
    setError(null);
  };

  return (
    <div className="py-10 px-4 container mx-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#f7f8f8]">Market Segment Research</h1>
          <p className="text-[#8a8f98]">
            Find ideal Market Research segments for Fractional CFO services
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700/30 text-red-300 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        <div className="card">
          {generatedResearch ? (
            <ResearchResult content={generatedResearch} onReset={resetGenerator} />
          ) : (
            <ResearchForm onSubmit={generateResearch} />
          )}
        </div>
        
        {isGenerating && (
          <div className="text-center mt-4">
            <p className="text-[#8a8f98]">
              {progressStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
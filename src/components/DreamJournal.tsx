import React, { useState } from 'react';
import { Moon, Sparkles, Heart } from 'lucide-react';
import { interpretDream } from '../utils/dreamInterpreter';

const DreamJournal = () => {
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dreamInterpretation = interpretDream(dream);
    setInterpretation(dreamInterpretation);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-indigo-50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="dream"
              className="block text-lg font-serif text-indigo-900 mb-2"
            >
              What did you dream about?
            </label>
            <textarea
              id="dream"
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              className="w-full h-40 p-4 rounded-xl bg-white border border-indigo-100 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              placeholder="Describe your dream in detail..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Interpret Dream
          </button>
        </form>

        {interpretation && (
          <div className="mt-8 space-y-6">
            <div className="p-6 bg-white rounded-xl border border-indigo-100">
              <h3 className="text-xl font-serif text-indigo-900 mb-4 flex items-center gap-2">
                <Moon className="text-indigo-700" />
                Dream Interpretation
              </h3>
              <p className="text-indigo-800 leading-relaxed">{interpretation}</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-indigo-100">
              <h3 className="text-xl font-serif text-indigo-900 mb-4 flex items-center gap-2">
                <Heart className="text-rose-500" />
                Self-Care Recommendations
              </h3>
              <ul className="space-y-3 text-indigo-800">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  Take time for meditation and reflection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  Journal about the emotions this dream brought up
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  Practice mindful breathing before bed
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamJournal;
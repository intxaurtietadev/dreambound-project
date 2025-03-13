import React from 'react';
import { Moon, Sun, Sparkles, BookHeart } from 'lucide-react';
import DreamJournal from './components/DreamJournal';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif text-indigo-900 mb-4 flex items-center justify-center gap-3">
            <Moon className="text-indigo-700" />
            Dreamscape Journal
            <Sparkles className="text-indigo-700" />
          </h1>
          <p className="text-lg text-indigo-700 max-w-2xl mx-auto">
            Explore your inner world through dream journaling. Understanding your dreams
            is a gateway to deeper self-awareness and personal growth.
          </p>
        </header>
        <DreamJournal />
      </main>
    </div>
  );
}

export default App;
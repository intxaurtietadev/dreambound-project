import React from 'react';
import { Moon, Sun, BookHeart, User } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Moon className="text-indigo-700" />
            <span className="font-serif text-xl text-indigo-900">Dreamscape</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="nav-button">
              <BookHeart className="w-5 h-5" />
              <span>Journal</span>
            </button>
            <button className="nav-button">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
import React, { useState } from 'react';
import { Lock, Unlock, X } from 'lucide-react';

export function PasswordProtectedPlayer({ children, setIsLockedPlayer, correctPassword }) {
  const [isLocked, setIsLocked] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsLocked(false);
      setShowInput(false);
      setError('');
      setIsLockedPlayer(false);
    } else {
      setError('Incorrect password');
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setPassword('');
    setError('');
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full max-w-3xl shadow shadow-neutral-600 border border-neutral-700 mx-auto aspect-video bg-black rounded-lg overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop)', 'blur': '20px', "opacity": "0.3"
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="group relative inline-flex items-center gap-2 px-8 py-4  hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105" style={{ "backgroundColor": "rgb(255 255 255 / 0.1)"}}
          >
            <Lock className="w-5 h-5" />
            <span className="text-lg font-medium">Unlock Player</span>
            <div className="absolute inset-0 border border-white/30 rounded-lg group-hover:border-white/50 transition-colors" />
          </button>
        ) : (
          <div className="bg-black/70 p-8 rounded-xl backdrop-blur-md w-80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Enter Password</h3>
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 text-black bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleUnlock}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Unlock className="w-4 h-4" />
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const location = useLocation();

  // Function to derive title from path
  const getTitle = (path) => {
    if (path === '/') return 'Dashboard';
    const name = path.replace('/', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="bg-[#121214] p-4 flex items-center gap-4 md:hidden border-b border-zinc-800 sticky top-0 z-40">
      <button
        onClick={onMenuClick}
        className="text-zinc-400 hover:text-white"
      >
        <HiOutlineMenuAlt2 size={24} />
      </button>
      <h1 className="text-lg font-bold text-white">{getTitle(location.pathname)}</h1>
    </header>
  );
};

export default Header;
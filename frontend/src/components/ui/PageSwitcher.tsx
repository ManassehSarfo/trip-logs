import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PageSwitcherProps {
  options?: { label: string; path: string }[];
  defaultSelected?: string;
}

const PageSwitcher: React.FC<PageSwitcherProps> = ({
  options = [
    { label: 'Home', path: '/' },
    { label: 'Trip Info', path: '/trip' },
    { label: 'Logsheet', path: '/logs' },
  ],
  defaultSelected,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine selected based on current path
  const initialSelected =
    options.find((opt) => opt.path === location.pathname)?.label ||
    defaultSelected ||
    options[0].label;
  const [selected, setSelected] = useState<string>(initialSelected);

  useEffect(() => {
    setSelected(
      options.find((opt) => opt.path === location.pathname)?.label ||
        defaultSelected ||
        options[0].label
    );
  }, [location.pathname, options, defaultSelected]);

  const select = (option: { label: string; path: string }) => {
    setSelected(option.label);
    navigate(option.path);
  };

  return (
    <div className="flex items-center p-1 rounded-2xl bg-gray-100 w-max shadow-inner">
      {options.map((option) => (
        <button
          key={option.label}
          onClick={() => select(option)}
          className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
            selected === option.label
              ? 'bg-white text-gray-800 shadow'
              : 'bg-transparent text-blue-500'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default PageSwitcher;

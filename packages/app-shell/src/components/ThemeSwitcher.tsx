'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Laptop, Moon, Sun } from 'lucide-react';

const ICON_SIZE = 16;

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="appearance-none bg-transparent px-2 py-1 text-sm cursor-pointer"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2">
        {theme === 'light' ? (
          <Sun size={ICON_SIZE} className="text-muted-foreground" />
        ) : theme === 'dark' ? (
          <Moon size={ICON_SIZE} className="text-muted-foreground" />
        ) : (
          <Laptop size={ICON_SIZE} className="text-muted-foreground" />
        )}
      </span>
    </div>
  );
}

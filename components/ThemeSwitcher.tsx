'use client';

import React, { useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = localStorage.getItem(
      'magen-theme'
    ) as Theme | null;

    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  function applyTheme(value: Theme) {
    const root = document.documentElement;

    if (value === 'dark') {
      root.classList.add('dark');
      return;
    }

    if (value === 'light') {
      root.classList.remove('dark');
      return;
    }

    const dark =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

    root.classList.toggle('dark', dark);
  }

  function changeTheme(value: Theme) {
    setTheme(value);

    localStorage.setItem(
      'magen-theme',
      value
    );

    applyTheme(value);
  }

  const Icon =
    theme === 'dark'
      ? Moon
      : theme === 'light'
        ? Sun
        : Monitor;

  return (
    <div className="relative group">

      <button
        type="button"
        aria-label="Change theme"
        className="
          flex h-10 w-10
          items-center justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-600
          transition
          hover:bg-slate-100

          dark:border-slate-800
          dark:bg-slate-900
          dark:text-slate-300
          dark:hover:bg-slate-800
        "
      >
        <Icon className="h-[18px] w-[18px]" />
      </button>

      <div
        className="
          invisible
          absolute
          right-0
          top-full
          z-50
          mt-2
          w-40
          translate-y-1
          rounded-xl
          border
          border-slate-200
          bg-white
          p-1.5
          opacity-0
          shadow-xl
          transition-all
          group-hover:visible
          group-hover:translate-y-0
          group-hover:opacity-100

          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <ThemeOption
          icon={<Sun />}
          label="Light"
          active={theme === 'light'}
          onClick={() => changeTheme('light')}
        />

        <ThemeOption
          icon={<Moon />}
          label="Dark"
          active={theme === 'dark'}
          onClick={() => changeTheme('dark')}
        />

        <ThemeOption
          icon={<Monitor />}
          label="System"
          active={theme === 'system'}
          onClick={() => changeTheme('system')}
        />
      </div>
    </div>
  );
}

function ThemeOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-2.5
        rounded-lg
        px-3
        py-2.5
        text-xs
        font-medium
        transition

        ${
          active
            ? `
              bg-slate-100
              text-slate-900

              dark:bg-slate-800
              dark:text-white
            `
            : `
              text-slate-600
              hover:bg-slate-50

              dark:text-slate-400
              dark:hover:bg-slate-800/70
            `
        }
      `}
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      {label}

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 ">
      <input
        type="text"
        placeholder="Search for games like The Legend of Zelda , Mario ..."
        value={query}
        onChange={handleChange}
        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm text-gray-800 bg-white placeholder-gray-500"
      />
    </div>
  );
}
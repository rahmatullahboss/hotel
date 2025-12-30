"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMagnifyingGlass, HiOutlineXMark, HiOutlineClock } from "react-icons/hi2";

interface SearchResult {
  type: "hotel" | "city" | "recent";
  id: string;
  title: string;
  subtitle?: string;
}

const RECENT_SEARCHES_KEY = "zinurooms-recent-searches";
const MAX_RECENT = 5;

// Popular cities for quick access
const popularCities = [
  { id: "dhaka", title: "ঢাকা", subtitle: "জনপ্রিয়" },
  { id: "chittagong", title: "চট্টগ্রাম", subtitle: "সমুদ্র উপকূল" },
  { id: "sylhet", title: "সিলেট", subtitle: "চা বাগান" },
  { id: "coxs-bazar", title: "কক্সবাজার", subtitle: "সমুদ্র সৈকত" },
];

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as Element).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const newRecent: SearchResult = {
      type: "recent",
      id: Date.now().toString(),
      title: searchQuery,
    };

    const updated = [newRecent, ...recentSearches.filter(r => r.title !== searchQuery)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

    // Navigate to search results
    router.push(`/hotels?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleSelectCity = (city: typeof popularCities[0]) => {
    router.push(`/hotels?city=${city.id}`);
    setIsOpen(false);
    setQuery("");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="হোটেল বা শহর খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <HiOutlineXMark className="w-4 h-4" />
          </button>
        )}
        <kbd className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded">
          /
        </kbd>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  সাম্প্রতিক সার্চ
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  মুছুন
                </button>
              </div>
              {recentSearches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearch(item.title)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <HiOutlineClock className="w-4 h-4 text-gray-400" />
                  {item.title}
                </button>
              ))}
            </div>
          )}

          {/* Popular Cities */}
          {!query && (
            <div className="p-3">
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                জনপ্রিয় গন্তব্য
              </span>
              <div className="grid grid-cols-2 gap-2">
                {popularCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className="flex flex-col items-start p-3 text-left bg-gray-50 hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-900">{city.title}</span>
                    <span className="text-xs text-gray-500">{city.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          {query && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => handleSearch(query)}
                className="w-full px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                &quot;{query}&quot; খুঁজুন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

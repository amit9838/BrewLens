import { useState, useDeferredValue, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Moon, Sun, Terminal, X, MenuIcon } from 'lucide-react';

import './App.css'
import { useBrewData } from './hooks/useBrewData';
import { usePagination } from './hooks/usePagination';
import { ItemCard } from './components/ItemCard';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { Footer } from './components/layout/Footer';
import { NavDrawer } from './components/layout/Drawer';
import { type BrewType, type BrewItem } from './types';
import { cn } from './lib/utils';


const queryClient = new QueryClient();

function HomebrewExplorer() {
  // State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [type, setType] = useState<BrewType>('cask');
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [modalItem, setModalItem] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Queries & Derived State
  const { data = [], isLoading, error } = useBrewData(type);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    if (!deferredSearch) return data;
    return data.filter(i => i._searchString.includes(deferredSearch.toLowerCase()));
  }, [data, deferredSearch]);

  const { currentData, currentPage, setCurrentPage, totalPages } = usePagination(filtered, itemsPerPage);

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-gray-100 p-4 sm:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        <NavDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} onShowInstallGuide={() => setIsOpen(true)} />

        {/* HEADER */}
        <header className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setIsOpen(true)} >
              <MenuIcon size={20} />
            </Button>
            <div className="bg-green-600 text-white p-2 rounded-lg"><Terminal size={24} /></div>
            <h1 className="text-2xl font-bold">Brew<span className="font-light opacity-70">Lens</span></h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder={`Search ${type}s...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="ghost" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="shrink-0">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex">
            {(['cask', 'formula'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setSearch(''); }}
                className={cn("px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                  type === t ? "bg-white dark:bg-gray-600 shadow text-green-600 dark:text-green-400" : "text-gray-500"
                )}
              >
                {t}s
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Items per page:</span>
              <select
                className="bg-transparent font-medium cursor-pointer outline-none"
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
              >
                {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* GRID */}
        {isLoading ? (
          <div className="py-20 text-center animate-pulse">Loading data...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">Failed to load data.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentData.map(item => (
                <ItemCard key={item.id} item={item} onViewJson={setModalItem} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 pt-8">
                <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
                <span className="py-2 text-sm font-mono text-gray-500">Page {currentPage} of {totalPages}</span>
                <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
              </div>
            )}

            {/* Footer */}
            <Footer />
          </>
        )}

        {/* JSON MODAL */}
        <Modal isOpen={!!modalItem} onClose={() => setModalItem(null)}>
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="font-bold">Raw JSON</h3>
            <button onClick={() => setModalItem(null)}><X size={20} /></button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-black overflow-auto max-h-[60vh]">
            <pre className="text-xs font-mono text-gray-600 dark:text-gray-400">{JSON.stringify(modalItem, null, 2)}</pre>
          </div>
        </Modal>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomebrewExplorer />
    </QueryClientProvider>
  );
}
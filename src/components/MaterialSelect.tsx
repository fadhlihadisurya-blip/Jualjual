import React, { useState, useRef, useEffect } from 'react';
import { Material } from '../types';
import { formatRupiah } from '../utils/calculator';
import { ChevronDown, Plus, Search, Check } from 'lucide-react';

interface MaterialSelectProps {
  value: string; // materialId
  onChange: (materialId: string) => void;
  materials: Material[];
  onAddNewMaterial?: (name: string) => void;
  placeholder?: string;
}

export const MaterialSelect: React.FC<MaterialSelectProps> = ({
  value,
  onChange,
  materials,
  onAddNewMaterial,
  placeholder = 'Pilih atau ketik bahan baku...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMaterial = materials.find((m) => m.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCleanName = (name: string) => name.replace(/\s*\([^)]*\)/g, '').trim();

  const getUnitCost = (m: Material) =>
    m.initialQuantity > 0 ? m.purchasePrice / m.initialQuantity : m.unitCost || 0;

  const filteredMaterials = materials.filter((m) => {
    const clean = getCleanName(m.name).toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return clean.includes(query) || m.unit.toLowerCase().includes(query);
  });

  const exactMatchExists = materials.some(
    (m) => getCleanName(m.name).toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const handleSelect = (matId: string) => {
    onChange(matId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    if (onAddNewMaterial) {
      onAddNewMaterial(trimmed);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      {/* Selected Box / Search Input */}
      <div
        className="flex items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik nama bahan baku..."
              className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredMaterials.length > 0) {
                    handleSelect(filteredMaterials[0].id);
                  } else if (onAddNewMaterial && searchTerm.trim()) {
                    handleCreateNew();
                  }
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
            />
          ) : (
            <span className="truncate font-medium text-slate-800">
              {selectedMaterial ? (
                <>
                  {getCleanName(selectedMaterial.name)}{' '}
                  <span className="text-slate-500 font-normal">
                    ({formatRupiah(getUnitCost(selectedMaterial))} / {selectedMaterial.unit})
                  </span>
                </>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </span>
          )}
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95">
          {filteredMaterials.length === 0 ? (
            <div className="p-2 text-center text-xs text-slate-500">
              Tidak ada bahan &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredMaterials.map((m) => {
                const isSelected = m.id === value;
                const clean = getCleanName(m.name);
                const cost = getUnitCost(m);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelect(m.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {clean}{' '}
                      <span className="text-slate-500 font-normal">
                        ({formatRupiah(cost)} / {m.unit})
                      </span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Option to Add New Material directly from typed text */}
          {searchTerm.trim().length > 0 && !exactMatchExists && onAddNewMaterial && (
            <div className="mt-1 border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Bahan Baru: &ldquo;{searchTerm.trim()}&rdquo;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

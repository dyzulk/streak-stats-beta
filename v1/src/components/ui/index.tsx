import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Card Component - Vercel Style
 */
export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "bg-black border border-zinc-800 rounded-lg shadow-sm shadow-black",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Button Component - Vercel Style
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border-transparent",
    secondary: "bg-transparent text-zinc-100 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md border transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Custom Searchable Select - Vercel Style
 */
import { Check, ChevronDown, Search } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function Select({ options, value, onChange, placeholder = "Select...", className, label }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && <label className="text-[10px] font-bold text-zinc-500 ml-0.5 uppercase tracking-[0.15em]">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 flex items-center justify-between hover:border-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <span className={cn(!selectedOption && "text-zinc-500")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={14} className={cn("text-zinc-500 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-black border border-zinc-800 rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-zinc-800 flex items-center gap-2">
              <Search size={14} className="text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent border-none text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-xs rounded-sm flex items-center justify-between transition-colors mb-0.5 last:mb-0",
                      opt.value === value ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                    )}
                  >
                    {opt.label}
                    {opt.value === value && <Check size={12} className="text-indigo-500" />}
                  </button>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-xs text-zinc-600">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Input Component - Vercel Style
 */
export function Input({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] font-bold text-zinc-500 ml-0.5 uppercase tracking-[0.15em]">{label}</label>}
      <input
        className={cn(
          "w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 hover:border-zinc-700 transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

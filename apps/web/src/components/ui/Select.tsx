import { SelectHTMLAttributes, forwardRef } from 'react';

const selectBase =
  'w-full rounded-xl border bg-app-bg/50 px-4 py-3 text-app-primary transition border-[var(--border)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-app-gold/20 focus:outline-none min-h-[44px] appearance-none bg-no-repeat bg-[length:1rem] bg-[right_0.75rem_center] pr-10';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(function Select({ className = '', error, children, ...props }, ref) {
  return (
    <div className="w-full relative">
      <select
        ref={ref}
        className={`${selectBase} ${error ? 'border-app-danger/50' : ''} ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-app-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

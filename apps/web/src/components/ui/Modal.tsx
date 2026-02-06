import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--overlay)] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full sm:max-w-lg sm:max-h-[90vh] h-full max-h-[95vh] sm:h-auto sm:rounded-xl bg-app-surface-2 border border-[var(--border)] shadow-modal flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] bg-app-surface-2 shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-app-primary truncate pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-app-secondary hover:bg-white/10 hover:text-app-primary focus-visible:ring-2 focus-visible:ring-app-gold/50"
            aria-label={t('common.close')}
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>
        {footer != null && (
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] bg-app-surface-2 px-4 sm:px-6 py-3 sm:py-4 safe-area-pb shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

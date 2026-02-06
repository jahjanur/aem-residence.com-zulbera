import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import logo from '../assets/KAKAKAK.svg';

const navKeys = [
  'dashboard',
  'suppliers',
  'products',
  'createOrder',
  'reconciliation',
  'controlPanel',
  'analytics',
] as const;
const navToPath: Record<(typeof navKeys)[number], string> = {
  dashboard: 'dashboard',
  suppliers: 'suppliers',
  products: 'products',
  createOrder: 'create-order',
  reconciliation: 'reconciliation',
  controlPanel: 'control-panel',
  analytics: 'analytics',
};

/** Bottom nav: primary 4 + More */
const bottomNavItems = [
  { key: 'dashboard' as const, path: 'dashboard', shortKey: 'dashboardShort' },
  { key: 'createOrder' as const, path: 'create-order', shortKey: 'createOrderShort' },
  { key: 'reconciliation' as const, path: 'reconciliation', shortKey: 'reconciliationShort' },
  { key: 'controlPanel' as const, path: 'control-panel', shortKey: 'controlPanelShort' },
];

/** More sheet: remaining links */
const moreSheetItems = [
  { key: 'suppliers' as const, path: 'suppliers' },
  { key: 'products' as const, path: 'products' },
  { key: 'analytics' as const, path: 'analytics' },
];

function IconDashboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
function IconOrder() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconReconciliation() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconControl() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const bottomNavIcons: Record<string, React.ReactNode> = {
  dashboard: <IconDashboard />,
  createOrder: <IconOrder />,
  reconciliation: <IconReconciliation />,
  controlPanel: <IconControl />,
  more: <IconMore />,
};

export default function AppLayout() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleLogout() {
    await api.post('/auth/logout');
    queryClient.clear();
    navigate('/login', { replace: true });
  }

  const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition min-h-[48px] ${
      isActive
        ? 'bg-app-gold-muted text-app-gold border border-app-gold/30'
        : 'text-app-secondary hover:text-app-primary hover:bg-white/5 border border-transparent'
    }`;

  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [moreOpen]);

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Sidebar: desktop only (lg+). Fixed so it does NOT take layout width on any breakpoint. */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 left-0 border-r border-[var(--border)] bg-app-surface-1 z-20">
        <div className="p-4 border-b border-[var(--border)] flex flex-col items-center gap-2">
          <img src={logo} alt="AEM Residence" className="h-20 w-auto object-contain" />
          <span className="text-app-secondary text-sm font-medium">{t('nav.operations')}</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          {navKeys.map((key) => (
            <NavLink key={key} to={navToPath[key]} className={sidebarLinkClass}>
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium min-h-[48px] bg-transparent border border-app-gold/40 text-app-gold hover:bg-app-gold-muted"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Content wrapper: full width on mobile (no sidebar width), offset on desktop only */}
      <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden lg:pl-56">
        {/* Mobile: minimal top bar (logo + title) */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-app-surface-1 safe-area-pt">
          <img src={logo} alt="" className="h-9 w-auto object-contain" />
          <span className="text-app-secondary text-sm font-medium">{t('nav.operations')}</span>
        </header>

        {/* Main content — full width, with bottom padding on mobile so content is not behind bottom nav */}
        <main className="flex-1 w-full page-container py-4 md:py-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile/Tablet: bottom navigation (hidden on lg+) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-app-surface-1 border-t border-[var(--border)] safe-area-pb"
          style={{ minHeight: 56, paddingTop: 12, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          aria-label="Mobile navigation"
        >
          {bottomNavItems.map(({ key, path, shortKey }) => (
            <NavLink
              key={key}
              to={`/app/${path}`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-lg transition ${
                  isActive ? 'text-app-gold' : 'text-app-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-app-gold' : 'text-app-secondary'}>{bottomNavIcons[key]}</span>
                  <span className="text-[10px] font-medium leading-tight">{t(`nav.${shortKey}`)}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-lg text-app-secondary"
          >
            <span>{bottomNavIcons.more}</span>
            <span className="text-[10px] font-medium leading-tight">{t('nav.more')}</span>
          </button>
        </nav>
      </div>

      {/* More sheet: overlay + panel */}
      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-app-overlay"
            onClick={() => setMoreOpen(false)}
            aria-hidden
          />
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-app-surface-2 border border-b-0 border-[var(--border)] shadow-modal safe-area-pb max-h-[85vh] flex flex-col"
            role="dialog"
            aria-label={t('nav.more')}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-lg font-semibold text-app-primary">{t('nav.more')}</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-app-secondary hover:bg-white/10 hover:text-app-primary"
                aria-label={t('common.close')}
              >
                <IconClose />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-0.5">
              {moreSheetItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={`/app/${navToPath[item.key]}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition min-h-[48px] ${
                      isActive
                        ? 'bg-app-gold-muted text-app-gold border border-app-gold/30'
                        : 'text-app-secondary hover:bg-white/5'
                    }`
                  }
                  onClick={() => setMoreOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium min-h-[48px] bg-transparent border border-app-danger/40 text-app-danger hover:bg-app-danger-muted"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
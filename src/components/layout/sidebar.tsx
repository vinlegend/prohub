'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid as LayoutGridIcon,
  FolderPlus as FolderPlusIcon,
  Users as UsersIcon,
  SquareStack,
  TriangleAlert,
  CircleDollarSign as CircleDollarSignIcon,
  Receipt,
  TrendingUp as TrendingUpIcon,
  Banknote as BanknoteIcon,
  Settings,
  ChevronDown as ChevronDownIcon,
  FileText as FileTextIcon,
  Users,
  FilePlus,
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar-context';
import { cn } from '@/lib/utils';

/* ───────────────── Routes (match /ops/* structure) ───────────────── */
const routes = {
  dashboard: '/ops/',
  cases: '/ops/cases/',
  'cases.case': '/ops/cases/case/',
  'cases.quotation': '/ops/cases/quotation/',
  customers: '/ops/customers/',
  items: '/ops/items/',
  incident: '/ops/incident/',
  finances: '/ops/finances/',
  'finances.taxes': '/ops/finances/taxes/',
  'finances.finance': '/ops/finances/finance/',
  'finances.bank': '/ops/finances/bank/',
  settings: '/ops/settings/',
  'settings.users': '/ops/settings/users/',
} as const;

/* ───────────────── Styles (expanded mode) ───────────────── */
const baseItem =
  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition';
const inactive = 'text-muted-foreground hover:bg-accent hover:text-foreground';
const activeLight = 'bg-primary/10 text-primary shadow hover:bg-primary/15';
const activeDark =
  'bg-primary text-primary-foreground rounded-md shadow hover:shadow-lg';

/* FIX: submenu full-width like parent; indent content only */
const subItem = 'pl-10 pr-3';

const activeStripe: React.CSSProperties = {
  boxShadow:
    '-4px 0 0px -1px color-mix(in oklab, var(--color-primary) 60%, transparent), 0 2px 2px 2px rgba(0,0,0,.06)',
};

/* Active helper: supports exact=true */
function isActive(pathname: string, href: string, exact = false) {
  const strip = (s: string) => s.replace(/\/+$/, '');
  const a = strip(pathname);
  const b = strip(href);
  if (exact) return a === b;
  return a === b || a.startsWith(b + '/');
}

type RailLevel = 0 | 1; 

function railPadding(level: RailLevel) {
  return level === 0 ? 'pl-[70%]' : 'pl-[78%]';
}

function railBg(active: boolean, open?: boolean) {
  if (active) {
    return 'bg-primary/10 text-primary ring-1 ring-primary/20 dark:bg-primary/20';
  }
  if (open) {
    return 'bg-accent/40 text-foreground'; 
  }
  return 'text-muted-foreground hover:bg-accent hover:text-foreground';
}

function CollapsedRailLink({
  href,
  title,
  active,
  icon,
  level = 0,
}: {
  href: string;
  title: string;
  active: boolean;
  icon: React.ReactNode;
  level?: RailLevel;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={cn(
        'relative flex h-10 w-full items-center rounded-md transition focus:outline-none focus:ring-0',
        railBg(active)
      )}
    >
      <span
        className={cn(
          'pointer-events-none -ml-5 inline-flex h-10 w-10 items-center justify-center',
          railPadding(level)
        )}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
      </span>
    </Link>
  );
}

function CollapsedParentRailButton({
  title,
  active,
  open,
  icon,
  level = 0,
  onToggle,
  controlsId,
}: {
  title: string;
  active: boolean; 
  open: boolean;   
  icon: React.ReactNode;
  level?: RailLevel;
  onToggle: () => void;
  controlsId: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-expanded={open}
      aria-controls={controlsId}
      className={cn(
        'relative flex h-10 w-full items-center rounded-md transition focus:outline-none focus:ring-0',
        railBg(active, open)
      )}
      onClick={onToggle}
    >
      <span
        className={cn(
          'pointer-events-none -ml-5 inline-flex h-10 w-10 items-center justify-center',
          railPadding(level)
        )}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
      </span>
      <ChevronDownIcon
        className={cn('absolute right-2 h-4 w-4 transition', open ? 'rotate-180' : '')}
      />
    </button>
  );
}

/* ───────────────── Sidebar content ───────────────── */
function SidebarContent({
  collapsed,
  themeIsDark,
  logoLightSrc,
  logoDarkSrc,
}: {
  collapsed: boolean;
  themeIsDark: boolean;
  logoLightSrc: string;
  logoDarkSrc: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState({
    cases: false,
    finances: false,
    settings: false,
  });

  // Auto-open groups if their parent path is active (non-exact),
  // so parent gets “open” highlight in collapsed when a child is active.
  React.useEffect(() => {
    setOpen(prev => ({
      ...prev,
      cases: isActive(pathname, routes.cases) ? true : prev.cases,
      finances: isActive(pathname, routes.finances) ? true : prev.finances,
      settings: isActive(pathname, routes.settings) ? true : prev.settings,
    }));
  }, [pathname]);

  const toggle = (k: keyof typeof open) =>
    setOpen(s => ({ ...s, [k]: !s[k] }));

  const activeCls = themeIsDark ? activeDark : activeLight;
  const stripeIfLight = (on: boolean): React.CSSProperties | undefined =>
    !themeIsDark && on ? activeStripe : undefined;

  const W = collapsed ? 80 : 300;
  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className={collapsed ? 'sr-only' : 'inline'}>{children}</span>
  );
  const itemTitle = (t: string) => (collapsed ? t : undefined);

  const groupBase = `${baseItem} w-full justify-between`;
  const groupIdle =
    'text-muted-foreground hover:bg-accent hover:text-foreground';
  const groupActiveParent =
    'bg-sidebar text-foreground ring-1 ring-border/30';

  const logoSrc = themeIsDark ? logoDarkSrc : logoLightSrc;

  return (
    <div
      className="lg:sticky lg:top-0 lg:self-start lg:max-h-dvh lg:overflow-y-auto"
      style={{ width: W }}
    >
      {/* Logo */}
      <div
        className={cn(
    'relative w-full overflow-hidden',
    'h-[96px] min-h-[96px]',
    collapsed ? 'px-2' : 'px-4',
    'flex items-center justify-center',
    'border-b border-border'
        )}
      >
        <Image
          src={logoSrc}
          alt="Logo"
          fill
          className="object-contain"
          sizes={`${collapsed ? 80 : 300}px`}
          priority={false}
        />
      </div>

      {/* NAV */}
      <nav
        aria-label="Sidebar"
        className={cn('mt-4 space-y-1 pb-6', collapsed ? 'px-0' : 'px-5')}
      >
        {/* Dashboard (exact only) */}
        {collapsed ? (
          <CollapsedRailLink
            href={routes.dashboard}
            title="Dashboard"
            active={isActive(pathname, routes.dashboard, true)}
            icon={<LayoutGridIcon className="h-5 w-5 shrink-0" />}
            level={0}
          />
        ) : (
          <Link
            href={routes.dashboard}
            title={itemTitle('Dashboard')}
            className={cn(
              baseItem,
              isActive(pathname, routes.dashboard, true) ? activeCls : inactive
            )}
            style={stripeIfLight(isActive(pathname, routes.dashboard, true))}
          >
            <LayoutGridIcon className="h-5 w-5 shrink-0" />
            <Label>Dashboard</Label>
          </Link>
        )}

        {/* Cases */}
        <div>
          {collapsed ? (
            <>
              <CollapsedParentRailButton
                title="Cases"
                active={isActive(pathname, routes.cases, true)} // exact active
                open={open.cases}                                // open highlight
                icon={<FolderPlusIcon className="h-5 w-5 shrink-0" />}
                level={0}
                onToggle={() => toggle('cases')}
                controlsId="cases-submenu-collapsed"
              />
              {open.cases && (
                <div id="cases-submenu-collapsed">
                  <CollapsedRailLink
                    href={routes['cases.case']}
                    title="Case"
                    active={isActive(pathname, routes['cases.case'])}
                    icon={<FilePlus className="h-5 w-5" />}
                    level={1}
                  />
                  <CollapsedRailLink
                    href={routes['cases.quotation']}
                    title="Case Quotation"
                    active={isActive(pathname, routes['cases.quotation'])}
                    icon={<FileTextIcon className="h-5 w-5" />}
                    level={1}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                title={itemTitle('Cases')}
                className={cn(
                  groupBase,
                  open.cases ? 'bg-accent/60' : '',
                  isActive(pathname, routes.cases)
                    ? groupActiveParent
                    : groupIdle
                )}
                onClick={() => toggle('cases')}
                aria-expanded={open.cases}
                aria-controls="cases-submenu"
                aria-haspopup="true"
              >
                <span className="flex items-center gap-3">
                  <FolderPlusIcon className="h-5 w-5 shrink-0" />
                  <Label>Cases</Label>
                </span>
                <ChevronDownIcon
                  className={cn('h-4 w-4 transition', open.cases ? 'rotate-180' : '')}
                />
              </button>

              {open.cases && (
                <div id="cases-submenu" role="menu" className="mt-1 space-y-1">
                  <Link
                    role="menuitem"
                    href={routes['cases.case']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['cases.case']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['cases.case']))}
                  >
                    <FilePlus className="h-5 w-5" />
                    <span>Case</span>
                  </Link>
                  <Link
                    role="menuitem"
                    href={routes['cases.quotation']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['cases.quotation']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['cases.quotation']))}
                  >
                    <FileTextIcon className="h-5 w-5" />
                    <span>Case Quotation</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Customers */}
        {collapsed ? (
          <CollapsedRailLink
            href={routes.customers}
            title="Customers"
            active={isActive(pathname, routes.customers)}
            icon={<UsersIcon className="h-5 w-5" />}
            level={0}
          />
        ) : (
          <Link
            href={routes.customers}
            title={itemTitle('Customers')}
            className={cn(
              baseItem,
              isActive(pathname, routes.customers) ? activeCls : inactive
            )}
            style={stripeIfLight(isActive(pathname, routes.customers))}
          >
            <UsersIcon className="h-5 w-5" />
            <Label>Customers</Label>
          </Link>
        )}

        {/* Items */}
        {collapsed ? (
          <CollapsedRailLink
            href={routes.items}
            title="Items"
            active={isActive(pathname, routes.items)}
            icon={<SquareStack className="h-5 w-5" />}
            level={0}
          />
        ) : (
          <Link
            href={routes.items}
            title={itemTitle('Items')}
            className={cn(
              baseItem,
              isActive(pathname, routes.items) ? activeCls : inactive
            )}
            style={stripeIfLight(isActive(pathname, routes.items))}
          >
            <SquareStack className="h-5 w-5" />
            <Label>Items</Label>
          </Link>
        )}

        {/* Incident */}
        {collapsed ? (
          <CollapsedRailLink
            href={routes.incident}
            title="Incident"
            active={isActive(pathname, routes.incident)}
            icon={<TriangleAlert className="h-5 w-5" />}
            level={0}
          />
        ) : (
          <Link
            href={routes.incident}
            title={itemTitle('Incident')}
            className={cn(
              baseItem,
              isActive(pathname, routes.incident) ? activeCls : inactive
            )}
            style={stripeIfLight(isActive(pathname, routes.incident))}
          >
            <TriangleAlert className="h-5 w-5" />
            <Label>Incident</Label>
          </Link>
        )}

        {/* Finances */}
        <div>
          {collapsed ? (
            <>
              <CollapsedParentRailButton
                title="Finances"
                active={isActive(pathname, routes.finances, true)} // exact-only active
                open={open.finances}                                // open highlight / child active
                icon={<CircleDollarSignIcon className="h-5 w-5" />}
                level={0}
                onToggle={() => toggle('finances')}
                controlsId="finances-submenu-collapsed"
              />
              {open.finances && (
                <div id="finances-submenu-collapsed">
                  <CollapsedRailLink
                    href={routes['finances.taxes']}
                    title="Taxes"
                    active={isActive(pathname, routes['finances.taxes'])}
                    icon={<Receipt className="h-5 w-5" />}
                    level={1}
                  />
                  <CollapsedRailLink
                    href={routes['finances.finance']}
                    title="Finance"
                    active={isActive(pathname, routes['finances.finance'])}
                    icon={<TrendingUpIcon className="h-5 w-5" />}
                    level={1}
                  />
                  <CollapsedRailLink
                    href={routes['finances.bank']}
                    title="Bank Account"
                    active={isActive(pathname, routes['finances.bank'])}
                    icon={<BanknoteIcon className="h-5 w-5" />}
                    level={1}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                title={itemTitle('Finances')}
                className={cn(
                  groupBase,
                  open.finances ? 'bg-accent/60' : '',
                  isActive(pathname, routes.finances)
                    ? groupActiveParent
                    : groupIdle
                )}
                onClick={() => toggle('finances')}
                aria-expanded={open.finances}
                aria-controls="finances-submenu"
                aria-haspopup="true"
              >
                <span className="flex items-center gap-3">
                  <CircleDollarSignIcon className="h-5 w-5" />
                  <Label>Finances</Label>
                </span>
                <ChevronDownIcon
                  className={cn('h-4 w-4 transition', open.finances ? 'rotate-180' : '')}
                />
              </button>

              {open.finances && (
                <div id="finances-submenu" role="menu" className="mt-1 space-y-1">
                  <Link
                    role="menuitem"
                    href={routes['finances.taxes']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['finances.taxes']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['finances.taxes']))}
                  >
                    <Receipt className="h-5 w-5" />
                    <span>Taxes</span>
                  </Link>
                  <Link
                    role="menuitem"
                    href={routes['finances.finance']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['finances.finance']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['finances.finance']))}
                  >
                    <TrendingUpIcon className="h-5 w-5" />
                    <span>Finance</span>
                  </Link>
                  <Link
                    role="menuitem"
                    href={routes['finances.bank']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['finances.bank']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['finances.bank']))}
                  >
                    <BanknoteIcon className="h-5 w-5" />
                    <span>Bank Account</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Settings */}
        <div>
          {collapsed ? (
            <>
              <CollapsedParentRailButton
                title="Settings"
                active={isActive(pathname, routes.settings, true)} // exact-only active
                open={open.settings}                                 // open highlight / child active
                icon={<Settings className="h-5 w-5" />}
                level={0}
                onToggle={() => toggle('settings')}
                controlsId="settings-submenu-collapsed"
              />
              {open.settings && (
                <div id="settings-submenu-collapsed">
                  <CollapsedRailLink
                    href={routes['settings.users']}
                    title="User Management"
                    active={isActive(pathname, routes['settings.users'])}
                    icon={<Users className="h-5 w-5" />}
                    level={1}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                title={itemTitle('Settings')}
                className={cn(
                  groupBase,
                  open.settings ? 'bg-accent/60' : '',
                  isActive(pathname, routes.settings)
                    ? groupActiveParent
                    : groupIdle
                )}
                onClick={() => toggle('settings')}
                aria-expanded={open.settings}
                aria-controls="settings-submenu"
                aria-haspopup="true"
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <Label>Settings</Label>
                </span>
                <ChevronDownIcon
                  className={cn('h-4 w-4 transition', open.settings ? 'rotate-180' : '')}
                />
              </button>

              {open.settings && (
                <div id="settings-submenu" role="menu" className="mt-1 space-y-1">
                  <Link
                    role="menuitem"
                    href={routes['settings.users']}
                    className={cn(
                      baseItem,
                      subItem,
                      isActive(pathname, routes['settings.users']) ? activeCls : inactive
                    )}
                    style={stripeIfLight(isActive(pathname, routes['settings.users']))}
                  >
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

/* ───────────────── Exported wrapper ───────────────── */
type SidebarProps = {
  logoLightSrc?: string;
  logoDarkSrc?: string;
};

export default function Sidebar({
  logoLightSrc = '/logo-light.png',
  logoDarkSrc = '/logo-dark.png',
}: SidebarProps) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const themeIsDark = mounted && resolvedTheme === 'dark';

  const W = collapsed ? 80 : 300;

  return (
    <>
      <aside
        className="hidden lg:block shrink-0 rounded-br-md border border-border bg-card text-card-foreground"
        style={{ width: W }}
      >
        <SidebarContent
          collapsed={collapsed}
          themeIsDark={!!themeIsDark}
          logoLightSrc={logoLightSrc}
          logoDarkSrc={logoDarkSrc}
        />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[9999] lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            'absolute left-0 top-0 h-full bg-card text-card-foreground w-[280px] max-w-[80%] border-r border-border shadow-xl transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SidebarContent
            collapsed={false}
            themeIsDark={!!themeIsDark}
            logoLightSrc={logoLightSrc}
            logoDarkSrc={logoDarkSrc}
          />
        </div>
      </div>
    </>
  );
}

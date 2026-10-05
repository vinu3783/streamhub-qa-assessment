import { NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/report', label: 'Amortization report' },
];

export function AppLayout() {
  const { search } = useLocation();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ₹
          </span>
          <span>Loan Analytics</span>
        </div>
        <nav aria-label="Main">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {/* Carry the current loan across views so the report reflects the dashboard input. */}
                <NavLink to={{ pathname: item.to, search }} end className="nav-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

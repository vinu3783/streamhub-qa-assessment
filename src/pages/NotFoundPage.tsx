import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="card not-found">
      <h1>Page not found</h1>
      <p className="muted">The page you requested does not exist.</p>
      <Link to="/">Back to the dashboard</Link>
    </section>
  );
}

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

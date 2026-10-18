import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--white)] flex flex-col justify-between selection:bg-[var(--yellow)] selection:text-[#080808] relative overflow-hidden">
      {/* Ambient subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(255,229,0,0.06), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,52,52,0.03), transparent 45%)',
        }}
      />

      {/* Modernized Minimal MCast Topbar */}
      <Header
        variant="minimal"
        badge="404 Error"
        badgeType="error"
        backHref="/"
        backLabel="← Homepage"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div
          className="w-full max-w-lg text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(20,20,20,.96), rgba(10,10,10,.96))',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: 'clamp(32px, 5vw, 48px)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{
              background: 'rgba(255, 229, 0, 0.1)',
              border: '1px solid var(--line-yellow)',
              color: 'var(--yellow)',
            }}
          >
            <Compass size={32} />
          </div>

          <span
            className="eyebrow"
            style={{ display: 'inline-flex', marginBottom: '12px' }}
          >
            Error 404
          </span>

          <h1 className="pixel-title text-3xl sm:text-4xl text-white mb-3">
            Page Not Found
          </h1>

          <p className="text-[var(--muted)] text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn&apos;t exist, has been moved, or the link has expired.
          </p>

          <Link
            href="/"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '13px 20px', fontSize: '0.92rem' }}
          >
            <span>Return to MCast Homepage</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {/* Modernized Minimal MCast Footer */}
      <Footer variant="minimal" />
    </div>
  );
}

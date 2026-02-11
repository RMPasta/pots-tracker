import Link from 'next/link';
import { auth } from '@/lib/auth';
import { AppLogo } from '@/components/AppLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ContactForm } from '@/components/ContactForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  path: '/contact',
  title: 'Contact — POTS Companion',
  description:
    'Send feedback, report a bug, or get support for POTS Companion. We read every message.',
});

export default async function ContactPage(): Promise<React.ReactElement> {
  const session = await auth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-4 sm:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-card-bg p-4 text-center shadow-(--shadow-soft)">
        <div className="mb-1 flex shrink-0 items-center justify-center">
          <AppLogo size="xl" variant="withTitle" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground-soft">Contact</h1>
        <p className="text-sm text-foreground-soft/80">
          Send a message, report a bug, or say hello. We read every message.
        </p>
        {session && (
          <p className="text-sm text-foreground-soft/80">
            <Link href="/dashboard" className="underline">
              Go to dashboard
            </Link>
          </p>
        )}
        <div className="w-full text-left">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

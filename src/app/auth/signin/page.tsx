import { auth, signIn } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppLogo } from '@/components/AppLogo';

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card-bg px-8 py-6 shadow-(--shadow-soft)">
          <AppLogo size="md" className="shrink-0" />
          <p className="text-lg text-foreground-soft">You are already signed in.</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex min-h-[520px] w-full max-w-md flex-col items-center rounded-2xl bg-card-bg p-4 shadow-(--shadow-soft)">
        <div className="mb-5 flex h-[280px] w-[280px] shrink-0 items-center justify-center overflow-hidden">
          <AppLogo size="xl" className="scale-125 object-center" />
        </div>

        <div className="w-full flex flex-col gap-4">
          {hasResend && (
            <>
              <form
                action={async (formData) => {
                  'use server';
                  const email = formData.get('email') as string;
                  if (email) {
                    await signIn('resend', { email, redirectTo: '/dashboard' });
                  }
                }}
                className="flex flex-col gap-3"
              >
                <label htmlFor="email" className="text-sm font-medium text-foreground-soft">
                  Email (magic link)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="rounded-xl border border-pastel-outline-pink/70 bg-input-bg px-4 py-2 text-input-text placeholder:text-input-placeholder focus:border-pastel-outline-pink focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/40"
                />
                <button
                  type="submit"
                  className="rounded-full bg-btn-primary px-6 py-3 text-foreground-soft transition-colors hover:bg-btn-primary-hover"
                >
                  Send magic link
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-pastel-outline-pink/40" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card-bg px-2 text-foreground-soft/80">or</span>
                </div>
              </div>
            </>
          )}

          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/dashboard' });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-full bg-btn-secondary px-6 py-3 text-foreground-soft shadow-(--shadow-soft) transition-colors hover:bg-btn-secondary-hover"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

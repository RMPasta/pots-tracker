import { auth, signIn } from '@/lib/auth';

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-2xl bg-white/80 px-8 py-6 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
          <p className="text-lg text-foreground-soft">You are already signed in.</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-full bg-pastel-pink px-6 py-3 text-foreground-soft transition-colors hover:opacity-90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white/80 p-6 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground-soft">
          Sign in to POTS Tracker
        </h1>

        <div className="mt-6 flex flex-col gap-4">
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
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground-soft"
                >
                  Email (magic link)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="rounded-xl border border-pastel-purple/40 bg-white px-4 py-2 text-foreground-soft placeholder:text-foreground-soft/60 focus:border-pastel-purple focus:outline-none focus:ring-2 focus:ring-pastel-purple/40"
                />
                <button
                  type="submit"
                  className="rounded-full bg-pastel-purple px-6 py-3 text-foreground-soft transition-colors hover:opacity-90"
                >
                  Send magic link
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-pastel-purple/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/80 px-2 text-foreground-soft/70 dark:bg-transparent">
                    or
                  </span>
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
              className="w-full rounded-full border-2 border-pastel-purple/50 bg-pastel-yellow/30 px-6 py-3 text-foreground-soft shadow-(--shadow-soft) transition-colors hover:bg-pastel-yellow/50"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

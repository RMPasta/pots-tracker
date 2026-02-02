import { auth, signIn } from '@/lib/auth';

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg text-zinc-600">You are already signed in.</p>
        <a
          href="/dashboard"
          className="rounded-full bg-pastel-pink px-6 py-3 text-white transition-colors hover:opacity-90"
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to POTS Tracker</h1>

      <div className="flex w-full max-w-sm flex-col gap-4">
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
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email (magic link)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-pastel-purple focus:outline-none focus:ring-1 focus:ring-pastel-purple"
              />
              <button
                type="submit"
                className="rounded-full bg-pastel-purple px-6 py-3 text-white transition-colors hover:opacity-90"
              >
                Send magic link
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">or</span>
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
            className="w-full rounded-full border border-zinc-300 bg-white px-6 py-3 text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

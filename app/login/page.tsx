import { loginAction } from "./actions";
import { SubmitButton } from "@/components/submit-button";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "invalid_input":
      return "Please enter a valid email and password.";
    case "invalid_credentials":
      return "Invalid email or password.";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            AVG Printing Shop
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Employee Job, Attendance, and Salary Tracking System
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <SubmitButton idleLabel="Sign In" pendingLabel="Signing In..." />
        </form>

        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          Staff Log in: yourname@avg.com / yourname123 | Example: marl@avg.com / marl123
        </div>
      </div>
    </main>
  );
}
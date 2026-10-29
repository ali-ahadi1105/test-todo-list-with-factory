export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900">Todo List App</h1>
        <p className="mb-8 text-lg text-neutral-600">
          A modern todo list application built with Next.js, NestJS, and Turborepo
        </p>
        <div className="space-x-4">
          <a
            href="/dashboard"
            className="bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium text-white transition-colors"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="text-primary-600 bg-primary-50 hover:bg-primary-100 inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}

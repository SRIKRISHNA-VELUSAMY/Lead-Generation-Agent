export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">Lead Generation Agent</h1>
      <p className="mt-2 text-neutral-600">
        Telegram bot for AI-powered lead research. API:{" "}
        <code className="rounded bg-neutral-100 px-1">/api/telegram/webhook</code>
      </p>
    </main>
  );
}

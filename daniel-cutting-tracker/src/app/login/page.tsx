import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Daniel Cutting Tracker</h1>
        <p className="text-sm text-zinc-500">Acompanhamento de alimentacao, peso, treino e gasto energetico.</p>
      </div>
      <LoginForm />
    </main>
  );
}

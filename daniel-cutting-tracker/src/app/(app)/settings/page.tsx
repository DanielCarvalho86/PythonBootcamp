import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card, StatRow } from "@/components/dashboard/Card";
import { calculateAgeYears } from "@/lib/calculations/bmr";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [profile, activeFoods, inactiveFoods, planCount] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.food.count({ where: { active: true } }),
    prisma.food.count({ where: { active: false } }),
    prisma.nutritionPlan.count({ where: { userId } }),
  ]);

  if (!profile) {
    return <p className="text-sm text-zinc-500">Perfil nao configurado.</p>;
  }

  const age = calculateAgeYears(profile.birthDate, new Date());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900">Configuracoes</h1>

      <Card title="Perfil">
        <StatRow label="Nome" value={profile.name} />
        <StatRow label="Idade" value={`${age} anos`} />
        <StatRow label="Altura" value={`${profile.heightCm} cm`} />
        <StatRow label="Peso de referencia" value={`${profile.referenceWeightKg} kg`} sub={profile.referenceWeightAt.toISOString().slice(0, 10)} />
      </Card>

      <Card title="Bioimpedancia de referencia (editavel, tratada como estimativa)">
        <StatRow label="Gordura corporal" value={`${profile.bodyFatPercent ?? "-"}%`} />
        <StatRow label="Massa de gordura" value={`${profile.fatMassKg ?? "-"} kg`} />
        <StatRow label="Massa muscular" value={`${profile.muscleMassKg ?? "-"} kg`} />
        <StatRow label="Musculo esqueletico" value={`${profile.skeletalMuscleKg ?? "-"} kg`} />
        <StatRow label="Gordura visceral" value={`${profile.visceralFat ?? "-"}`} />
        <StatRow label="IMC" value={`${profile.bmi ?? "-"}`} />
        <StatRow label="BMR do aparelho" value={`${profile.deviceBmrKcal ?? "-"} kcal`} />
        <p className="mt-2 text-[11px] text-zinc-400">
          Esses valores nunca sao tratados como verdade absoluta — peso e composicao corporal tem variabilidade
          natural. Edicao via banco de dados / API nesta primeira versao.
        </p>
      </Card>

      <Card title="Banco de alimentos">
        <StatRow label="Alimentos ativos" value={String(activeFoods)} />
        <StatRow label="Alimentos desativados" value={String(inactiveFoods)} />
        <Link
          href="/settings/foods"
          className="mt-3 inline-block rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Gerenciar alimentos
        </Link>
      </Card>

      <Card title="Planos alimentares">
        <StatRow label="Planos cadastrados" value={String(planCount)} />
        <Link
          href="/settings/plans"
          className="mt-3 inline-block rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Gerenciar planos
        </Link>
      </Card>

      <Card title="Aviso">
        <p className="text-xs text-zinc-500">
          Este aplicativo e uma ferramenta pessoal de acompanhamento e nao substitui orientacao medica ou
          nutricional profissional.
        </p>
      </Card>
    </div>
  );
}

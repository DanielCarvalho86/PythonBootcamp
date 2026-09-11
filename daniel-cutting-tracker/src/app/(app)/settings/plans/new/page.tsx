import { Card } from "@/components/dashboard/Card";
import { PlanTargetsForm } from "@/app/(app)/settings/plans/PlanTargetsForm";
import { createPlanAction } from "@/app/(app)/settings/plans/actions";

export default function NewPlanPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900">Nova semana</h1>
      <p className="text-xs text-zinc-500">
        Cria um plano vazio (sem refeicoes) — adicione as refeicoes e alimentos depois de salvar. Para partir de uma
        semana existente, use &quot;Duplicar como nova semana&quot; na pagina do plano de origem.
      </p>
      <Card>
        <PlanTargetsForm
          action={createPlanAction}
          submitLabel="Criar plano"
          initial={{
            name: "",
            startDate: "",
            endDate: "",
            caloriesMin: 2150,
            caloriesTarget: 2200,
            caloriesMax: 2250,
            proteinMin: 185,
            proteinTarget: 190,
            proteinMax: 195,
            carbsMin: 190,
            carbsTarget: 200,
            carbsMax: 210,
            fatMin: 70,
            fatTarget: 75,
            fatMax: 80,
            fiberMin: 30,
            fiberMax: 40,
            waterMinMl: 3000,
            waterMaxMl: 3500,
            creatineTargetG: 5,
            wheyTargetG: 40,
            notes: "",
          }}
        />
      </Card>
    </div>
  );
}

import { Card } from "@/components/dashboard/Card";
import { FoodForm } from "@/app/(app)/settings/foods/FoodForm";
import { createFoodAction } from "@/app/(app)/settings/foods/actions";

export default function NewFoodPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900">Novo alimento</h1>
      <Card>
        <FoodForm action={createFoodAction} submitLabel="Criar alimento" />
      </Card>
    </div>
  );
}

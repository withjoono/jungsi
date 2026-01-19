import { EditSelfEvaluationForm } from "@/components/services/evaluation/edit-self-evaluation-form";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerEvaluationList } from "@/stores/server/features/susi/evaluation/queries";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createLazyFileRoute("/evaluation/_layout/self/edit")({
  component: EditSelfEvaluation,
});

function EditSelfEvaluation() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluationList } = useGetOfficerEvaluationList();

  const myEvaluationItem = useMemo(() => {
    if (!currentUser || !evaluationList) return null;
    const filtered = evaluationList.filter(
      (n) => n.officer_id === currentUser.id,
    );
    return filtered.length ? filtered[0] : null;
  }, [currentUser, evaluationList]);

  return (
    <div>
      <EditSelfEvaluationForm
        evaluationId={myEvaluationItem?.id}
        series={myEvaluationItem?.series}
      />
    </div>
  );
}

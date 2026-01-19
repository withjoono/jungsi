import { createMutation } from "@/stores/server/common-utils";
import { useGetCurrentUser } from "../me/queries";

/**
 * 관심대학 추가
 */
export const useAddInterestRegularAdmission = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<
    {
      targetIds: number[];
      admissionType: "가" | "나" | "다" | "군외";
    },
    void
  >("POST", `/members/${user?.id}/regular-interests`);
};

/**
 * 관심대학 삭제
 */
export const useRemoveInterestRegularAdmission = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<
    {
      targetIds: number[];
      admissionType: "가" | "나" | "다" | "군외";
    },
    void
  >("DELETE", `/members/${user?.id}/regular-interests`);
};

export const useCreateRegularCombination = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<{ name: string; ids: number[] }, void>(
    "POST",
    `/members/${user?.id}/regular-combinations`,
  );
};

export const useUpdateRegularCombination = (combinationId: number) => {
  const { data: user } = useGetCurrentUser();
  return createMutation<
    {
      name: string;
    },
    void
  >("PATCH", `/members/${user?.id}/regular-combinations/${combinationId}`);
};

export const useDeleteRegularCombination = (combinationId: number) => {
  const { data: user } = useGetCurrentUser();
  return createMutation<void, void>(
    "DELETE",
    `/members/${user?.id}/regular-combinations/${combinationId}`,
  );
};

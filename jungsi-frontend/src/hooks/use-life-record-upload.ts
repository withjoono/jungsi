/**
 * ============================================
 * 생활기록부 업로드 훅 (Spring 백엔드 의존성 제거됨)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 *
 * 이 훅은 기존에 Spring 백엔드의 생활기록부 업로드 API를 사용했습니다.
 * Spring 백엔드가 비활성화되어 현재는 기능이 비활성화되어 있습니다.
 * NestJS 백엔드에 해당 기능이 마이그레이션되면 이 훅을 업데이트하세요.
 */

import { useAuthStore } from "@/stores/client/use-auth-store";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
// Spring API는 더 이상 사용하지 않음
// import { SPRING_API } from "@/stores/server/features/spring/apis";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const useLifeRecordUpload = () => {
  // Spring 백엔드가 비활성화되어 업로드 기능을 사용할 수 없음
  const [canUpload] = useState(false);
  const { data: currentUser } = useGetCurrentUser();
  const { refetch: _refetchSchoolRecord } = useGetSchoolRecords();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Zustand
  const { clearTokens } = useAuthStore();

  const _handleLogout = () => {
    clearTokens();
    queryClient.clear();
    toast.success("토큰이 만료되어 로그아웃됩니다.");
    navigate({ to: "/auth/login" });
  };

  /**
   * @deprecated Spring 백엔드가 비활성화되어 파일 업로드 기능을 사용할 수 없습니다.
   * NestJS 백엔드에 해당 기능이 마이그레이션되면 이 함수를 업데이트하세요.
   */
  const uploadFile = async (_type: "html" | "pdf", _file: File) => {
    if (!currentUser) return;

    // Spring 백엔드가 비활성화되어 파일 업로드 기능 비활성화
    toast.error("파일 업로드 기능이 현재 점검 중입니다. 잠시 후 다시 시도해주세요.");
    console.warn(
      "[useLifeRecordUpload] Spring 백엔드가 비활성화되어 파일 업로드를 사용할 수 없습니다."
    );

    // 기존 Spring API 호출 코드 (비활성화됨)
    // try {
    //   if (type === "html") {
    //     const res = await SPRING_API.uploadEarlyThreeGradeHtmlFile(file);
    //     if (res.status) {
    //       toast.success("생활기록부(html) 업로드에 성공하였습니다.");
    //       await refetchSchoolRecord();
    //     }
    //   } else if (type === "pdf") {
    //     const res = await SPRING_API.uploadEarlyThreeGradeGraduatePdfFile(file);
    //     if (res.status) {
    //       toast.success("생활기록부(pdf) 업로드에 성공하였습니다.");
    //       await refetchSchoolRecord();
    //     }
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
  };

  return { canUpload, uploadFile };
};

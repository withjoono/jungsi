/**
 * 학생 평가 상세 페이지
 *
 * Note: Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
 * 이 페이지의 Spring 관련 기능은 비활성화되었습니다.
 * NestJS 백엔드에 해당 기능이 마이그레이션되면 이 컴포넌트를 업데이트하세요.
 */
import { Button } from "@/components/custom/button";
import { EditEvaluationForm } from "@/components/services/evaluation/edit-evaluation-form";
import apiClient from "@/stores/server/api-client";
import { ADDITIONAL_FILE_APIS } from "@/stores/server/features/additional-file/apis";
import { IAdditionalFile } from "@/stores/server/features/additional-file/interfaces";
import { useGetOfficerAdditionalFiles } from "@/stores/server/features/additional-file/queries";
// Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
// import { useGetEvaluationStudnetInfo } from "@/stores/server/features/spring/queries";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/officer/_layout/apply/$studentId")({
  component: EditEvaluation,
});

function EditEvaluation() {
  const studentId = Route.useParams().studentId;
  // Spring 백엔드가 비활성화되어 쿼리도 비활성화됨
  // const { data: studentInfo } = useGetEvaluationStudnetInfo(studentId);
  const studentInfo = null;
  const { data: files } = useGetOfficerAdditionalFiles(Number(studentId));

  const downloadPdfAndHtml = () => {
    downloadSchoolrecrodFileFetch(studentId, studentInfo?.studentName);
  };

  // 한글 파일명 디코딩 함수
  const decodeFileName = (fileName: string): string => {
    try {
      return decodeURIComponent(fileName.replace(/\+/g, " "));
    } catch {
      return fileName; // 디코딩 실패 시 원래 파일명 반환
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const { url, fileName } =
        await ADDITIONAL_FILE_APIS.getOfficerAdditionalFileDownloadUrlAPI(
          fileId,
        );

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank"; // 새 탭에서 열기
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("파일 다운로드 중 오류가 발생했습니다.");
      console.error("Download error:", error);
    }
  };

  return (
    <div>
      {/* Spring 백엔드 비활성화 안내 */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold">⚠️ 서비스 점검 중</p>
        <p className="text-yellow-700 text-sm mt-1">
          평가 기능이 현재 점검 중입니다. 잠시 후 다시 시도해주세요.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 pb-8">
        <Button onClick={downloadPdfAndHtml} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          생기부 다운로드
        </Button>
        <div className="">
          <h3 className="text-md mb-2 font-semibold">업로드된 파일 목록</h3>
          {files && files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file: IAdditionalFile) => (
                <li key={file.id} className="flex items-center justify-between">
                  <span>{decodeFileName(file.file_name)}</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDownload(file.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      다운로드
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-accent-foreground">추가 파일 없음</p>
          )}
        </div>
      </div>
      <EditEvaluationForm studentId={studentId} />
    </div>
  );
}

/**
 * 평가자 -> 학생 파일 다운로드
 */
const downloadSchoolrecrodFileFetch = async (
  studentId: string | undefined,
  studentName: string | undefined,
) => {
  await apiClient
    .post(
      "/officer/file/list",
      {
        studentId: studentId,
      },
      {
        responseType: "blob",
      },
    )
    .then((res) => {
      const url = URL.createObjectURL(res.data);
      console.log(res);
      const link = document.createElement("a");
      link.href = url;
      link.download = studentName + "_생활기록부.zip";
      link.click();
    });
};

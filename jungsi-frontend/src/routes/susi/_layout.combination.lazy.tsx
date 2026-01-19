import { useState } from "react";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { useGetCombinations } from "@/stores/server/features/combination/queries";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useDeleteCombination,
  useUpdateCombination,
} from "@/stores/server/features/combination/mutations";
import { ICombination } from "@/stores/server/features/combination/interfaces";
import { Button } from "@/components/custom/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/susi/_layout/combination")({
  component: SusiCombination,
});

function SusiCombination() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: combinations, refetch: refetchCombinations } =
    useGetCombinations();
  const [selectedCombination, setSelectedCombination] =
    useState<ICombination | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const deleteCombination = useDeleteCombination(selectedCombination?.id || 0);
  const updateCombination = useUpdateCombination(selectedCombination?.id || 0);

  const handleSelectCombination = (combination: ICombination) => {
    setSelectedCombination(combination);
    setEditName(combination.name);
  };

  const handleDeleteCombination = async () => {
    if (!selectedCombination) return;
    try {
      await deleteCombination.mutateAsync();
      toast.success("조합이 성공적으로 삭제되었습니다.");
      setSelectedCombination(null);
      refetchCombinations();
    } catch (error) {
      toast.error("조합 삭제에 실패했습니다.");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEditName = async () => {
    if (!selectedCombination) return;
    try {
      await updateCombination.mutateAsync({ name: editName });
      toast.success("조합 이름이 성공적으로 변경되었습니다.");
      refetchCombinations();
      setIsEditingName(false);
      setSelectedCombination({ ...selectedCombination, name: editName });
    } catch (error) {
      toast.error("조합 이름 변경에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">조합 및 모의지원</h3>
        <p className="text-sm text-muted-foreground">
          생성한 조합 목록을 확인하고 관리할 수 있습니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : combinations?.length ? (
        <>
          <div className="flex flex-wrap gap-2">
            {combinations?.map((combination) => (
              <Button
                key={combination.id}
                onClick={() => handleSelectCombination(combination)}
                className="space-x-1"
                variant={
                  selectedCombination?.id === combination.id
                    ? "default"
                    : "outline"
                }
              >
                <span className="font-semibold">{combination.name}</span>
                <span className="text-xs">
                  (모집단위 {combination.recruitment_units.length}개,{" "}
                  {formatDateYYYYMMDD(combination.created_at)} 생성)
                </span>
              </Button>
            ))}
          </div>
          {selectedCombination && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleEditName}>저장</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingName(false)}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <h4 className="flex items-center text-lg font-semibold">
                    {selectedCombination.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </h4>
                )}
                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      조합 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>조합 삭제 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 이 조합을 삭제하시겠습니까? 이 작업은 되돌릴 수
                        없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCombination}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">대학명</TableHead>
                    <TableHead className="min-w-[100px]">유형</TableHead>
                    <TableHead className="min-w-[160px]">전형명</TableHead>
                    <TableHead className="min-w-[200px]">모집단위명</TableHead>
                    <TableHead className="min-w-[200px]">전형일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCombination.recruitment_units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        {unit.admission.university?.name} (
                        {unit.admission.university?.region})
                      </TableCell>
                      <TableCell
                        className={cn(
                          unit.admission.category?.id === 1 && "text-blue-500",
                          unit.admission.category?.id === 2 &&
                            "text-purple-500",
                          unit.admission.category?.id === 3 && "text-green-500",
                        )}
                      >
                        {unit.admission.category?.name || ""}
                      </TableCell>
                      <TableCell>{unit.admission.name}</TableCell>
                      <TableCell>{unit.name}</TableCell>
                      <TableCell>
                        {unit.interview?.interview_date || "정보 없음"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-20">
          <p className="text-base font-semibold sm:text-lg">
            조합이 존재하지 않아요 🥲
          </p>
          <p className="text-sm text-foreground/70">
            <Link to="/susi/interest" className="text-blue-500">
              관심대학
            </Link>
            에서 모의지원을 위한 조합을 생성해보세요!
          </p>
        </div>
      )}
    </div>
  );
}

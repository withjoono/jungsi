import { Button } from "@/components/custom/button";
import { EarlyComprehensiveReport } from "@/components/reports/early-comprehensive-report";
import { EarlySubjectReport } from "@/components/reports/early-subject-report";
import { RequireLoginMessage } from "@/components/require-login-message";
import { InterestComprehensive } from "@/components/services/interests/interest-comprehensive";
import { InterestSubject } from "@/components/services/interests/interest-subject";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCombination } from "@/stores/server/features/combination/mutations";
import { useGetCombinations } from "@/stores/server/features/combination/queries";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { IInterestRecruitment } from "@/stores/server/features/susi/interest-univ/interfaces";
import { AlertDialog, AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { IconPlus } from "@tabler/icons-react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/susi/_layout/interest")({
  component: SusiInterests,
});

function SusiInterests() {
  const navigate = useNavigate();
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { refetch: refetchCombinations } = useGetCombinations();

  const [tab, setTab] = useState("subject");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [selectedComprehensive, setSelectedComprehensive] =
    useState<IInterestRecruitment | null>(null);
  const [isCreatingCombination, setIsCreatingCombination] = useState(false);
  const [selectedItems, setSelectedItems] = useState<IInterestRecruitment[]>(
    [],
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const combinationNameRef = useRef<HTMLInputElement>(null);

  // Mutations
  const createCombination = useCreateCombination();

  const onTabChange = (value: string) => {
    setTab(value);
  };

  const resetSelectedItems = () => {
    setSelectedSubjectId(null);
    setSelectedComprehensive(null);
  };

  const onClickSusiSubjectDetail = (susiSubjectId: number) => {
    setSelectedSubjectId(susiSubjectId);
    window.scrollTo(0, 0);
  };

  const onClickSusiComprehensiveDetail = (item: IInterestRecruitment) => {
    setSelectedComprehensive(item);
    window.scrollTo(0, 0);
  };

  const toggleItemSelection = useCallback((item: IInterestRecruitment) => {
    setSelectedItems((prevItems) => {
      const isItemSelected = prevItems.some(
        (i) => i.recruitmentUnit.id === item.recruitmentUnit.id,
      );
      if (isItemSelected) {
        return prevItems.filter(
          (i) => i.recruitmentUnit.id !== item.recruitmentUnit.id,
        );
      } else if (prevItems.length < 6) {
        return [...prevItems, item];
      } else {
        toast.error("최대 6개까지만 선택할 수 있습니다.");
        return prevItems;
      }
    });
  }, []);

  const handleCreateCombination = async () => {
    if (selectedItems.length === 0) {
      toast.error("최소 1개 이상의 항목을 선택해주세요.");
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmCreateCombination = async (name: string) => {
    if (!name.trim()) {
      toast.error("조합 이름을 입력해주세요.");
      return;
    }

    try {
      await createCombination.mutateAsync({
        name: name.trim(),
        recruitment_unit_ids: selectedItems.map(
          (item) => item.recruitmentUnit.id,
        ),
      });
      toast.success("조합이 성공적으로 생성되었습니다.");
      setSelectedItems([]);
      setIsCreatingCombination(false);
      setIsDialogOpen(false);
      await refetchCombinations();
      navigate({ to: "/susi/combination" });
    } catch (error) {
      toast.error("조합 생성에 실패했습니다.");
    }
  };

  if (selectedSubjectId) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-6">
        <div className="sticky top-20 z-10 flex justify-center">
          <Button className="w-1/3" onClick={resetSelectedItems}>
            목록으로
          </Button>
        </div>
        <EarlySubjectReport earlySubjectId={selectedSubjectId} />
      </div>
    );
  }

  if (selectedComprehensive) {
    return (
      <div className="space-y-6">
        <div className="sticky top-20 z-10 flex justify-center">
          <Button className="w-1/3" onClick={resetSelectedItems}>
            목록으로
          </Button>
        </div>
        <EarlyComprehensiveReport
          earlyComprehensiveId={selectedComprehensive.recruitmentUnit.id}
          evaluationId={selectedComprehensive.evaluation_id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">관심대학</h3>
        <p className="text-sm text-muted-foreground">
          교과/학종/논술 탭에서 관심 목록에 추가한 대학 리스트입니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : (
        <>
          <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                <TabsTrigger
                  value="subject"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  교과
                </TabsTrigger>
                <TabsTrigger
                  value="comprehensive"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  학종
                </TabsTrigger>
                <TabsTrigger
                  disabled
                  value="nonsul"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  논술
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center justify-end">
                {isCreatingCombination ? (
                  <div className="flex gap-2">
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        setIsCreatingCombination(false);
                        setSelectedItems([]);
                      }}
                    >
                      취소
                    </Button>

                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          onClick={handleCreateCombination}
                          disabled={selectedItems.length === 0}
                          className="gap-2 bg-blue-500 hover:bg-blue-500/90"
                        >
                          저장하기 ({selectedItems.length}/6)
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>새 조합 생성</AlertDialogTitle>
                          <AlertDialogDescription>
                            조합의 이름을 입력하고 선택한 항목을 확인해주세요.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="조합 이름"
                            ref={combinationNameRef}
                          />
                          <div className="overflow-y-auto">
                            <ul className="list-inside list-disc">
                              {selectedItems.map((item) => (
                                <li key={item.recruitmentUnit.id}>
                                  {item.recruitmentUnit.university.name} -{" "}
                                  {item.recruitmentUnit.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setIsDialogOpen(false)}
                          >
                            취소
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              confirmCreateCombination(
                                combinationNameRef.current?.value || "",
                              )
                            }
                            asChild
                          >
                            <Button>저장</Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsCreatingCombination(true)}
                    className="gap-2 bg-blue-500 hover:bg-blue-500/90"
                  >
                    <IconPlus className="size-4" /> 조합 생성
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="subject">
              <InterestSubject
                onClickSusiSubjectDetail={onClickSusiSubjectDetail}
                isCreatingCombination={isCreatingCombination}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
              />
            </TabsContent>
            <TabsContent value="comprehensive">
              <InterestComprehensive
                onClickSusiComprehensiveDetail={onClickSusiComprehensiveDetail}
                isCreatingCombination={isCreatingCombination}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

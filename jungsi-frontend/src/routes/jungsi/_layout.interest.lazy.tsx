import { RequireLogin } from "@/components/access-control";
import { Button } from "@/components/custom/button";
import { JungsiReport } from "@/components/reports/jungsi-report";
import { InterestRegular } from "@/components/services/interests/interest-regular";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { useCreateRegularCombination } from "@/stores/server/features/jungsi/mutations";
import { useGetRegularCombinations } from "@/stores/server/features/jungsi/queries";
import { IconPlus } from "@tabler/icons-react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/jungsi/_layout/interest")({
  component: SusiInterests,
});

function SusiInterests() {
  const navigate = useNavigate();
  const { refetch: refetchCombinations } = useGetRegularCombinations();

  const [tab, setTab] = useState("a");
  const [selectedRegularId, setSelectedRegularId] = useState<number | null>(
    null,
  );
  const [isCreatingCombination, setIsCreatingCombination] = useState(false);
  const [selectedItems, setSelectedItems] = useState<IRegularAdmission[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const combinationNameRef = useRef<HTMLInputElement>(null);

  const createCombination = useCreateRegularCombination();

  const onTabChange = (value: string) => {
    setTab(value);
  };

  const resetSelectedItems = () => {
    setSelectedRegularId(null);
  };

  const onClickRegularDetail = (susiRegularId: number) => {
    setSelectedRegularId(susiRegularId);
    window.scrollTo(0, 0);
  };

  const toggleItemSelection = useCallback((item: IRegularAdmission) => {
    setSelectedItems((prevItems) => {
      const isItemSelected = prevItems.some((i) => i.id === item.id);
      if (isItemSelected) {
        return prevItems.filter((i) => i.id !== item.id);
      } else if (prevItems.length < 3) {
        const newItems = [...prevItems, item];
        const classified = classifySelectedItems(newItems);
        if (Object.values(classified).some((group) => group.length > 1)) {
          toast.error("각 군에서 하나씩만 선택할 수 있습니다.");
          return prevItems;
        }
        return newItems;
      } else {
        toast.error("최대 3개까지만 선택할 수 있습니다.");
        return prevItems;
      }
    });
  }, []);

  const classifySelectedItems = (items: IRegularAdmission[]) => {
    return items.reduce(
      (acc, item) => {
        if (item.admissionType === "가") acc.a.push(item);
        else if (item.admissionType === "나") acc.b.push(item);
        else if (item.admissionType === "다") acc.c.push(item);
        return acc;
      },
      { a: [], b: [], c: [] } as Record<string, IRegularAdmission[]>,
    );
  };

  const handleCreateCombination = () => {
    const classified = classifySelectedItems(selectedItems);

    if (
      classified.a.length !== 1 ||
      classified.b.length !== 1 ||
      classified.c.length !== 1
    ) {
      toast.error("가, 나, 다 군에서 각각 하나씩 선택해야 합니다.");
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
        ids: selectedItems.map((item) => item.id),
      });
      toast.success("조합이 성공적으로 생성되었습니다.");
      setSelectedItems([]);
      setIsCreatingCombination(false);
      setIsDialogOpen(false);
      await refetchCombinations();
      navigate({ to: "/jungsi/combination" });
    } catch (error) {
      toast.error("조합 생성에 실패했습니다.");
    }
  };

  if (selectedRegularId) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-6">
        <div className="sticky top-20 z-10 flex justify-center">
          <Button className="w-1/3" onClick={resetSelectedItems}>
            목록으로
          </Button>
        </div>
        <JungsiReport admissionId={selectedRegularId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">관심대학</h3>
        <p className="text-sm text-muted-foreground">
          정시 서비스에서 관심 목록에 추가한 대학 리스트입니다.
        </p>
      </div>
      <Separator />
      <RequireLogin featureName="관심대학">
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                <TabsTrigger
                  value="a"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  가군
                </TabsTrigger>
                <TabsTrigger
                  value="b"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  나군
                </TabsTrigger>
                <TabsTrigger
                  value="c"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  다군
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center justify-end">
                {isCreatingCombination ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
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
                          disabled={selectedItems.length !== 3}
                          className="gap-2 bg-blue-500 hover:bg-blue-500/90"
                        >
                          저장하기 ({selectedItems.length}/3)
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
                            {["가", "나", "다"].map((type) => (
                              <div key={type}>
                                <h4 className="font-semibold">{type}군</h4>
                                <ul className="list-inside list-disc">
                                  {selectedItems
                                    .filter(
                                      (item) => item.admissionType === type,
                                    )
                                    .map((item) => (
                                      <li key={item.id}>
                                        {item.university.name} -{" "}
                                        {item.recruitmentName}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ))}
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

            <TabsContent value="a">
              <InterestRegular
                onClickRegularDetail={onClickRegularDetail}
                isCreatingCombination={isCreatingCombination}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
                admissionType="가"
              />
            </TabsContent>
            <TabsContent value="b">
              <InterestRegular
                onClickRegularDetail={onClickRegularDetail}
                isCreatingCombination={isCreatingCombination}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
                admissionType="나"
              />
            </TabsContent>
            <TabsContent value="c">
              <InterestRegular
                onClickRegularDetail={onClickRegularDetail}
                isCreatingCombination={isCreatingCombination}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
                admissionType="다"
              />
            </TabsContent>
          </Tabs>
      </RequireLogin>
    </div>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calcRealRate, getRateColor, type CrawlerDataEntry } from "./types";

interface CompetitionRateTableProps {
  data: CrawlerDataEntry[];
  showDepartment?: boolean;
}

export function CompetitionRateTable({
  data,
  showDepartment = true,
}: CompetitionRateTableProps) {
  const isUnfilled = (item: CrawlerDataEntry) => calcRealRate(item) <= 1;

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>대학명</TableHead>
            <TableHead>캠퍼스</TableHead>
            <TableHead>전형명</TableHead>
            {showDepartment && <TableHead>모집단위</TableHead>}
            <TableHead className="text-center">정원</TableHead>
            <TableHead className="text-center">지원</TableHead>
            <TableHead className="text-center">최종경쟁률</TableHead>
            <TableHead className="text-center">예상최종경쟁</TableHead>
            <TableHead className="text-center">작년추합</TableHead>
            <TableHead className="bg-orange-50 text-center">
              예상실질경쟁
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow
              key={idx}
              className={`hover:bg-gray-50 ${isUnfilled(item) ? "bg-red-50/50" : ""}`}
            >
              <TableCell className="text-center font-medium text-gray-500">
                {idx + 1}
              </TableCell>
              <TableCell className="font-medium text-gray-800">
                {item.대학명}
                {isUnfilled(item) && (
                  <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                    미달
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs text-gray-600">
                {item.캠퍼스 || "-"}
              </TableCell>
              <TableCell className="text-xs text-gray-600">
                {item.전형명 || "-"}
              </TableCell>
              {showDepartment && (
                <TableCell className="text-gray-600">{item.모집단위}</TableCell>
              )}
              <TableCell className="text-center text-gray-600">
                {item.정원 ?? item.모집인원}
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {item.지원인원}
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {(item as any).최종경쟁률 ?? item.경쟁률}
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {item.예상최종경쟁 ?? "-"}
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {item.작년추합 ? item.작년추합.toFixed(2) : "-"}
              </TableCell>
              <TableCell className="bg-orange-50/50 text-center">
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${getRateColor(calcRealRate(item))}`}
                >
                  {calcRealRate(item).toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

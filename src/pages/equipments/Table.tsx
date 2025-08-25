import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEquipments } from "@/hooks/useEquipments";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomPagination from "@/components/custom-pagination";
import SkeletonTableRow from "@/components/skeleton-table-row";
import { SquareChevronRight } from "lucide-react";

export default function Table() {
  const { equipments, load, status } = useEquipments();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between" id="card-header">
          <CardTitle>{t("app.equipment.equipments")}</CardTitle>
          <Button onClick={() => navigate("/equipments/new")}>
            {t("app.equipment.newEquipment")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TableUI>
          <TableHeader>
            <TableRow className="text-lime-100">
              <TableHead>{t("app.common.name")}</TableHead>
              <TableHead>{t("app.common.serial")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!status.load.loading &&
              equipments.data.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>{equipment.serial}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() =>
                        navigate(`/equipments/${equipment.serial}`)
                      }
                    >
                      <SquareChevronRight />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {!status.load.loading && equipments.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("app.common.noData")}
                </TableCell>
              </TableRow>
            )}

            {status.load.loading && (
              <>
                <SkeletonTableRow columns={4} />
                <SkeletonTableRow columns={4} />
                <SkeletonTableRow columns={4} />
              </>
            )}
          </TableBody>
        </TableUI>
        <CustomPagination total={equipments.total} />
      </CardContent>
    </Card>
  );
}

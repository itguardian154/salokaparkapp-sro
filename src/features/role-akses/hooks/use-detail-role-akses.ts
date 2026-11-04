import { useEffect, useState } from "react";

import { getRoleAksesDetail } from "../service/role-akses-service";
import type {
  RoleAksesDetail,
  RoleAksesDetailResponse,
} from "../types/role-akses";

const useRoleAksesDetail = (id: number | null) => {
  const [dataRoleAkses, setDataRoleAkses] =
    useState<RoleAksesDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id === null) {
      setDataRoleAkses(null);
      return;
    }

    const controller = new AbortController();

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setErrorDetail(null);

      try {
        const response: RoleAksesDetailResponse =
          await getRoleAksesDetail(id, controller.signal);

        setDataRoleAkses(response.data);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Gagal mengambil detail role akses:", error);

        setErrorDetail("Gagal mengambil detail role akses.");
        setDataRoleAkses(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDetail(false);
        }
      }
    };

    void fetchDetail();

    return () => controller.abort();
  }, [id, refreshKey]);

  const refetchDetail = () => {
    setRefreshKey((key) => key + 1);
  };

  return {
    dataRoleAkses,
    loadingDetail,
    errorDetail,
    refetchDetail,
  };
};

export default useRoleAksesDetail;

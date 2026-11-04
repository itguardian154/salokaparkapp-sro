import { useCallback, useEffect, useState } from "react";
import { getPermission } from "../service/role-akses-service";
import type { RoleAksesPermission } from "../types/role-akses";

const usePermission = () => {
  const [dataPermission, setDataPermission] = useState<
    RoleAksesPermission[]
  >([]);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [errorPermission, setErrorPermission] = useState<string | null>(null);

  const refetchPermission = useCallback(async (signal?: AbortSignal) => {
    setLoadingPermission(true);
    setErrorPermission(null);

    try {
      const response = await getPermission(signal);
      setDataPermission(response.data);
    } catch (error) {
      if (signal?.aborted) return;

      setErrorPermission(
        error instanceof Error
          ? error.message
          : "Gagal memuat permission.",
      );
    } finally {
      if (!signal?.aborted) {
        setLoadingPermission(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void refetchPermission(controller.signal);

    return () => controller.abort();
  }, [refetchPermission]);

  return {
    dataPermission,
    loadingPermission,
    errorPermission,
    refetchPermission,
  };
};

export default usePermission;
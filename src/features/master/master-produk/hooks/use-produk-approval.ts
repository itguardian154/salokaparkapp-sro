import { useCallback, useEffect, useRef, useState } from "react";
import {
  approveProduk,
  checkProdukApprovalPermission,
  getProdukApprovalErrorMessage,
  rejectProduk,
  submitProdukForApproval,
} from "../service/produk-approval-service";

export type ProdukApprovalAction = "submit" | "approve" | "reject";

const useProdukApproval = (produkId: number | null, enabled: boolean) => {
  const [canApprove, setCanApprove] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] =
    useState<ProdukApprovalAction | null>(null);
  const permissionRequestId = useRef(0);

  const checkPermission = useCallback(async () => {
    const requestId = ++permissionRequestId.current;

    if (!enabled || produkId === null) {
      setCanApprove(false);
      setCheckingPermission(false);
      setPermissionError(null);
      return;
    }

    setCheckingPermission(true);
    setPermissionError(null);

    try {
      const allowed = await checkProdukApprovalPermission(produkId);
      if (requestId === permissionRequestId.current) setCanApprove(allowed);
    } catch (error: unknown) {
      if (requestId === permissionRequestId.current) {
        setCanApprove(false);
        setPermissionError(getProdukApprovalErrorMessage(error));
      }
    } finally {
      if (requestId === permissionRequestId.current) {
        setCheckingPermission(false);
      }
    }
  }, [enabled, produkId]);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  const runAction = async (
    action: ProdukApprovalAction,
  ): Promise<string | undefined> => {
    if (produkId === null) return;

    setLoadingAction(action);
    try {
      const response =
        action === "submit"
          ? await submitProdukForApproval(produkId)
          : action === "approve"
            ? await approveProduk(produkId)
            : await rejectProduk(produkId);
      await checkPermission();
      return response.message;
    } catch (error: unknown) {
      throw new Error(getProdukApprovalErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    canApprove,
    checkingPermission,
    permissionError,
    loadingAction,
    runAction,
    checkPermission,
  };
};

export default useProdukApproval;

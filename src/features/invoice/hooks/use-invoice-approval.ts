import { useCallback, useEffect, useRef, useState } from "react";
import {
  approveInvoice,
  checkInvoiceApprovalPermission,
  getInvoiceApprovalErrorMessage,
  rejectInvoice,
  submitInvoiceForApproval,
} from "../service/invoice-approval-service";

export type InvoiceApprovalAction = "submit" | "approve" | "reject";

const useInvoiceApproval = (invoiceId: number | null, enabled: boolean) => {
  const [canApprove, setCanApprove] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] =
    useState<InvoiceApprovalAction | null>(null);
  const permissionRequestId = useRef(0);

  const checkPermission = useCallback(async () => {
    const requestId = ++permissionRequestId.current;

    if (!enabled || invoiceId === null) {
      setCanApprove(false);
      setCheckingPermission(false);
      setPermissionError(null);
      return;
    }

    setCheckingPermission(true);
    setPermissionError(null);

    try {
      const allowed = await checkInvoiceApprovalPermission(invoiceId);
      if (requestId === permissionRequestId.current) setCanApprove(allowed);
    } catch (error: unknown) {
      if (requestId === permissionRequestId.current) {
        setCanApprove(false);
        setPermissionError(getInvoiceApprovalErrorMessage(error));
      }
    } finally {
      if (requestId === permissionRequestId.current) {
        setCheckingPermission(false);
      }
    }
  }, [enabled, invoiceId]);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  const runAction = async (
    action: InvoiceApprovalAction,
  ): Promise<string | undefined> => {
    if (invoiceId === null) return;

    setLoadingAction(action);
    try {
      const response =
        action === "submit"
          ? await submitInvoiceForApproval(invoiceId)
          : action === "approve"
            ? await approveInvoice(invoiceId)
            : await rejectInvoice(invoiceId);
      await checkPermission();
      return response.message;
    } catch (error: unknown) {
      throw new Error(getInvoiceApprovalErrorMessage(error));
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

export default useInvoiceApproval;

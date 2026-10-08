import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth-service";

type AuthStatus = "loading" | "authenticated" | "error";

export function useAuthBootstrap() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status !== "loading") return;

    login()
      .then(() => {
        setStatus("authenticated");
        navigate("/dashboard", { replace: true });
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Login gagal.",
        );
        setStatus("error");
      });
  }, [navigate, status]);

  const retry = useCallback(() => {
    setErrorMessage("");
    setStatus("loading");
  }, []);

  return { status, errorMessage, retry };
}

import axios from "axios";
import API_URLS from "@/config/env";
import type { AuthProfile, LoginResponse } from "../types/auth";
import { clearAuthSession, saveAuthSession } from "../utils/auth-storage";

let pendingLogin: Promise<void> | null = null;

async function requestLogin(): Promise<void> {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URLS.sro}auth/login`,
      {
        employee_id: "1907",
        password: "19071907",
      },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.message || "Login gagal.");
    }

    const { user, token, token_type: tokenType } = result.data;
    const session: AuthProfile = {
      department: user.department,
      grade: user.grade,
      sub_department: user.sub_department,
      user: { name: user.name },
      position: user.position,
      employee_id: user.employee_id,
      token,
      token_type: tokenType,
    };

    saveAuthSession(session);
  } catch (error: unknown) {
    clearAuthSession();

    if (axios.isAxiosError<LoginResponse>(error)) {
      const apiMessage = error.response?.data?.message;
      throw new Error(apiMessage || error.message || "Login gagal.");
    }

    throw error;
  }
}

export function login(): Promise<void> {
  if (!pendingLogin) {
    pendingLogin = requestLogin().catch((error: unknown) => {
      clearAuthSession();
      pendingLogin = null;
      throw error;
    });
  }

  return pendingLogin;
}

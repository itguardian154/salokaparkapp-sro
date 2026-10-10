import { useAuthBootstrap } from "../hooks/use-auth";
import { useEffect, type ReactNode } from "react";
import Swal from "sweetalert2";

type AuthBootstrapProps = {
  children: ReactNode;
};

export default function AuthBootstrap({
  children,
}: AuthBootstrapProps) {
  const { status, errorMessage } = useAuthBootstrap();

  useEffect(() => {
    if (status === "loading") {
      Swal.fire({
        title: "Sedang diproses..",
        text: "Jangan tutup halaman ini. Tunggu sampai berhasil masuk ke halaman.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      return;
    }

    if (status === "error") {
      Swal.fire({
        icon: "error",
        title: `Oops ${errorMessage}...`,
        text: "Terjadi kesalahan, harap hubungi developer.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "https://salokapark.app/salokaparkapp";
      });

      return;
    }

    Swal.close();
  }, [status, errorMessage]);

  if (status !== "authenticated") {
    return null;
  }

  return children;
}
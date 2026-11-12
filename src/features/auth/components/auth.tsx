
import { useAuthBootstrap } from "../hooks/use-auth";
import { useEffect, useState, type ReactNode } from "react";
import Swal from "sweetalert2";

type AuthBootstrapProps = {
  children: ReactNode;
};

const LOGIN_LOADING_KEY = "sro_login_loading_shown";

export default function AuthBootstrap({
  children,
}: AuthBootstrapProps) {
  const { status, errorMessage } = useAuthBootstrap();

  const [minimumLoadingDone, setMinimumLoadingDone] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Tampilkan loading hanya jika belum pernah ditampilkan pada sesi ini
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(LOGIN_LOADING_KEY);

    if (!alreadyShown) {
      sessionStorage.setItem(LOGIN_LOADING_KEY, "true");

      setMinimumLoadingDone(false);
      setShowLoading(true);

      const timer = setTimeout(() => {
        setMinimumLoadingDone(true);
      }, 4000);

      return () => clearTimeout(timer);
    }

    setShowLoading(false);
    setMinimumLoadingDone(true);
  }, []);

  // Handle authentication error
  useEffect(() => {
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
    }
  }, [status, errorMessage]);

  // Transisi loading ke dashboard
  useEffect(() => {
    if (status !== "authenticated" || !minimumLoadingDone) {
      return;
    }

    if (!showLoading) {
      setShowDashboard(true);
      return;
    }

    setFadeOut(true);

    const timer = setTimeout(() => {
      setShowLoading(false);

      requestAnimationFrame(() => {
        setShowDashboard(true);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [status, minimumLoadingDone, showLoading]);

  // Kunci scroll selama loading dan transisi
  useEffect(() => {
    const isTransitioning = showLoading || !showDashboard;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (isTransitioning) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showLoading, showDashboard]);

  if (status === "error") {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* DASHBOARD */}
      {status === "authenticated" && (
        <div
          className={`
            min-h-screen w-full
            transition-all duration-1000 ease-out
            ${
              showDashboard
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-3 scale-[0.99] opacity-0"
            }
          `}
        >
          {children}
        </div>
      )}

      {/* LOADING SCREEN */}
      {showLoading && (
        <div
          className={`
            fixed inset-0 z-[99999]
            h-[100dvh] w-screen overflow-hidden
            bg-black
            transition-all duration-[800ms] ease-in-out
            ${
              fadeOut
                ? "scale-105 opacity-0"
                : "scale-100 opacity-100"
            }
          `}
        >
          <video
            src="/img/logo-sro.webm"
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

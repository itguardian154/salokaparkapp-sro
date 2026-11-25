
import { useAuthBootstrap } from "../hooks/use-auth";
import { useEffect, useState, type ReactNode } from "react";
import Swal from "sweetalert2";

type AuthBootstrapProps = {
  children: ReactNode;
};

const LOGIN_LOADING_KEY = "sro_login_loading_shown";
const MOBILE_BREAKPOINT = "(max-width: 767px)";

export default function AuthBootstrap({
  children,
}: AuthBootstrapProps) {
  const { status, errorMessage } = useAuthBootstrap();

  const hasShownLoading = !!sessionStorage.getItem(LOGIN_LOADING_KEY);

  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_BREAKPOINT).matches
  );

  const [showLoading, setShowLoading] = useState(
    () => !hasShownLoading
  );

  const [minimumLoadingDone, setMinimumLoadingDone] = useState(
    () => hasShownLoading
  );

  const [fadeOut, setFadeOut] = useState(false);
  const [showDashboard, setShowDashboard] = useState(hasShownLoading);
  const [isFirstLoading, setIsFirstLoading] = useState(!hasShownLoading);

  // Deteksi ukuran layar untuk menentukan video
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Tampilkan loading pertama kali SRO dibuka
  useEffect(() => {
    if (!showLoading) return;

    sessionStorage.setItem(LOGIN_LOADING_KEY, "true");

    const timer = setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 4000);

    return () => clearTimeout(timer);
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
        window.location.href =
          "https://salokapark.app/salokaparkapp";
      });
    }
  }, [status, errorMessage]);

  // Transisi loading ke dashboard
  useEffect(() => {
    if (status !== "authenticated" || !minimumLoadingDone) {
      return;
    }

    // Refresh: langsung tampilkan dashboard tanpa animasi
    if (!showLoading) {
      setShowDashboard(true);
      return;
    }

    // Pertama kali: gunakan transisi loading
    setFadeOut(true);

    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowDashboard(true);
      setIsFirstLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [status, minimumLoadingDone, showLoading]);

  // Kunci scroll hanya selama loading dan transisi
  useEffect(() => {
    const isTransitioning = showLoading || !showDashboard;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousBodyHeight = body.style.height;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    if (isTransitioning) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";

      html.style.height = "100%";
      body.style.height = "100%";

      html.style.overscrollBehavior = "none";
      body.style.overscrollBehavior = "none";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;

      html.style.height = previousHtmlHeight;
      body.style.height = previousBodyHeight;

      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [showLoading, showDashboard]);

  if (status === "error") {
    return null;
  }

  const videoSrc = isMobile
    ? "/img/logo-sro-potrait.webm"
    : "/img/logo-sro.webm";

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden">
      {/* DASHBOARD */}
      {status === "authenticated" && (
        <div
          className={`
            min-h-[100dvh] w-full
            ${
              isFirstLoading
                ? `transition-all duration-1000 ease-out ${
                    showDashboard
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-3 scale-[0.99] opacity-0"
                  }`
                : "translate-y-0 scale-100 opacity-100"
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
            h-screen h-[100dvh] w-full
            overflow-hidden bg-black
            transition-all duration-[800ms] ease-in-out
            ${
              fadeOut
                ? "scale-105 opacity-0"
                : "scale-100 opacity-100"
            }
          `}
        >
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={(event) => {
              console.error(
                "SRO loading video error:",
                videoSrc,
                event.currentTarget.error
              );
            }}
            className="
              absolute inset-0
              block h-full w-full
              object-cover object-center
            "
          />
        </div>
      )}
    </div>
  );
}

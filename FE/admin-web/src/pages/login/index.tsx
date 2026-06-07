import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuthSession } from "@/features/auth";

export function LoginPage() {
  const { loginAsAdmin, loginAsUser, role } = useAdminAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = getRedirectPath(location.state);
  const [shouldRedirectUser, setShouldRedirectUser] = useState(false);

  useEffect(() => {
    if (role === "ADMIN") {
      navigate(redirectTo, { replace: true });
    }

    if (role === "USER" && shouldRedirectUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, role, shouldRedirectUser]);

  const onUserLogin = () => {
    setShouldRedirectUser(true);
    loginAsUser();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">onehand.sales admin</p>
        <h1 className="mt-3 text-2xl font-semibold">관리자 로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Auth 목표 작업에서 관리자 role 검증을 연결합니다.
        </p>
        <div className="mt-6 grid gap-2">
          <button
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground"
            onClick={loginAsAdmin}
            type="button"
          >
            관리자로 계속
          </button>
          <button
            className="h-10 w-full rounded-md border bg-white text-sm font-medium hover:bg-muted"
            onClick={onUserLogin}
            type="button"
          >
            일반 사용자로 계속
          </button>
        </div>
      </section>
    </main>
  );
}

function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/";
}

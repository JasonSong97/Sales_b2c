import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalShellSize = "sm" | "md" | "lg" | "xl";
type ModalShellPlacement = "center" | "top" | "bottom";

type ModalShellProps = {
  readonly open: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: ModalShellSize;
  readonly placement?: ModalShellPlacement;
  readonly closeLabel?: string;
  readonly showCloseButton?: boolean;
  readonly panelClassName?: string;
  readonly bodyClassName?: string;
  readonly footerClassName?: string;
  readonly closeButtonClassName?: string;
  readonly onOpenChange: (open: boolean) => void;
};

const sizeClassNames: Record<ModalShellSize, string> = {
  sm: "max-w-[420px]",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const placementClassNames: Record<ModalShellPlacement, string> = {
  center: "place-items-center",
  top: "items-start justify-center pt-14 md:pt-24",
  bottom: "items-end justify-center pb-4 md:items-center md:pb-6",
};

// 기능 : 공통 모달 overlay, panel, header, body, footer 문법을 제공합니다.
export function ModalShell({
  open,
  title,
  description,
  children,
  footer,
  size = "md",
  placement = "center",
  closeLabel = "모달 닫기",
  showCloseButton = true,
  panelClassName,
  bodyClassName,
  footerClassName,
  closeButtonClassName,
  onOpenChange,
}: ModalShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]",
        placementClassNames[placement]
      )}
    >
      <section
        aria-labelledby={title ? "modal-shell-title" : undefined}
        aria-modal="true"
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-lg border bg-white shadow-xl",
          sizeClassNames[size],
          panelClassName
        )}
        role="dialog"
      >
        {showCloseButton ? (
          <button
            aria-label={closeLabel}
            className={cn(
              "absolute right-4 top-4 z-10 grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-white text-muted-foreground hover:bg-muted",
              closeButtonClassName
            )}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {title || description ? (
          <header className="border-b px-5 py-4 pr-16">
            {title ? (
              <h2 className="text-lg font-semibold" id="modal-shell-title">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </header>
        ) : null}

        <div className={cn("overflow-y-auto px-5 py-5", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <footer
            className={cn(
              "flex justify-end gap-2 border-t px-5 py-4",
              footerClassName
            )}
          >
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

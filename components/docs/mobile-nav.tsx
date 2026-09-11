"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

/**
 * The sidebar as a drawer on small screens. A native modal <dialog> gives
 * focus containment, Escape to close, and an inert page behind it.
 */
export function MobileNav({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="icon-button lg:hidden"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <MenuIcon width={18} height={18} />
      </button>
      <dialog
        ref={dialogRef}
        className="drawer"
        aria-label="Navigation"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="drawer-inner">
          <div className="drawer-header">
            <span className="drawer-title">Docs</span>
            <button
              type="button"
              className="icon-button"
              aria-label="Close navigation"
              onClick={() => dialogRef.current?.close()}
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}

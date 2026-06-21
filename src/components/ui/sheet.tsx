"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Sheet — a right-anchored slide-over built on the Base UI Dialog. Used for
 *  detail drawers (contacts, etc.). */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="bg-ink/40 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 fixed inset-0 z-50 backdrop-blur-[2px] duration-200" />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "shadow-card-lg data-closed:animate-out data-closed:slide-out-to-right data-open:animate-in data-open:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white duration-200 outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="text-text-2 hover:bg-paper absolute top-4 right-4 grid size-8 place-items-center rounded-[10px] transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-[18px]" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border-line border-b px-6 py-5", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-lg font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn("text-text-2 text-sm", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-5", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-line flex items-center justify-end gap-2 border-t px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
};

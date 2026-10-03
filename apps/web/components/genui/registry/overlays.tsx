"use client";

import { type BaseComponentProps, useStateBinding } from "@json-render/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";

import type { CommandComponentProps } from "@/lib/genui/catalog/definitions";

export const overlayComponents = {
  Sheet: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Sheet">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <Sheet onOpenChange={(value) => setOpen(value)} open={open ?? false}>
        <SheetContent side={props.side ?? "right"}>
          <SheetHeader>
            <SheetTitle>{props.title}</SheetTitle>
            {props.description ? (
              <SheetDescription>{props.description}</SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="p-4">{children}</div>
        </SheetContent>
      </Sheet>
    );
  },

  AlertDialog: ({
    props,
    emit,
  }: BaseComponentProps<CommandComponentProps<"AlertDialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <AlertDialog
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) emit("cancel");
        }}
        open={open ?? false}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            {props.description ? (
              <AlertDialogDescription>
                {props.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {props.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpen(false);
                emit("confirm");
              }}
            >
              {props.confirmLabel ?? "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};

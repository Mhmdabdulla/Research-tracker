import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { closeModal } from "../../store/modalSlice";
import { AlertCircle, Info, X } from "lucide-react";

export const ConfirmModal: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, title, message, confirmText, cancelText, type } = useSelector(
    (state: RootState) => state.modal
  );

  const onConfirm = () => {
    window.dispatchEvent(new CustomEvent("confirm-modal-result", { detail: true }));
    dispatch(closeModal());
  };

  const onCancel = useCallback(() => {
    window.dispatchEvent(new CustomEvent("confirm-modal-result", { detail: false }));
    dispatch(closeModal());
  }, [dispatch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  type === "danger"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {type === "danger" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </div>
              <button
                onClick={onCancel}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="rounded-xl px-4 py-2 text-sm font-medium border hover:bg-accent transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${
                  type === "danger" ? "bg-red-600" : "bg-primary"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

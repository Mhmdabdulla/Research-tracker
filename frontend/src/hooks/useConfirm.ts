import { useDispatch } from "react-redux";
import { showModal, type ModalType } from "../store/modalSlice";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
}

export const useConfirm = () => {
  const dispatch = useDispatch();

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      dispatch(
        showModal({
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          type: options.type || "info",
        })
      );

      const handleResult = (event: Event) => {
        const customEvent = event as CustomEvent<boolean>;
        resolve(customEvent.detail);
        window.removeEventListener("confirm-modal-result", handleResult);
      };

      window.addEventListener("confirm-modal-result", handleResult);
    });
  };

  return { confirm };
};

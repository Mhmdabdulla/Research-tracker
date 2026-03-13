import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

export type ModalType = "danger" | "info";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: ModalType;
}

const initialState: ModalState = {
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  type: "info",
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (
      state,
      action: PayloadAction<Omit<ModalState, "isOpen">>
    ) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.confirmText = action.payload.confirmText || "Confirm";
      state.cancelText = action.payload.cancelText || "Cancel";
      state.type = action.payload.type || "info";
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { showModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;

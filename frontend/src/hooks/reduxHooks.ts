// src/hooks/reduxHooks.ts
// Always use these instead of plain useDispatch / useSelector
// to get full TypeScript inference without casting everywhere.

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
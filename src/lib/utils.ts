import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ActionResult } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorResponse(message: string, errors?: Record<string, string[]>): ActionResult<any> {
  return { success: false, message, errors };
}

export function successResponse<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}
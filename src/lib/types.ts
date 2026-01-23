// Discriminated union type for action results
export type SuccessResult<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResult = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type ActionResult<T = void> = SuccessResult<T> | ErrorResult;

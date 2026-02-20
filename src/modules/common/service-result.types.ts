export type ServiceError<Status extends number = number, Code extends string = string> = {
  ok: false
  status: Status
  code: Code
  message: string
}

export type ServiceSuccess<T> = {
  ok: true
  data: T
}

export type ServiceResult<
  T,
  Status extends number = number,
  Code extends string = string
> = ServiceSuccess<T> | ServiceError<Status, Code>

export type ServiceGuardResult<Status extends number = number, Code extends string = string> =
  | { ok: true }
  | ServiceError<Status, Code>

export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'

export const isArray = Array.isArray

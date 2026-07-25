export function messageFor(error) {
  console.error(error);
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

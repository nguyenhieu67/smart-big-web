export function LoadingSpinner() {
  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}

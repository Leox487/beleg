export function FormError({
  children,
  className = "form-error",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p className={className} role="alert" aria-live="polite">
      {children}
    </p>
  );
}

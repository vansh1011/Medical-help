export default function Spinner({ size = 5 }) {
  return (
    <span
      className={`inline-block h-${size} w-${size} animate-spin rounded-full border-2 border-brand-500 border-t-transparent`}
      aria-label="Loading"
    />
  );
}

import { formatCOP, formatNumber } from "@/lib/format";

type Props = {
  value: number;
  /** "+" para recargos. */
  prefix?: string;
  className?: string;
};

export function Price({ value, prefix = "", className = "" }: Props) {
  return (
    <span className={`whitespace-nowrap tabular-nums ${className}`}>
      <span aria-hidden="true">
        {prefix}
        {formatCOP(value)}
      </span>
      <span className="sr-only">
        {prefix === "+" ? "más " : ""}
        {formatNumber(value)} pesos
      </span>
    </span>
  );
}

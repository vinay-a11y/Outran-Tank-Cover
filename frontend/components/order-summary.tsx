import { formatINR } from "@/lib/utils";

type OrderSummaryProps = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  lineCount?: number;
  totalLabel?: string;
  children?: React.ReactNode;
};

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  lineCount,
  totalLabel = "Total Amount",
  children,
}: OrderSummaryProps) {
  return (
    <>
      <div className="mt-5 grid gap-3 border-b border-border-primary pb-5 text-sm">
        <div className="flex justify-between">
          <span>Subtotal{lineCount !== undefined ? ` (${lineCount} lines)` : ""}</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Savings</span>
            <span>-{formatINR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <span className="font-black uppercase">{totalLabel}</span>
        <span className="text-3xl font-black text-accent-primary">{formatINR(total)}</span>
      </div>
      {children}
    </>
  );
}

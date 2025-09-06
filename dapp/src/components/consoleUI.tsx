import React from "react";
import { cx } from "@/utils/helpers";

export type SectionId =
  | "explorer"
  | "query"
  | "create"
  | "collections"
  | "settings";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};
export const Button: React.FC<BtnProps> = ({
  className,
  children,
  variant = "primary",
  size = "md",
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  const styles = {
    primary:
      "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50",
    secondary:
      "bg-neutral-700 text-white hover:bg-neutral-600 disabled:opacity-50",
    ghost:
      "bg-transparent text-neutral-300 hover:bg-neutral-900 border border-neutral-800 disabled:opacity-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50",
  } as const;
  const sizes = { sm: "px-2.5 py-1.5", md: "px-3 py-2" } as const;
  return (
    <button
      className={cx(base, styles[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...rest }, ref) => (
  <input
    ref={ref as any}
    className={cx(
      "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none",
      "focus:ring-2 focus:ring-white/10 placeholder:text-neutral-500",
      className
    )}
    {...rest}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea
    ref={ref as any}
    className={cx(
      "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none",
      "focus:ring-2 focus:ring-white/10 min-h-[140px] placeholder:text-neutral-500",
      className
    )}
    {...rest}
  />
));
Textarea.displayName = "Textarea";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  children,
  ...rest
}) => (
  <label
    className={cx("text-xs font-medium text-neutral-400", className)}
    {...rest}
  >
    {children}
  </label>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div
    className={cx(
      "rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div className={cx("p-4 border-b border-neutral-800", className)} {...rest}>
    {children}
  </div>
);
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...rest
}) => (
  <h3
    className={cx("text-base font-semibold text-neutral-100", className)}
    {...rest}
  >
    {children}
  </h3>
);
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div className={cx("p-4", className)} {...rest}>
    {children}
  </div>
);

export const Badge: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "neutral" | "success" | "danger" | "warning" | "outline";
  }
> = ({ className, tone = "outline", children, ...rest }) => {
  const tones = {
    neutral: "bg-neutral-800 text-neutral-200 border border-neutral-700",
    success: "bg-emerald-600/20 text-emerald-300 border border-emerald-700/40",
    danger: "bg-rose-600/20 text-rose-300 border border-rose-700/40",
    warning: "bg-amber-500/20 text-amber-200 border border-amber-600/40",
    outline: "bg-transparent text-neutral-300 border border-neutral-700",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px]",
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};

export const HeaderStat: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
    <div className="text-neutral-500">{label}</div>
    <div className="text-neutral-100 font-mono">{value || "—"}</div>
  </div>
);

export const SidebarLink: React.FC<{
  section: SectionId;
  setSection: (s: SectionId) => void;
  id: SectionId;
  label: string;
}> = ({ section, setSection, id, label }) => (
  <button
    className={cx(
      "w-full text-left px-3 py-2 rounded-lg text-sm",
      section === id
        ? "bg-neutral-800 text-white"
        : "hover:bg-neutral-900 text-neutral-300"
    )}
    onClick={() => setSection(id)}
  >
    {label}
  </button>
);

export const QueryBar: React.FC<{
  value: string;
  setValue: (v: string) => void;
  onRun: () => void;
  connected: boolean;
  placeholder?: string;
  extra?: React.ReactNode;
}> = ({ value, setValue, onRun, connected, placeholder, extra }) => (
  <Card>
    <CardHeader>
      <CardTitle>Query</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
      <div>
        <Label>Expression</Label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? 'type = "message"'}
        />
      </div>
      <Button variant="primary" onClick={onRun} disabled={!connected}>
        Run
      </Button>
      {extra || (
        <Button variant="ghost" onClick={() => setValue("")}>
          Clear
        </Button>
      )}
    </CardContent>
  </Card>
);

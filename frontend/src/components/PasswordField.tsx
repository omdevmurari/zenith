import { useState } from "react";

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export default function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
  className = "",
  inputClassName = "",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-950/80 px-5 py-4 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${inputClassName}`}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-300"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

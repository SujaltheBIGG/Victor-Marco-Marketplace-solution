"use client"
import { Input } from "@/components/atoms"
import { cn } from "@/lib/utils"
import { FieldError } from "react-hook-form"

type LabeledInputProps = {
  label: string
  error?: FieldError
} & React.InputHTMLAttributes<HTMLInputElement>

export const LabeledInput = ({
  error,
  label,
  className,
  ...props
}: LabeledInputProps) => (
  <label className={cn("block", className)}>
    <p className={cn("ui-label mb-2 text-eyebrow text-fg", error && "text-negative")}>{label}</p>
    <Input error={!!error} {...props} />
    {error && <p className="label-sm text-negative">{error.message}</p>}
  </label>
)

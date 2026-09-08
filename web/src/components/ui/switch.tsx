"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchProps = {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: "sm" | "default"
  name?: string
}

function Switch({
  id,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
  size = "default",
  name,
}: SwitchProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const checked = checkedProp ?? uncontrolled

  function toggle() {
    if (disabled) return
    const next = !checked
    if (checkedProp === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      name={name}
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        size === "default" ? "h-5 w-9" : "h-4 w-7",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm transition-transform duration-200",
          size === "default" ? "size-4" : "size-3",
          checked
            ? size === "default"
              ? "translate-x-[18px]"
              : "translate-x-[14px]"
            : "translate-x-0.5"
        )}
      />
    </button>
  )
}

export { Switch }

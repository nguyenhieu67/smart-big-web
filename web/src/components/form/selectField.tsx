"use client";

import { useLayoutEffect, useState } from "react";

import { ChevronUpIcon } from "@/components/icons";
import { useClickOutside } from "@/hooks";

import { FormGroup, SIZE_STYLES, type FieldSize } from "./formGroup";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  error?: string;
  size?: FieldSize;
  className?: string;
}

const OPTION_HEIGHT = 36;
const MAX_MENU_HEIGHT = 240;

// Vùng nhìn thấy thực tế của ô chọn: tổ tiên cuộn/cắt gần nhất (vd. modal), nếu không có thì viewport
function getVisibleBounds(el: HTMLElement) {
  let top = 0;
  let bottom = window.innerHeight;
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "hidden"
    ) {
      const rect = node.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
  }
  return { top, bottom };
}

export function SelectField({
  label,
  id,
  name,
  options,
  value = "",
  placeholder = "Chọn...",
  onChange,
  error,
  size = "md",
  className = "",
}: SelectFieldProps) {
  const { isOpen, setIsOpen, ref } = useClickOutside<HTMLDivElement>();
  const [openUpward, setOpenUpward] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const bounds = getVisibleBounds(ref.current);
    const menuHeight = Math.min(
      options.length * OPTION_HEIGHT + 8,
      MAX_MENU_HEIGHT,
    );
    const spaceBelow = bounds.bottom - rect.bottom;
    const spaceAbove = rect.top - bounds.top;
    setOpenUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
  }, [isOpen, ref, options.length]);

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <FormGroup label={label} htmlFor={id} error={error}>
      <div ref={ref} className="relative w-full">
        {name && <input type="hidden" name={name} value={value} />}
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-surface flex w-full items-center justify-between rounded-xl border px-3 transition-all focus:ring-1 focus:outline-none ${SIZE_STYLES[size]} ${
            error
              ? "border-danger focus:border-danger focus:ring-danger"
              : "border-line focus:border-ring focus:ring-ring"
          } ${className}`}
        >
          <span
            className={`truncate ${selectedOption ? "text-fg" : "text-fg-subtle"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronUpIcon
            size="xs"
            className={`text-fg-subtle transition-transform duration-200 ${
              isOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className={`border-line bg-surface absolute left-0 z-50 max-h-60 w-full overflow-y-auto rounded-xl border py-1 shadow-lg ${
              openUpward ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"
            }`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-fg-body hover:bg-surface-hover"
                  }`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FormGroup>
  );
}

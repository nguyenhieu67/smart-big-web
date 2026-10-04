"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ChevronUpIcon } from "@/components/icons";

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
const GAP = 4; // khoảng cách giữa ô chọn và danh sách
const EDGE = 8; // chừa mép màn hình

interface MenuPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

// Danh sách hiển thị bằng position: fixed theo màn hình (qua portal) nên không bị cắt bởi
// overflow của card / modal. Đủ chỗ phía dưới thì mở xuống, thiếu chỗ thì mở lên trên.
function computePosition(
  trigger: HTMLElement,
  optionCount: number,
): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(optionCount * OPTION_HEIGHT + 8, MAX_MENU_HEIGHT);
  const below = window.innerHeight - rect.bottom - EDGE - GAP;
  const above = rect.top - EDGE - GAP;

  if (below < menuHeight && above > below) {
    return {
      left: rect.left,
      width: rect.width,
      bottom: window.innerHeight - rect.top + GAP,
      maxHeight: Math.min(MAX_MENU_HEIGHT, above),
    };
  }
  return {
    left: rect.left,
    width: rect.width,
    top: rect.bottom + GAP,
    maxHeight: Math.min(MAX_MENU_HEIGHT, below),
  };
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
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const isOpen = position !== null;

  const selectedOption = options.find((opt) => opt.value === value);

  const close = () => setPosition(null);

  const toggle = () => {
    if (isOpen) return close();
    if (triggerRef.current) {
      setPosition(computePosition(triggerRef.current, options.length));
    }
  };

  // Khi mở: đóng khi bấm ra ngoài / nhấn Esc, và định vị lại khi cuộn hoặc đổi cỡ cửa sổ
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setPosition(null);
    };
    // Esc chỉ đóng danh sách, không lan lên đóng modal chứa nó
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setPosition(null);
    };
    const reposition = () => {
      if (triggerRef.current) {
        setPosition(computePosition(triggerRef.current, options.length));
      }
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true); // bắt cả cuộn trong modal / bảng

    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen, options.length]);

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { name, value: optionValue } });
    close();
  };

  return (
    <FormGroup label={label} htmlFor={id} error={error}>
      <div className="relative w-full">
        {name && <input type="hidden" name={name} value={value} />}
        <button
          ref={triggerRef}
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={toggle}
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

        {position &&
          createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              style={{
                position: "fixed",
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
                maxHeight: position.maxHeight,
              }}
              className="bg-surface border-line shadow-pop z-[100] overflow-y-auto rounded-xl border py-1"
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
            </ul>,
            document.body,
          )}
      </div>
    </FormGroup>
  );
}

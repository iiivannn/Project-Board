"use client";

import { useState, useRef, useEffect } from "react";

type ProjectOption = {
  value: string;
  label: string;
  status: string;
};

type Props = {
  options: ProjectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  complete: "Complete",
  obsolete: "Obsolete",
};

export default function ProjectSelect({
  options,
  value,
  onChange,
  placeholder = "-- Choose a project --",
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`custom-select__trigger${open ? " open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="custom-select__trigger-content">
          {selected ? (
            <>
              <span
                className="custom-select__dot"
                style={{ backgroundColor: `var(--col-${selected.status})` }}
              />
              <span className="custom-select__label">{selected.label}</span>
            </>
          ) : (
            <span className="custom-select__placeholder">{placeholder}</span>
          )}
        </span>

        <svg
          className={`custom-select__chevron${open ? " open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="custom-select__dropdown" role="listbox">
          <li
            className={`custom-select__option custom-select__option--placeholder${
              value === "" ? " selected" : ""
            }`}
            role="option"
            aria-selected={value === ""}
            onClick={() => handleSelect("")}
          >
            {placeholder}
          </li>

          {options.map((option) => (
            <li
              key={option.value}
              className={`custom-select__option${
                option.value === value ? " selected" : ""
              }`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              <span
                className="custom-select__dot"
                style={{ backgroundColor: `var(--col-${option.status})` }}
              />
              <span className="custom-select__option-label">{option.label}</span>
              <span
                className={`custom-select__status-tag custom-select__status-tag--${option.status}`}
              >
                {STATUS_LABELS[option.status] ?? option.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

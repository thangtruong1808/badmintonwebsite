import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  error?: string;
  id?: string;
}

export const TextInput: React.FC<InputProps> = ({
  label,
  error,
  id,
  ...props
}) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-calibri text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-calibri text-gray-800 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        {...props}
      />
      {error && (
        <p className="font-calibri text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const NumberInput: React.FC<
  InputProps & { type?: "number" | "text" }
> = ({ label, error, id, ...props }) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-calibri text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-calibri text-gray-800 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        {...props}
      />
      {error && (
        <p className="font-calibri text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  id,
  ...props
}) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-calibri text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-calibri text-gray-800 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="font-calibri text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string;
  error?: string;
  id?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  id,
  ...props
}) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-calibri text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-calibri text-gray-800 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        {...props}
      />
      {error && (
        <p className="font-calibri text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  ...props
}) => {
  const inputId = id ?? props.name;
  return (
    <div className="flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className="font-calibri text-sm text-gray-700"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export const FormActions: React.FC<{
  onCancel: () => void;
  submitLabel?: string;
}> = ({ onCancel, submitLabel = "Save" }) => (
  <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
    <button
      type="button"
      onClick={onCancel}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-calibri text-gray-700 hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
    >
      {submitLabel}
    </button>
  </div>
);

import PropTypes from "prop-types";

// Shared building blocks for the admin screens. The public site is airy on
// purpose; this is a tool, so it runs denser and leans on hairlines and mono
// labels to keep a lot of controls legible in one view.

export const Panel = ({ title, description, action, children }) => (
  <section className="border border-rule bg-paper">
    {(title || action) && (
      <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
        <div>
          {title ? <h2 className="text-lg text-ink">{title}</h2> : null}
          {description ? (
            <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const Field = ({ label, hint, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-meta uppercase text-ink-muted">
      {label}
    </label>
    {children}
    {hint ? <p className="mt-1.5 text-meta text-ink-muted">{hint}</p> : null}
  </div>
);

const inputBase =
  "w-full border border-rule bg-paper px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink-muted hover:border-ink-muted focus:border-accent disabled:opacity-50";

export const Input = (props) => <input {...props} className={inputBase} />;

export const Select = ({ children, ...props }) => (
  <select {...props} className={inputBase}>
    {children}
  </select>
);

export const Textarea = ({ rows = 4, ...props }) => (
  <textarea {...props} rows={rows} className={`${inputBase} resize-y leading-relaxed`} />
);

export const Button = ({ variant = "secondary", className = "", children, ...props }) => {
  const styles = {
    primary: "bg-ink text-paper hover:bg-accent",
    secondary: "border border-rule text-ink hover:border-ink hover:bg-surface",
    danger: "border border-accent text-accent hover:bg-accent hover:text-paper",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// One status line, coloured by kind. The old admin printed every message in
// the accent colour, so "Signed in." looked exactly like a failure.
export const Status = ({ status }) => {
  if (!status?.message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm ${status.kind === "error" ? "text-accent" : "text-ink-muted"}`}
    >
      {status.message}
    </p>
  );
};

Panel.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node,
};
Field.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  htmlFor: PropTypes.string,
  children: PropTypes.node,
};
Select.propTypes = { children: PropTypes.node };
Textarea.propTypes = { rows: PropTypes.number };
Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  className: PropTypes.string,
  children: PropTypes.node,
};
Status.propTypes = {
  status: PropTypes.shape({ kind: PropTypes.string, message: PropTypes.string }),
};

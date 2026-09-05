import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "../components/Section";
import { EMAIL, SOCIAL } from "../config";


const LINKS = [
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "LinkedIn",
    value: "felicia-angel",
    href: SOCIAL.linkedin,
  },
  { label: "GitHub", value: "Feliciaangel21", href: SOCIAL.github },
];

const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
];

const validate = ({ name, email, message }) => {
  const errors = {};
  if (!name.trim()) errors.name = "Please enter your name.";
  if (!email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "That email address does not look right.";
  if (!message.trim()) errors.message = "Please write a message.";
  return errors;
};

const EMPTY = { name: "", email: "", message: "" };

const ContactPage = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  const isSending = state === "sending";

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) setErrors(validate(next));
  };

  // Validate on blur rather than on every keystroke: correcting someone
  // halfway through typing their own email address is hostile.
  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(formData);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(nextErrors).length) return;

    setState("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "New message from your portfolio",
          _captcha: "false",
          _template: "table",
          ...formData,
        }),
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      setFormData(EMPTY);
      setTouched({});
      setState("sent");
    } catch (caught) {
      console.error("Error submitting contact form:", caught);
      setErrorMessage(`Could not send. Please email ${EMAIL} directly.`);
      setState("error");
    }
  };

  const fieldClass = (name) => {
    const invalid = errors[name] && touched[name];
    return `w-full border bg-surface px-3.5 py-3 text-base text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink-muted focus:border-accent focus:bg-paper disabled:opacity-50 ${
      invalid ? "border-accent" : "border-rule hover:border-ink-muted"
    }`;
  };

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <SectionHeading title="Contact" />

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* A sent message is the single outcome this page exists for, so it
                replaces the form rather than being announced by a small grey
                line beside the button. */}
            {state === "sent" ? (
              <div className="border border-rule bg-surface p-8">
                <span className="grid h-10 w-10 place-items-center border border-accent text-accent">
                  <Check className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl text-ink">Message sent</h3>
                <p className="mt-3 max-w-prose text-ink-body">
                  Thanks for getting in touch. I will reply to the address you gave as
                  soon as I can.
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="link-underline mt-6 text-sm text-ink-body transition-colors duration-150 ease-out hover:text-accent"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {FIELDS.map(({ name, label, type, autoComplete }) => (
                    <div key={name}>
                      {/* Label above the input, never a placeholder standing in
                          for one: placeholders vanish the moment you type. */}
                      <label
                        htmlFor={name}
                        className="mb-2 block font-mono text-meta uppercase text-ink"
                      >
                        {label}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type={type}
                        autoComplete={autoComplete}
                        value={formData[name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSending}
                        aria-invalid={Boolean(errors[name] && touched[name])}
                        aria-describedby={
                          errors[name] && touched[name] ? `${name}-error` : undefined
                        }
                        className={fieldClass(name)}
                      />
                      {errors[name] && touched[name] ? (
                        <p id={`${name}-error`} className="mt-2 text-sm text-accent">
                          {errors[name]}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="message"
                    className="mb-2 block font-mono text-meta uppercase text-ink"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="7"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSending}
                    aria-invalid={Boolean(errors.message && touched.message)}
                    aria-describedby={
                      errors.message && touched.message ? "message-error" : undefined
                    }
                    className={`${fieldClass("message")} resize-y leading-relaxed`}
                  />
                  {errors.message && touched.message ? (
                    <p id="message-error" className="mt-2 text-sm text-accent">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="bg-ink px-6 py-3 text-sm text-paper transition-colors duration-150 ease-out hover:bg-accent active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSending ? "Sending" : "Send message"}
                  </button>
                  <p role="status" aria-live="polite" className="text-sm text-accent">
                    {state === "error" ? errorMessage : ""}
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <h3 className="font-mono text-meta uppercase text-ink">Direct</h3>
            <ul className="mt-4 border-t border-rule">
              {LINKS.map(({ label, value, href }) => {
                const external = !href.startsWith("mailto:");
                return (
                  <li key={label} className="border-b border-rule">
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="group flex items-baseline justify-between gap-4 py-3.5"
                    >
                      <span className="font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out group-hover:text-accent">
                        {label}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-body transition-colors duration-150 ease-out group-hover:text-accent">
                        <span className="truncate">{value}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-meta text-ink-muted">
              The form reaches the same inbox as the email address above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

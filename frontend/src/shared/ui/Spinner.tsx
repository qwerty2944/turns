type Props = {
  size?: number;
  label?: string;
  inline?: boolean;
};

export const Spinner = ({ size = 16, label, inline = true }: Props) => {
  const Wrap = inline ? "span" : "div";
  return (
    <Wrap className="spinner-wrap" role="status" aria-live="polite">
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="56"
          strokeDashoffset="14"
        />
      </svg>
      {label && <span className="spinner-label">{label}</span>}
    </Wrap>
  );
};

export const FullPageSpinner = ({ label }: { label?: string }) => (
  <div className="full-page-spinner">
    <Spinner size={48} inline={false} />
    {label && <span className="muted">{label}</span>}
  </div>
);

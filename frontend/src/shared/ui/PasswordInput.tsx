"use client";

import { useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** Password input with an eye toggle to reveal/hide the value. */
export const PasswordInput = (props: Props) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw-wrap">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="pw-eye"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        tabIndex={-1}
      >
        {visible ? "🙈" : "👁"}
      </button>
    </div>
  );
};

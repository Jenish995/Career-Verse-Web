/**
 * OtpInput — A reusable 6-digit OTP input component with:
 *   - Auto-focus on mount
 *   - Auto-advance to next box on digit entry
 *   - Backspace navigates to previous box
 *   - Paste support (paste full 6-digit code)
 *   - Auto-submit callback when all 6 digits are entered
 *
 * Props:
 *   @param {number}   [length=6]     - Number of OTP digits
 *   @param {function} onComplete     - Called with the full OTP string when all digits are entered
 *   @param {boolean}  [disabled]     - Disable all inputs
 *   @param {Array}    [value]        - Controlled value (array of single-char strings)
 *   @param {function} [onChange]     - Called with updated digits array on every change
 */
import React, { useRef, useEffect, useState } from "react";

const OtpInput = ({
  length = 6,
  onComplete,
  disabled = false,
  value: controlledValue,
  onChange: controlledOnChange,
}) => {
  const [internalDigits, setInternalDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Use controlled or uncontrolled mode
  const digits = controlledValue || internalDigits;
  const setDigits = (newDigits) => {
    if (controlledOnChange) {
      controlledOnChange(newDigits);
    } else {
      setInternalDigits(newDigits);
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = async (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    const fullOtp = newDigits.join("");
    if (fullOtp.length === length && onComplete) {
      await onComplete(fullOtp);
    } else if (index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1].focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    }
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (pastedData.length === length) {
      const newDigits = pastedData.split("");
      setDigits(newDigits);
      if (onComplete) {
        await onComplete(pastedData);
      }
    }
  };

  return (
    <div className="otp-container" style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          className="otp-input"
          value={digit}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: "48px",
            height: "48px",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          }}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;

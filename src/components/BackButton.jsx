import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export default function BackButton({ 
  to = -1, 
  variant = "default",
  label = "Back",
  onClick,
  className = ""
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to === -1) {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  const variantStyles = {
    default: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      background: "#f3f4f6",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    ghost: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      background: "transparent",
      color: "#6b7280",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    primary: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "10px 20px",
      background: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    icon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      padding: "0",
      background: "#f3f4f6",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <button
      onClick={handleClick}
      style={style}
      className={`back-button ${variant} ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={variant === "icon" ? 20 : 16} />
      {variant !== "icon" && <span>{label}</span>}
    </button>
  );
}
interface FlagIconProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FlagIcon({ countryCode, size = "sm", className = "" }: FlagIconProps) {
  const sizeClasses = {
    sm: "w-4 h-3 text-xs",
    md: "w-5 h-4 text-sm", 
    lg: "w-6 h-5 text-base"
  };

  const getFlagEmoji = (code: string) => {
    if (code === "XX" || !code) return "🏳️";
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded border border-gray-200 bg-white shadow-sm overflow-hidden flex-shrink-0 ${className}`}
      title={countryCode}
      style={{ minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }}
    >
      {getFlagEmoji(countryCode)}
    </span>
  );
}
interface FlagIconProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FlagIcon({ countryCode, size = "sm", className = "" }: FlagIconProps) {
  const sizeClasses = {
    sm: "w-4 h-3",
    md: "w-6 h-4",
    lg: "w-8 h-6"
  };

  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} text-base leading-none ${className}`}
      title={countryCode}
    >
      {getFlagEmoji(countryCode)}
    </span>
  );
}
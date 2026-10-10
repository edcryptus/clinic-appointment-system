const palette = [
  "bg-mint text-pine",
  "bg-[#E9E4D8] text-[#5A4A2F]",
  "bg-[#E4E9F0] text-[#2F4A5A]",
  "bg-[#F0E3DE] text-[#7A4438]",
  "bg-mint-pale text-pine-deep",
];

function toneFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return palette[h % palette.length];
}

function initialsFor(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, "").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export default function DoctorAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-28 w-28 text-4xl"
      : size === "sm"
        ? "h-11 w-11 text-sm"
        : "h-16 w-16 text-xl";
  return (
    <span
      aria-hidden="true"
      className={`grid ${dims} shrink-0 place-items-center rounded-2xl font-serif-display ring-1 ring-pine/10 ${toneFor(name)}`}
    >
      {initialsFor(name)}
    </span>
  );
}

import { brand } from "../config/brand";

function MessengerIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.522 3.771 8.564.195.168.312.391.325.635l.065 1.977c.021.646.686 1.067 1.265.793l2.206-1.031c.168-.078.36-.091.533-.037.997.301 2.261.464 3.473.464 6.76 0 12-4.952 12-11.64C24 4.951 18.76 0 12 0zm7.197 8.755l-3.515 5.586c-.291.462-.937.585-1.376.249l-2.766-2.104c-.098-.075-.212-.113-.329-.113-.142 0-.279.051-.388.15l-.394.355c-.237.212-.593.226-.846.034l-3.54-2.666c-.249-.187-.312-.544-.144-.81l3.515-5.586c.291-.462.937-.585 1.376-.249l2.766 2.104c.098.075.212.113.329.113.142 0 .279-.051.388-.15l.394-.355c.237-.212.593-.226.846-.034l3.54 2.666c.249.187.312.544.144.81z" />
    </svg>
  );
}

export default function MessengerButton({
  label = "Chat on Messenger",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={brand.messengerUrl}
      target="_blank"
      rel="noreferrer"
      className={`btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-[#0084FF] px-6 py-3.5 text-[15px] font-semibold text-white shadow-card hover:bg-[#0073E6] ${className}`}
    >
      <MessengerIcon />
      {label}
    </a>
  );
}

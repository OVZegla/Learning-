import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="Learning+"
        width={160}
        height={40}
        priority
        className="h-8 w-auto dark:invert"
      />
    </div>
  );
}

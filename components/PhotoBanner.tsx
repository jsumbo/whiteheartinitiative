import Image from "next/image";

// Full-bleed photo with a dark green overlay behind a large heading, as in the brochure.
export function PhotoBanner({
  image,
  alt,
  children,
  preload = false,
  className = "min-h-[46vh]",
}: {
  image?: string;
  alt?: string;
  children: React.ReactNode;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative isolate flex items-end overflow-hidden bg-forest text-white ${className}`}>
      {image && (
        <Image
          src={image}
          alt={alt ?? ""}
          fill
          sizes="100vw"
          preload={preload}
          quality={55}
          className="-z-20 object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/65 to-forest/25" />
      <div className="wrap w-full py-10 md:py-16">{children}</div>
    </div>
  );
}

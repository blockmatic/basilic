import Image from "next/image";

interface DiagramProps {
  src?: string;
  alt: string;
  children?: React.ReactNode;
  caption?: string;
  width?: number;
  height?: number;
}

export function Diagram({
  src,
  alt,
  children,
  caption,
  width = 800,
  height = 600,
}: DiagramProps) {
  return (
    <figure className="my-8 flex flex-col items-center">
      {src ? (
        <div className="border-border bg-muted/50 relative w-full max-w-full overflow-hidden rounded-lg border">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-full"
          />
        </div>
      ) : (
        <div className="border-border bg-muted/50 relative w-full max-w-full overflow-hidden rounded-lg border p-8">
          <div className="flex items-center justify-center">{children}</div>
        </div>
      )}
      {caption && (
        <figcaption className="text-muted-foreground mt-4 text-center text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

import React from "react";

type FooterProps = {
  company?: string;
  className?: string;
};

export default function Footer({
  company = "Hubnet Express",
  className = "",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={`bg-background${className}`}>
      <div className="mx-auto w-full max-w-[98vw] px-4 py-6">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          © {year} {company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import type { HTMLAttributes } from "react";
import type { TokenSet } from "../../domain/tokens";
import { brandFontClasses } from "./brand-fonts";
import { brandScopeVars } from "./scope-vars";

interface BrandScopeProps extends HTMLAttributes<HTMLDivElement> {
  tokens: TokenSet;
}

/** The only place brand tokens enter the page. Everything below reads them as --sb-* variables. */
export function BrandScope({ tokens, className = "", style, ...props }: Readonly<BrandScopeProps>) {
  return (
    <div
      {...props}
      data-brand={tokens.brandId}
      className={`${brandFontClasses} ${className}`}
      style={{ ...brandScopeVars(tokens), ...style }}
    />
  );
}

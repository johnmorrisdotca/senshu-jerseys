import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "senshu-jersey": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { cut?: string; colors?: string; number?: number | string; name?: string; turnable?: boolean };
    }
  }
}

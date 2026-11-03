import { useEffect } from "react";

export function SenshuJersey({ cut = "hockey", colors = "#af1e2d,#ffffff,#192168", number = 9 }: { cut?: string; colors?: string; number?: number }) {
  useEffect(() => {
    // The element needs a browser, so it is imported here, never at the top of the file: a server render never reaches an effect.
    void import("@johnmorrisdotca/senshu-jerseys/define");
  }, []);
  return <senshu-jersey cut={cut} colors={colors} number={number} />;
}

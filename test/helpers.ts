// Shared by the tests.

/** Checks that a string is well-formed XML of the kind a drawing makes: tags nest and close, attributes are quoted. */
export function wellFormed(xml: string): string | null {
  const stack: string[] = [];
  const tag = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g;
  let rest = xml;
  let last = 0;
  for (let m = tag.exec(xml); m; m = tag.exec(xml)) {
    const between = xml.slice(last, m.index);
    if (/[<>]/.test(between.replace(/&[a-z]+;/g, ""))) return `stray < or > near ${JSON.stringify(between.slice(0, 40))}`;
    last = m.index + m[0].length;
    if (m[4]) continue;
    if (m[1]) { const open = stack.pop(); if (open !== m[2]) return `</${m[2]}> closes <${open}>`; } else stack.push(m[2]);
  }
  rest = xml.slice(last);
  if (/[<>]/.test(rest)) return "stray < or > at the end";
  return stack.length ? `unclosed <${stack.at(-1)}>` : null;
}

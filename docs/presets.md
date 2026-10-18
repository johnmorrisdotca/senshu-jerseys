# Presets

A preset is a team's uniform of one era written as colours and stripes: the body, the trim, the sleeve, hem and chest bands, the yoke, the collar and the number's colours, with the matching pants, socks and helmet where they are known.
**A preset never draws a crest, a logo, a monogram, a wordmark or a sponsor's mark**, and nothing on it is a team's mark: the chest stays empty or takes the caller's own `crest`. This holds for defunct teams too, whose marks
are still owned and sold today. The colours and the stripe layouts are facts taken from the uniform sections of Wikipedia articles, Wikidata and the clubs' published colour codes and recorded here as data; no picture is copied.
They are an honest reading, not a proof: where a layout could not be said with the stripes the renderer draws, the nearest plain one is used.

Made from the built package by `node scripts/make-presets-doc.mjs`; `pnpm test:readme` checks that it is current. 1541 presets in 14 modules.

## What the one-line spec can say

A preset is a line of colours (body, trim, second trim, number fill, number outline) followed by `key=value` words; `-` skips a colour. The bands are lists of widths and colour indexes joined by dots.

| Word | Option | Reads as |
| --- | --- | --- |
| `ss=`, `hs=`, `cb=` | `sleeveStripes`, `hemStripes`, `chestBand` | A count (`ss=2`) or `Bands`: pairs of a width and a colour (`0` the body, `1` the trim, `2` the second trim, `3` the number's fill), from the cuff or hem inward. |
| `sh=`, `hh=`, `tt=` | `sleeveStripes`, `hemStripes` shrinking, `sleeveTeeth` | `sh=5.9.2.1.10` is five bands from 9 to 2 units wide in colour 1 with gaps of 10 tenths of a band; `tt=58.2.7.9` is teeth in colour 2, seven of them 9 units deep, 58 percent of the way down the sleeve (add `,c` to point them at the cuff). |
| `cf=` | `cuffs` | The sleeve's end in a colour: `cf=18.1` is a cuff 18 units long in the trim (the Canadiens' red tips); `cf=10` is the same with the default colour (the trim). |
| `as=` | `armStripes` | Bands down the length of the sleeve, from the shoulder to the cuff. |
| `y=`, `p=y` | `yoke`, `pattern: "yoke"` | A shoulder yoke (curved, square, pointed or full-arm). |
| `sn=1` | `sleeveNumbers` | The number on the upper arm, where the cut puts it. |
| `ab=` | `armbands` | Armbands: `ab=2.12.30` is a band in the second trim, 12 units wide, 30 percent down the sleeve (an official's); `ab=2` takes the defaults. |
| `pk=1`, `bd=` | `pocket`, `badge` | A chest pocket, and a plain badge spot on it: `r` round, `s` shield, `q` square. |
| `bp=` | `plate` | A plate behind the back's name and number, for lettering over stripes: `bp=1` takes the lighter of the body and the trim, `bp=101010` a colour (with `nf=` the ink on it). |
| `pr=1`, `na=s` | `protector`, `nameArch: "straight"` | An umpire's chest protector; the name set straight, as officials wear it. |
| `co=z`, `co=t` | `collar: "zip"`, `collar: "point"` | A zip collar, and a long-point dress collar (the other collar words are `l` lace-up, `v`, `c` crew, `p` polo, `r` round, `w` wishbone, `b` band). |

**Multi-colour stripe sets** need no new word: a stripe set is a list with a gap and as many bands as you like, in as many colours as there are indexes. The Flames' elbow set of yellow, white and yellow with the red of the body showing between is `ss=20.0.4.1.3.0.8.2.3.0.4.1`: a gap of 20 from the cuff, a yellow band of 4, a gap of 3, a white band of 8, a gap of 3, a yellow band of 4.

**A wide elbow band with thin edges** (the Kraken's) is the same list: `ss=20.0.3.2.14.1.3.2` is a gap of 20, a thin edge of 3 in the second trim, a band of 14 in the trim, another edge. The gap is what moves a stripe from the cuff to the elbow.

**Diagonal chest text** is not in a preset: the team's word on the chest is its wordmark, so presets leave the chest empty. A page draws it with its own text: `frontText: "HOMETOWN", frontTextAngle: "diagonal-up"` (rising to the right) or `"diagonal-down"`.

| Module | Import | Presets |
| --- | --- | --- |
| `NHL_CLASSIC` | `@johnmorrisdotca/senshu-jerseys/presets/nhl-classic` | 208 |
| `NHL` | `@johnmorrisdotca/senshu-jerseys/presets/nhl` | 211 |
| `HOCKEY_NATIONS` | `@johnmorrisdotca/senshu-jerseys/presets/hockey-nations` | 139 |
| `HOCKEY_PATTERNS` | `@johnmorrisdotca/senshu-jerseys/presets/hockey-patterns` | 4 |
| `MLB` | `@johnmorrisdotca/senshu-jerseys/presets/mlb` | 182 |
| `NBA` | `@johnmorrisdotca/senshu-jerseys/presets/nba` | 184 |
| `NFL` | `@johnmorrisdotca/senshu-jerseys/presets/nfl` | 169 |
| `CFL` | `@johnmorrisdotca/senshu-jerseys/presets/cfl` | 66 |
| `IFAF` | `@johnmorrisdotca/senshu-jerseys/presets/cfl` | 10 |
| `SOCCER` | `@johnmorrisdotca/senshu-jerseys/presets/soccer` | 165 |
| `SOCCER_NATIONS` | `@johnmorrisdotca/senshu-jerseys/presets/soccer-nations` | 85 |
| `RUGBY` | `@johnmorrisdotca/senshu-jerseys/presets/rugby` | 54 |
| `OFFICIALS` | `@johnmorrisdotca/senshu-jerseys/presets/officials` | 40 |
| `HOCKEY_STYLES` | `@johnmorrisdotca/senshu-jerseys/presets/hockey-styles` | 24 |

The officials' shirts (`OFFICIALS`, ids that start with `ref:`) are described, with their sources, in [officials.md](./officials.md).

## NHL_CLASSIC

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `nhl:toronto-arenas-1917-1918-home` | Toronto Arenas | 1917-1918 | `#00205b` `#fff` |
| `nhl:toronto-arenas-1918-1919-home` | Toronto Arenas | 1918-1919 | `#00205b` `#fff` |
| `nhl:toronto-stpats-1919-1920-home` | Toronto St. Patricks | 1919-1920 | `#00693c` `#fff` |
| `nhl:toronto-stpats-1920-1921-home` | Toronto St. Patricks | 1920-1921 | `#00693c` `#fff` |
| `nhl:toronto-stpats-1921-1922-home` | Toronto St. Patricks | 1921-1922 | `#00693c` `#fff` |
| `nhl:toronto-stpats-1922-1925-home` | Toronto St. Patricks | 1922-1925 | `#fff` `#00693c` |
| `nhl:toronto-stpats-1925-1926-home` | Toronto St. Patricks | 1925-1926 | `#00693c` `#fff` |
| `nhl:toronto-stpats-1926-1927-home` | Toronto St. Patricks | 1926-1927 | `#00693c` `#fff` |
| `nhl:toronto-1927-home` | Toronto Maple Leafs | 1927 | `#fff` `#00693c` |
| `nhl:toronto-1927-1930-home` | Toronto Maple Leafs | 1927-1930 | `#00205b` `#fff` |
| `nhl:toronto-1927-1930-away` | Toronto Maple Leafs | 1927-1930 | `#fff` `#00205b` |
| `nhl:toronto-1930-1934-home` | Toronto Maple Leafs | 1930-1934 | `#00205b` `#fff` |
| `nhl:toronto-1930-1934-away` | Toronto Maple Leafs | 1930-1934 | `#fff` `#00205b` |
| `nhl:toronto-1934-1937-home` | Toronto Maple Leafs | 1934-1937 | `#00205b` `#fff` |
| `nhl:toronto-1934-1937-away` | Toronto Maple Leafs | 1934-1937 | `#fff` `#00205b` |
| `nhl:toronto-1937-1958-home` | Toronto Maple Leafs | 1937-1958 | `#00205b` `#fff` |
| `nhl:toronto-1937-1958-away` | Toronto Maple Leafs | 1937-1958 | `#fff` `#00205b` |
| `nhl:toronto-1958-1963-home` | Toronto Maple Leafs | 1958-1963 | `#00205b` `#fff` |
| `nhl:toronto-1958-1963-away` | Toronto Maple Leafs | 1958-1963 | `#fff` `#00205b` |
| `nhl:toronto-1963-1967-home` | Toronto Maple Leafs | 1963-1967 | `#00205b` `#fff` |
| `nhl:toronto-1963-1967-away` | Toronto Maple Leafs | 1963-1967 | `#fff` `#00205b` |
| `nhl:montreal-1909-1910-home` | Montreal Canadiens | 1909-1910 | `#192168` `#fff` |
| `nhl:montreal-1910-1911-home` | Montreal Canadiens | 1910-1911 | `#af1e2d` `#0b6b3a` |
| `nhl:montreal-1913-1914-home` | Montreal Canadiens | 1913-1914 | `#fff` `#192168` `#af1e2d` |
| `nhl:montreal-1917-1927-home` | Montreal Canadiens | 1917-1927 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1927-1935-home` | Montreal Canadiens | 1927-1935 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1935-1938-away` | Montreal Canadiens | 1935-1938 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1936-1939-home` | Montreal Canadiens | 1936-1939 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1938-1941-away` | Montreal Canadiens | 1938-1941 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1939-1941-home` | Montreal Canadiens | 1939-1941 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1941-1944-home` | Montreal Canadiens | 1941-1944 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1941-1944-away` | Montreal Canadiens | 1941-1944 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1944-1947-away` | Montreal Canadiens | 1944-1947 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1947-1950-home` | Montreal Canadiens | 1947-1950 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1947-1958-away` | Montreal Canadiens | 1947-1958 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1950-1956-home` | Montreal Canadiens | 1950-1956 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1956-1959-home` | Montreal Canadiens | 1956-1959 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1958-1967-away` | Montreal Canadiens | 1958-1967 | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-1959-1960-home` | Montreal Canadiens | 1959-1960 | `#af1e2d` `#192168` `#fff` |
| `nhl:montreal-1960-1967-home` | Montreal Canadiens | 1960-1967 | `#af1e2d` `#192168` `#fff` |
| `nhl:boston-1924-1925-home` | Boston Bruins | 1924-1925 | `#4a2511` `#ffb81c` |
| `nhl:boston-1925-1926-home` | Boston Bruins | 1925-1926 | `#fff` `#4a2511` `#ffb81c` |
| `nhl:boston-1926-1935-home` | Boston Bruins | 1926-1935 | `#4a2511` `#ffb81c` `#fff` |
| `nhl:boston-1932-1935-away` | Boston Bruins | 1932-1935 | `#fff` `#4a2511` `#ffb81c` |
| `nhl:boston-1935-1938-home` | Boston Bruins | 1935-1938 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1938-1948-home` | Boston Bruins | 1938-1948 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1939-1945-away` | Boston Bruins | 1939-1945 | `#ffb81c` `#000` `#fff` |
| `nhl:boston-1948-1955-home` | Boston Bruins | 1948-1955 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1950-1955-away` | Boston Bruins | 1950-1955 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1955-1959-home` | Boston Bruins | 1955-1959 | `#ffb81c` `#000` `#fff` |
| `nhl:boston-1955-1959-away` | Boston Bruins | 1955-1959 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1959-1965-home` | Boston Bruins | 1959-1965 | `#ffb81c` `#000` `#fff` |
| `nhl:boston-1959-1965-away` | Boston Bruins | 1959-1965 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1959-1967-third` | Boston Bruins | 1959-1967 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1966-1967-home` | Boston Bruins | 1966-1967 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1967-1968-home` | Boston Bruins | 1967-1968 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1967-1968-away` | Boston Bruins | 1967-1968 | `#fff` `#000` `#ffb81c` |
| `nhl:chicago-1926-1927-home` | Chicago Black Hawks | 1926-1927 | `#fff` `#000` |
| `nhl:chicago-1927-1928-home` | Chicago Black Hawks | 1927-1928 | `#000` `#fff` |
| `nhl:chicago-1928-1934-home` | Chicago Black Hawks | 1928-1934 | `#000` `#fff` |
| `nhl:chicago-1934-1935-home` | Chicago Black Hawks | 1934-1935 | `#000` `#cf0a2c` `#fff` |
| `nhl:chicago-1935-1937-home` | Chicago Black Hawks | 1935-1937 | `#000` `#cf0a2c` `#d8c18f` |
| `nhl:chicago-1937-1939-home` | Chicago Black Hawks | 1937-1939 | `#000` `#cf0a2c` `#fff` |
| `nhl:chicago-1939-1951-home` | Chicago Black Hawks | 1939-1951 | `#000` `#cf0a2c` `#fff` |
| `nhl:chicago-1940-1955-away` | Chicago Black Hawks | 1940-1955 | `#fff` `#cf0a2c` `#000` |
| `nhl:chicago-1951-1955-home` | Chicago Black Hawks | 1951-1955 | `#000` `#cf0a2c` `#fff` |
| `nhl:chicago-1955-1963-home` | Chicago Black Hawks | 1955-1963 | `#cf0a2c` `#000` `#fff` |
| `nhl:chicago-1955-1963-away` | Chicago Black Hawks | 1955-1963 | `#fff` `#000` `#cf0a2c` |
| `nhl:chicago-1963-1973-home` | Chicago Black Hawks | 1963-1973 | `#cf0a2c` `#000` `#fff` |
| `nhl:chicago-1963-1973-away` | Chicago Black Hawks | 1963-1973 | `#fff` `#000` `#cf0a2c` |
| `nhl:detroit-cougars-1926-1927-home` | Detroit Cougars | 1926-1927 | `#fff` `#ce1126` |
| `nhl:detroit-cougars-1927-1928-home` | Detroit Cougars | 1927-1928 | `#fff` `#ce1126` |
| `nhl:detroit-cougars-1928-1929-home` | Detroit Cougars | 1928-1929 | `#fff` `#ce1126` |
| `nhl:detroit-cougars-1929-1930-home` | Detroit Cougars | 1929-1930 | `#fff` `#ce1126` |
| `nhl:detroit-falcons-1930-1932-home` | Detroit Falcons | 1930-1932 | `#fff` `#ce1126` |
| `nhl:detroit-1932-1934-home` | Detroit Red Wings | 1932-1934 | `#ce1126` `#fff` |
| `nhl:detroit-1934-1937-home` | Detroit Red Wings | 1934-1937 | `#ce1126` `#fff` |
| `nhl:detroit-1934-1937-away` | Detroit Red Wings | 1934-1937 | `#fff` `#ce1126` |
| `nhl:detroit-1937-1940-home` | Detroit Red Wings | 1937-1940 | `#ce1126` `#fff` |
| `nhl:detroit-1937-1940-away` | Detroit Red Wings | 1937-1940 | `#fff` `#ce1126` |
| `nhl:detroit-1940-1956-home` | Detroit Red Wings | 1940-1956 | `#ce1126` `#fff` |
| `nhl:detroit-1940-1956-away` | Detroit Red Wings | 1940-1956 | `#fff` `#ce1126` |
| `nhl:detroit-1956-1967-home` | Detroit Red Wings | 1956-1967 | `#ce1126` `#fff` |
| `nhl:detroit-1956-1967-away` | Detroit Red Wings | 1956-1967 | `#fff` `#ce1126` |
| `nhl:rangers-1926-1927-home` | New York Rangers | 1926-1927 | `#0a6fd0` `#ce1126` `#fff` |
| `nhl:rangers-1927-1928-home` | New York Rangers | 1927-1928 | `#0a6fd0` `#ce1126` `#fff` |
| `nhl:rangers-1928-1929-home` | New York Rangers | 1928-1929 | `#0a6fd0` `#ce1126` `#fff` |
| `nhl:rangers-1929-1934-home` | New York Rangers | 1929-1934 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1934-1935-home` | New York Rangers | 1934-1935 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1935-1941-home` | New York Rangers | 1935-1941 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1941-1951-home` | New York Rangers | 1941-1951 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1951-1963-home` | New York Rangers | 1951-1963 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1951-1963-away` | New York Rangers | 1951-1963 | `#fff` `#0038a8` `#ce1126` |
| `nhl:rangers-1963-1970-home` | New York Rangers | 1963-1970 | `#0038a8` `#ce1126` `#fff` |
| `nhl:rangers-1963-1970-away` | New York Rangers | 1963-1970 | `#fff` `#0038a8` `#ce1126` |
| `nhl:ottawa-silver-seven-1903-1907-home` | Ottawa Silver Seven | 1903-1907 | `#fff` `#c8102e` `#000` |
| `nhl:ottawa-1917-1922-home` | Ottawa Senators (1917-1934) | 1917-1922 | `#fff` `#c8102e` `#000` |
| `nhl:ottawa-1919-1920-away` | Ottawa Senators (1917-1934) | 1919-1920 | `#fff` `#c8102e` |
| `nhl:ottawa-1922-1927-home` | Ottawa Senators (1917-1934) | 1922-1927 | `#fff` `#c8102e` `#000` |
| `nhl:ottawa-1927-1929-home` | Ottawa Senators (1917-1934) | 1927-1929 | `#fff` `#c8102e` `#000` |
| `nhl:ottawa-1929-1934-home` | Ottawa Senators (1917-1934) | 1929-1934 | `#fff` `#c8102e` `#000` |
| `nhl:quebec-bulldogs-1919-1920-home` | Quebec Bulldogs | 1919-1920 | `#0033a0` `#fff` |
| `nhl:wanderers-1917-1918-home` | Montreal Wanderers | 1917-1918 | `#fff` `#c8102e` |
| `nhl:tigers-1920-1921-home` | Hamilton Tigers | 1920-1921 | `#ffb81c` `#000` |
| `nhl:tigers-1921-1923-home` | Hamilton Tigers | 1921-1923 | `#ffb81c` `#000` |
| `nhl:tigers-1923-1924-home` | Hamilton Tigers | 1923-1924 | `#ffb81c` `#000` |
| `nhl:tigers-1924-1925-home` | Hamilton Tigers | 1924-1925 | `#ffb81c` `#000` |
| `nhl:pirates-1925-1928-home` | Pittsburgh Pirates | 1925-1928 | `#e6aa00` `#000` |
| `nhl:pirates-1928-1929-home` | Pittsburgh Pirates | 1928-1929 | `#ffd800` `#5b84c4` |
| `nhl:pirates-1929-1930-home` | Pittsburgh Pirates | 1929-1930 | `#ee9a4a` `#000` |
| `nhl:quakers-1930-1931-home` | Philadelphia Quakers | 1930-1931 | `#ee9a45` `#000` |
| `nhl:maroons-1924-1925-home` | Montreal Maroons | 1924-1925 | `#5c1420` `#fff` |
| `nhl:maroons-1925-1929-home` | Montreal Maroons | 1925-1929 | `#5c1420` `#fff` |
| `nhl:maroons-1929-1931-home` | Montreal Maroons | 1929-1931 | `#5c1420` `#fff` |
| `nhl:maroons-1931-1935-home` | Montreal Maroons | 1931-1935 | `#5c1420` `#fff` |
| `nhl:maroons-1935-1938-home` | Montreal Maroons | 1935-1938 | `#5c1420` `#fff` |
| `nhl:americans-1925-1926-home` | New York Americans | 1925-1926 | `#fff` `#002868` `#c8102e` |
| `nhl:americans-1926-1927-home` | New York Americans | 1926-1927 | `#fff` `#c8102e` `#002868` |
| `nhl:americans-1927-1930-home` | New York Americans | 1927-1930 | `#fff` `#c8102e` `#002868` |
| `nhl:americans-1930-1933-home` | New York Americans | 1930-1933 | `#fff` `#002868` `#c8102e` |
| `nhl:americans-1933-1935-home` | New York Americans | 1933-1935 | `#fff` `#002868` `#c8102e` |
| `nhl:americans-1933-1935-away` | New York Americans | 1933-1935 | `#fff` `#002868` `#c8102e` |
| `nhl:americans-1935-1938-home` | New York Americans | 1935-1938 | `#fff` `#002868` `#c8102e` |
| `nhl:americans-1935-1938-away` | New York Americans | 1935-1938 | `#fff` `#c8102e` `#002868` |
| `nhl:americans-1938-1940-home` | New York Americans | 1938-1940 | `#fff` `#c8102e` `#002868` |
| `nhl:americans-1940-1941-home` | New York Americans | 1940-1941 | `#fff` `#c8102e` `#002868` |
| `nhl:brooklyn-1941-1942-home` | Brooklyn Americans | 1941-1942 | `#fff` `#c8102e` `#002868` |
| `nhl:eagles-1934-1935-home` | St. Louis Eagles | 1934-1935 | `#fff` `#0a1f8a` `#c8102e` |
| `nhl:seals-1967-1969-home` | California Seals | 1967-1969 | `#0b7a35` `#fff` `#1f3a93` |
| `nhl:seals-1967-1969-away` | California Seals | 1967-1969 | `#fff` `#0b7a35` `#1f3a93` |
| `nhl:seals-1969-1970-home` | California Seals | 1969-1970 | `#0b7a35` `#fff` `#1f3a93` |
| `nhl:seals-1969-1970-away` | California Seals | 1969-1970 | `#fff` `#0b7a35` `#1f3a93` |
| `nhl:golden-seals-1970-1974-home` | California Golden Seals | 1970-1974 | `#ffc20e` `#00833e` `#fff` |
| `nhl:golden-seals-1970-1974-away` | California Golden Seals | 1970-1974 | `#00833e` `#ffc20e` `#fff` |
| `nhl:oakland-seals-1974-1976-home` | Oakland Seals | 1974-1976 | `#fff` `#1fa5ab` `#ffc20e` |
| `nhl:oakland-seals-1974-1976-away` | Oakland Seals | 1974-1976 | `#1fa5ab` `#fff` `#ffc20e` |
| `nhl:north-stars-1967-1968-home` | Minnesota North Stars | 1967-1968 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1967-1968-away` | Minnesota North Stars | 1967-1968 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1968-1969-home` | Minnesota North Stars | 1968-1969 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1968-1969-away` | Minnesota North Stars | 1968-1969 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1969-1972-home` | Minnesota North Stars | 1969-1972 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1969-1972-away` | Minnesota North Stars | 1969-1972 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1972-1975-home` | Minnesota North Stars | 1972-1975 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1972-1975-away` | Minnesota North Stars | 1972-1975 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1975-1977-home` | Minnesota North Stars | 1975-1977 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1975-1977-away` | Minnesota North Stars | 1975-1977 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1978-1979-home` | Minnesota North Stars | 1978-1979 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1978-1979-away` | Minnesota North Stars | 1978-1979 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1979-1981-home` | Minnesota North Stars | 1979-1981 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1979-1981-away` | Minnesota North Stars | 1979-1981 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1981-1988-home` | Minnesota North Stars | 1981-1988 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1981-1988-away` | Minnesota North Stars | 1981-1988 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1988-1991-home` | Minnesota North Stars | 1988-1991 | `#00803d` `#fff` `#ffc20e` |
| `nhl:north-stars-1988-1991-away` | Minnesota North Stars | 1988-1991 | `#fff` `#00803d` `#ffc20e` |
| `nhl:north-stars-1991-1993-home` | Minnesota North Stars | 1991-1993 | `#fff` `#000` `#00803d` |
| `nhl:north-stars-1991-1993-away` | Minnesota North Stars | 1991-1993 | `#000` `#00803d` `#fff` |
| `nhl:atlanta-flames-1972-1973-home` | Atlanta Flames | 1972-1973 | `#fff` `#cc2229` `#ffc20e` |
| `nhl:atlanta-flames-1972-1973-away` | Atlanta Flames | 1972-1973 | `#cc2229` `#fff` `#ffc20e` |
| `nhl:atlanta-flames-1973-1977-home` | Atlanta Flames | 1973-1977 | `#fff` `#cc2229` `#ffc20e` |
| `nhl:atlanta-flames-1973-1977-away` | Atlanta Flames | 1973-1977 | `#cc2229` `#fff` `#ffc20e` |
| `nhl:atlanta-flames-1977-1980-home` | Atlanta Flames | 1977-1980 | `#fff` `#cc2229` `#ffc20e` |
| `nhl:atlanta-flames-1977-1980-away` | Atlanta Flames | 1977-1980 | `#cc2229` `#fff` `#ffc20e` |
| `nhl:scouts-1974-1976-home` | Kansas City Scouts | 1974-1976 | `#fff` `#0a2a7a` `#cc2229` |
| `nhl:scouts-1974-1976-away` | Kansas City Scouts | 1974-1976 | `#0a2a7a` `#cc2229` `#fff` |
| `nhl:rockies-1976-1982-home` | Colorado Rockies | 1976-1982 | `#fff` `#00247d` `#cc2229` |
| `nhl:rockies-1976-1982-away` | Colorado Rockies | 1976-1982 | `#00247d` `#cc2229` `#fff` |
| `nhl:barons-1976-1978-home` | Cleveland Barons | 1976-1978 | `#fff` `#cc2229` `#000` |
| `nhl:barons-1976-1978-away` | Cleveland Barons | 1976-1978 | `#cc2229` `#fff` `#000` |
| `nhl:whalers-1979-1985-home` | Hartford Whalers | 1979-1985 | `#fff` `#007a3d` `#0f3a8f` |
| `nhl:whalers-1979-1985-away` | Hartford Whalers | 1979-1985 | `#007a3d` `#fff` `#0f3a8f` |
| `nhl:whalers-1982-1983-home` | Hartford Whalers | 1982-1983 | `#fff` `#007a3d` `#0f3a8f` |
| `nhl:whalers-1982-1983-away` | Hartford Whalers | 1982-1983 | `#007a3d` `#fff` `#0f3a8f` |
| `nhl:whalers-1985-1989-home` | Hartford Whalers | 1985-1989 | `#fff` `#007a3d` `#0f3a8f` |
| `nhl:whalers-1985-1989-away` | Hartford Whalers | 1985-1989 | `#007a3d` `#fff` `#0f3a8f` |
| `nhl:whalers-1989-1992-home` | Hartford Whalers | 1989-1992 | `#fff` `#007a3d` `#0f3a8f` |
| `nhl:whalers-1989-1992-away` | Hartford Whalers | 1989-1992 | `#007a3d` `#fff` `#0f3a8f` |
| `nhl:whalers-1992-1997-home` | Hartford Whalers | 1992-1997 | `#fff` `#14315a` `#007a3d` |
| `nhl:whalers-1992-1997-away` | Hartford Whalers | 1992-1997 | `#14315a` `#fff` `#007a3d` |
| `nhl:nordiques-1979-1989-home` | Quebec Nordiques | 1979-1989 | `#fff` `#1c5db8` `#ce1126` |
| `nhl:nordiques-1979-1989-away` | Quebec Nordiques | 1979-1989 | `#1c5db8` `#fff` `#ce1126` |
| `nhl:nordiques-1989-1991-home` | Quebec Nordiques | 1989-1991 | `#fff` `#1c5db8` `#ce1126` |
| `nhl:nordiques-1989-1991-away` | Quebec Nordiques | 1989-1991 | `#1c5db8` `#fff` `#ce1126` |
| `nhl:nordiques-1991-1995-home` | Quebec Nordiques | 1991-1995 | `#fff` `#1c5db8` `#ce1126` |
| `nhl:nordiques-1991-1995-away` | Quebec Nordiques | 1991-1995 | `#1c5db8` `#fff` `#ce1126` |
| `nhl:jets-1979-1990-home` | Winnipeg Jets (1979-1996) | 1979-1990 | `#fff` `#0b2a7b` `#ce1126` |
| `nhl:jets-1979-1990-away` | Winnipeg Jets (1979-1996) | 1979-1990 | `#0b2a7b` `#fff` `#ce1126` |
| `nhl:jets-1990-1996-home` | Winnipeg Jets (1979-1996) | 1990-1996 | `#fff` `#0b2a7b` `#ce1126` |
| `nhl:jets-1990-1996-away` | Winnipeg Jets (1979-1996) | 1990-1996 | `#0b2a7b` `#fff` `#ce1126` |
| `nhl:thrashers-1999-2003-home` | Atlanta Thrashers | 1999-2003 | `#fff` `#041e42` `#8a1538` |
| `nhl:thrashers-1999-2003-away` | Atlanta Thrashers | 1999-2003 | `#041e42` `#8a1538` `#ffb81c` |
| `nhl:thrashers-2003-2006-third` | Atlanta Thrashers | 2003-2006 | `#041e42` `#8a1538` `#ffb81c` |
| `nhl:thrashers-2006-2007-home` | Atlanta Thrashers | 2006-2007 | `#6c8fd6` `#041e42` `#8a1538` |
| `nhl:thrashers-2006-2007-away` | Atlanta Thrashers | 2006-2007 | `#fff` `#041e42` `#8a1538` |
| `nhl:thrashers-2007-2011-home` | Atlanta Thrashers | 2007-2011 | `#6c8fd6` `#041e42` `#8a1538` |
| `nhl:thrashers-2007-2011-away` | Atlanta Thrashers | 2007-2011 | `#fff` `#041e42` `#8a1538` |
| `nhl:thrashers-2008-2011-third` | Atlanta Thrashers | 2008-2011 | `#8a1538` `#041e42` `#ffb81c` |
| `nhl:ducks-1993-1997-home` | Mighty Ducks of Anaheim | 1993-1997 | `#fff` `#007a67` `#4e2a5e` |
| `nhl:ducks-1993-1997-away` | Mighty Ducks of Anaheim | 1993-1997 | `#4e2a5e` `#007a67` `#9ea1a2` |
| `nhl:ducks-1995-1996-third` | Mighty Ducks of Anaheim | 1995-1996 | `#007a67` `#4e2a5e` `#fff` |
| `nhl:ducks-1997-2003-third` | Mighty Ducks of Anaheim | 1997-2003 | `#fff` `#007a67` `#4e2a5e` |
| `nhl:ducks-2003-2006-third` | Mighty Ducks of Anaheim | 2003-2006 | `#000` `#4e2a5e` `#9ea1a2` |
| `nhl:coyotes-1996-2003-home` | Phoenix Coyotes | 1996-2003 | `#fff` `#000` `#8c2633` |
| `nhl:coyotes-1996-2003-away` | Phoenix Coyotes | 1996-2003 | `#000` `#8c2633` `#e8d9a6` |
| `nhl:coyotes-1998-2003-third` | Phoenix Coyotes | 1998-2003 | `#245e44` `#000` `#d2691e` |
| `nhl:coyotes-2003-2007-home` | Phoenix Coyotes | 2003-2007 | `#8c2633` `#fff` `#000` |
| `nhl:coyotes-2003-2007-away` | Phoenix Coyotes | 2003-2007 | `#fff` `#8c2633` `#000` |
| `nhl:coyotes-2007-2008-home` | Phoenix Coyotes | 2007-2008 | `#8c2633` `#fff` `#000` |
| `nhl:coyotes-2007-2008-away` | Phoenix Coyotes | 2007-2008 | `#fff` `#8c2633` `#000` |

## NHL

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `nhl:montreal-1967-red` | Montreal Canadiens | 1967- | `#af1e2d` `#fff` `#192168` |
| `nhl:montreal-1967-white` | Montreal Canadiens | 1967- | `#fff` `#af1e2d` `#192168` |
| `nhl:montreal-2020-2021-alt` | Montreal Canadiens | 2020-2021 | `#192168` `#fff` `#af1e2d` |
| `nhl:montreal-2022-2023-alt` | Montreal Canadiens | 2022-2023 | `#9bcbeb` `#fff` `#192168` |
| `nhl:toronto-1967-1970-blue` | Toronto Maple Leafs | 1967-1970 | `#003e7e` `#fff` |
| `nhl:toronto-1967-1970-white` | Toronto Maple Leafs | 1967-1970 | `#fff` `#003e7e` |
| `nhl:toronto-1970-1992-blue` | Toronto Maple Leafs | 1970-1992 | `#003e7e` `#fff` |
| `nhl:toronto-1970-1992-white` | Toronto Maple Leafs | 1970-1992 | `#fff` `#003e7e` |
| `nhl:toronto-1992-2016-blue` | Toronto Maple Leafs | 1992-2016 | `#003e7e` `#fff` |
| `nhl:toronto-1992-2016-white` | Toronto Maple Leafs | 1992-2016 | `#fff` `#003e7e` |
| `nhl:toronto-2016-home` | Toronto Maple Leafs | 2016- | `#00205b` `#fff` |
| `nhl:toronto-2016-away` | Toronto Maple Leafs | 2016- | `#fff` `#00205b` |
| `nhl:boston-1967-1995-black` | Boston Bruins | 1967-1995 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1967-1995-white` | Boston Bruins | 1967-1995 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1995-2006-black` | Boston Bruins | 1995-2006 | `#000` `#ffb81c` `#fff` |
| `nhl:boston-1995-2006-white` | Boston Bruins | 1995-2006 | `#fff` `#000` `#ffb81c` |
| `nhl:boston-1995-2006-third` | Boston Bruins | 1995-2006 | `#ffb81c` `#000` `#fff` |
| `nhl:boston-2007-home` | Boston Bruins | 2007- | `#000` `#ffb81c` `#fff` |
| `nhl:boston-2007-away` | Boston Bruins | 2007- | `#fff` `#000` `#ffb81c` |
| `nhl:boston-2020-2021-alt` | Boston Bruins | 2020-2021 | `#ffb81c` `#000` `#fff` |
| `nhl:chicago-1967-red` | Chicago Blackhawks | 1967- | `#cf0a2c` `#fff` `#000` |
| `nhl:chicago-1967-white` | Chicago Blackhawks | 1967- | `#fff` `#cf0a2c` `#000` |
| `nhl:chicago-1996-2007-third` | Chicago Blackhawks | 1996-2007 | `#000` `#cf0a2c` `#fff` |
| `nhl:chicago-2009-2011-third` | Chicago Blackhawks | 2009-2011 | `#000` `#e0d3a8` `#cf0a2c` |
| `nhl:detroit-1967-red` | Detroit Red Wings | 1967- | `#ce1126` `#fff` |
| `nhl:detroit-1967-white` | Detroit Red Wings | 1967- | `#fff` `#ce1126` |
| `nhl:detroit-2009-alt` | Detroit Red Wings | 2009 | `#fff` `#ce1126` |
| `nhl:detroit-2020-2021-alt` | Detroit Red Wings | 2020-2021 | `#fff` `#c0c0c0` |
| `nhl:rangers-1967-1975-blue` | New York Rangers | 1967-1975 | `#0038a8` `#fff` `#ce1126` |
| `nhl:rangers-1967-1975-white` | New York Rangers | 1967-1975 | `#fff` `#0038a8` `#ce1126` |
| `nhl:rangers-1978-1997-blue` | New York Rangers | 1978-1997 | `#0038a8` `#fff` `#ce1126` |
| `nhl:rangers-1997-blue` | New York Rangers | 1997- | `#0038a8` `#fff` `#ce1126` |
| `nhl:rangers-1997-white` | New York Rangers | 1997- | `#fff` `#0038a8` `#ce1126` |
| `nhl:rangers-1996-2007-third` | New York Rangers | 1996-2007 | `#001a4d` `#ce1126` `#c0c0c0` |
| `nhl:rangers-2012-alt` | New York Rangers | 2012 | `#efe3c1` `#0038a8` `#ce1126` |
| `nhl:flyers-1967-1982-orange` | Philadelphia Flyers | 1967-1982 | `#f74902` `#fff` `#000` |
| `nhl:flyers-1967-1982-white` | Philadelphia Flyers | 1967-1982 | `#fff` `#f74902` `#000` |
| `nhl:flyers-1982-2007-orange` | Philadelphia Flyers | 1982-2007 | `#f74902` `#fff` `#000` |
| `nhl:flyers-1982-2007-white` | Philadelphia Flyers | 1982-2007 | `#fff` `#f74902` `#000` |
| `nhl:flyers-1997-2010-black` | Philadelphia Flyers | 1997-2010 | `#000` `#f74902` `#fff` |
| `nhl:flyers-2009-home` | Philadelphia Flyers | 2009- | `#f74902` `#fff` `#000` |
| `nhl:flyers-2010-away` | Philadelphia Flyers | 2010- | `#fff` `#f74902` `#000` |
| `nhl:penguins-1967-1973-blue` | Pittsburgh Penguins | 1967-1973 | `#9cc3e6` `#1b2c6b` `#fff` |
| `nhl:penguins-1967-1973-white` | Pittsburgh Penguins | 1967-1973 | `#fff` `#1b2c6b` `#9cc3e6` |
| `nhl:penguins-1980-1992-black` | Pittsburgh Penguins | 1980-1992 | `#000` `#fcb514` `#fff` |
| `nhl:penguins-1980-1992-white` | Pittsburgh Penguins | 1980-1992 | `#fff` `#000` `#fcb514` |
| `nhl:penguins-1980-1984-third` | Pittsburgh Penguins | 1980-1984 | `#fcb514` `#000` `#fff` |
| `nhl:penguins-2000-2016-black` | Pittsburgh Penguins | 2000-2016 | `#000` `#cfc493` `#fff` |
| `nhl:penguins-2000-2016-white` | Pittsburgh Penguins | 2000-2016 | `#fff` `#000` `#cfc493` |
| `nhl:penguins-2014-home` | Pittsburgh Penguins | 2014- | `#000` `#fcb514` `#fff` |
| `nhl:penguins-2014-away` | Pittsburgh Penguins | 2014- | `#fff` `#000` `#fcb514` |
| `nhl:blues-1967-1984-blue` | St. Louis Blues | 1967-1984 | `#0a56a8` `#fcb514` `#fff` |
| `nhl:blues-1967-1984-white` | St. Louis Blues | 1967-1984 | `#fff` `#0a56a8` `#fcb514` |
| `nhl:blues-1984-1994-blue` | St. Louis Blues | 1984-1994 | `#003087` `#fcb514` `#c8102e` |
| `nhl:blues-1984-1994-white` | St. Louis Blues | 1984-1994 | `#fff` `#003087` `#c8102e` |
| `nhl:blues-1994-1998-blue` | St. Louis Blues | 1994-1998 | `#002a6e` `#c8102e` `#fcb514` |
| `nhl:blues-1998-2025-blue` | St. Louis Blues | 1998-2025 | `#002f87` `#fcb514` `#041e42` |
| `nhl:blues-1998-2025-white` | St. Louis Blues | 1998-2025 | `#fff` `#002f87` `#fcb514` |
| `nhl:blues-2025-home` | St. Louis Blues | 2025- | `#002f87` `#fcb514` `#fff` |
| `nhl:kings-1967-1980-purple` | Los Angeles Kings | 1967-1980 | `#4d2f8a` `#ffc72c` `#fff` |
| `nhl:kings-1967-1980-gold` | Los Angeles Kings | 1967-1980 | `#ffc72c` `#4d2f8a` `#fff` |
| `nhl:kings-1980-1988-purple` | Los Angeles Kings | 1980-1988 | `#4d2f8a` `#ffc72c` `#fff` |
| `nhl:kings-1980-1988-gold` | Los Angeles Kings | 1980-1988 | `#ffc72c` `#4d2f8a` `#fff` |
| `nhl:kings-1988-1998-black` | Los Angeles Kings | 1988-1998 | `#000` `#a2aaad` `#fff` |
| `nhl:kings-1988-1998-white` | Los Angeles Kings | 1988-1998 | `#fff` `#000` `#a2aaad` |
| `nhl:kings-1998-2007-white` | Los Angeles Kings | 1998-2007 | `#fff` `#5b2c8f` `#a2aaad` |
| `nhl:kings-1999-2007-purple` | Los Angeles Kings | 1999-2007 | `#5b2c8f` `#a2aaad` `#fff` |
| `nhl:kings-2011-home` | Los Angeles Kings | 2011- | `#000` `#a2aaad` `#fff` |
| `nhl:kings-2011-away` | Los Angeles Kings | 2011- | `#fff` `#000` `#a2aaad` |
| `nhl:sabres-1970-1996-white` | Buffalo Sabres | 1970-1996 | `#fff` `#00479d` `#fcb514` |
| `nhl:sabres-1970-1996-blue` | Buffalo Sabres | 1970-1996 | `#00479d` `#fcb514` `#fff` |
| `nhl:sabres-1996-2006-black` | Buffalo Sabres | 1996-2006 | `#000` `#c8102e` `#a2aaad` |
| `nhl:sabres-1996-2006-white` | Buffalo Sabres | 1996-2006 | `#fff` `#000` `#c8102e` |
| `nhl:sabres-2010-2020-navy` | Buffalo Sabres | 2010-2020 | `#041e42` `#ffb81c` `#a2aaad` |
| `nhl:sabres-2010-2020-white` | Buffalo Sabres | 2010-2020 | `#fff` `#041e42` `#ffb81c` |
| `nhl:sabres-2020-home` | Buffalo Sabres | 2020- | `#00479d` `#fcb514` `#fff` |
| `nhl:sabres-2020-away` | Buffalo Sabres | 2020- | `#fff` `#00479d` `#fcb514` |
| `nhl:canucks-1970-1978-blue` | Vancouver Canucks | 1970-1978 | `#003d8f` `#00843d` `#fff` |
| `nhl:canucks-1970-1978-white` | Vancouver Canucks | 1970-1978 | `#fff` `#00843d` `#003d8f` |
| `nhl:canucks-1978-1985-yellow` | Vancouver Canucks | 1978-1985 | `#fcd116` `#000` `#f15a22` |
| `nhl:canucks-1978-1985-black` | Vancouver Canucks | 1978-1985 | `#000` `#fcd116` `#f15a22` |
| `nhl:canucks-1992-1997-white` | Vancouver Canucks | 1992-1997 | `#fff` `#000` `#e31837` |
| `nhl:canucks-1992-1997-black` | Vancouver Canucks | 1992-1997 | `#000` `#e31837` `#fcd116` |
| `nhl:canucks-1997-2007-blue` | Vancouver Canucks | 1997-2007 | `#0b1f4d` `#e31837` `#a2aaad` |
| `nhl:canucks-1997-2007-white` | Vancouver Canucks | 1997-2007 | `#fff` `#0b1f4d` `#e31837` |
| `nhl:canucks-2007-2019-home` | Vancouver Canucks | 2007-2019 | `#00205b` `#00843d` `#fff` |
| `nhl:canucks-2007-2019-away` | Vancouver Canucks | 2007-2019 | `#fff` `#00205b` `#00843d` |
| `nhl:canucks-2019-third` | Vancouver Canucks | 2019- | `#00205b` `#00843d` `#fff` |
| `nhl:canucks-2023-alt` | Vancouver Canucks | 2023- | `#000` `#e31837` `#fcd116` |
| `nhl:islanders-1972-1995-blue` | New York Islanders | 1972-1995 | `#00539b` `#f47d30` `#fff` |
| `nhl:islanders-1972-1995-white` | New York Islanders | 1972-1995 | `#fff` `#00539b` `#f47d30` |
| `nhl:islanders-1997-2010-navy` | New York Islanders | 1997-2010 | `#002d62` `#ff6a13` `#fff` |
| `nhl:islanders-1997-2010-white` | New York Islanders | 1997-2010 | `#fff` `#002d62` `#ff6a13` |
| `nhl:islanders-2002-2007-third` | New York Islanders | 2002-2007 | `#ff6a13` `#002d62` `#fff` |
| `nhl:islanders-2010-home` | New York Islanders | 2010- | `#00539b` `#f47d30` `#fff` |
| `nhl:islanders-2010-away` | New York Islanders | 2010- | `#fff` `#00539b` `#f47d30` |
| `nhl:capitals-1974-1995-red` | Washington Capitals | 1974-1995 | `#c8102e` `#fff` `#041e42` |
| `nhl:capitals-1974-1995-white` | Washington Capitals | 1974-1995 | `#fff` `#c8102e` `#041e42` |
| `nhl:capitals-1995-2007-blue` | Washington Capitals | 1995-2007 | `#041e42` `#b87333` `#000` |
| `nhl:capitals-1995-2007-white` | Washington Capitals | 1995-2007 | `#fff` `#041e42` `#b87333` |
| `nhl:capitals-1997-2007-black` | Washington Capitals | 1997-2007 | `#000` `#b87333` `#fff` |
| `nhl:capitals-2007-home` | Washington Capitals | 2007- | `#c8102e` `#fff` `#041e42` |
| `nhl:capitals-2007-away` | Washington Capitals | 2007- | `#fff` `#c8102e` `#041e42` |
| `nhl:capitals-2015-third` | Washington Capitals | 2015- | `#a6162b` `#fff` `#041e42` |
| `nhl:oilers-1972-1974-orange` | Edmonton Oilers | 1972-1974 | `#f26b21` `#003777` `#fff` |
| `nhl:oilers-1974-1979-blue` | Edmonton Oilers | 1974-1979 | `#003777` `#f26b21` `#fff` |
| `nhl:oilers-1979-1996-white` | Edmonton Oilers | 1979-1996 | `#fff` `#003777` `#f26b21` |
| `nhl:oilers-1979-1996-blue` | Edmonton Oilers | 1979-1996 | `#003777` `#f26b21` `#fff` |
| `nhl:oilers-1996-2007-blue` | Edmonton Oilers | 1996-2007 | `#00205b` `#b86125` `#fff` |
| `nhl:oilers-1996-2007-white` | Edmonton Oilers | 1996-2007 | `#fff` `#00205b` `#b86125` |
| `nhl:oilers-2001-2007-third` | Edmonton Oilers | 2001-2007 | `#00205b` `#a5acaf` `#fff` |
| `nhl:oilers-2009-2017-home` | Edmonton Oilers | 2009-2017 | `#003777` `#f26b21` `#fff` |
| `nhl:oilers-2011-2017-away` | Edmonton Oilers | 2011-2017 | `#fff` `#003777` `#f26b21` |
| `nhl:oilers-2017-home` | Edmonton Oilers | 2017- | `#ff4c00` `#041e42` `#fff` |
| `nhl:oilers-2017-away` | Edmonton Oilers | 2017- | `#fff` `#041e42` `#ff4c00` |
| `nhl:oilers-2019-third` | Edmonton Oilers | 2019- | `#041e42` `#ff4c00` |
| `nhl:oilers-2023-alt` | Edmonton Oilers | 2023 | `#041e42` `#ff4c00` `#f1e6c8` |
| `nhl:oilers-2025-alt` | Edmonton Oilers | 2025- | `#d8c7a5` `#041e42` `#ff4c00` |
| `nhl:flames-1980-1994-white` | Calgary Flames | 1980-1994 | `#fff` `#c8102e` `#f1be48` |
| `nhl:flames-1980-1994-red` | Calgary Flames | 1980-1994 | `#c8102e` `#f1be48` `#fff` |
| `nhl:flames-2020-home` | Calgary Flames | 2020- | `#c8102e` `#f1be48` `#fff` |
| `nhl:flames-2020-away` | Calgary Flames | 2020- | `#fff` `#c8102e` `#f1be48` |
| `nhl:flames-1994-2000-red` | Calgary Flames | 1994-2000 | `#c8102e` `#000` `#f1be48` |
| `nhl:flames-1994-2000-white` | Calgary Flames | 1994-2000 | `#fff` `#000` `#f1be48` |
| `nhl:flames-1998-2007-black` | Calgary Flames | 1998-2007 | `#000` `#c8102e` `#f1be48` |
| `nhl:flames-2007-2020-home` | Calgary Flames | 2007-2020 | `#c8102e` `#000` `#f1be48` |
| `nhl:flames-2007-2020-away` | Calgary Flames | 2007-2020 | `#fff` `#c8102e` `#000` |
| `nhl:flames-2011-alt` | Calgary Flames | 2011 | `#6f1d1b` `#e6b800` `#f1e6c8` |
| `nhl:devils-1982-1992-red` | New Jersey Devils | 1982-1992 | `#ce1126` `#fff` `#00843d` |
| `nhl:devils-1982-1992-white` | New Jersey Devils | 1982-1992 | `#fff` `#ce1126` `#00843d` |
| `nhl:devils-1992-2017-red` | New Jersey Devils | 1992-2017 | `#ce1126` `#000` `#fff` |
| `nhl:devils-1992-2017-white` | New Jersey Devils | 1992-2017 | `#fff` `#000` `#ce1126` |
| `nhl:devils-2017-home` | New Jersey Devils | 2017- | `#ce1126` `#000` `#fff` |
| `nhl:devils-2017-away` | New Jersey Devils | 2017- | `#fff` `#000` `#ce1126` |
| `nhl:devils-2020-2021-alt` | New Jersey Devils | 2020-2021 | `#00843d` `#fff` `#ce1126` |
| `nhl:devils-2021-alt` | New Jersey Devils | 2021- | `#000` `#fff` `#ce1126` |
| `nhl:stars-1993-1999-black` | Dallas Stars | 1993-1999 | `#000` `#006847` `#ffc72c` |
| `nhl:stars-1993-1999-white` | Dallas Stars | 1993-1999 | `#fff` `#006847` `#000` |
| `nhl:stars-1999-2007-white` | Dallas Stars | 1999-2007 | `#fff` `#006847` `#ffc72c` |
| `nhl:stars-1999-2007-green` | Dallas Stars | 1999-2007 | `#006847` `#000` `#ffc72c` |
| `nhl:stars-2007-2013-black` | Dallas Stars | 2007-2013 | `#000` `#ffc72c` `#006847` |
| `nhl:stars-2007-2013-white` | Dallas Stars | 2007-2013 | `#fff` `#006847` `#ffc72c` |
| `nhl:stars-2013-home` | Dallas Stars | 2013- | `#006847` `#000` `#fff` |
| `nhl:stars-2013-away` | Dallas Stars | 2013- | `#fff` `#006847` `#000` |
| `nhl:avalanche-1995-2007-burgundy` | Colorado Avalanche | 1995-2007 | `#6f263d` `#236192` `#000` |
| `nhl:avalanche-1995-2007-white` | Colorado Avalanche | 1995-2007 | `#fff` `#6f263d` `#236192` |
| `nhl:avalanche-2007-home` | Colorado Avalanche | 2007- | `#6f263d` `#236192` `#000` |
| `nhl:avalanche-2007-away` | Colorado Avalanche | 2007- | `#fff` `#6f263d` `#236192` |
| `nhl:hurricanes-1997-2007-red` | Carolina Hurricanes | 1997-2007 | `#cc0000` `#000` `#c0c0c0` |
| `nhl:hurricanes-1997-2007-white` | Carolina Hurricanes | 1997-2007 | `#fff` `#cc0000` `#000` |
| `nhl:hurricanes-2008-2018-black` | Carolina Hurricanes | 2008-2018 | `#000` `#cc0000` `#c0c0c0` |
| `nhl:hurricanes-2013-home` | Carolina Hurricanes | 2013- | `#c8102e` `#000` `#fff` |
| `nhl:hurricanes-2013-away` | Carolina Hurricanes | 2013- | `#fff` `#000` `#c8102e` |
| `nhl:hurricanes-2018-black` | Carolina Hurricanes | 2018- | `#000` `#c8102e` `#5b6670` |
| `nhl:jets-2011-home` | Winnipeg Jets | 2011- | `#041e42` `#fff` `#004a98` |
| `nhl:jets-2011-away` | Winnipeg Jets | 2011- | `#fff` `#041e42` `#004a98` |
| `nhl:wild-2000-2007-green` | Minnesota Wild | 2000-2007 | `#154734` `#af2335` `#eaaa00` |
| `nhl:wild-2000-2007-white` | Minnesota Wild | 2000-2007 | `#fff` `#af2335` `#eaaa00` |
| `nhl:wild-2007-2017-home` | Minnesota Wild | 2007-2017 | `#af2335` `#154734` `#eaaa00` |
| `nhl:wild-2007-2017-away` | Minnesota Wild | 2007-2017 | `#fff` `#af2335` `#154734` |
| `nhl:wild-2009-2017-third` | Minnesota Wild | 2009-2017 | `#154734` `#eaaa00` `#af2335` |
| `nhl:wild-2017-home` | Minnesota Wild | 2017- | `#154734` `#eaaa00` `#af2335` |
| `nhl:wild-2013-away` | Minnesota Wild | 2013- | `#fff` `#154734` `#af2335` |
| `nhl:coyotes-1996-2003-white` | Arizona Coyotes | 1996-2003 | `#fff` `#1f7a63` `#b5372d` |
| `nhl:coyotes-1996-2003-black` | Arizona Coyotes | 1996-2003 | `#000` `#1f7a63` `#b5372d` |
| `nhl:coyotes-2003-2014-red` | Arizona Coyotes | 2003-2014 | `#8c2633` `#000` `#e2d6b5` |
| `nhl:coyotes-2003-2014-white` | Arizona Coyotes | 2003-2014 | `#fff` `#8c2633` `#000` |
| `nhl:utah-2024-home` | Utah Mammoth | 2024- | `#010101` `#6cace4` `#fff` |
| `nhl:utah-2024-away` | Utah Mammoth | 2024- | `#fff` `#010101` `#6cace4` |
| `nhl:senators-1992-1995-black` | Ottawa Senators | 1992-1995 | `#000` `#c8102e` `#fff` |
| `nhl:senators-1995-2007-black` | Ottawa Senators | 1995-2007 | `#000` `#c8102e` `#fff` |
| `nhl:senators-1992-2007-white` | Ottawa Senators | 1992-2007 | `#fff` `#000` `#c8102e` |
| `nhl:senators-1997-2007-red` | Ottawa Senators | 1997-2007 | `#c8102e` `#000` `#fff` |
| `nhl:senators-2007-home` | Ottawa Senators | 2007- | `#000` `#c8102e` `#fff` |
| `nhl:senators-2007-away` | Ottawa Senators | 2007- | `#fff` `#000` `#c8102e` |
| `nhl:senators-2011-2017-third` | Ottawa Senators | 2011-2017 | `#000` `#c8102e` `#fff` |
| `nhl:senators-2018-2024-third` | Ottawa Senators | 2018-2024 | `#c8102e` `#000` `#c0c0c0` |
| `nhl:lightning-1992-2007-white` | Tampa Bay Lightning | 1992-2007 | `#fff` `#000` `#003f87` |
| `nhl:lightning-1992-2007-black` | Tampa Bay Lightning | 1992-2007 | `#000` `#fff` `#003f87` |
| `nhl:lightning-2011-home` | Tampa Bay Lightning | 2011- | `#002868` `#fff` `#000` |
| `nhl:lightning-2011-away` | Tampa Bay Lightning | 2011- | `#fff` `#002868` `#000` |
| `nhl:lightning-2019-alt` | Tampa Bay Lightning | 2019- | `#000` `#5b6670` |
| `nhl:sharks-1991-1997-teal` | San Jose Sharks | 1991-1997 | `#006d75` `#fff` `#000` |
| `nhl:sharks-1991-1997-white` | San Jose Sharks | 1991-1997 | `#fff` `#006d75` `#000` |
| `nhl:sharks-1997-2007-teal` | San Jose Sharks | 1997-2007 | `#00585e` `#a2aaad` `#000` |
| `nhl:sharks-1998-2007-white` | San Jose Sharks | 1998-2007 | `#fff` `#00585e` `#a2aaad` |
| `nhl:sharks-2001-2007-black` | San Jose Sharks | 2001-2007 | `#000` `#006d75` `#fff` |
| `nhl:sharks-2007-home` | San Jose Sharks | 2007- | `#006272` `#000` `#ea7200` |
| `nhl:sharks-2007-away` | San Jose Sharks | 2007- | `#fff` `#006272` `#000` |
| `nhl:panthers-1993-2003-red` | Florida Panthers | 1993-2003 | `#ce1126` `#041e42` `#f4a900` |
| `nhl:panthers-1993-2007-white` | Florida Panthers | 1993-2007 | `#fff` `#041e42` `#f4a900` |
| `nhl:panthers-1998-2011-navy` | Florida Panthers | 1998-2011 | `#041e42` `#ce1126` `#f4a900` |
| `nhl:panthers-2016-home` | Florida Panthers | 2016- | `#c8102e` `#041e42` `#b9975b` |
| `nhl:panthers-2016-away` | Florida Panthers | 2016- | `#fff` `#041e42` `#b9975b` |
| `nhl:predators-1998-2007-navy` | Nashville Predators | 1998-2007 | `#041e42` `#ffb81c` `#c0c0c0` |
| `nhl:predators-1998-2007-white` | Nashville Predators | 1998-2007 | `#fff` `#041e42` `#c0c0c0` |
| `nhl:predators-2001-2007-gold` | Nashville Predators | 2001-2007 | `#e5ac1a` `#041e42` `#fff` |
| `nhl:predators-2011-home` | Nashville Predators | 2011- | `#ffb81c` `#041e42` `#fff` |
| `nhl:predators-2011-away` | Nashville Predators | 2011- | `#fff` `#ffb81c` `#041e42` |
| `nhl:bluejackets-2000-2007-blue` | Columbus Blue Jackets | 2000-2007 | `#002654` `#ce1126` `#a4a9ad` |
| `nhl:bluejackets-2000-2007-white` | Columbus Blue Jackets | 2000-2007 | `#fff` `#002654` `#ce1126` |
| `nhl:bluejackets-2007-home` | Columbus Blue Jackets | 2007- | `#002654` `#ce1126` `#a4a9ad` |
| `nhl:bluejackets-2007-away` | Columbus Blue Jackets | 2007- | `#fff` `#002654` `#ce1126` |
| `nhl:ducks-2006-2024-home` | Anaheim Ducks | 2006-2024 | `#000` `#f47a38` `#b9975b` |
| `nhl:ducks-2006-2024-away` | Anaheim Ducks | 2006-2024 | `#fff` `#f47a38` `#000` |
| `nhl:knights-2017-home` | Vegas Golden Knights | 2017- | `#333f42` `#b4975a` `#000` |
| `nhl:knights-2017-away` | Vegas Golden Knights | 2017- | `#fff` `#b4975a` `#000` |
| `nhl:knights-2020-alt` | Vegas Golden Knights | 2020- | `#b4975a` `#000` `#333f42` |
| `nhl:kraken-2021-home` | Seattle Kraken | 2021- | `#001628` `#99d9d9` `#e9072b` |
| `nhl:kraken-2021-away` | Seattle Kraken | 2021- | `#fff` `#001628` `#99d9d9` |
| `nhl:kraken-2022-2023-alt` | Seattle Kraken | 2022-2023 | `#99d9d9` `#001628` `#355464` |

## HOCKEY_NATIONS

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `hockey:canada-1920-home` | Canada | 1920 | `#e0a800` `#fff` |
| `hockey:canada-1948-home` | Canada | 1948 | `#1f3a8a` `#fff` `#d52b1e` |
| `hockey:canada-1972-home` | Canada | 1972 | `#fff` `#d52b1e` |
| `hockey:canada-1972-away` | Canada | 1972 | `#d52b1e` `#fff` |
| `hockey:canada-1988-home` | Canada | 1988 | `#fff` `#d52b1e` `#0b2a6a` |
| `hockey:canada-1988-away` | Canada | 1988 | `#d52b1e` `#fff` `#0b2a6a` |
| `hockey:canada-1992-home` | Canada | 1992 | `#d52b1e` `#fff` `#1f4fb8` |
| `hockey:canada-1992-away` | Canada | 1992 | `#fff` `#d52b1e` `#1f4fb8` |
| `hockey:canada-1994-home` | Canada | 1994 | `#fff` `#d52b1e` |
| `hockey:canada-1994-away` | Canada | 1994 | `#d52b1e` `#fff` |
| `hockey:canada-1998-2001-home` | Canada | 1998-2001 | `#fff` `#c1272d` `#000` |
| `hockey:canada-1998-2001-away` | Canada | 1998-2001 | `#c1272d` `#fff` `#000` |
| `hockey:canada-2016-home` | Canada | 2016 | `#fff` `#d52b1e` |
| `hockey:canada-2016-away` | Canada | 2016 | `#d52b1e` `#fff` |
| `hockey:canada-2018-home` | Canada | 2018 | `#d52b1e` `#000` |
| `hockey:canada-2018-away` | Canada | 2018 | `#fff` `#d52b1e` |
| `hockey:canada-2018-third` | Canada | 2018 | `#111` `#d52b1e` |
| `hockey:usa-1980-home` | United States | 1980 | `#fff` `#0b4a97` `#c8102e` |
| `hockey:usa-1980-away` | United States | 1980 | `#0b4a97` `#fff` `#c8102e` |
| `hockey:usa-1988-home` | United States | 1988 | `#fff` `#c8102e` `#0a2a6a` |
| `hockey:usa-1988-away` | United States | 1988 | `#0a2a6a` `#fff` `#c8102e` |
| `hockey:usa-1989-home` | United States | 1989 | `#fff` `#0b4a97` `#c8102e` |
| `hockey:usa-1989-away` | United States | 1989 | `#0b4a97` `#fff` `#c8102e` |
| `hockey:usa-1994-home` | United States | 1994 | `#fff` `#2a1f6e` `#c8102e` |
| `hockey:usa-1994-away` | United States | 1994 | `#2a1f6e` `#fff` `#c8102e` |
| `hockey:usa-1998-2000-home` | United States | 1998-2000 | `#fff` `#1b1a4d` `#9aa0a6` |
| `hockey:usa-1998-2000-away` | United States | 1998-2000 | `#1b1a4d` `#fff` `#9aa0a6` |
| `hockey:ussr-1964-1972-home` | Soviet Union | 1964-1972 | `#d4281c` `#fff` |
| `hockey:ussr-1964-1972-away` | Soviet Union | 1964-1972 | `#fff` `#d4281c` |
| `hockey:ussr-1972-1976-home` | Soviet Union | 1972-1976 | `#d4281c` `#fff` |
| `hockey:ussr-1972-1976-away` | Soviet Union | 1972-1976 | `#fff` `#d4281c` |
| `hockey:ussr-1976-1984-home` | Soviet Union | 1976-1984 | `#d4281c` `#fff` |
| `hockey:ussr-1976-1984-away` | Soviet Union | 1976-1984 | `#fff` `#d4281c` |
| `hockey:ussr-1984-1986-home` | Soviet Union | 1984-1986 | `#d4281c` `#fff` `#b01c12` |
| `hockey:ussr-1984-1986-away` | Soviet Union | 1984-1986 | `#fff` `#d4281c` |
| `hockey:ussr-1986-1988-home` | Soviet Union | 1986-1988 | `#d4281c` `#fff` |
| `hockey:ussr-1986-1988-away` | Soviet Union | 1986-1988 | `#fff` `#d4281c` |
| `hockey:ussr-1988-1991-home` | Soviet Union | 1988-1991 | `#d4281c` `#fff` |
| `hockey:ussr-1988-1991-away` | Soviet Union | 1988-1991 | `#fff` `#d4281c` |
| `hockey:russia-1994-home` | Russia | 1994 | `#fff` `#0033a0` `#d4281c` |
| `hockey:russia-1994-away` | Russia | 1994 | `#d4281c` `#fff` `#0033a0` |
| `hockey:russia-1996-2000-home` | Russia | 1996-2000 | `#fff` `#1c3fa8` `#d4281c` |
| `hockey:russia-1996-2000-away` | Russia | 1996-2000 | `#d4281c` `#fff` `#1c3fa8` |
| `hockey:russia-2000-2004-home` | Russia | 2000-2004 | `#fff` `#0b44d0` `#d4281c` |
| `hockey:russia-2000-2004-away` | Russia | 2000-2004 | `#d4281c` `#0b44d0` `#fff` |
| `hockey:russia-2014-home` | Russia | 2014 | `#cf1f26` `#1a2a6c` `#fff` |
| `hockey:russia-2014-away` | Russia | 2014 | `#fff` `#cf1f26` `#1a2a6c` |
| `hockey:russia-2016-home` | Russia | 2016 | `#fff` `#1f4fb8` `#d4281c` |
| `hockey:russia-2016-away` | Russia | 2016 | `#c91f37` `#1f4fb8` `#fff` |
| `hockey:russia-2018-home` | Russia | 2018 | `#fff` `#c91f37` |
| `hockey:russia-2018-away` | Russia | 2018 | `#c91f37` `#fff` |
| `hockey:czechoslovakia-1967-home` | Czechoslovakia | 1967 | `#2a6fd0` `#fff` `#d52b1e` |
| `hockey:czechoslovakia-1967-away` | Czechoslovakia | 1967 | `#fff` `#d52b1e` `#2a6fd0` |
| `hockey:czechoslovakia-1967-third` | Czechoslovakia | 1967 | `#d52b1e` `#fff` `#2a6fd0` |
| `hockey:czechoslovakia-1974-home` | Czechoslovakia | 1974 | `#d52b1e` `#fff` `#2a6fd0` |
| `hockey:czechoslovakia-1974-away` | Czechoslovakia | 1974 | `#fff` `#d52b1e` `#2a6fd0` |
| `hockey:czechoslovakia-1985-home` | Czechoslovakia | 1985 | `#d52b1e` `#fff` `#2a5fc0` |
| `hockey:czechoslovakia-1985-away` | Czechoslovakia | 1985 | `#fff` `#d52b1e` `#2a5fc0` |
| `hockey:czechoslovakia-1988-home` | Czechoslovakia | 1988 | `#fff` `#d52b1e` `#2a5fc0` |
| `hockey:czechoslovakia-1988-away` | Czechoslovakia | 1988 | `#d52b1e` `#fff` `#2a5fc0` |
| `hockey:czech-1998-2002-home` | Czech Republic | 1998-2002 | `#fff` `#0b2a8a` `#d52b1e` |
| `hockey:czech-1998-2002-away` | Czech Republic | 1998-2002 | `#d52b1e` `#fff` `#0b2a8a` |
| `hockey:czech-2006-home` | Czech Republic | 2006 | `#fff` `#d52b1e` `#0b2a8a` |
| `hockey:czech-2006-away` | Czech Republic | 2006 | `#d52b1e` `#fff` `#0b2a8a` |
| `hockey:czech-2018-home` | Czech Republic | 2018 | `#ef1c46` `#fff` `#1d3a8f` |
| `hockey:czech-2018-away` | Czech Republic | 2018 | `#fff` `#ef1c46` `#1d3a8f` |
| `hockey:sweden-1988-home` | Sweden | 1988 | `#fecb00` `#0b4a9a` `#fff` |
| `hockey:sweden-1988-away` | Sweden | 1988 | `#0b4a9a` `#fecb00` `#fff` |
| `hockey:sweden-1994-home` | Sweden | 1994 | `#fecb00` `#0b4a9a` |
| `hockey:sweden-1994-away` | Sweden | 1994 | `#0b4a9a` `#fecb00` |
| `hockey:sweden-1998-2005-home` | Sweden | 1998-2005 | `#ffd800` `#0a4a96` |
| `hockey:sweden-1998-2005-away` | Sweden | 1998-2005 | `#0a4a96` `#ffd800` |
| `hockey:sweden-2018-home` | Sweden | 2018 | `#f5b800` `#1f3a7a` |
| `hockey:sweden-2018-away` | Sweden | 2018 | `#1f3a7a` `#f5b800` |
| `hockey:finland-1988-home` | Finland | 1988 | `#fff` `#1b5ed0` |
| `hockey:finland-1988-away` | Finland | 1988 | `#1b5ed0` `#fff` |
| `hockey:finland-1992-home` | Finland | 1992 | `#fff` `#0b3a8f` |
| `hockey:finland-1992-away` | Finland | 1992 | `#0b3a8f` `#fff` |
| `hockey:finland-1994-home` | Finland | 1994 | `#fff` `#0b4aa0` |
| `hockey:finland-1994-away` | Finland | 1994 | `#0b4aa0` `#fff` |
| `hockey:finland-1998-2004-home` | Finland | 1998-2004 | `#fff` `#2a8fd0` `#1a1f5c` |
| `hockey:finland-1998-2004-away` | Finland | 1998-2004 | `#2a8fd0` `#fff` `#1a1f5c` |
| `hockey:finland-2018-home` | Finland | 2018 | `#1b4da1` `#0a1f4a` |
| `hockey:finland-2018-away` | Finland | 2018 | `#fff` `#3a8fd4` `#0a1f4a` |
| `hockey:west-germany-1988-home` | West Germany | 1988 | `#fff` `#000` `#dd0000` |
| `hockey:west-germany-1988-away` | West Germany | 1988 | `#dd0000` `#000` `#ffce00` |
| `hockey:germany-1992-home` | Germany | 1992 | `#fff` `#000` `#dd0000` |
| `hockey:germany-1992-away` | Germany | 1992 | `#dd0000` `#000` `#ffce00` |
| `hockey:germany-1998-2000-home` | Germany | 1998-2000 | `#fff` `#111` `#dd0000` |
| `hockey:germany-1998-2000-away` | Germany | 1998-2000 | `#111` `#dd0000` `#ffce00` |
| `hockey:germany-2018-home` | Germany | 2018 | `#111` `#ffce00` `#dd0000` |
| `hockey:germany-2018-away` | Germany | 2018 | `#ffce00` `#111` `#dd0000` |
| `hockey:switzerland-1988-home` | Switzerland | 1988 | `#fff` `#e30a17` |
| `hockey:switzerland-1988-away` | Switzerland | 1988 | `#e30a17` `#fff` |
| `hockey:switzerland-1991-home` | Switzerland | 1991 | `#fff` `#e30a17` |
| `hockey:switzerland-1991-away` | Switzerland | 1991 | `#e30a17` `#fff` |
| `hockey:switzerland-1998-2000-home` | Switzerland | 1998-2000 | `#fff` `#e30a17` `#000` |
| `hockey:switzerland-1998-2000-away` | Switzerland | 1998-2000 | `#e30a17` `#fff` `#000` |
| `hockey:switzerland-2001-2004-home` | Switzerland | 2001-2004 | `#fff` `#e30a17` `#000` |
| `hockey:switzerland-2001-2004-away` | Switzerland | 2001-2004 | `#e30a17` `#fff` `#000` |
| `hockey:switzerland-2018-home` | Switzerland | 2018 | `#e30a17` `#fff` |
| `hockey:switzerland-2018-away` | Switzerland | 2018 | `#fff` `#e30a17` |
| `hockey:slovakia-2014-home` | Slovakia | 2014 | `#fff` `#0b2a5e` `#ee1c25` |
| `hockey:slovakia-2014-away` | Slovakia | 2014 | `#0b2a5e` `#fff` `#ee1c25` |
| `hockey:slovakia-2018-home` | Slovakia | 2018 | `#0b5fb0` `#fff` `#ee1c25` |
| `hockey:slovakia-2018-away` | Slovakia | 2018 | `#fff` `#0b5fb0` `#ee1c25` |
| `hockey:slovakia-2022-home` | Slovakia | 2022 | `#fff` `#3b4ea9` `#b3202e` |
| `hockey:slovakia-2022-away` | Slovakia | 2022 | `#3b4ea9` `#fff` `#b3202e` |
| `hockey:norway-1937-home` | Norway | 1937 | `#fff` `#d52b1e` `#1a3a8f` |
| `hockey:norway-1952-1963-home` | Norway | 1952-1963 | `#d52b1e` `#fff` `#1f3a8f` |
| `hockey:norway-1964-home` | Norway | 1964 | `#d52b1e` `#fff` `#1a3a8f` |
| `hockey:norway-1964-away` | Norway | 1964 | `#fff` `#d52b1e` `#1a3a8f` |
| `hockey:norway-1973-home` | Norway | 1973 | `#d52b1e` `#fff` `#1a3a8f` |
| `hockey:norway-1973-away` | Norway | 1973 | `#fff` `#1a3a8f` `#d52b1e` |
| `hockey:norway-1985-home` | Norway | 1985 | `#d52b1e` `#fff` `#1a3a8f` |
| `hockey:norway-1985-away` | Norway | 1985 | `#fff` `#1a3a8f` `#d52b1e` |
| `hockey:norway-1998-home` | Norway | 1998 | `#d52b1e` `#fff` `#1a3a8f` |
| `hockey:norway-1998-away` | Norway | 1998 | `#fff` `#d52b1e` `#1a3a8f` |
| `hockey:norway-2006-home` | Norway | 2006 | `#d52b1e` `#fff` `#1a3a8f` |
| `hockey:norway-2006-away` | Norway | 2006 | `#fff` `#d52b1e` `#1a3a8f` |
| `hockey:latvia-1996-1997-home` | Latvia | 1996-1997 | `#7a0c20` `#fff` `#000` |
| `hockey:latvia-1996-1997-away` | Latvia | 1996-1997 | `#fff` `#7a0c20` `#000` |
| `hockey:latvia-2002-2004-home` | Latvia | 2002-2004 | `#7a0c20` `#fff` `#000` |
| `hockey:latvia-2002-2004-away` | Latvia | 2002-2004 | `#fff` `#7a0c20` `#000` |
| `hockey:latvia-2018-home` | Latvia | 2018 | `#7c1a38` `#fff` |
| `hockey:latvia-2018-away` | Latvia | 2018 | `#fff` `#7c1a38` |
| `hockey:japan-1998-2000-home` | Japan | 1998-2000 | `#fff` `#d6261e` |
| `hockey:japan-1998-2000-away` | Japan | 1998-2000 | `#d6261e` `#fff` |
| `hockey:japan-2002-2004-home` | Japan | 2002-2004 | `#fff` `#d6261e` `#111` |
| `hockey:japan-2002-2004-away` | Japan | 2002-2004 | `#d6261e` `#fff` `#111` |
| `hockey:japan-2022-home` | Japan | 2022 | `#fff` `#d6261e` |
| `hockey:japan-2022-away` | Japan | 2022 | `#151515` `#d6261e` |
| `hockey:gb-2019-home` | Great Britain | 2019 | `#1b2a5c` `#fff` `#c8102e` |
| `hockey:gb-2022-home` | Great Britain | 2022 | `#fff` `#1b2a5c` `#c8102e` |
| `hockey:gb-2022-away` | Great Britain | 2022 | `#1b2a5c` `#fff` `#c8102e` |
| `hockey:italy-1992-home` | Italy | 1992 | `#fff` `#1b5fb3` `#009246` |
| `hockey:italy-1992-away` | Italy | 1992 | `#1b5fb3` `#fff` `#009246` |
| `hockey:france-1998-2000-home` | France | 1998-2000 | `#fff` `#241a8c` `#d52b1e` |
| `hockey:france-1998-2000-away` | France | 1998-2000 | `#241a8c` `#fff` `#d52b1e` |

## HOCKEY_PATTERNS

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `hockey:shrinking-bands-2026-home` | Shrinking bands | 2026 | `#fff` `#c8102e` `#1b2a6b` |
| `hockey:shrinking-bands-2026-away` | Shrinking bands | 2026 | `#1b2a6b` `#fff` `#c8102e` |
| `hockey:sawtooth-sleeves-2026-home` | Sawtooth sleeves | 2026 | `#151515` `#c8102e` `#fff` |
| `hockey:sawtooth-sleeves-2026-away` | Sawtooth sleeves | 2026 | `#fff` `#151515` `#c8102e` |

## MLB

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `mlb:yankees-1929-home` | New York Yankees | 1929- | `#fff` `#0c2340` |
| `mlb:yankees-1930-away` | New York Yankees | 1930- | `#a9adb0` `#0c2340` |
| `mlb:yankees-1973-1978-home` | New York Yankees | 1973-1978 | `#fff` `#0c2340` |
| `mlb:redsox-1930-1969-home` | Boston Red Sox | 1930-1969 | `#fff` `#bd3039` `#0c2340` |
| `mlb:redsox-1930-1969-away` | Boston Red Sox | 1930-1969 | `#a9adb0` `#bd3039` `#0c2340` |
| `mlb:redsox-1990-home` | Boston Red Sox | 1990- | `#fff` `#bd3039` `#0c2340` |
| `mlb:redsox-1990-away` | Boston Red Sox | 1990- | `#a2aaad` `#bd3039` `#0c2340` |
| `mlb:orioles-1966-1988-home` | Baltimore Orioles | 1966-1988 | `#fff` `#df4601` `#000` |
| `mlb:orioles-1966-1988-away` | Baltimore Orioles | 1966-1988 | `#a9adb0` `#df4601` `#000` |
| `mlb:orioles-1971-1988-orange` | Baltimore Orioles | 1971-1988 | `#df4601` `#000` `#fff` |
| `mlb:orioles-1995-home` | Baltimore Orioles | 1995- | `#fff` `#df4601` `#000` |
| `mlb:orioles-1995-away` | Baltimore Orioles | 1995- | `#a2aaad` `#df4601` `#000` |
| `mlb:rays-1998-2007-home` | Tampa Bay Rays | 1998-2007 | `#fff` `#29235c` `#00a651` |
| `mlb:rays-1998-2007-away` | Tampa Bay Rays | 1998-2007 | `#a9adb0` `#29235c` `#00a651` |
| `mlb:rays-2008-home` | Tampa Bay Rays | 2008- | `#fff` `#092c5c` `#8fbce6` |
| `mlb:rays-2008-away` | Tampa Bay Rays | 2008- | `#a2aaad` `#092c5c` `#8fbce6` |
| `mlb:rays-2008-sunday` | Tampa Bay Rays | 2008- | `#8fbce6` `#092c5c` `#f5d130` |
| `mlb:bluejays-1977-1996-home` | Toronto Blue Jays | 1977-1996 | `#fff` `#134a8e` |
| `mlb:bluejays-1977-1996-away` | Toronto Blue Jays | 1977-1996 | `#7bb3e0` `#134a8e` |
| `mlb:bluejays-2012-home` | Toronto Blue Jays | 2012- | `#fff` `#134a8e` `#1d2d5c` |
| `mlb:bluejays-2012-away` | Toronto Blue Jays | 2012- | `#a2aaad` `#134a8e` `#1d2d5c` |
| `mlb:whitesox-1951-1963-home` | Chicago White Sox | 1951-1963 | `#fff` `#27251f` `#c8102e` |
| `mlb:whitesox-1951-1963-away` | Chicago White Sox | 1951-1963 | `#a9adb0` `#27251f` `#c8102e` |
| `mlb:whitesox-1964-1970-home` | Chicago White Sox | 1964-1970 | `#fff` `#0c2340` `#c8102e` |
| `mlb:whitesox-1964-1970-away` | Chicago White Sox | 1964-1970 | `#9cbcdc` `#0c2340` `#c8102e` |
| `mlb:whitesox-1971-1975-home` | Chicago White Sox | 1971-1975 | `#fff` `#c8102e` |
| `mlb:whitesox-1971-1975-away` | Chicago White Sox | 1971-1975 | `#a9adb0` `#c8102e` |
| `mlb:whitesox-1976-1981-home` | Chicago White Sox | 1976-1981 | `#fff` `#0c2340` `#c8102e` |
| `mlb:whitesox-1976-1981-away` | Chicago White Sox | 1976-1981 | `#0c2340` `#fff` `#c8102e` |
| `mlb:whitesox-1991-home` | Chicago White Sox | 1991- | `#fff` `#27251f` `#c4ced4` |
| `mlb:whitesox-1991-away` | Chicago White Sox | 1991- | `#a2aaad` `#27251f` `#c4ced4` |
| `mlb:cleveland-1950-1969-home` | Cleveland Guardians | 1950-1969 | `#fff` `#e31937` `#0c2340` |
| `mlb:cleveland-1950-1969-away` | Cleveland Guardians | 1950-1969 | `#a9adb0` `#e31937` `#0c2340` |
| `mlb:cleveland-1975-1977-home` | Cleveland Guardians | 1975-1977 | `#fff` `#e31937` |
| `mlb:cleveland-1975-1977-away` | Cleveland Guardians | 1975-1977 | `#e31937` `#fff` `#0c2340` |
| `mlb:cleveland-1994-2021-home` | Cleveland Guardians | 1994-2021 | `#fff` `#0c2340` `#e31937` |
| `mlb:cleveland-1994-2021-away` | Cleveland Guardians | 1994-2021 | `#a2aaad` `#0c2340` `#e31937` |
| `mlb:cleveland-2022-home` | Cleveland Guardians | 2022- | `#fff` `#e31937` `#0c2340` |
| `mlb:cleveland-2022-away` | Cleveland Guardians | 2022- | `#a2aaad` `#0c2340` `#e31937` |
| `mlb:tigers-1930-1969-home` | Detroit Tigers | 1930-1969 | `#fff` `#0c2340` `#fa4616` |
| `mlb:tigers-1930-1969-away` | Detroit Tigers | 1930-1969 | `#a9adb0` `#0c2340` `#fa4616` |
| `mlb:tigers-1994-home` | Detroit Tigers | 1994- | `#fff` `#0c2340` `#fa4616` |
| `mlb:tigers-1994-away` | Detroit Tigers | 1994- | `#a2aaad` `#0c2340` `#fa4616` |
| `mlb:royals-1969-1972-home` | Kansas City Royals | 1969-1972 | `#fff` `#004687` |
| `mlb:royals-1969-1972-away` | Kansas City Royals | 1969-1972 | `#7ab2dd` `#004687` |
| `mlb:royals-1973-1991-home` | Kansas City Royals | 1973-1991 | `#fff` `#004687` |
| `mlb:royals-1973-1991-away` | Kansas City Royals | 1973-1991 | `#7ab2dd` `#004687` |
| `mlb:royals-2006-home` | Kansas City Royals | 2006- | `#fff` `#004687` `#bd9b60` |
| `mlb:royals-2006-away` | Kansas City Royals | 2006- | `#a2aaad` `#004687` `#bd9b60` |
| `mlb:royals-2006-powder` | Kansas City Royals | 2006- | `#7ab2dd` `#004687` `#bd9b60` |
| `mlb:twins-1961-1971-home` | Minnesota Twins | 1961-1971 | `#fff` `#002b5c` `#d31145` |
| `mlb:twins-1961-1971-away` | Minnesota Twins | 1961-1971 | `#a9adb0` `#002b5c` `#d31145` |
| `mlb:twins-1973-1986-home` | Minnesota Twins | 1973-1986 | `#fff` `#002b5c` `#d31145` |
| `mlb:twins-1973-1986-away` | Minnesota Twins | 1973-1986 | `#9cbcdc` `#002b5c` `#d31145` |
| `mlb:twins-2010-home` | Minnesota Twins | 2010- | `#fff` `#002b5c` `#d31145` |
| `mlb:twins-2010-away` | Minnesota Twins | 2010- | `#a2aaad` `#002b5c` `#d31145` |
| `mlb:colts-1962-1964-home` | Houston Colt .45s | 1962-1964 | `#fff` `#002d62` `#ff6600` |
| `mlb:colts-1962-1964-away` | Houston Colt .45s | 1962-1964 | `#a9adb0` `#002d62` `#ff6600` |
| `mlb:astros-1975-1993-home` | Houston Astros | 1975-1993 | `#fff` `#eb6e1f` `#c8102e` |
| `mlb:astros-1975-1993-away` | Houston Astros | 1975-1993 | `#eb6e1f` `#f9a01b` `#c8102e` |
| `mlb:astros-1994-1999-home` | Houston Astros | 1994-1999 | `#fff` `#002d62` `#eb9c2a` |
| `mlb:astros-1994-1999-away` | Houston Astros | 1994-1999 | `#a9adb0` `#002d62` `#eb9c2a` |
| `mlb:astros-2000-2012-home` | Houston Astros | 2000-2012 | `#f5ecd0` `#000` `#9d3a2c` |
| `mlb:astros-2000-2012-away` | Houston Astros | 2000-2012 | `#a9adb0` `#000` `#9d3a2c` |
| `mlb:astros-2013-home` | Houston Astros | 2013- | `#fff` `#002d62` `#eb6e1f` |
| `mlb:astros-2013-away` | Houston Astros | 2013- | `#a2aaad` `#002d62` `#eb6e1f` |
| `mlb:angels-1972-1985-home` | Los Angeles Angels | 1972-1985 | `#fff` `#ba0021` `#003263` |
| `mlb:angels-1972-1985-away` | Los Angeles Angels | 1972-1985 | `#ba0021` `#fff` `#003263` |
| `mlb:angels-2002-home` | Los Angeles Angels | 2002- | `#fff` `#ba0021` `#003263` |
| `mlb:angels-2002-away` | Los Angeles Angels | 2002- | `#a2aaad` `#ba0021` `#003263` |
| `mlb:angels-2002-red` | Los Angeles Angels | 2002- | `#ba0021` `#fff` `#c4ced4` |
| `mlb:athletics-1972-1981-home` | Athletics | 1972-1981 | `#fff` `#006341` `#efb21e` |
| `mlb:athletics-1972-1981-green` | Athletics | 1972-1981 | `#006341` `#efb21e` `#fff` |
| `mlb:athletics-1972-1981-gold` | Athletics | 1972-1981 | `#efb21e` `#006341` `#fff` |
| `mlb:athletics-1987-home` | Athletics | 1987- | `#fff` `#003831` `#efb21e` |
| `mlb:athletics-1987-away` | Athletics | 1987- | `#a2aaad` `#003831` `#efb21e` |
| `mlb:athletics-1987-green` | Athletics | 1987- | `#003831` `#efb21e` `#fff` |
| `mlb:mariners-1977-1992-home` | Seattle Mariners | 1977-1992 | `#fff` `#0c2c56` `#ffcc00` |
| `mlb:mariners-1977-1992-away` | Seattle Mariners | 1977-1992 | `#a9adb0` `#0c2c56` `#ffcc00` |
| `mlb:mariners-1993-2010-home` | Seattle Mariners | 1993-2010 | `#fff` `#0c2c56` `#005c5c` |
| `mlb:mariners-1993-2010-away` | Seattle Mariners | 1993-2010 | `#a9adb0` `#0c2c56` `#005c5c` |
| `mlb:mariners-1993-2010-navy` | Seattle Mariners | 1993-2010 | `#0c2c56` `#005c5c` `#c4ced4` |
| `mlb:mariners-2011-home` | Seattle Mariners | 2011- | `#fff` `#0c2c56` `#005c5c` |
| `mlb:mariners-2011-away` | Seattle Mariners | 2011- | `#a2aaad` `#0c2c56` `#005c5c` |
| `mlb:rangers-1972-1981-home` | Texas Rangers | 1972-1981 | `#fff` `#003278` `#c0111f` |
| `mlb:rangers-1972-1981-away` | Texas Rangers | 1972-1981 | `#a4c6e8` `#003278` `#c0111f` |
| `mlb:rangers-2020-home` | Texas Rangers | 2020- | `#fff` `#003278` `#c0111f` |
| `mlb:rangers-2020-away` | Texas Rangers | 2020- | `#a2aaad` `#003278` `#c0111f` |
| `mlb:rangers-2020-red` | Texas Rangers | 2020- | `#c0111f` `#fff` `#003278` |
| `mlb:bostonbraves-1936-1952-home` | Boston Braves | 1936-1952 | `#fff` `#c8102e` `#0c2340` |
| `mlb:bostonbraves-1936-1952-away` | Boston Braves | 1936-1952 | `#a9adb0` `#c8102e` `#0c2340` |
| `mlb:milbraves-1953-1965-home` | Milwaukee Braves | 1953-1965 | `#fff` `#0c2340` `#c8102e` |
| `mlb:milbraves-1953-1965-away` | Milwaukee Braves | 1953-1965 | `#a9adb0` `#0c2340` `#c8102e` |
| `mlb:braves-1966-1971-home` | Atlanta Braves | 1966-1971 | `#fff` `#0c2340` `#ce1141` |
| `mlb:braves-1966-1971-away` | Atlanta Braves | 1966-1971 | `#a9adb0` `#0c2340` `#ce1141` |
| `mlb:braves-1972-1975-away` | Atlanta Braves | 1972-1975 | `#9cbcdc` `#ce1141` `#0c2340` |
| `mlb:braves-1987-home` | Atlanta Braves | 1987- | `#fff` `#ce1141` `#0c2340` |
| `mlb:braves-1987-away` | Atlanta Braves | 1987- | `#a2aaad` `#ce1141` `#0c2340` |
| `mlb:marlins-1993-2002-home` | Miami Marlins | 1993-2002 | `#fff` `#00a3ad` `#000` |
| `mlb:marlins-1993-2002-away` | Miami Marlins | 1993-2002 | `#a9adb0` `#00a3ad` `#000` |
| `mlb:marlins-2012-2018-home` | Miami Marlins | 2012-2018 | `#fff` `#ff6600` `#00a3e0` |
| `mlb:marlins-2019-home` | Miami Marlins | 2019- | `#fff` `#000` `#00a3e0` |
| `mlb:marlins-2019-away` | Miami Marlins | 2019- | `#a2aaad` `#000` `#00a3e0` |
| `mlb:mets-1962-1977-home` | New York Mets | 1962-1977 | `#fff` `#002d72` `#ff5910` |
| `mlb:mets-1962-1977-away` | New York Mets | 1962-1977 | `#a9adb0` `#002d72` `#ff5910` |
| `mlb:mets-1978-1982-home` | New York Mets | 1978-1982 | `#fff` `#002d72` `#ff5910` |
| `mlb:mets-1999-home` | New York Mets | 1999- | `#fff` `#002d72` `#ff5910` |
| `mlb:mets-1999-away` | New York Mets | 1999- | `#a2aaad` `#002d72` `#ff5910` |
| `mlb:phillies-1950-1969-home` | Philadelphia Phillies | 1950-1969 | `#fff` `#e81828` `#002d72` |
| `mlb:phillies-1950-1969-away` | Philadelphia Phillies | 1950-1969 | `#a9adb0` `#e81828` `#002d72` |
| `mlb:phillies-1970-1991-home` | Philadelphia Phillies | 1970-1991 | `#fff` `#6f263d` |
| `mlb:phillies-1970-1991-away` | Philadelphia Phillies | 1970-1991 | `#9cbcdc` `#6f263d` |
| `mlb:phillies-1992-home` | Philadelphia Phillies | 1992- | `#fff` `#e81828` `#002d72` |
| `mlb:phillies-1992-away` | Philadelphia Phillies | 1992- | `#a2aaad` `#e81828` `#002d72` |
| `mlb:nationals-2005-home` | Washington Nationals | 2005- | `#fff` `#ab0003` `#14225a` |
| `mlb:nationals-2005-away` | Washington Nationals | 2005- | `#a2aaad` `#ab0003` `#14225a` |
| `mlb:expos-1969-1976-home` | Montreal Expos | 1969-1976 | `#fff` `#c8102e` `#003087` |
| `mlb:expos-1977-1991-home` | Montreal Expos | 1977-1991 | `#fff` `#003087` `#c8102e` |
| `mlb:expos-1977-1991-away` | Montreal Expos | 1977-1991 | `#6cace4` `#003087` `#c8102e` |
| `mlb:expos-1992-2004-home` | Montreal Expos | 1992-2004 | `#fff` `#003087` `#c8102e` |
| `mlb:expos-1992-2004-away` | Montreal Expos | 1992-2004 | `#a9adb0` `#003087` `#c8102e` |
| `mlb:cubs-1957-home` | Chicago Cubs | 1957- | `#fff` `#0e3386` `#cc3433` |
| `mlb:cubs-1957-away` | Chicago Cubs | 1957- | `#a9adb0` `#0e3386` `#cc3433` |
| `mlb:cubs-1990-blue` | Chicago Cubs | 1990- | `#0e3386` `#cc3433` `#fff` |
| `mlb:reds-1956-1966-home` | Cincinnati Reds | 1956-1966 | `#fff` `#c6011f` |
| `mlb:reds-1956-1966-away` | Cincinnati Reds | 1956-1966 | `#a9adb0` `#c6011f` |
| `mlb:reds-1967-home` | Cincinnati Reds | 1967- | `#fff` `#c6011f` `#000` |
| `mlb:reds-1967-away` | Cincinnati Reds | 1967- | `#a2aaad` `#c6011f` `#000` |
| `mlb:brewers-1978-1993-home` | Milwaukee Brewers | 1978-1993 | `#fff` `#00297b` `#ffc52f` |
| `mlb:brewers-1978-1993-away` | Milwaukee Brewers | 1978-1993 | `#9cbcdc` `#00297b` `#ffc52f` |
| `mlb:brewers-2000-2019-home` | Milwaukee Brewers | 2000-2019 | `#fff` `#13294b` `#ffc52f` |
| `mlb:brewers-2000-2019-away` | Milwaukee Brewers | 2000-2019 | `#a2aaad` `#13294b` `#ffc52f` |
| `mlb:brewers-2020-home` | Milwaukee Brewers | 2020- | `#fff` `#12284b` `#ffc52f` |
| `mlb:brewers-2020-away` | Milwaukee Brewers | 2020- | `#a2aaad` `#12284b` `#ffc52f` |
| `mlb:pirates-1960-1969-home` | Pittsburgh Pirates | 1960-1969 | `#fff` `#27251f` `#fdb827` |
| `mlb:pirates-1960-1969-away` | Pittsburgh Pirates | 1960-1969 | `#a9adb0` `#27251f` `#fdb827` |
| `mlb:pirates-1970-1976-home` | Pittsburgh Pirates | 1970-1976 | `#fff` `#27251f` `#fdb827` |
| `mlb:pirates-1970-1976-away` | Pittsburgh Pirates | 1970-1976 | `#a9adb0` `#27251f` `#fdb827` |
| `mlb:pirates-1977-1979-home` | Pittsburgh Pirates | 1977-1979 | `#fff` `#27251f` `#fdb827` |
| `mlb:pirates-1977-1979-black` | Pittsburgh Pirates | 1977-1979 | `#27251f` `#fdb827` `#fff` |
| `mlb:pirates-1977-1979-gold` | Pittsburgh Pirates | 1977-1979 | `#fdb827` `#27251f` `#fff` |
| `mlb:pirates-1991-home` | Pittsburgh Pirates | 1991- | `#fff` `#27251f` `#fdb827` |
| `mlb:pirates-1991-away` | Pittsburgh Pirates | 1991- | `#a2aaad` `#27251f` `#fdb827` |
| `mlb:pirates-1991-black` | Pittsburgh Pirates | 1991- | `#27251f` `#fdb827` `#fff` |
| `mlb:cardinals-1940-1969-home` | St. Louis Cardinals | 1940-1969 | `#fff` `#c41e3a` `#0c2340` |
| `mlb:cardinals-1940-1969-away` | St. Louis Cardinals | 1940-1969 | `#a9adb0` `#c41e3a` `#0c2340` |
| `mlb:cardinals-1970-1991-home` | St. Louis Cardinals | 1970-1991 | `#fff` `#c41e3a` |
| `mlb:cardinals-1970-1991-away` | St. Louis Cardinals | 1970-1991 | `#9cbcdc` `#c41e3a` |
| `mlb:cardinals-1992-home` | St. Louis Cardinals | 1992- | `#fff` `#c41e3a` `#0c2340` |
| `mlb:cardinals-1992-away` | St. Louis Cardinals | 1992- | `#a2aaad` `#c41e3a` `#0c2340` |
| `mlb:dbacks-1998-2006-home` | Arizona Diamondbacks | 1998-2006 | `#fff` `#5b2c83` `#00a3a6` |
| `mlb:dbacks-1998-2006-away` | Arizona Diamondbacks | 1998-2006 | `#a9adb0` `#5b2c83` `#00a3a6` |
| `mlb:dbacks-2007-2023-home` | Arizona Diamondbacks | 2007-2023 | `#fff` `#a71930` `#e3d4ad` |
| `mlb:dbacks-2007-2023-away` | Arizona Diamondbacks | 2007-2023 | `#a2aaad` `#a71930` `#e3d4ad` |
| `mlb:dbacks-2007-2023-red` | Arizona Diamondbacks | 2007-2023 | `#a71930` `#e3d4ad` `#000` |
| `mlb:rockies-1993-home` | Colorado Rockies | 1993- | `#fff` `#33006f` `#c4ced4` |
| `mlb:rockies-1993-away` | Colorado Rockies | 1993- | `#a2aaad` `#33006f` `#c4ced4` |
| `mlb:rockies-1993-purple` | Colorado Rockies | 1993- | `#33006f` `#c4ced4` `#000` |
| `mlb:brooklyn-1939-1957-home` | Brooklyn Dodgers | 1939-1957 | `#fff` `#005a9c` `#ef3e42` |
| `mlb:brooklyn-1939-1957-away` | Brooklyn Dodgers | 1939-1957 | `#a9adb0` `#005a9c` `#ef3e42` |
| `mlb:dodgers-1958-home` | Los Angeles Dodgers | 1958- | `#fff` `#005a9c` `#ef3e42` |
| `mlb:dodgers-1958-away` | Los Angeles Dodgers | 1958- | `#a9adb0` `#005a9c` `#ef3e42` |
| `mlb:nygiants-1947-1957-home` | New York Giants | 1947-1957 | `#fff` `#000` `#fd5a1e` |
| `mlb:nygiants-1947-1957-away` | New York Giants | 1947-1957 | `#a9adb0` `#000` `#fd5a1e` |
| `mlb:giants-1958-home` | San Francisco Giants | 1958- | `#fff` `#27251f` `#fd5a1e` |
| `mlb:giants-1958-away` | San Francisco Giants | 1958- | `#a2aaad` `#27251f` `#fd5a1e` |
| `mlb:giants-1990-orange` | San Francisco Giants | 1990- | `#fd5a1e` `#27251f` `#fff` |
| `mlb:padres-1969-1971-home` | San Diego Padres | 1969-1971 | `#f5ecd0` `#4a2c1a` `#ffc425` |
| `mlb:padres-1969-1971-away` | San Diego Padres | 1969-1971 | `#d2b48c` `#4a2c1a` `#ffc425` |
| `mlb:padres-1972-1973-gold` | San Diego Padres | 1972-1973 | `#ffc425` `#4a2c1a` `#fff` |
| `mlb:padres-1976-1977-brown` | San Diego Padres | 1976-1977 | `#4a2c1a` `#ffc425` `#fff` |
| `mlb:padres-1985-1990-home` | San Diego Padres | 1985-1990 | `#fff` `#4a2c1a` `#ff6600` |
| `mlb:padres-1991-2003-home` | San Diego Padres | 1991-2003 | `#fff` `#0c2340` `#fe5a1d` |
| `mlb:padres-1991-2003-away` | San Diego Padres | 1991-2003 | `#a9adb0` `#0c2340` `#fe5a1d` |
| `mlb:padres-2020-home` | San Diego Padres | 2020- | `#fff` `#2f241d` `#ffc425` |
| `mlb:padres-2020-away` | San Diego Padres | 2020- | `#e3d4ad` `#2f241d` `#ffc425` |
| `mlb:pilots-1969-home` | Seattle Pilots | 1969 | `#fff` `#0c2c56` `#ffcb05` |
| `mlb:pilots-1969-away` | Seattle Pilots | 1969 | `#a9adb0` `#0c2c56` `#ffcb05` |
| `mlb:senators-1950s-home` | Washington Senators | 1950s | `#fff` `#c8102e` `#0c2340` |
| `mlb:senators-1950s-away` | Washington Senators | 1950s | `#a9adb0` `#c8102e` `#0c2340` |
| `mlb:phila-1930s-home` | Philadelphia Athletics | 1930s | `#fff` `#0c2340` |
| `mlb:phila-1930s-away` | Philadelphia Athletics | 1930s | `#a9adb0` `#0c2340` |

## NBA

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `nba:hawks-1972-1995-home` | Atlanta Hawks | 1972-1995 | `#fff` `#e03a3e` `#ffc72c` |
| `nba:hawks-1972-1995-away` | Atlanta Hawks | 1972-1995 | `#e03a3e` `#ffc72c` `#fff` |
| `nba:hawks-2020-home` | Atlanta Hawks | 2020- | `#fff` `#c8102e` `#c1d32f` |
| `nba:hawks-2020-away` | Atlanta Hawks | 2020- | `#c8102e` `#fff` `#c1d32f` |
| `nba:celtics-1950-1996-home` | Boston Celtics | 1950-1996 | `#fff` `#007a33` |
| `nba:celtics-1950-1996-away` | Boston Celtics | 1950-1996 | `#007a33` `#fff` |
| `nba:celtics-1997-home` | Boston Celtics | 1997- | `#fff` `#007a33` `#ba9653` |
| `nba:celtics-1997-away` | Boston Celtics | 1997- | `#007a33` `#fff` `#ba9653` |
| `nba:nynets-1972-1977-home` | New York Nets | 1972-1977 | `#fff` `#0033a0` `#c8102e` |
| `nba:nynets-1972-1977-away` | New York Nets | 1972-1977 | `#0033a0` `#fff` `#c8102e` |
| `nba:njnets-1977-1989-home` | New Jersey Nets | 1977-1989 | `#fff` `#c8102e` `#002a60` |
| `nba:njnets-1977-1989-away` | New Jersey Nets | 1977-1989 | `#002a60` `#fff` `#c8102e` |
| `nba:njnets-1990-1996-home` | New Jersey Nets | 1990-1996 | `#fff` `#c8102e` `#002a60` |
| `nba:njnets-1990-1996-away` | New Jersey Nets | 1990-1996 | `#0f2d65` `#c8102e` `#fff` |
| `nba:njnets-1997-2011-home` | New Jersey Nets | 1997-2011 | `#fff` `#0c2340` `#c4ced4` |
| `nba:njnets-1997-2011-away` | New Jersey Nets | 1997-2011 | `#0c2340` `#c4ced4` `#c8102e` |
| `nba:njnets-2009-2011-red` | New Jersey Nets | 2009-2011 | `#c8102e` `#0c2340` `#c4ced4` |
| `nba:nets-2012-home` | Brooklyn Nets | 2012- | `#fff` `#000` |
| `nba:nets-2012-away` | Brooklyn Nets | 2012- | `#000` `#fff` |
| `nba:charlotte-1988-2001-home` | Charlotte Hornets | 1988-2001 | `#fff` `#00788c` `#1d1160` |
| `nba:charlotte-1988-2001-away` | Charlotte Hornets | 1988-2001 | `#00788c` `#fff` `#1d1160` |
| `nba:charlotte-2014-home` | Charlotte Hornets | 2014- | `#fff` `#1d1160` `#00788c` |
| `nba:charlotte-2014-away` | Charlotte Hornets | 2014- | `#1d1160` `#00788c` `#fff` |
| `nba:neworleans-2003-2013-home` | New Orleans Hornets | 2003-2013 | `#fff` `#00778b` `#1d1160` |
| `nba:neworleans-2003-2013-away` | New Orleans Hornets | 2003-2013 | `#00778b` `#1d1160` `#ffc72c` |
| `nba:bobcats-2004-2013-home` | Charlotte Bobcats | 2004-2013 | `#fff` `#f26531` `#1d4f91` |
| `nba:bobcats-2004-2013-away` | Charlotte Bobcats | 2004-2013 | `#1d4f91` `#f26531` `#000` |
| `nba:bulls-1966-home` | Chicago Bulls | 1966- | `#fff` `#ce1141` `#000` |
| `nba:bulls-1966-away` | Chicago Bulls | 1966- | `#ce1141` `#000` `#fff` |
| `nba:cavaliers-1970-1982-home` | Cleveland Cavaliers | 1970-1982 | `#fff` `#860038` `#fdbb30` |
| `nba:cavaliers-1970-1982-away` | Cleveland Cavaliers | 1970-1982 | `#860038` `#fdbb30` `#fff` |
| `nba:cavaliers-1983-1993-home` | Cleveland Cavaliers | 1983-1993 | `#fff` `#005baa` `#f26f21` |
| `nba:cavaliers-1983-1993-away` | Cleveland Cavaliers | 1983-1993 | `#005baa` `#f26f21` `#fff` |
| `nba:cavaliers-1994-2002-home` | Cleveland Cavaliers | 1994-2002 | `#fff` `#041e42` `#f26f21` |
| `nba:cavaliers-1994-2002-away` | Cleveland Cavaliers | 1994-2002 | `#041e42` `#f26f21` `#fff` |
| `nba:cavaliers-2003-2009-home` | Cleveland Cavaliers | 2003-2009 | `#fff` `#860038` `#fdbb30` |
| `nba:cavaliers-2003-2009-away` | Cleveland Cavaliers | 2003-2009 | `#860038` `#fdbb30` `#041e42` |
| `nba:mavericks-1980-1992-home` | Dallas Mavericks | 1980-1992 | `#fff` `#0053bc` `#00843d` |
| `nba:mavericks-1980-1992-away` | Dallas Mavericks | 1980-1992 | `#00843d` `#fff` `#0053bc` |
| `nba:mavericks-2001-home` | Dallas Mavericks | 2001- | `#fff` `#00538c` `#002b5e` |
| `nba:mavericks-2001-away` | Dallas Mavericks | 2001- | `#002b5e` `#00538c` `#b8c4ca` |
| `nba:nuggets-1982-1992-home` | Denver Nuggets | 1982-1992 | `#fff` `#4b92db` `#fdb927` |
| `nba:nuggets-1982-1992-away` | Denver Nuggets | 1982-1992 | `#4b92db` `#fdb927` `#fff` |
| `nba:nuggets-1993-2002-home` | Denver Nuggets | 1993-2002 | `#fff` `#0c2340` `#ffc72c` |
| `nba:nuggets-1993-2002-away` | Denver Nuggets | 1993-2002 | `#0c2340` `#ffc72c` `#7d1d4a` |
| `nba:nuggets-2003-2017-home` | Denver Nuggets | 2003-2017 | `#fff` `#4b92db` `#0c2340` |
| `nba:nuggets-2003-2017-away` | Denver Nuggets | 2003-2017 | `#4b92db` `#0c2340` `#fdb927` |
| `nba:nuggets-2018-home` | Denver Nuggets | 2018- | `#fff` `#0e2240` `#fec524` |
| `nba:nuggets-2018-away` | Denver Nuggets | 2018- | `#0e2240` `#fec524` `#8b2131` |
| `nba:rockets-aba-1970-1974-home` | Denver Rockets | 1970-1974 | `#fff` `#4b92db` `#fdb927` |
| `nba:rockets-aba-1970-1974-away` | Denver Rockets | 1970-1974 | `#4b92db` `#fdb927` `#fff` |
| `nba:pistons-1980-1995-home` | Detroit Pistons | 1980-1995 | `#fff` `#c8102e` `#1d42ba` |
| `nba:pistons-1980-1995-away` | Detroit Pistons | 1980-1995 | `#1d42ba` `#c8102e` `#fff` |
| `nba:pistons-1996-2000-home` | Detroit Pistons | 1996-2000 | `#fff` `#00756a` `#c8102e` |
| `nba:pistons-1996-2000-away` | Detroit Pistons | 1996-2000 | `#00756a` `#c8102e` `#000` |
| `nba:pistons-2005-2016-home` | Detroit Pistons | 2005-2016 | `#fff` `#c8102e` `#1d42ba` |
| `nba:pistons-2005-2016-away` | Detroit Pistons | 2005-2016 | `#1d42ba` `#c8102e` `#fff` |
| `nba:phillywarriors-1959-1962-home` | Philadelphia Warriors | 1959-1962 | `#fff` `#c8102e` `#0033a0` |
| `nba:warriors-1975-1996-home` | Golden State Warriors | 1975-1996 | `#fff` `#1d428a` `#ffc72c` |
| `nba:warriors-1975-1996-away` | Golden State Warriors | 1975-1996 | `#1d428a` `#ffc72c` `#fff` |
| `nba:warriors-2010-home` | Golden State Warriors | 2010- | `#fff` `#1d428a` `#ffc72c` |
| `nba:warriors-2010-away` | Golden State Warriors | 2010- | `#1d428a` `#ffc72c` `#fff` |
| `nba:rockets-1980-1994-home` | Houston Rockets | 1980-1994 | `#fff` `#ce1141` `#ffc72c` |
| `nba:rockets-1980-1994-away` | Houston Rockets | 1980-1994 | `#ce1141` `#ffc72c` `#fff` |
| `nba:rockets-2003-2019-home` | Houston Rockets | 2003-2019 | `#fff` `#ce1141` `#c4ced4` |
| `nba:rockets-2003-2019-away` | Houston Rockets | 2003-2019 | `#ce1141` `#c4ced4` `#000` |
| `nba:pacers-1967-1989-home` | Indiana Pacers | 1967-1989 | `#fff` `#002d62` `#fdbb30` |
| `nba:pacers-1967-1989-away` | Indiana Pacers | 1967-1989 | `#002d62` `#fdbb30` `#fff` |
| `nba:pacers-2005-home` | Indiana Pacers | 2005- | `#fff` `#002d62` `#fdbb30` |
| `nba:pacers-2005-away` | Indiana Pacers | 2005- | `#002d62` `#fdbb30` `#fff` |
| `nba:braves-1971-1972-home` | Buffalo Braves | 1971-1972 | `#fff` `#f58426` `#000` |
| `nba:braves-1971-1972-away` | Buffalo Braves | 1971-1972 | `#f58426` `#000` `#fff` |
| `nba:braves-1973-1977-home` | Buffalo Braves | 1973-1977 | `#fff` `#6cace4` `#000` |
| `nba:braves-1973-1977-away` | Buffalo Braves | 1973-1977 | `#6cace4` `#fff` `#000` |
| `nba:clippers-1984-2009-home` | Los Angeles Clippers | 1984-2009 | `#fff` `#c8102e` `#1d428a` |
| `nba:clippers-1984-2009-away` | Los Angeles Clippers | 1984-2009 | `#c8102e` `#fff` `#1d428a` |
| `nba:clippers-2010-home` | Los Angeles Clippers | 2010- | `#fff` `#c8102e` `#1d428a` |
| `nba:clippers-2010-away` | Los Angeles Clippers | 2010- | `#1d428a` `#c8102e` `#fff` |
| `nba:mpls-1948-1957-home` | Minneapolis Lakers | 1948-1957 | `#fff` `#7fb3e0` `#fdb927` |
| `nba:mpls-1948-1957-away` | Minneapolis Lakers | 1948-1957 | `#7fb3e0` `#fdb927` `#fff` |
| `nba:mpls-1958-1960-home` | Minneapolis Lakers | 1958-1960 | `#fff` `#0033a0` |
| `nba:mpls-1958-1960-away` | Minneapolis Lakers | 1958-1960 | `#0033a0` `#fff` |
| `nba:lakers-1960-1966-home` | Los Angeles Lakers | 1960-1966 | `#fff` `#0033a0` `#7fb3e0` |
| `nba:lakers-1960-1966-away` | Los Angeles Lakers | 1960-1966 | `#0033a0` `#fff` `#7fb3e0` |
| `nba:lakers-1967-1977-home` | Los Angeles Lakers | 1967-1977 | `#fdb927` `#552583` `#fff` |
| `nba:lakers-1967-1977-away` | Los Angeles Lakers | 1967-1977 | `#552583` `#fdb927` `#fff` |
| `nba:lakers-1978-1998-home` | Los Angeles Lakers | 1978-1998 | `#fdb927` `#552583` `#fff` |
| `nba:lakers-1978-1998-away` | Los Angeles Lakers | 1978-1998 | `#552583` `#fdb927` `#fff` |
| `nba:lakers-1999-2017-home` | Los Angeles Lakers | 1999-2017 | `#fdb927` `#552583` `#fff` |
| `nba:lakers-1999-2017-away` | Los Angeles Lakers | 1999-2017 | `#552583` `#fdb927` `#fff` |
| `nba:lakers-2002-white` | Los Angeles Lakers | 2002- | `#fff` `#552583` `#fdb927` |
| `nba:lakers-2018-home` | Los Angeles Lakers | 2018- | `#fdb927` `#552583` `#fff` |
| `nba:lakers-2018-away` | Los Angeles Lakers | 2018- | `#552583` `#000` `#fdb927` |
| `nba:vancouver-1995-2000-home` | Vancouver Grizzlies | 1995-2000 | `#fff` `#00a9b5` `#000` |
| `nba:vancouver-1995-2000-away` | Vancouver Grizzlies | 1995-2000 | `#00a9b5` `#000` `#a4552b` |
| `nba:vancouver-1995-2000-black` | Vancouver Grizzlies | 1995-2000 | `#000` `#00a9b5` `#fff` |
| `nba:grizzlies-2004-home` | Memphis Grizzlies | 2004- | `#fff` `#5d76a9` `#12173f` |
| `nba:grizzlies-2004-away` | Memphis Grizzlies | 2004- | `#5d76a9` `#f5b112` `#12173f` |
| `nba:heat-1988-1998-home` | Miami Heat | 1988-1998 | `#fff` `#98002e` `#f9a01b` |
| `nba:heat-1988-1998-away` | Miami Heat | 1988-1998 | `#98002e` `#f9a01b` `#000` |
| `nba:heat-1999-home` | Miami Heat | 1999- | `#fff` `#98002e` `#f9a01b` |
| `nba:heat-1999-away` | Miami Heat | 1999- | `#98002e` `#f9a01b` `#000` |
| `nba:heat-1999-black` | Miami Heat | 1999- | `#000` `#98002e` `#f9a01b` |
| `nba:bucks-1968-1992-home` | Milwaukee Bucks | 1968-1992 | `#fff` `#00471b` `#cc0000` |
| `nba:bucks-1968-1992-away` | Milwaukee Bucks | 1968-1992 | `#00471b` `#fff` `#cc0000` |
| `nba:bucks-1993-2005-home` | Milwaukee Bucks | 1993-2005 | `#fff` `#4b2e83` `#00a65a` |
| `nba:bucks-1993-2005-away` | Milwaukee Bucks | 1993-2005 | `#4b2e83` `#00a65a` `#c4ced4` |
| `nba:bucks-2015-home` | Milwaukee Bucks | 2015- | `#fff` `#00471b` `#eee1c6` |
| `nba:bucks-2015-away` | Milwaukee Bucks | 2015- | `#00471b` `#eee1c6` `#0077c0` |
| `nba:wolves-2008-2016-home` | Minnesota Timberwolves | 2008-2016 | `#fff` `#236192` `#78be20` |
| `nba:wolves-2008-2016-away` | Minnesota Timberwolves | 2008-2016 | `#236192` `#78be20` `#9ea2a2` |
| `nba:wolves-2017-home` | Minnesota Timberwolves | 2017- | `#fff` `#0c2340` `#78be20` |
| `nba:wolves-2017-away` | Minnesota Timberwolves | 2017- | `#0c2340` `#236192` `#78be20` |
| `nba:knicks-1960-home` | New York Knicks | 1960- | `#fff` `#006bb6` `#f58426` |
| `nba:knicks-1960-away` | New York Knicks | 1960- | `#006bb6` `#f58426` `#fff` |
| `nba:pelicans-2013-home` | New Orleans Pelicans | 2013- | `#fff` `#0c2340` `#c8102e` |
| `nba:pelicans-2013-away` | New Orleans Pelicans | 2013- | `#0c2340` `#85714d` `#c8102e` |
| `nba:pelicans-2013-red` | New Orleans Pelicans | 2013- | `#c8102e` `#0c2340` `#85714d` |
| `nba:thunder-2008-home` | Oklahoma City Thunder | 2008- | `#fff` `#007ac1` `#ef3b24` |
| `nba:thunder-2008-away` | Oklahoma City Thunder | 2008- | `#007ac1` `#ef3b24` `#fdbb30` |
| `nba:sonics-1967-1974-home` | Seattle SuperSonics | 1967-1974 | `#fff` `#00653a` `#ffc200` |
| `nba:sonics-1967-1974-away` | Seattle SuperSonics | 1967-1974 | `#00653a` `#fff` `#ffc200` |
| `nba:sonics-1975-1994-home` | Seattle SuperSonics | 1975-1994 | `#fff` `#00653a` `#ffc200` |
| `nba:sonics-1975-1994-away` | Seattle SuperSonics | 1975-1994 | `#00653a` `#ffc200` `#fff` |
| `nba:sonics-1995-2000-home` | Seattle SuperSonics | 1995-2000 | `#fff` `#00653a` `#ee1c25` |
| `nba:sonics-1995-2000-away` | Seattle SuperSonics | 1995-2000 | `#00653a` `#ee1c25` `#a75d0f` |
| `nba:sonics-2001-2007-home` | Seattle SuperSonics | 2001-2007 | `#fff` `#00653a` `#ffc200` |
| `nba:sonics-2001-2007-away` | Seattle SuperSonics | 2001-2007 | `#00653a` `#ffc200` `#fff` |
| `nba:magic-1989-1999-home` | Orlando Magic | 1989-1999 | `#fff` `#0077c0` `#000` |
| `nba:magic-1989-1999-away` | Orlando Magic | 1989-1999 | `#0077c0` `#000` |
| `nba:magic-2008-home` | Orlando Magic | 2008- | `#fff` `#0077c0` `#c4ced4` |
| `nba:magic-2008-away` | Orlando Magic | 2008- | `#0077c0` `#c4ced4` `#000` |
| `nba:sixers-1970-1996-home` | Philadelphia 76ers | 1970-1996 | `#fff` `#ed174c` `#006bb6` |
| `nba:sixers-1970-1996-away` | Philadelphia 76ers | 1970-1996 | `#006bb6` `#ed174c` `#fff` |
| `nba:sixers-2010-home` | Philadelphia 76ers | 2010- | `#fff` `#006bb6` `#ed174c` |
| `nba:sixers-2010-away` | Philadelphia 76ers | 2010- | `#006bb6` `#ed174c` `#fff` |
| `nba:nationals-1950-1962-home` | Syracuse Nationals | 1950-1962 | `#fff` `#c8102e` `#0033a0` |
| `nba:nationals-1950-1962-away` | Syracuse Nationals | 1950-1962 | `#0033a0` `#fff` `#c8102e` |
| `nba:suns-1968-1991-home` | Phoenix Suns | 1968-1991 | `#fff` `#1d1160` `#e56020` |
| `nba:suns-1968-1991-away` | Phoenix Suns | 1968-1991 | `#1d1160` `#e56020` `#fff` |
| `nba:suns-2013-home` | Phoenix Suns | 2013- | `#fff` `#1d1160` `#e56020` |
| `nba:suns-2013-away` | Phoenix Suns | 2013- | `#1d1160` `#e56020` `#fff` |
| `nba:suns-2013-orange` | Phoenix Suns | 2013- | `#e56020` `#1d1160` `#fff` |
| `nba:blazers-1970-2001-home` | Portland Trail Blazers | 1970-2001 | `#fff` `#e03a3e` `#000` |
| `nba:blazers-1970-2001-away` | Portland Trail Blazers | 1970-2001 | `#e03a3e` `#000` `#fff` |
| `nba:blazers-2017-home` | Portland Trail Blazers | 2017- | `#fff` `#e03a3e` `#000` |
| `nba:blazers-2017-away` | Portland Trail Blazers | 2017- | `#000` `#e03a3e` `#fff` |
| `nba:royals-1957-1971-home` | Cincinnati Royals | 1957-1971 | `#fff` `#0033a0` |
| `nba:royals-1957-1971-away` | Cincinnati Royals | 1957-1971 | `#0033a0` `#fff` |
| `nba:kckings-1972-1984-home` | Kansas City Kings | 1972-1984 | `#fff` `#c8102e` `#0033a0` |
| `nba:kckings-1972-1984-away` | Kansas City Kings | 1972-1984 | `#0033a0` `#c8102e` `#fff` |
| `nba:kings-1994-2007-home` | Sacramento Kings | 1994-2007 | `#fff` `#5a2d81` `#000` |
| `nba:kings-1994-2007-away` | Sacramento Kings | 1994-2007 | `#5a2d81` `#c4ced4` `#000` |
| `nba:kings-1994-2007-black` | Sacramento Kings | 1994-2007 | `#000` `#5a2d81` `#c4ced4` |
| `nba:kings-2016-home` | Sacramento Kings | 2016- | `#fff` `#5a2d81` `#63727a` |
| `nba:kings-2016-away` | Sacramento Kings | 2016- | `#5a2d81` `#63727a` `#fff` |
| `nba:spurs-1976-home` | San Antonio Spurs | 1976- | `#fff` `#c4ced4` `#000` |
| `nba:spurs-1976-away` | San Antonio Spurs | 1976- | `#000` `#c4ced4` `#fff` |
| `nba:raptors-1995-2007-home` | Toronto Raptors | 1995-2007 | `#fff` `#753bbd` `#ce1141` |
| `nba:raptors-1995-2007-away` | Toronto Raptors | 1995-2007 | `#753bbd` `#ce1141` `#000` |
| `nba:raptors-2008-home` | Toronto Raptors | 2008- | `#fff` `#ce1141` `#000` |
| `nba:raptors-2008-away` | Toronto Raptors | 2008- | `#ce1141` `#000` `#fff` |
| `nba:raptors-2008-black` | Toronto Raptors | 2008- | `#000` `#ce1141` `#c4ced4` |
| `nba:nojazz-1974-1978-home` | New Orleans Jazz | 1974-1978 | `#fff` `#4b2e83` `#ffc72c` |
| `nba:nojazz-1974-1978-away` | New Orleans Jazz | 1974-1978 | `#4b2e83` `#ffc72c` `#00843d` |
| `nba:jazz-1979-1995-home` | Utah Jazz | 1979-1995 | `#fff` `#4b2e83` `#ffc72c` |
| `nba:jazz-1979-1995-away` | Utah Jazz | 1979-1995 | `#4b2e83` `#ffc72c` `#fff` |
| `nba:jazz-1996-2003-home` | Utah Jazz | 1996-2003 | `#fff` `#4b2e83` `#00a3b1` |
| `nba:jazz-1996-2003-away` | Utah Jazz | 1996-2003 | `#4b2e83` `#00a3b1` `#a35b2f` |
| `nba:jazz-2016-home` | Utah Jazz | 2016- | `#fff` `#002b5c` `#f9a01b` |
| `nba:jazz-2016-away` | Utah Jazz | 2016- | `#002b5c` `#f9a01b` `#fff` |
| `nba:bullets-1974-1996-home` | Washington Bullets | 1974-1996 | `#fff` `#e31837` `#002b5c` |
| `nba:bullets-1974-1996-away` | Washington Bullets | 1974-1996 | `#e31837` `#fff` `#002b5c` |
| `nba:wizards-1997-2006-home` | Washington Wizards | 1997-2006 | `#fff` `#002b5c` `#cb8e48` |
| `nba:wizards-1997-2006-away` | Washington Wizards | 1997-2006 | `#002b5c` `#cb8e48` `#000` |
| `nba:wizards-2011-home` | Washington Wizards | 2011- | `#fff` `#002b5c` `#e31837` |
| `nba:wizards-2011-away` | Washington Wizards | 2011- | `#002b5c` `#e31837` `#fff` |
| `nba:colonels-1967-1969-home` | Kentucky Colonels | 1967-1969 | `#fff` `#c4d600` |
| `nba:colonels-1967-1969-away` | Kentucky Colonels | 1967-1969 | `#c4d600` `#fff` |
| `nba:colonels-1970-1973-home` | Kentucky Colonels | 1970-1973 | `#fff` `#0033a0` |
| `nba:colonels-1970-1973-away` | Kentucky Colonels | 1970-1973 | `#0033a0` `#fff` |
| `nba:colonels-1974-1975-home` | Kentucky Colonels | 1974-1975 | `#fff` `#0033a0` `#c8102e` |
| `nba:spirits-1975-1976-home` | Spirits of St. Louis | 1975-1976 | `#fff` `#cc5500` `#000` |
| `nba:spirits-1975-1976-away` | Spirits of St. Louis | 1975-1976 | `#cc5500` `#000` `#fff` |

## NFL

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `nfl:cowboys-1964-1994-white` | Dallas Cowboys | 1964-1994 | `#fff` `#003594` |
| `nfl:cowboys-1964-1994-blue` | Dallas Cowboys | 1964-1994 | `#003594` `#fff` |
| `nfl:cowboys-1995-white` | Dallas Cowboys | 1995- | `#fff` `#002244` `#869397` |
| `nfl:cowboys-1995-navy` | Dallas Cowboys | 1995- | `#002244` `#869397` `#fff` |
| `nfl:giants-1961-1974-home` | New York Giants | 1961-1974 | `#0b2265` `#fff` |
| `nfl:giants-1961-1974-away` | New York Giants | 1961-1974 | `#fff` `#0b2265` |
| `nfl:giants-1975-1999-home` | New York Giants | 1975-1999 | `#0b2265` `#fff` `#a71930` |
| `nfl:giants-1975-1999-away` | New York Giants | 1975-1999 | `#fff` `#0b2265` `#a71930` |
| `nfl:giants-2000-home` | New York Giants | 2000- | `#0b2265` `#fff` `#a71930` |
| `nfl:giants-2000-away` | New York Giants | 2000- | `#fff` `#0b2265` `#a71930` |
| `nfl:eagles-1960-1969-home` | Philadelphia Eagles | 1960-1969 | `#00693c` `#fff` |
| `nfl:eagles-1960-1969-away` | Philadelphia Eagles | 1960-1969 | `#fff` `#00693c` |
| `nfl:eagles-1974-1995-home` | Philadelphia Eagles | 1974-1995 | `#00693c` `#fff` `#c0c0c0` |
| `nfl:eagles-1974-1995-away` | Philadelphia Eagles | 1974-1995 | `#fff` `#00693c` `#c0c0c0` |
| `nfl:eagles-1996-home` | Philadelphia Eagles | 1996- | `#004c54` `#a5acaf` `#000` |
| `nfl:eagles-1996-away` | Philadelphia Eagles | 1996- | `#fff` `#004c54` `#a5acaf` |
| `nfl:bostonredskins-1937-1959-home` | Boston Redskins | 1937-1959 | `#5a1414` `#ffb612` |
| `nfl:redskins-1972-1999-home` | Washington Redskins | 1972-1999 | `#5a1414` `#ffb612` |
| `nfl:redskins-1972-1999-away` | Washington Redskins | 1972-1999 | `#fff` `#5a1414` `#ffb612` |
| `nfl:redskins-2000-2019-home` | Washington Redskins | 2000-2019 | `#5a1414` `#ffb612` |
| `nfl:redskins-2000-2019-away` | Washington Redskins | 2000-2019 | `#fff` `#5a1414` `#ffb612` |
| `nfl:commanders-2022-home` | Washington Commanders | 2022- | `#5a1414` `#ffb612` |
| `nfl:commanders-2022-away` | Washington Commanders | 2022- | `#fff` `#5a1414` `#ffb612` |
| `nfl:bears-1962-1982-home` | Chicago Bears | 1962-1982 | `#0b162a` `#c83803` `#fff` |
| `nfl:bears-1962-1982-away` | Chicago Bears | 1962-1982 | `#fff` `#0b162a` `#c83803` |
| `nfl:bears-1983-2024-home` | Chicago Bears | 1983-2024 | `#0b162a` `#c83803` `#fff` |
| `nfl:bears-1983-2024-away` | Chicago Bears | 1983-2024 | `#fff` `#0b162a` `#c83803` |
| `nfl:packers-1937-1949-home` | Green Bay Packers | 1937-1949 | `#1b2b5c` `#ffb612` |
| `nfl:packers-1959-1979-home` | Green Bay Packers | 1959-1979 | `#203731` `#ffb612` |
| `nfl:packers-1959-1979-away` | Green Bay Packers | 1959-1979 | `#fff` `#203731` `#ffb612` |
| `nfl:packers-1980-2019-home` | Green Bay Packers | 1980-2019 | `#203731` `#ffb612` |
| `nfl:packers-1980-2019-away` | Green Bay Packers | 1980-2019 | `#fff` `#203731` `#ffb612` |
| `nfl:lions-1960-1969-home` | Detroit Lions | 1960-1969 | `#0076b6` `#b0b7bc` `#fff` |
| `nfl:lions-1960-1969-away` | Detroit Lions | 1960-1969 | `#fff` `#0076b6` `#b0b7bc` |
| `nfl:lions-1970-2002-home` | Detroit Lions | 1970-2002 | `#0076b6` `#b0b7bc` `#fff` |
| `nfl:lions-1970-2002-away` | Detroit Lions | 1970-2002 | `#fff` `#0076b6` `#b0b7bc` |
| `nfl:lions-2003-2016-home` | Detroit Lions | 2003-2016 | `#0076b6` `#b0b7bc` `#000` |
| `nfl:lions-2003-2016-away` | Detroit Lions | 2003-2016 | `#fff` `#0076b6` `#b0b7bc` |
| `nfl:vikings-1961-1999-home` | Minnesota Vikings | 1961-1999 | `#4f2683` `#ffc62f` `#fff` |
| `nfl:vikings-1961-1999-away` | Minnesota Vikings | 1961-1999 | `#fff` `#4f2683` `#ffc62f` |
| `nfl:vikings-2013-home` | Minnesota Vikings | 2013- | `#4f2683` `#ffc62f` `#fff` |
| `nfl:vikings-2013-away` | Minnesota Vikings | 2013- | `#fff` `#4f2683` `#ffc62f` |
| `nfl:falcons-1966-1989-red` | Atlanta Falcons | 1966-1989 | `#a71930` `#000` `#fff` |
| `nfl:falcons-1966-1989-white` | Atlanta Falcons | 1966-1989 | `#fff` `#a71930` `#000` |
| `nfl:falcons-1990-2002-black` | Atlanta Falcons | 1990-2002 | `#000` `#a71930` `#a5acaf` |
| `nfl:falcons-1990-2002-white` | Atlanta Falcons | 1990-2002 | `#fff` `#000` `#a71930` |
| `nfl:falcons-2003-2019-red` | Atlanta Falcons | 2003-2019 | `#a71930` `#000` `#fff` |
| `nfl:falcons-2003-2019-white` | Atlanta Falcons | 2003-2019 | `#fff` `#a71930` `#000` |
| `nfl:panthers-1995-2011-home` | Carolina Panthers | 1995-2011 | `#0085ca` `#000` `#bfc0bf` |
| `nfl:panthers-1995-2011-away` | Carolina Panthers | 1995-2011 | `#fff` `#000` `#0085ca` |
| `nfl:panthers-2012-black` | Carolina Panthers | 2012- | `#101820` `#0085ca` `#bfc0bf` |
| `nfl:saints-1967-1999-home` | New Orleans Saints | 1967-1999 | `#000` `#d3bc8d` |
| `nfl:saints-1967-1999-away` | New Orleans Saints | 1967-1999 | `#fff` `#000` `#d3bc8d` |
| `nfl:saints-2000-home` | New Orleans Saints | 2000- | `#000` `#d3bc8d` |
| `nfl:saints-2000-away` | New Orleans Saints | 2000- | `#fff` `#000` `#d3bc8d` |
| `nfl:buccaneers-1976-1996-white` | Tampa Bay Buccaneers | 1976-1996 | `#fff` `#ff7900` `#d50a0a` |
| `nfl:buccaneers-1976-1996-orange` | Tampa Bay Buccaneers | 1976-1996 | `#ff7900` `#fff` `#d50a0a` |
| `nfl:buccaneers-1997-2013-home` | Tampa Bay Buccaneers | 1997-2013 | `#d50a0a` `#34302b` `#000` |
| `nfl:buccaneers-1997-2013-away` | Tampa Bay Buccaneers | 1997-2013 | `#fff` `#d50a0a` `#34302b` |
| `nfl:buccaneers-2020-home` | Tampa Bay Buccaneers | 2020- | `#d50a0a` `#34302b` `#ff7900` |
| `nfl:chicagocardinals-1947-1959-home` | Chicago Cardinals | 1947-1959 | `#b2122e` `#fff` |
| `nfl:stlcardinals-1960-1987-home` | St. Louis Cardinals | 1960-1987 | `#b2122e` `#fff` |
| `nfl:stlcardinals-1960-1987-away` | St. Louis Cardinals | 1960-1987 | `#fff` `#b2122e` |
| `nfl:cardinals-2005-home` | Arizona Cardinals | 2005- | `#97233f` `#000` `#ffb612` |
| `nfl:cardinals-2005-away` | Arizona Cardinals | 2005- | `#fff` `#97233f` `#000` |
| `nfl:fortyniners-1980-1995-home` | San Francisco 49ers | 1980-1995 | `#aa0000` `#b3995d` `#fff` |
| `nfl:fortyniners-1980-1995-away` | San Francisco 49ers | 1980-1995 | `#fff` `#aa0000` `#b3995d` |
| `nfl:fortyniners-2009-home` | San Francisco 49ers | 2009- | `#aa0000` `#b3995d` `#000` |
| `nfl:fortyniners-2009-away` | San Francisco 49ers | 2009- | `#fff` `#aa0000` `#b3995d` |
| `nfl:clerams-1937-1945-home` | Cleveland Rams | 1937-1945 | `#0b4aa5` `#ffd100` |
| `nfl:rams-1950-1972-home` | Los Angeles Rams | 1950-1972 | `#003594` `#ffd100` `#fff` |
| `nfl:rams-1950-1972-away` | Los Angeles Rams | 1950-1972 | `#fff` `#003594` `#ffd100` |
| `nfl:rams-1973-1999-home` | Los Angeles Rams | 1973-1999 | `#003594` `#ffd100` `#fff` |
| `nfl:rams-1973-1999-away` | Los Angeles Rams | 1973-1999 | `#fff` `#003594` `#ffd100` |
| `nfl:stlrams-2000-2016-home` | St. Louis Rams | 2000-2016 | `#002244` `#b3995d` |
| `nfl:stlrams-2000-2016-away` | St. Louis Rams | 2000-2016 | `#fff` `#002244` `#b3995d` |
| `nfl:rams-2020-home` | Los Angeles Rams | 2020- | `#003594` `#ffa300` `#fff` |
| `nfl:seahawks-1976-2001-home` | Seattle Seahawks | 1976-2001 | `#004c91` `#006747` `#c0c0c0` |
| `nfl:seahawks-1976-2001-away` | Seattle Seahawks | 1976-2001 | `#fff` `#004c91` `#006747` |
| `nfl:seahawks-2002-2011-home` | Seattle Seahawks | 2002-2011 | `#002244` `#a5acaf` `#69be28` |
| `nfl:seahawks-2002-2011-away` | Seattle Seahawks | 2002-2011 | `#fff` `#002244` `#69be28` |
| `nfl:seahawks-2012-home` | Seattle Seahawks | 2012- | `#002244` `#a5acaf` `#69be28` |
| `nfl:seahawks-2012-away` | Seattle Seahawks | 2012- | `#fff` `#002244` `#69be28` |
| `nfl:seahawks-2012-grey` | Seattle Seahawks | 2012- | `#a5acaf` `#002244` `#69be28` |
| `nfl:bills-1962-1973-home` | Buffalo Bills | 1962-1973 | `#00338d` `#fff` `#c60c30` |
| `nfl:bills-1962-1973-away` | Buffalo Bills | 1962-1973 | `#fff` `#00338d` `#c60c30` |
| `nfl:bills-1974-1983-home` | Buffalo Bills | 1974-1983 | `#00338d` `#fff` `#c60c30` |
| `nfl:bills-1984-2001-home` | Buffalo Bills | 1984-2001 | `#00338d` `#fff` `#c60c30` |
| `nfl:bills-1984-2001-away` | Buffalo Bills | 1984-2001 | `#fff` `#00338d` `#c60c30` |
| `nfl:bills-2011-home` | Buffalo Bills | 2011- | `#00338d` `#c60c30` `#fff` |
| `nfl:dolphins-1966-1996-white` | Miami Dolphins | 1966-1996 | `#fff` `#008e97` `#fc4c02` |
| `nfl:dolphins-1966-1996-aqua` | Miami Dolphins | 1966-1996 | `#008e97` `#fff` `#fc4c02` |
| `nfl:dolphins-1997-2012-white` | Miami Dolphins | 1997-2012 | `#fff` `#005778` `#008e97` |
| `nfl:dolphins-1997-2012-aqua` | Miami Dolphins | 1997-2012 | `#008e97` `#005778` `#fc4c02` |
| `nfl:dolphins-2018-white` | Miami Dolphins | 2018- | `#fff` `#008e97` `#fc4c02` |
| `nfl:bospatriots-1960-1992-red` | Boston Patriots | 1960-1992 | `#c60c30` `#fff` `#002244` |
| `nfl:bospatriots-1960-1992-white` | Boston Patriots | 1960-1992 | `#fff` `#c60c30` `#002244` |
| `nfl:patriots-1993-1999-blue` | New England Patriots | 1993-1999 | `#0c2340` `#b0b7bc` `#c60c30` |
| `nfl:patriots-1993-1999-white` | New England Patriots | 1993-1999 | `#fff` `#0c2340` `#c60c30` |
| `nfl:patriots-2000-home` | New England Patriots | 2000- | `#002244` `#c60c30` `#b0b7bc` |
| `nfl:patriots-2000-away` | New England Patriots | 2000- | `#fff` `#002244` `#c60c30` |
| `nfl:nytitans-1960-1962-home` | New York Titans | 1960-1962 | `#0b3a8e` `#ffcc00` |
| `nfl:jets-1963-1977-home` | New York Jets | 1963-1977 | `#00573c` `#fff` |
| `nfl:jets-1963-1977-away` | New York Jets | 1963-1977 | `#fff` `#00573c` |
| `nfl:jets-1978-1997-home` | New York Jets | 1978-1997 | `#125740` `#fff` |
| `nfl:jets-1978-1997-away` | New York Jets | 1978-1997 | `#fff` `#125740` |
| `nfl:jets-1998-2018-home` | New York Jets | 1998-2018 | `#003f2d` `#fff` |
| `nfl:jets-1998-2018-away` | New York Jets | 1998-2018 | `#fff` `#003f2d` |
| `nfl:ravens-1996-home` | Baltimore Ravens | 1996- | `#241773` `#000` `#9e7c0c` |
| `nfl:ravens-1996-away` | Baltimore Ravens | 1996- | `#fff` `#241773` `#9e7c0c` |
| `nfl:ravens-2005-black` | Baltimore Ravens | 2005- | `#000` `#241773` `#9e7c0c` |
| `nfl:bengals-1968-1996-orange` | Cincinnati Bengals | 1968-1996 | `#fb4f14` `#000` `#fff` |
| `nfl:bengals-1968-1996-white` | Cincinnati Bengals | 1968-1996 | `#fff` `#fb4f14` `#000` |
| `nfl:bengals-1997-orange` | Cincinnati Bengals | 1997- | `#fb4f14` `#000` `#fff` |
| `nfl:bengals-1997-white` | Cincinnati Bengals | 1997- | `#fff` `#fb4f14` `#000` |
| `nfl:browns-1950-1974-brown` | Cleveland Browns | 1950-1974 | `#311d00` `#ff3c00` `#fff` |
| `nfl:browns-1950-1974-white` | Cleveland Browns | 1950-1974 | `#fff` `#311d00` `#ff3c00` |
| `nfl:browns-1975-1995-brown` | Cleveland Browns | 1975-1995 | `#311d00` `#ff3c00` `#fff` |
| `nfl:browns-1975-1995-white` | Cleveland Browns | 1975-1995 | `#fff` `#311d00` `#ff3c00` |
| `nfl:browns-2006-2014-orange` | Cleveland Browns | 2006-2014 | `#ff3c00` `#311d00` `#fff` |
| `nfl:browns-2020-brown` | Cleveland Browns | 2020- | `#4f2c1d` `#ff3c00` `#fff` |
| `nfl:steelers-1933-home` | Pittsburgh Steelers | 1933 | `#ffb612` `#000` |
| `nfl:steelers-1936-1961-home` | Pittsburgh Steelers | 1936-1961 | `#000` `#ffb612` `#fff` |
| `nfl:steelers-1966-1967-home` | Pittsburgh Steelers | 1966-1967 | `#000` `#ffb612` |
| `nfl:steelers-1966-1967-away` | Pittsburgh Steelers | 1966-1967 | `#fff` `#ffb612` |
| `nfl:steelers-1968-home` | Pittsburgh Steelers | 1968- | `#000` `#ffb612` `#fff` |
| `nfl:steelers-1968-away` | Pittsburgh Steelers | 1968- | `#fff` `#000` `#ffb612` |
| `nfl:texans-2002-home` | Houston Texans | 2002- | `#03202f` `#a71930` |
| `nfl:texans-2002-away` | Houston Texans | 2002- | `#fff` `#03202f` `#a71930` |
| `nfl:texans-2003-red` | Houston Texans | 2003- | `#a71930` `#03202f` |
| `nfl:baltcolts-1953-1983-home` | Baltimore Colts | 1953-1983 | `#00338d` `#fff` |
| `nfl:baltcolts-1953-1983-away` | Baltimore Colts | 1953-1983 | `#fff` `#00338d` |
| `nfl:colts-2004-home` | Indianapolis Colts | 2004- | `#002c5f` `#a2aaad` |
| `nfl:colts-2004-away` | Indianapolis Colts | 2004- | `#fff` `#002c5f` `#a2aaad` |
| `nfl:jaguars-1995-2008-teal` | Jacksonville Jaguars | 1995-2008 | `#006778` `#000` `#9f792c` |
| `nfl:jaguars-1995-2008-white` | Jacksonville Jaguars | 1995-2008 | `#fff` `#006778` `#000` |
| `nfl:jaguars-2013-2024-teal` | Jacksonville Jaguars | 2013-2024 | `#006778` `#101820` `#d7a22a` |
| `nfl:jaguars-2013-2024-white` | Jacksonville Jaguars | 2013-2024 | `#fff` `#101820` `#006778` |
| `nfl:oilers-1960-1965-red` | Houston Oilers | 1960-1965 | `#c8102e` `#fff` |
| `nfl:oilers-1966-1996-blue` | Houston Oilers | 1966-1996 | `#4b92db` `#fff` `#c8102e` |
| `nfl:oilers-1966-1996-white` | Houston Oilers | 1966-1996 | `#fff` `#4b92db` `#c8102e` |
| `nfl:titans-1999-2017-navy` | Tennessee Titans | 1999-2017 | `#0c2340` `#4b92db` `#c8102e` |
| `nfl:titans-1999-2017-white` | Tennessee Titans | 1999-2017 | `#fff` `#0c2340` `#4b92db` |
| `nfl:titans-2018-navy` | Tennessee Titans | 2018- | `#0c2340` `#4b92db` `#c8102e` |
| `nfl:titans-2018-white` | Tennessee Titans | 2018- | `#fff` `#0c2340` `#4b92db` |
| `nfl:broncos-1960-1961-home` | Denver Broncos | 1960-1961 | `#e0a82e` `#5a3a1c` |
| `nfl:broncos-1962-1996-orange` | Denver Broncos | 1962-1996 | `#fb4f14` `#0c2340` `#fff` |
| `nfl:broncos-1962-1996-white` | Denver Broncos | 1962-1996 | `#fff` `#0c2340` `#fb4f14` |
| `nfl:broncos-1997-2023-navy` | Denver Broncos | 1997-2023 | `#0c2340` `#fb4f14` `#fff` |
| `nfl:broncos-1997-2023-white` | Denver Broncos | 1997-2023 | `#fff` `#0c2340` `#fb4f14` |
| `nfl:broncos-2024-orange` | Denver Broncos | 2024- | `#fb4f14` `#0c2340` `#fff` |
| `nfl:chiefs-1963-1973-home` | Kansas City Chiefs | 1963-1973 | `#e31837` `#fff` `#ffb81c` |
| `nfl:chiefs-1963-1973-away` | Kansas City Chiefs | 1963-1973 | `#fff` `#e31837` `#ffb81c` |
| `nfl:chiefs-1974-home` | Kansas City Chiefs | 1974- | `#e31837` `#ffb81c` `#fff` |
| `nfl:chiefs-1974-away` | Kansas City Chiefs | 1974- | `#fff` `#e31837` `#ffb81c` |
| `nfl:oakraiders-1960-1962-home` | Oakland Raiders | 1960-1962 | `#000` `#d4af37` |
| `nfl:oakraiders-1963-1981-home` | Oakland Raiders | 1963-1981 | `#000` `#a5acaf` `#fff` |
| `nfl:oakraiders-1963-1981-away` | Oakland Raiders | 1963-1981 | `#fff` `#000` `#a5acaf` |
| `nfl:laraiders-1982-1994-home` | Los Angeles Raiders | 1982-1994 | `#000` `#a5acaf` `#fff` |
| `nfl:oakraiders-1995-2019-home` | Oakland Raiders | 1995-2019 | `#000` `#a5acaf` `#fff` |
| `nfl:raiders-2020-away` | Las Vegas Raiders | 2020- | `#fff` `#000` `#a5acaf` |
| `nfl:sdchargers-1961-1973-home` | San Diego Chargers | 1961-1973 | `#0080c6` `#ffc20e` `#fff` |
| `nfl:sdchargers-1961-1973-away` | San Diego Chargers | 1961-1973 | `#fff` `#0080c6` `#ffc20e` |
| `nfl:sdchargers-1974-1987-home` | San Diego Chargers | 1974-1987 | `#fff` `#0080c6` `#ffc20e` |
| `nfl:sdchargers-1988-2006-home` | San Diego Chargers | 1988-2006 | `#002a5e` `#ffc20e` `#0080c6` |
| `nfl:sdchargers-1988-2006-away` | San Diego Chargers | 1988-2006 | `#fff` `#002a5e` `#ffc20e` |
| `nfl:sdchargers-2007-2016-home` | San Diego Chargers | 2007-2016 | `#0080c6` `#ffc20e` `#002a5e` |
| `nfl:chargers-2017-home` | Los Angeles Chargers | 2017- | `#0080c6` `#ffc20e` `#fff` |
| `nfl:chargers-2017-away` | Los Angeles Chargers | 2017- | `#fff` `#0080c6` `#ffc20e` |

## CFL

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `cfl:argonauts-1950s-home` | Toronto Argonauts | 1950s | `#0b2d62` `#5cb3e0` `#fff` |
| `cfl:argonauts-1950s-away` | Toronto Argonauts | 1950s | `#fff` `#0b2d62` `#5cb3e0` |
| `cfl:argonauts-1970s-home` | Toronto Argonauts | 1970s | `#5cb3e0` `#0b2d62` `#fff` |
| `cfl:argonauts-1970s-away` | Toronto Argonauts | 1970s | `#fff` `#0b2d62` `#5cb3e0` |
| `cfl:argonauts-1996-2015-home` | Toronto Argonauts | 1996-2015 | `#0b2d62` `#5cb3e0` `#fff` |
| `cfl:argonauts-1996-2015-away` | Toronto Argonauts | 1996-2015 | `#fff` `#0b2d62` `#5cb3e0` |
| `cfl:argonauts-2016-home` | Toronto Argonauts | 2016- | `#5cb3e0` `#0b2d62` `#fff` |
| `cfl:argonauts-2016-away` | Toronto Argonauts | 2016- | `#fff` `#0b2d62` `#5cb3e0` |
| `cfl:tigercats-1960s-home` | Hamilton Tiger-Cats | 1960s | `#fdb913` `#000` `#fff` |
| `cfl:tigercats-1960s-away` | Hamilton Tiger-Cats | 1960s | `#fff` `#000` `#fdb913` |
| `cfl:tigercats-1980s-home` | Hamilton Tiger-Cats | 1980s | `#000` `#fdb913` `#fff` |
| `cfl:tigercats-1980s-away` | Hamilton Tiger-Cats | 1980s | `#fff` `#000` `#fdb913` |
| `cfl:tigercats-2010-home` | Hamilton Tiger-Cats | 2010- | `#000` `#fdb913` |
| `cfl:tigercats-2010-away` | Hamilton Tiger-Cats | 2010- | `#fff` `#000` `#fdb913` |
| `cfl:bluebombers-1960s-home` | Winnipeg Blue Bombers | 1960s | `#0033a0` `#ffb81c` `#fff` |
| `cfl:bluebombers-1960s-away` | Winnipeg Blue Bombers | 1960s | `#fff` `#0033a0` `#ffb81c` |
| `cfl:bluebombers-1980s-home` | Winnipeg Blue Bombers | 1980s | `#0033a0` `#ffb81c` `#fff` |
| `cfl:bluebombers-1980s-away` | Winnipeg Blue Bombers | 1980s | `#fff` `#0033a0` `#ffb81c` |
| `cfl:bluebombers-2000-home` | Winnipeg Blue Bombers | 2000- | `#003594` `#ffb81c` |
| `cfl:bluebombers-2000-away` | Winnipeg Blue Bombers | 2000- | `#fff` `#003594` `#ffb81c` |
| `cfl:roughriders-1924-1947-home` | Saskatchewan Roughriders | 1924-1947 | `#c8102e` `#000` |
| `cfl:roughriders-1924-1947-away` | Saskatchewan Roughriders | 1924-1947 | `#fff` `#c8102e` `#000` |
| `cfl:roughriders-1948-1984-home` | Saskatchewan Roughriders | 1948-1984 | `#00693c` `#fff` |
| `cfl:roughriders-1948-1984-away` | Saskatchewan Roughriders | 1948-1984 | `#fff` `#00693c` |
| `cfl:roughriders-1985-2004-home` | Saskatchewan Roughriders | 1985-2004 | `#00693c` `#fff` `#000` |
| `cfl:roughriders-1985-2004-away` | Saskatchewan Roughriders | 1985-2004 | `#fff` `#00693c` `#000` |
| `cfl:roughriders-2005-home` | Saskatchewan Roughriders | 2005- | `#00693c` `#fff` |
| `cfl:roughriders-2005-away` | Saskatchewan Roughriders | 2005- | `#fff` `#00693c` |
| `cfl:stampeders-1960s-home` | Calgary Stampeders | 1960s | `#c8102e` `#fff` |
| `cfl:stampeders-1960s-away` | Calgary Stampeders | 1960s | `#fff` `#c8102e` |
| `cfl:stampeders-1990s-home` | Calgary Stampeders | 1990s | `#c8102e` `#000` `#fff` |
| `cfl:stampeders-1990s-away` | Calgary Stampeders | 1990s | `#fff` `#c8102e` `#000` |
| `cfl:stampeders-2010-home` | Calgary Stampeders | 2010- | `#c8102e` `#fff` |
| `cfl:stampeders-2010-away` | Calgary Stampeders | 2010- | `#fff` `#c8102e` |
| `cfl:eskimos-1970s-home` | Edmonton Eskimos | 1970s | `#00573c` `#ffb81c` `#fff` |
| `cfl:eskimos-1970s-away` | Edmonton Eskimos | 1970s | `#fff` `#00573c` `#ffb81c` |
| `cfl:eskimos-1990s-home` | Edmonton Eskimos | 1990s | `#00573c` `#ffb81c` `#fff` |
| `cfl:eskimos-1990s-away` | Edmonton Eskimos | 1990s | `#fff` `#00573c` `#ffb81c` |
| `cfl:eskimos-2012-2020-home` | Edmonton Eskimos | 2012-2020 | `#00573c` `#ffb81c` `#fff` |
| `cfl:elks-2021-home` | Edmonton Elks | 2021- | `#00573c` `#ffb81c` `#fff` |
| `cfl:elks-2021-away` | Edmonton Elks | 2021- | `#fff` `#00573c` `#ffb81c` |
| `cfl:lions-1954-1989-home` | BC Lions | 1954-1989 | `#f58220` `#000` `#fff` |
| `cfl:lions-1954-1989-away` | BC Lions | 1954-1989 | `#fff` `#f58220` `#000` |
| `cfl:lions-1990-1994-home` | BC Lions | 1990-1994 | `#000` `#c0c0c0` `#f58220` |
| `cfl:lions-1990-1994-away` | BC Lions | 1990-1994 | `#fff` `#000` `#c0c0c0` |
| `cfl:lions-2005-2024-home` | BC Lions | 2005-2024 | `#f58220` `#000` `#fff` |
| `cfl:lions-2005-2024-away` | BC Lions | 2005-2024 | `#fff` `#f58220` `#000` |
| `cfl:ottawa-1950s-home` | Ottawa Rough Riders | 1950s | `#c8102e` `#000` `#fff` |
| `cfl:ottawa-1950s-away` | Ottawa Rough Riders | 1950s | `#fff` `#c8102e` `#000` |
| `cfl:ottawa-1975-1991-home` | Ottawa Rough Riders | 1975-1991 | `#c8102e` `#000` `#fff` |
| `cfl:ottawa-1975-1991-away` | Ottawa Rough Riders | 1975-1991 | `#fff` `#c8102e` `#000` |
| `cfl:ottawa-1992-1993-home` | Ottawa Rough Riders | 1992-1993 | `#c8102e` `#c0c0c0` `#000` |
| `cfl:ottawa-1994-1995-home` | Ottawa Rough Riders | 1994-1995 | `#0b1f4f` `#c8102e` `#d4af37` |
| `cfl:redblacks-2014-home` | Ottawa Redblacks | 2014- | `#c8102e` `#000` `#fff` |
| `cfl:redblacks-2014-away` | Ottawa Redblacks | 2014- | `#fff` `#c8102e` `#000` |
| `cfl:alouettes-1946-1981-home` | Montreal Alouettes | 1946-1981 | `#1c3f94` `#c8102e` `#fff` |
| `cfl:alouettes-1946-1981-away` | Montreal Alouettes | 1946-1981 | `#fff` `#1c3f94` `#c8102e` |
| `cfl:alouettes-1996-2011-home` | Montreal Alouettes | 1996-2011 | `#c8102e` `#0c2340` `#fff` |
| `cfl:alouettes-1996-2011-away` | Montreal Alouettes | 1996-2011 | `#fff` `#c8102e` `#0c2340` |
| `cfl:alouettes-2012-home` | Montreal Alouettes | 2012- | `#c8102e` `#0c2340` `#c0c0c0` |
| `cfl:alouettes-2012-away` | Montreal Alouettes | 2012- | `#fff` `#c8102e` `#0c2340` |
| `cfl:concordes-1982-1985-home` | Montreal Concordes | 1982-1985 | `#1d4fa0` `#fff` `#c8102e` |
| `cfl:concordes-1982-1985-away` | Montreal Concordes | 1982-1985 | `#fff` `#1d4fa0` `#c8102e` |
| `cfl:stallions-1994-1995-home` | Baltimore Stallions | 1994-1995 | `#00a79d` `#000` `#c0c0c0` |
| `cfl:stallions-1994-1995-away` | Baltimore Stallions | 1994-1995 | `#fff` `#00a79d` `#000` |
| `cfl:pirates-1994-1995-home` | Shreveport Pirates | 1994-1995 | `#000` `#d4af37` `#c0c0c0` |

## IFAF

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `ifaf:canada-2000s-home` | Canada | 2000s | `#d52b1e` `#fff` |
| `ifaf:canada-2000s-away` | Canada | 2000s | `#fff` `#d52b1e` |
| `ifaf:usa-2000s-home` | United States | 2000s | `#0a2a66` `#fff` `#b22234` |
| `ifaf:usa-2000s-away` | United States | 2000s | `#fff` `#0a2a66` `#b22234` |
| `ifaf:japan-2000s-home` | Japan | 2000s | `#c8102e` `#fff` |
| `ifaf:japan-2000s-away` | Japan | 2000s | `#fff` `#c8102e` |
| `ifaf:mexico-2000s-home` | Mexico | 2000s | `#006847` `#fff` `#ce1126` |
| `ifaf:mexico-2000s-away` | Mexico | 2000s | `#fff` `#006847` `#ce1126` |
| `ifaf:germany-2000s-home` | Germany | 2000s | `#000` `#dd0000` `#ffce00` |
| `ifaf:germany-2000s-away` | Germany | 2000s | `#fff` `#000` `#dd0000` |

## SOCCER

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `soccer:arsenal-1950-1970-home` | Arsenal | 1950-1970 | `#d11` `#fff` |
| `soccer:arsenal-1970-1990-home` | Arsenal | 1970-1990 | `#d11` `#fff` |
| `soccer:arsenal-1970-1980-away` | Arsenal | 1970-1980 | `#fd0` `#135` |
| `soccer:liverpool-1950-1964-home` | Liverpool | 1950-1964 | `#c11` `#fff` |
| `soccer:liverpool-1964-1990-home` | Liverpool | 1964-1990 | `#c11` `#fff` |
| `soccer:liverpool-1970-1990-away` | Liverpool | 1970-1990 | `#fff` `#c11` |
| `soccer:manutd-1950-1970-home` | Manchester United | 1950-1970 | `#d11` `#fff` |
| `soccer:manutd-1970-1990-home` | Manchester United | 1970-1990 | `#d11` `#fff` |
| `soccer:manutd-1967-1970-away` | Manchester United | 1967-1970 | `#69c` `#fff` |
| `soccer:manutd-1995-1996-away` | Manchester United | 1995-1996 | `#999` `#000` |
| `soccer:chelsea-1955-1975-home` | Chelsea | 1955-1975 | `#04b` `#fff` |
| `soccer:chelsea-1975-1990-home` | Chelsea | 1975-1990 | `#04b` `#fff` |
| `soccer:chelsea-1970-1985-away` | Chelsea | 1970-1985 | `#fd0` `#04b` |
| `soccer:spurs-1950-1975-home` | Tottenham Hotspur | 1950-1975 | `#fff` `#013` |
| `soccer:spurs-1975-1995-home` | Tottenham Hotspur | 1975-1995 | `#fff` `#013` |
| `soccer:everton-1950-1975-home` | Everton | 1950-1975 | `#039` `#fff` |
| `soccer:everton-1975-1995-home` | Everton | 1975-1995 | `#039` `#fff` |
| `soccer:newcastle-1950-1990-home` | Newcastle United | 1950-1990 | `#fff` `#000` |
| `soccer:sunderland-1950-1990-home` | Sunderland | 1950-1990 | `#fff` `#d11` |
| `soccer:sheffutd-1950-1990-home` | Sheffield United | 1950-1990 | `#fff` `#d11` |
| `soccer:sheffwed-1950-1990-home` | Sheffield Wednesday | 1950-1990 | `#fff` `#04b` |
| `soccer:stoke-1950-1990-home` | Stoke City | 1950-1990 | `#fff` `#d11` |
| `soccer:southampton-1950-1990-home` | Southampton | 1950-1990 | `#fff` `#d11` |
| `soccer:brighton-1950-1990-home` | Brighton & Hove Albion | 1950-1990 | `#fff` `#06c` |
| `soccer:westbrom-1950-1990-home` | West Bromwich Albion | 1950-1990 | `#fff` `#013` |
| `soccer:blackpool-1950s-home` | Blackpool | 1950s | `#f60` `#fff` |
| `soccer:wolves-1950s-home` | Wolverhampton Wanderers | 1950s | `#fb1` `#000` |
| `soccer:wolves-1960-1990-home` | Wolverhampton Wanderers | 1960-1990 | `#fb1` `#000` |
| `soccer:villa-1950-1975-home` | Aston Villa | 1950-1975 | `#712` `#9be` |
| `soccer:villa-1975-1995-home` | Aston Villa | 1975-1995 | `#712` `#9be` |
| `soccer:westham-1960-1990-home` | West Ham United | 1960-1990 | `#712` `#9be` |
| `soccer:burnley-1955-1975-home` | Burnley | 1955-1975 | `#712` `#9be` |
| `soccer:leeds-1961-1970-home` | Leeds United | 1961-1970 | `#fff` `#000` |
| `soccer:leeds-1970-1975-home` | Leeds United | 1970-1975 | `#fff` `#06c` `#fd0` |
| `soccer:leeds-1970-1980-away` | Leeds United | 1970-1980 | `#fd0` `#06c` |
| `soccer:forest-1955-1985-home` | Nottingham Forest | 1955-1985 | `#d11` `#fff` |
| `soccer:derby-1960-1985-home` | Derby County | 1960-1985 | `#fff` `#000` |
| `soccer:ipswich-1960-1990-home` | Ipswich Town | 1960-1990 | `#04b` `#fff` |
| `soccer:coventry-1960-1995-home` | Coventry City | 1960-1995 | `#7cf` `#fff` |
| `soccer:mancity-1950-1990-home` | Manchester City | 1950-1990 | `#6ad` `#fff` |
| `soccer:mancity-1956-1975-away` | Manchester City | 1956-1975 | `#d11` `#000` |
| `soccer:preston-1950s-home` | Preston North End | 1950s | `#fff` `#013` |
| `soccer:huddersfield-1950-1990-home` | Huddersfield Town | 1950-1990 | `#fff` `#06c` |
| `soccer:qpr-1960-1985-home` | Queens Park Rangers | 1960-1985 | `#fff` `#06c` |
| `soccer:norwich-1960-1995-home` | Norwich City | 1960-1995 | `#fd0` `#080` |
| `soccer:watford-1977-1990-home` | Watford | 1977-1990 | `#fd0` `#d11` `#000` |
| `soccer:wimbledon-1985-1995-home` | Wimbledon | 1985-1995 | `#fd0` `#04b` |
| `soccer:celtic-1960-1980-home` | Celtic | 1960-1980 | `#090` `#fff` |
| `soccer:celtic-1980-1995-home` | Celtic | 1980-1995 | `#090` `#fff` |
| `soccer:rangers-1950-1990-home` | Rangers | 1950-1990 | `#13c` `#fff` |
| `soccer:aberdeen-1970-1990-home` | Aberdeen | 1970-1990 | `#d11` `#fff` |
| `soccer:hearts-1950-1990-home` | Heart of Midlothian | 1950-1990 | `#712` `#fff` |
| `soccer:hibs-1950-1990-home` | Hibernian | 1950-1990 | `#fff` `#090` |
| `soccer:dundeeutd-1969-1995-home` | Dundee United | 1969-1995 | `#f60` `#000` |
| `soccer:realmadrid-1950-1970-home` | Real Madrid | 1950-1970 | `#fff` `#639` |
| `soccer:realmadrid-1970-1990-home` | Real Madrid | 1970-1990 | `#fff` `#639` |
| `soccer:realmadrid-1990s-home` | Real Madrid | 1990s | `#fff` `#639` |
| `soccer:barcelona-1950-1990-home` | Barcelona | 1950-1990 | `#04a` `#a04` |
| `soccer:atletico-1950-1990-home` | Atlético Madrid | 1950-1990 | `#fff` `#d11` |
| `soccer:athletic-1950-1990-home` | Athletic Bilbao | 1950-1990 | `#fff` `#d11` |
| `soccer:valencia-1950-1995-home` | Valencia | 1950-1995 | `#fff` `#000` |
| `soccer:sevilla-1950-1995-home` | Sevilla | 1950-1995 | `#fff` `#d11` |
| `soccer:sociedad-1950-1995-home` | Real Sociedad | 1950-1995 | `#fff` `#06c` |
| `soccer:espanyol-1950-1995-home` | Espanyol | 1950-1995 | `#fff` `#06c` |
| `soccer:betis-1950-1995-home` | Real Betis | 1950-1995 | `#fff` `#080` |
| `soccer:celta-1950-1995-home` | Celta Vigo | 1950-1995 | `#8bf` `#fff` |
| `soccer:deportivo-1990-2005-home` | Deportivo La Coruña | 1990-2005 | `#fff` `#06c` |
| `soccer:juventus-1950-1990-home` | Juventus | 1950-1990 | `#fff` `#000` |
| `soccer:juventus-1990-2000-home` | Juventus | 1990-2000 | `#fff` `#000` |
| `soccer:milan-1950-1980-home` | AC Milan | 1950-1980 | `#d11` `#000` |
| `soccer:milan-1980-2000-home` | AC Milan | 1980-2000 | `#d11` `#000` |
| `soccer:milan-1950-1990-away` | AC Milan | 1950-1990 | `#fff` `#d11` `#000` |
| `soccer:inter-1950-1990-home` | Inter Milan | 1950-1990 | `#13a` `#000` |
| `soccer:inter-1950-1990-away` | Inter Milan | 1950-1990 | `#fff` `#13a` `#000` |
| `soccer:roma-1950-1990-home` | AS Roma | 1950-1990 | `#912` `#fa0` |
| `soccer:lazio-1950-1990-home` | Lazio | 1950-1990 | `#8df` `#fff` |
| `soccer:napoli-1980-1995-home` | Napoli | 1980-1995 | `#29d` `#fff` |
| `soccer:napoli-1980-1995-away` | Napoli | 1980-1995 | `#fff` `#29d` |
| `soccer:fiorentina-1950-1990-home` | Fiorentina | 1950-1990 | `#639` `#fff` |
| `soccer:torino-1948-1990-home` | Torino | 1948-1990 | `#812` `#fff` |
| `soccer:sampdoria-1980-2000-home` | Sampdoria | 1980-2000 | `#13a` `#fff` `#d11` |
| `soccer:bologna-1950-1995-home` | Bologna | 1950-1995 | `#d11` `#13a` |
| `soccer:atalanta-1950-1995-home` | Atalanta | 1950-1995 | `#13a` `#000` |
| `soccer:genoa-1950-1995-home` | Genoa | 1950-1995 | `#d11` `#13a` |
| `soccer:cagliari-1960-1995-home` | Cagliari | 1960-1995 | `#d11` `#13a` |
| `soccer:verona-1980-1995-home` | Hellas Verona | 1980-1995 | `#fd0` `#13a` |
| `soccer:udinese-1980-2000-home` | Udinese | 1980-2000 | `#fff` `#000` |
| `soccer:bayern-1965-1980-home` | Bayern Munich | 1965-1980 | `#d11` `#fff` |
| `soccer:bayern-1980-1995-home` | Bayern Munich | 1980-1995 | `#d11` `#fff` |
| `soccer:dortmund-1960-1995-home` | Borussia Dortmund | 1960-1995 | `#fd0` `#000` |
| `soccer:schalke-1955-1995-home` | Schalke 04 | 1955-1995 | `#13c` `#fff` |
| `soccer:hsv-1960-1990-home` | Hamburger SV | 1960-1990 | `#fff` `#d11` `#013` |
| `soccer:koln-1960-1995-home` | 1. FC Köln | 1960-1995 | `#fff` `#d11` |
| `soccer:gladbach-1965-1980-home` | Borussia Mönchengladbach | 1965-1980 | `#fff` `#090` `#000` |
| `soccer:werder-1960-1995-home` | Werder Bremen | 1960-1995 | `#090` `#fff` |
| `soccer:stuttgart-1980-2000-home` | VfB Stuttgart | 1980-2000 | `#fff` `#d11` |
| `soccer:lautern-1960-1995-home` | 1. FC Kaiserslautern | 1960-1995 | `#d11` `#fff` |
| `soccer:munich1860-1960-1995-home` | 1860 Munich | 1960-1995 | `#6ad` `#fff` |
| `soccer:marseille-1970-2000-home` | Olympique de Marseille | 1970-2000 | `#fff` `#5bf` |
| `soccer:psg-1980-2000-home` | Paris Saint-Germain | 1980-2000 | `#13a` `#d11` `#fff` |
| `soccer:stetienne-1965-1985-home` | Saint-Étienne | 1965-1985 | `#090` `#fff` |
| `soccer:reims-1950s-home` | Stade de Reims | 1950s | `#d11` `#fff` |
| `soccer:nantes-1965-1995-home` | FC Nantes | 1965-1995 | `#fd0` `#090` |
| `soccer:lens-1980-2000-home` | RC Lens | 1980-2000 | `#d11` `#fd0` |
| `soccer:bordeaux-1980-2000-home` | Girondins de Bordeaux | 1980-2000 | `#013` `#fff` |
| `soccer:lyon-1990-2005-home` | Olympique Lyonnais | 1990-2005 | `#fff` `#d11` `#13a` |
| `soccer:nice-1950-1995-home` | OGC Nice | 1950-1995 | `#d11` `#000` |
| `soccer:ajax-1965-1980-home` | Ajax | 1965-1980 | `#fff` `#d11` |
| `soccer:feyenoord-1965-1995-home` | Feyenoord | 1965-1995 | `#d11` `#fff` |
| `soccer:psv-1960-1995-home` | PSV Eindhoven | 1960-1995 | `#d11` `#fff` |
| `soccer:benfica-1955-1975-home` | Benfica | 1955-1975 | `#d11` `#fff` |
| `soccer:porto-1960-1995-home` | Porto | 1960-1995 | `#fff` `#04b` |
| `soccer:sporting-1960-1995-home` | Sporting CP | 1960-1995 | `#fff` `#090` |
| `soccer:santos-1955-1975-home` | Santos | 1955-1975 | `#fff` `#000` |
| `soccer:flamengo-1950-1995-home` | Flamengo | 1950-1995 | `#d11` `#000` |
| `soccer:corinthians-1950-1995-home` | Corinthians | 1950-1995 | `#fff` `#000` |
| `soccer:palmeiras-1950-1995-home` | Palmeiras | 1950-1995 | `#090` `#fff` |
| `soccer:saopaulo-1985-2000-home` | São Paulo | 1985-2000 | `#fff` `#d11` `#000` |
| `soccer:vasco-1950-1995-home` | Vasco da Gama | 1950-1995 | `#000` `#fff` |
| `soccer:fluminense-1950-1995-home` | Fluminense | 1950-1995 | `#712` `#090` `#fff` |
| `soccer:botafogo-1950-1995-home` | Botafogo | 1950-1995 | `#000` `#fff` |
| `soccer:cruzeiro-1960-1995-home` | Cruzeiro | 1960-1995 | `#13c` `#fff` |
| `soccer:gremio-1950-1995-home` | Grêmio | 1950-1995 | `#6ad` `#000` `#fff` |
| `soccer:internacional-1950-1995-home` | Internacional | 1950-1995 | `#d11` `#fff` |
| `soccer:atleticomg-1950-1995-home` | Atlético Mineiro | 1950-1995 | `#fff` `#000` |
| `soccer:boca-1950-2000-home` | Boca Juniors | 1950-2000 | `#13a` `#fd0` |
| `soccer:river-1950-2000-home` | River Plate | 1950-2000 | `#fff` `#d11` |
| `soccer:independiente-1950-1995-home` | Independiente | 1950-1995 | `#d11` `#fff` |
| `soccer:racing-1950-1995-home` | Racing Club | 1950-1995 | `#fff` `#7bd` |
| `soccer:sanlorenzo-1950-1995-home` | San Lorenzo | 1950-1995 | `#13a` `#d11` |
| `soccer:estudiantes-1960-1995-home` | Estudiantes | 1960-1995 | `#fff` `#d11` |
| `soccer:newells-1950-1995-home` | Newell's Old Boys | 1950-1995 | `#d11` `#000` |
| `soccer:rosario-1950-1995-home` | Rosario Central | 1950-1995 | `#13a` `#fd0` |
| `soccer:america-1960-1995-home` | Club América | 1960-1995 | `#fd0` `#13a` |
| `soccer:chivas-1950-1995-home` | Guadalajara (Chivas) | 1950-1995 | `#fff` `#d11` |
| `soccer:cruzazul-1970-1995-home` | Cruz Azul | 1970-1995 | `#13c` `#fff` |
| `soccer:pumas-1970-1995-home` | Pumas UNAM | 1970-1995 | `#013` `#fb1` |
| `soccer:toluca-1970-1995-home` | Toluca | 1970-1995 | `#d11` `#fff` |
| `soccer:monterrey-1990-2005-home` | Monterrey | 1990-2005 | `#13a` `#fff` |
| `soccer:pachuca-1990-2005-home` | Pachuca | 1990-2005 | `#fff` `#13a` |
| `soccer:atlas-1950-1995-home` | Atlas | 1950-1995 | `#d11` `#000` |
| `soccer:cosmos-1971-1974-home` | New York Cosmos | 1971-1974 | `#090` `#fd0` |
| `soccer:cosmos-1971-1974-away` | New York Cosmos | 1971-1974 | `#fd0` `#090` |
| `soccer:cosmos-1975-1978-home` | New York Cosmos | 1975-1978 | `#fff` `#090` `#fd0` |
| `soccer:cosmos-1975-1978-away` | New York Cosmos | 1975-1978 | `#090` `#fd0` |
| `soccer:cosmos-1979-1985-home` | New York Cosmos | 1979-1985 | `#fff` `#013` `#fb1` |
| `soccer:cosmos-1979-1985-away` | New York Cosmos | 1979-1985 | `#013` `#fb1` |
| `soccer:dcunited-1996-2000-home` | D.C. United | 1996-2000 | `#000` `#d11` `#fff` |
| `soccer:crew-1996-2000-home` | Columbus Crew | 1996-2000 | `#fd0` `#000` |
| `soccer:sounders-2009-2012-home` | Seattle Sounders FC | 2009-2012 | `#6c3` `#13a` |
| `soccer:torontofc-2007-2010-home` | Toronto FC | 2007-2010 | `#d11` `#888` |
| `soccer:whitecaps-2011-2014-home` | Vancouver Whitecaps | 2011-2014 | `#fff` `#13a` |
| `soccer:galaxy-1996-2000-home` | LA Galaxy | 1996-2000 | `#fff` `#013` `#fb1` |
| `soccer:sportingkc-2011-2016-home` | Sporting Kansas City | 2011-2016 | `#9be` `#013` |
| `soccer:kashima-1993-1996-home` | Kashima Antlers | 1993-1996 | `#c11` `#013` |
| `soccer:verdy-1993-1996-home` | Verdy Kawasaki | 1993-1996 | `#090` `#fff` |
| `soccer:urawa-1993-1996-home` | Urawa Red Diamonds | 1993-1996 | `#c11` `#fff` |
| `soccer:marinos-1993-1996-home` | Yokohama Marinos | 1993-1996 | `#13a` `#fff` `#d11` |
| `soccer:flugels-1993-1998-home` | Yokohama Flügels | 1993-1998 | `#fff` `#5bf` |
| `soccer:sspulse-1993-1996-home` | Shimizu S-Pulse | 1993-1996 | `#f80` `#fff` |
| `soccer:gamba-1993-1996-home` | Gamba Osaka | 1993-1996 | `#13a` `#000` |
| `soccer:grampus-1993-1996-home` | Nagoya Grampus Eight | 1993-1996 | `#d11` `#fd0` |
| `soccer:jubilo-1994-2000-home` | Júbilo Iwata | 1994-2000 | `#6ad` `#fff` |
| `soccer:sanfrecce-1993-1996-home` | Sanfrecce Hiroshima | 1993-1996 | `#639` `#fff` |
| `soccer:jef-1993-1996-home` | JEF United Ichihara | 1993-1996 | `#fd0` `#090` |

## SOCCER_NATIONS

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `fifa:brazil-1958-1962-home` | Brazil | 1958-1962 | `#fd0` `#093` |
| `fifa:brazil-1958-1962-away` | Brazil | 1958-1962 | `#037` `#fff` |
| `fifa:brazil-1970-home` | Brazil | 1970 | `#fd0` `#093` |
| `fifa:brazil-1970-away` | Brazil | 1970 | `#037` `#fff` |
| `fifa:brazil-1982-home` | Brazil | 1982 | `#fd0` `#093` `#037` |
| `fifa:brazil-1994-home` | Brazil | 1994 | `#fd0` `#093` `#037` |
| `fifa:argentina-1950-1970-home` | Argentina | 1950-1970 | `#fff` `#7ae` |
| `fifa:argentina-1978-home` | Argentina | 1978 | `#fff` `#7ae` |
| `fifa:argentina-1986-home` | Argentina | 1986 | `#fff` `#7ae` |
| `fifa:argentina-1986-away` | Argentina | 1986 | `#013` `#7ae` |
| `fifa:uruguay-1950-home` | Uruguay | 1950 | `#7ae` `#fff` |
| `fifa:uruguay-1970-home` | Uruguay | 1970 | `#7ae` `#fff` |
| `fifa:uruguay-1970-away` | Uruguay | 1970 | `#fff` `#7ae` |
| `fifa:england-1950-1965-home` | England | 1950-1965 | `#fff` `#013` |
| `fifa:england-1966-home` | England | 1966 | `#fff` `#013` |
| `fifa:england-1966-away` | England | 1966 | `#d11` `#fff` |
| `fifa:england-1982-home` | England | 1982 | `#fff` `#c11` `#013` |
| `fifa:england-1990-home` | England | 1990 | `#fff` `#013` `#c11` |
| `fifa:england-1996-home` | England | 1996 | `#fff` `#c11` `#013` |
| `fifa:england-1996-away` | England | 1996 | `#999` `#c11` `#013` |
| `fifa:scotland-1970-1980-home` | Scotland | 1970-1980 | `#013` `#fff` |
| `fifa:scotland-1982-home` | Scotland | 1982 | `#013` `#c11` `#fff` |
| `fifa:scotland-1978-away` | Scotland | 1978 | `#fd0` `#013` |
| `fifa:wales-1958-home` | Wales | 1958 | `#d11` `#fff` |
| `fifa:wales-1990-1995-away` | Wales | 1990-1995 | `#090` `#fff` |
| `fifa:ireland-1988-1992-home` | Republic of Ireland | 1988-1992 | `#090` `#fff` |
| `fifa:ireland-1988-1992-away` | Republic of Ireland | 1988-1992 | `#fff` `#090` |
| `fifa:nireland-1980-1986-home` | Northern Ireland | 1980-1986 | `#090` `#fff` |
| `fifa:germany-1954-home` | Germany | 1954 | `#fff` `#000` |
| `fifa:germany-1974-home` | Germany | 1974 | `#fff` `#000` |
| `fifa:germany-1974-away` | Germany | 1974 | `#090` `#fff` |
| `fifa:germany-1990-home` | Germany | 1990 | `#fff` `#000` `#c11` |
| `fifa:germany-1990-away` | Germany | 1990 | `#090` `#000` `#c11` |
| `fifa:netherlands-1974-home` | Netherlands | 1974 | `#f60` `#000` |
| `fifa:netherlands-1974-away` | Netherlands | 1974 | `#fff` `#f60` |
| `fifa:netherlands-1988-home` | Netherlands | 1988 | `#f60` `#000` |
| `fifa:france-1958-home` | France | 1958 | `#13a` `#fff` |
| `fifa:france-1982-home` | France | 1982 | `#13a` `#fff` `#c11` |
| `fifa:france-1982-away` | France | 1982 | `#fff` `#13a` `#c11` |
| `fifa:france-1998-home` | France | 1998 | `#13a` `#fff` `#c11` |
| `fifa:italy-1970-home` | Italy | 1970 | `#08c` `#fff` |
| `fifa:italy-1982-home` | Italy | 1982 | `#08c` `#fff` |
| `fifa:italy-1982-away` | Italy | 1982 | `#fff` `#08c` |
| `fifa:italy-1990-home` | Italy | 1990 | `#08c` `#fff` |
| `fifa:spain-1964-home` | Spain | 1964 | `#d00` `#fd0` |
| `fifa:spain-1982-home` | Spain | 1982 | `#d00` `#fd0` `#04a` |
| `fifa:spain-1982-away` | Spain | 1982 | `#fff` `#04a` `#d00` |
| `fifa:portugal-1966-home` | Portugal | 1966 | `#a01` `#090` |
| `fifa:belgium-1986-home` | Belgium | 1986 | `#d11` `#000` `#fd0` |
| `fifa:hungary-1954-home` | Hungary | 1954 | `#d11` `#fff` |
| `fifa:hungary-1954-away` | Hungary | 1954 | `#fff` `#d11` |
| `fifa:ussr-1960-1970-home` | Soviet Union | 1960-1970 | `#d11` `#fff` |
| `fifa:ussr-1988-home` | Soviet Union | 1988 | `#d11` `#fff` |
| `fifa:ussr-1988-away` | Soviet Union | 1988 | `#fff` `#d11` |
| `fifa:yugoslavia-1990-home` | Yugoslavia | 1990 | `#13a` `#fff` `#d11` |
| `fifa:yugoslavia-1960-1970-away` | Yugoslavia | 1960-1970 | `#fff` `#13a` |
| `fifa:czechoslovakia-1962-home` | Czechoslovakia | 1962 | `#d11` `#fff` |
| `fifa:poland-1974-home` | Poland | 1974 | `#fff` `#d11` |
| `fifa:poland-1974-away` | Poland | 1974 | `#d11` `#fff` |
| `fifa:sweden-1958-home` | Sweden | 1958 | `#fd0` `#04a` |
| `fifa:denmark-1986-home` | Denmark | 1986 | `#d11` `#fff` |
| `fifa:austria-1954-home` | Austria | 1954 | `#fff` `#000` |
| `fifa:switzerland-1954-home` | Switzerland | 1954 | `#d11` `#fff` |
| `fifa:romania-1990-home` | Romania | 1990 | `#fd0` `#13a` `#d11` |
| `fifa:chile-1962-home` | Chile | 1962 | `#d11` `#fff` |
| `fifa:colombia-1990-home` | Colombia | 1990 | `#fd0` `#13a` `#d11` |
| `fifa:peru-1970-home` | Peru | 1970 | `#fff` `#d11` |
| `fifa:paraguay-1950-1990-home` | Paraguay | 1950-1990 | `#fff` `#d11` |
| `fifa:mexico-1970-home` | Mexico | 1970 | `#090` `#fff` |
| `fifa:usa-1990-home` | United States | 1990 | `#fff` `#13a` `#d11` |
| `fifa:usa-1994-away` | United States | 1994 | `#13a` `#fff` `#d11` |
| `fifa:canada-1986-home` | Canada | 1986 | `#d11` `#fff` |
| `fifa:costarica-1990-home` | Costa Rica | 1990 | `#d11` `#13a` `#fff` |
| `fifa:japan-1998-home` | Japan | 1998 | `#13a` `#fff` |
| `fifa:japan-1998-away` | Japan | 1998 | `#fff` `#13a` |
| `fifa:korea-1986-home` | South Korea | 1986 | `#d11` `#13a` |
| `fifa:korea-1986-away` | South Korea | 1986 | `#fff` `#d11` `#13a` |
| `fifa:australia-1974-home` | Australia | 1974 | `#fd0` `#090` |
| `fifa:cameroon-1982-1990-home` | Cameroon | 1982-1990 | `#090` `#fd0` `#d11` |
| `fifa:nigeria-1994-home` | Nigeria | 1994 | `#fff` `#090` |
| `fifa:nigeria-1994-away` | Nigeria | 1994 | `#090` `#fff` |
| `fifa:morocco-1986-home` | Morocco | 1986 | `#d11` `#090` |
| `fifa:algeria-1982-home` | Algeria | 1982 | `#fff` `#090` `#d11` |
| `fifa:egypt-1990-home` | Egypt | 1990 | `#d11` `#fff` `#000` |
| `fifa:tunisia-1978-home` | Tunisia | 1978 | `#d11` `#fff` |

## RUGBY

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `rugby:nz-1905-1990-home` | New Zealand | 1905-1990 | `#000` `#fff` |
| `rugby:nz-1990-2000-home` | New Zealand | 1990-2000 | `#000` `#fff` |
| `rugby:nz-1980-2000-away` | New Zealand | 1980-2000 | `#fff` `#000` |
| `rugby:rsa-1950-1990-home` | South Africa | 1950-1990 | `#093` `#fd0` |
| `rugby:rsa-1995-home` | South Africa | 1995 | `#093` `#fd0` |
| `rugby:rsa-1995-2000-away` | South Africa | 1995-2000 | `#fff` `#093` `#fd0` |
| `rugby:aus-1980-1995-home` | Australia | 1980-1995 | `#fd0` `#093` |
| `rugby:aus-1991-home` | Australia | 1991 | `#fd0` `#093` |
| `rugby:aus-1990-1995-away` | Australia | 1990-1995 | `#093` `#fd0` |
| `rugby:eng-1950-1980-home` | England | 1950-1980 | `#fff` `#013` |
| `rugby:eng-1980-1990-home` | England | 1980-1990 | `#fff` `#c11` `#013` |
| `rugby:eng-1990-2000-home` | England | 1990-2000 | `#fff` `#013` `#c11` |
| `rugby:eng-1990-2000-away` | England | 1990-2000 | `#c11` `#fff` `#013` |
| `rugby:sco-1950-1990-home` | Scotland | 1950-1990 | `#013` `#fff` |
| `rugby:sco-1990-2000-home` | Scotland | 1990-2000 | `#013` `#fff` `#c11` |
| `rugby:irl-1950-1990-home` | Ireland | 1950-1990 | `#093` `#fff` |
| `rugby:irl-1990-2000-home` | Ireland | 1990-2000 | `#093` `#fff` |
| `rugby:irl-1990-2000-away` | Ireland | 1990-2000 | `#fff` `#093` |
| `rugby:wal-1950-1990-home` | Wales | 1950-1990 | `#d11` `#fff` |
| `rugby:wal-1990-2000-home` | Wales | 1990-2000 | `#d11` `#fff` `#fd0` |
| `rugby:wal-1970-1990-away` | Wales | 1970-1990 | `#fff` `#d11` |
| `rugby:fra-1950-1990-home` | France | 1950-1990 | `#13a` `#fff` `#d11` |
| `rugby:fra-1990-2000-home` | France | 1990-2000 | `#13a` `#fff` `#d11` |
| `rugby:fra-1950-1990-away` | France | 1950-1990 | `#fff` `#13a` `#d11` |
| `rugby:ita-1990-2000-home` | Italy | 1990-2000 | `#08c` `#fff` |
| `rugby:arg-1965-1990-home` | Argentina | 1965-1990 | `#fff` `#7ae` |
| `rugby:arg-1965-1990-away` | Argentina | 1965-1990 | `#013` `#7ae` |
| `rugby:fij-1990-2000-home` | Fiji | 1990-2000 | `#fff` `#000` |
| `rugby:sam-1991-2000-home` | Samoa | 1991-2000 | `#13a` `#fff` `#d11` |
| `rugby:ton-1990-2000-home` | Tonga | 1990-2000 | `#d11` `#fff` |
| `rugby:jpn-1950-2000-home` | Japan | 1950-2000 | `#fff` `#d11` |
| `rugby:can-1990-2000-home` | Canada | 1990-2000 | `#d11` `#fff` |
| `rugby:usa-1990-2000-home` | United States | 1990-2000 | `#fff` `#013` `#d11` |
| `rugby:geo-1990-2000-home` | Georgia | 1990-2000 | `#fff` `#d11` |
| `rugby:lions-1950-1990-home` | British & Irish Lions | 1950-1990 | `#d11` `#fff` |
| `rugby:baabaas-1950-2000-home` | Barbarians | 1950-2000 | `#fff` `#000` |
| `rugby:quins-1950-1990-home` | Harlequins | 1950-1990 | `#7bd` `#612` |
| `rugby:leicester-1950-2000-home` | Leicester Tigers | 1950-2000 | `#093` `#d11` `#fff` |
| `rugby:bath-1950-2000-home` | Bath | 1950-2000 | `#13a` `#fff` `#000` |
| `rugby:gloucester-1950-2000-home` | Gloucester | 1950-2000 | `#fff` `#c25` |
| `rugby:wasps-1950-2000-home` | Wasps | 1950-2000 | `#000` `#fd0` |
| `rugby:saracens-1950-1995-home` | Saracens | 1950-1995 | `#000` `#d11` |
| `rugby:cardiff-1950-2000-home` | Cardiff | 1950-2000 | `#13a` `#000` |
| `rugby:newport-1950-2000-home` | Newport | 1950-2000 | `#000` `#fb1` |
| `rugby:llanelli-1950-2000-home` | Llanelli | 1950-2000 | `#d11` `#fff` |
| `rugby:munster-1990-2000-home` | Munster | 1990-2000 | `#d11` `#fff` |
| `rugby:leinster-1990-2000-home` | Leinster | 1990-2000 | `#13a` `#fff` |
| `rugby:toulouse-1990-2000-home` | Stade Toulousain | 1990-2000 | `#d11` `#000` `#fff` |
| `rugby:toulon-1990-2000-home` | Toulon | 1990-2000 | `#d11` `#000` |
| `rugby:stadefrancais-2000s-home` | Stade Français | 2000s | `#13a` `#e3a` |
| `rugby:clermont-1990-2000-home` | Clermont | 1990-2000 | `#fd0` `#13a` |
| `rugby:biarritz-1990-2000-home` | Biarritz | 1990-2000 | `#fff` `#7ae` |
| `rugby:auckland-1950-2000-home` | Auckland | 1950-2000 | `#fff` `#13a` |
| `rugby:canterbury-1950-2000-home` | Canterbury | 1950-2000 | `#d11` `#000` |

## OFFICIALS

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `ref:nhl-modern-referee` | NHL referee | 1955- | `#fff` `#101010` `#f58220` |
| `ref:nhl-modern-referee-zip` | NHL referee, zip collar | 1955- | `#fff` `#101010` `#f58220` |
| `ref:nhl-modern-linesman` | NHL linesman | 1955- | `#fff` `#101010` `#f58220` |
| `ref:nhl-modern-linesman-zip` | NHL linesman, zip collar | 1955- | `#fff` `#101010` `#f58220` |
| `ref:hockey-canada-referee` | Hockey Canada referee | 2000s | `#fff` `#101010` `#d52b1e` |
| `ref:pwhl-referee` | PWHL referee | 2024- | `#fff` `#101010` `#5a2d82` |
| `ref:nhl-1950s-candy` | NHL referee, candy stripes | 1950s | `#fff` `#c8102e` `#1d1d1d` |
| `ref:nhl-1950s-orange` | NHL referee, orange half-zip | 1950-1955 | `#f26b21` `#101010` |
| `ref:nhl-1930s-cream` | NHL referee, cream sweater | 1930-1950 | `#efe6c8` `#101010` |
| `ref:nba-classic` | NBA referee, striped | 1950-1970 | `#fff` `#101010` |
| `ref:nba-modern` | NBA referee | 1971- | `#b9bec3` `#fff` `#111` |
| `ref:nba-summer-league` | NBA Summer League referee | 2010s | `#b9bec3` `#fff` `#111` |
| `ref:wnba` | WNBA referee | 1997- | `#b9bec3` `#fff` `#111` |
| `ref:fiba` | FIBA referee | 2010s | `#9ea3a8` `#111` |
| `ref:euroleague` | EuroLeague referee | 2010s | `#f26b21` `#111` |
| `ref:nbl-australia` | Australian NBL referee | 2010s | `#2f9e44` `#111` |
| `ref:ncaa-basketball-men` | NCAA men's basketball referee | 2019- | `#fff` `#101010` |
| `ref:ncaa-basketball-women` | NCAA women's basketball referee | 2019- | `#b9bec3` `#fff` `#111` |
| `ref:football-1910s-white` | Football official, plain white | 1900-1920 | `#fff` `#101010` |
| `ref:nfl` | NFL official | 2006- | `#fff` `#101010` |
| `ref:cfl` | CFL official | 2000s | `#fff` `#101010` |
| `ref:ncaa-football` | NCAA football official | 1950- | `#fff` `#101010` |
| `ref:highschool-football` | High school football official | 1950- | `#fff` `#101010` |
| `ref:soccer-black-classic` | Soccer referee, black | 1900-1994 | `#111` `#4a4a4a` |
| `ref:soccer-red-classic` | Soccer referee, red | 1900-1994 | `#c8102e` `#111` |
| `ref:soccer-green-1994` | Soccer referee, green | 1994-1999 | `#2e8b3d` `#111` |
| `ref:soccer-burgundy-1994` | Soccer referee, burgundy | 1994 | `#6d1f2f` `#111` |
| `ref:soccer-yellow` | Soccer referee, yellow | 1994- | `#f7e017` `#111` |
| `ref:soccer-lime` | Soccer referee, lime | 2010s | `#a6e22e` `#111` |
| `ref:soccer-coral` | Soccer referee, coral | 2019- | `#ff7a70` `#111` |
| `ref:soccer-cyan` | Soccer referee, cyan | 2019- | `#19c9e6` `#111` |
| `ref:soccer-turquoise` | Soccer referee, turquoise | 2025- | `#20c5b5` `#111` |
| `ref:soccer-purple` | Soccer referee, purple | 2025- | `#7b3fa0` `#eee` |
| `ref:mlb-umpire-navy` | MLB umpire | 1996- | `#14213d` `#c8102e` `#fff` |
| `ref:mlb-umpire-navy-protector` | MLB plate umpire, protector | 1996- | `#14213d` `#c8102e` `#fff` |
| `ref:mlb-umpire-lightblue` | MLB umpire, light blue | 1980-1995 | `#9ec5e3` `#14213d` |
| `ref:mlb-umpire-black-2000` | MLB umpire, black polo | 2000 | `#111` `#888` |
| `ref:rugby-union-yellow` | Rugby union referee, yellow | 2020s | `#f7e017` `#111` |
| `ref:lacrosse-boys` | Lacrosse official, boys' game | 2020s | `#fff` `#101010` |
| `ref:lacrosse-girls` | Lacrosse official, girls' game | 2020s | `#fff` `#101010` |

## HOCKEY_STYLES

| Id | Team | Years | Colours (body, trim, second trim) |
| --- | --- | --- | --- |
| `style:canada-2026-home` | Canada | 2026 | `#d52b1e` `#fff` `#111` |
| `style:canada-2026-away` | Canada | 2026 | `#fff` `#d52b1e` `#111` |
| `style:usa-2026-home` | United States | 2026 | `#0a3161` `#fff` `#b31942` |
| `style:usa-2026-away` | United States | 2026 | `#fff` `#0a3161` `#b31942` |
| `style:sweden-2026-home` | Sweden | 2026 | `#006aa7` `#fecc00` `#fff` |
| `style:sweden-2026-away` | Sweden | 2026 | `#fecc00` `#006aa7` `#fff` |
| `style:finland-2026-home` | Finland | 2026 | `#fff` `#003580` |
| `style:finland-2026-away` | Finland | 2026 | `#003580` `#fff` |
| `style:czechia-2026-home` | Czechia | 2026 | `#d7141a` `#fff` `#11457e` |
| `style:czechia-2026-away` | Czechia | 2026 | `#fff` `#d7141a` `#11457e` |
| `style:slovakia-2026-home` | Slovakia | 2026 | `#fff` `#0b4ea2` `#ee1c25` |
| `style:slovakia-2026-away` | Slovakia | 2026 | `#0b4ea2` `#fff` `#ee1c25` |
| `style:switzerland-2026-home` | Switzerland | 2026 | `#d52b1e` `#fff` |
| `style:switzerland-2026-away` | Switzerland | 2026 | `#fff` `#d52b1e` |
| `style:germany-2026-home` | Germany | 2026 | `#fff` `#111` `#dd0000` |
| `style:germany-2026-away` | Germany | 2026 | `#111` `#fff` `#dd0000` |
| `style:latvia-2026-home` | Latvia | 2026 | `#9e3039` `#fff` |
| `style:latvia-2026-away` | Latvia | 2026 | `#fff` `#9e3039` |
| `style:norway-2026-home` | Norway | 2026 | `#ba0c2f` `#fff` `#00205b` |
| `style:norway-2026-away` | Norway | 2026 | `#fff` `#ba0c2f` `#00205b` |
| `style:japan-2026-home` | Japan | 2026 | `#fff` `#bc002d` `#1b2a6b` |
| `style:japan-2026-away` | Japan | 2026 | `#bc002d` `#fff` `#1b2a6b` |
| `style:france-2026-home` | France | 2026 | `#0055a4` `#fff` `#ef4135` |
| `style:france-2026-away` | France | 2026 | `#fff` `#0055a4` `#ef4135` |

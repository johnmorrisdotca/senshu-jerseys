# Notice: where the drawings and the data come from

The code of this package is under the MIT licence (see [LICENSE](LICENSE)). Every drawing is made for this package: the cuts, the letters and numerals, the caps, helmets, banners and the rest are drawn here, with no art, font or icon taken from elsewhere. There are no runtime dependencies.

## The presets

A preset (`src/presets/`) records a team's uniform of one era as colours and stripes. The colours and the stripe layouts are **facts** read from public descriptions and written here as data:

| Source | What was taken | Licence of the source |
| --- | --- | --- |
| The uniform and logo sections of English Wikipedia articles on teams and national teams | Colour names and values, where stripes and bands sit, collar, yoke and number colours | CC BY-SA 4.0 (the text; facts are not copyrightable, and no text is copied) |
| English Wikipedia articles on officials (ice hockey, basketball, American football, association football, baseball umpires, rugby union and rugby league referees) | The colours, stripes, collars and armbands officials wear, and the years they changed | CC BY-SA 4.0 (facts; no text is copied) |
| The Alberta Sports Hall of Fame, the Illinois High School Association's Sports Officials Handbook, and FootyHeadlines on referee kit ranges | The year the NHL's striped sweater began, high school and lacrosse stripes, the colours of recent soccer referee kits | Facts |
| Wikidata | Team names and colour values | CC0 |
| Clubs' own published colour codes and brand pages | Colour values | Facts |

No picture is taken from Wikimedia Commons or anywhere else: uniform images and diagrams (including the kit diagrams on Wikimedia Commons and the era pages of nhluniforms.com, which the NHL and national hockey presets were checked against) are looked at only as a reference, never traced or copied.

**What a preset does not hold.** No crest, logo, monogram, wordmark, sponsor mark or manufacturer mark of a team, a club, a league or a federation, whether the team plays today or is defunct (the marks of defunct teams are still owned and sold). A jersey whose identity is mostly its chest mark still reads by its colours and stripes, and a caller may add their own `crest`. Team names appear as names, to say which uniform is meant; they are the property of their owners, and nothing here is endorsed by or affiliated with any team or league.

The facts are a first reading and some rows are marked `unsure` in their source files. A correction with a source is welcome.

## The Kodokan emblem

`emblem: { mark: "kodokan" }` draws the emblem of the Kodokan (the judo institute in Tokyo): a white flower of sixteen petals round a red disc, as vector in `src/judogiKodokan.ts`. It is drawn from how the emblem looks (the Judo BC logo and a photograph of the Kodokan's pin, "Diploma for judo 9th dan" on Wikimedia Commons, public domain); no file of the Kodokan's or Judo BC's is used or shipped. The emblem is the Kodokan's mark and its trademark status has not been checked: it is included at the maintainer's choice, and a user is responsible for any right to wear or show it.

## Klee One (the bundled kana)

`@johnmorrisdotca/senshu-jerseys/brush-kana` holds the outlines of some glyphs of **Klee One** (https://github.com/fontworks-fonts/Klee, taken from https://github.com/google/fonts/tree/main/ofl/kleeone, read 2026-11-02), cut out by `scripts/make-brush-kana.mjs` as vector paths in `src/brushKanaData.ts`. Klee One is licensed under the SIL Open Font License 1.1, copied below. The outlines are modified (cut into single glyphs, set in an em box, rounded to whole units); they are not sold on their own, and the font's name is not used for anything else. The glyphs are listed in `BRUSH_KANA_CHARS`; the font file itself is not in this package.

```
Copyright 2020 The Klee Project Authors (https://github.com/fontworks-fonts/Klee)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## Made-up examples

The demo's other teams, players and numbers are made up.

## The backgrounds behind the pictures

The backgrounds behind the README pictures and the demo's preview (`scripts/family-backgrounds.ts`, version 1.0.0) are the family's shared module, copied byte for byte from taisen-brackets: twenty-five backgrounds drawn in code from gradients, patterns and paths, all by this package's author, none traced from a picture, a poster, a logo, a trophy or a photograph (MIT). It is tooling: the package ships none of it, and no jersey, cap, helmet or banner is drawn on a background.

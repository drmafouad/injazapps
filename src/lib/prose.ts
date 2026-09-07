// Minimal markdown structure parser for long-form prose pages (about,
// terms, privacy, ...). The copy for these pages is plain prose — no
// bold/italic/links/lists — so a full markdown pipeline is unneeded.
// Recognizes only: a leading "# Title" (H1) and "## Heading" (H2)
// section breaks, with everything else treated as paragraphs. Lines
// wrapped for readability within one paragraph are joined with spaces.
export interface ProseSection {
  heading: string | null;
  paragraphs: string[];
}

export interface ProseDocument {
  title: string;
  sections: ProseSection[];
}

export function parseProse(markdown: string): ProseDocument {
  const blocks = markdown
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!blocks.length || !blocks[0].startsWith('# ')) {
    throw new Error('Prose document must start with an H1 ("# Title") block');
  }
  const title = blocks[0].slice(2).trim();

  const sections: ProseSection[] = [];
  let current: ProseSection = { heading: null, paragraphs: [] };

  const pushCurrent = () => {
    if (current.heading !== null || current.paragraphs.length > 0) sections.push(current);
  };

  for (const block of blocks.slice(1)) {
    if (block.startsWith('## ')) {
      pushCurrent();
      current = { heading: block.slice(3).trim(), paragraphs: [] };
    } else {
      current.paragraphs.push(block.replace(/\s*\n\s*/g, ' '));
    }
  }
  pushCurrent();

  return { title, sections };
}

// Splits text on a literal brand-name substring so the caller can wrap
// each occurrence in <bdi> — for a Latin brand name sitting inside
// Arabic running text. Harmless (returns the text unsplit) when the
// brand name isn't present, so it's safe to apply unconditionally.
export function splitOnBrandName(text: string, brandName = 'InjazApps'): string[] {
  return text.split(brandName);
}

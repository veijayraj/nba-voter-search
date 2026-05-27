interface HighlightProps {
  text: string;
  search: string;
}

const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

export function Highlight({ text, search }: HighlightProps) {
  if (!search.trim()) return <>{text}</>;

  // Match accent-insensitively by searching in the normalized text
  // but slicing from the original so display stays correct (e.g. "Jokić" not "Jokic")
  const normText   = stripAccents(text.toLowerCase());
  const normSearch = stripAccents(search.toLowerCase());

  const parts: { str: string; highlight: boolean }[] = [];
  let last = 0;
  let idx: number;

  while ((idx = normText.indexOf(normSearch, last)) !== -1) {
    if (idx > last) parts.push({ str: text.slice(last, idx), highlight: false });
    parts.push({ str: text.slice(idx, idx + normSearch.length), highlight: true });
    last = idx + normSearch.length;
  }
  if (last < text.length) parts.push({ str: text.slice(last), highlight: false });

  return (
    <>
      {parts.map((p, i) =>
        p.highlight ? <mark key={i}>{p.str}</mark> : p.str
      )}
    </>
  );
}

interface HighlightProps {
  text: string;
  search: string;
}

export function Highlight({ text, search }: HighlightProps) {
  if (!search.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}
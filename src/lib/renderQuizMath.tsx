import { Fragment } from "react";
import { BlockMath, InlineMath } from "react-katex";

const MATH_PATTERN = /(\$\$[\s\S]*?\$\$|\$(?:\\.|[^$\\])*\$)/g;

export function RenderQuizMath({ text }: { text: string }) {
  const parts = text.split(MATH_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

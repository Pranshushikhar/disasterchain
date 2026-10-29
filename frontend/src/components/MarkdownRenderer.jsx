import React, { useMemo } from 'react';

/**
 * Parses inline formatting:
 * - **bold**
 * - *italic* or _italic_
 * - `inline code`
 * - [link text](url)
 */
function renderInline(text) {
  if (!text) return null;

  // Tokenize string for bold, italic, code, and links
  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex pattern matching bold, code, link, or italic
  const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/;

  while (remaining.length > 0) {
    const match = remaining.match(inlinePattern);
    if (!match) {
      tokens.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      tokens.push(<span key={keyIdx++}>{remaining.slice(0, matchIndex)}</span>);
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const boldContent = matchedStr.slice(2, -2);
      tokens.push(
        <strong key={keyIdx++} className="dc-md-bold">
          {renderInline(boldContent)}
        </strong>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      const codeContent = matchedStr.slice(1, -1);
      tokens.push(
        <code key={keyIdx++} className="dc-md-code">
          {codeContent}
        </code>
      );
    } else if (matchedStr.startsWith('[') && matchedStr.includes('](') && matchedStr.endsWith(')')) {
      const closeBracket = matchedStr.indexOf('](');
      const label = matchedStr.slice(1, closeBracket);
      const url = matchedStr.slice(closeBracket + 2, -1);
      const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') ? url : '#';
      tokens.push(
        <a
          key={keyIdx++}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dc-md-link"
        >
          {label}
        </a>
      );
    } else if (
      (matchedStr.startsWith('*') && matchedStr.endsWith('*')) ||
      (matchedStr.startsWith('_') && matchedStr.endsWith('_'))
    ) {
      const italicContent = matchedStr.slice(1, -1);
      tokens.push(
        <em key={keyIdx++} className="dc-md-italic">
          {renderInline(italicContent)}
        </em>
      );
    }

    remaining = remaining.slice(matchIndex + matchedStr.length);
  }

  return tokens;
}

/**
 * Zero-dependency robust Markdown & Rich-Text Renderer
 * Specifically tailored for WeatherGPT conversational responses.
 * Renders headings, bold text, bulleted lists, numbered lists, paragraphs,
 * and highlights key-value advisories cleanly without leaking raw symbols.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const blocks = useMemo(() => {
    if (!content || typeof content !== 'string') return [];

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const parsedBlocks = [];
    let currentList = null; // { type: 'ul' | 'ol', items: [] }

    const flushList = () => {
      if (currentList) {
        parsedBlocks.push({ ...currentList });
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line closes active lists
      if (!trimmed) {
        flushList();
        continue;
      }

      // 1. Heading checks (# Heading, ## Heading, ### Heading)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushList();
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        parsedBlocks.push({
          type: 'heading',
          level,
          text: headingText,
        });
        continue;
      }

      // 2. Unordered bullet lists (• item, - item, * item)
      const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)$/);
      if (bulletMatch) {
        const itemText = bulletMatch[2];
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(itemText);
        continue;
      }

      // 3. Numbered lists (1. item, 2. item)
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        const itemText = numberedMatch[2];
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(itemText);
        continue;
      }

      // Regular paragraph line
      flushList();
      parsedBlocks.push({
        type: 'paragraph',
        text: trimmed,
      });
    }

    flushList();
    return parsedBlocks;
  }, [content]);

  if (!content) return null;

  return (
    <div className={`dc-markdown-renderer ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          if (block.level === 1 || block.level === 2) {
            return (
              <h4 key={idx} className="dc-md-h4">
                {renderInline(block.text)}
              </h4>
            );
          }
          return (
            <h5 key={idx} className="dc-md-h5">
              {renderInline(block.text)}
            </h5>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={idx} className="dc-md-ul">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="dc-md-li">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={idx} className="dc-md-ol">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="dc-md-li">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="dc-md-p">
              {renderInline(block.text)}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

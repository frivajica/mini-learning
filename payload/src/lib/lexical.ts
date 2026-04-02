/* eslint-disable @typescript-eslint/no-explicit-any */

export async function lexicalToHtml(content: unknown): Promise<string> {
  if (!content || typeof content !== "object") {
    return "";
  }

  const lexicalContent = content as any;

  if (!lexicalContent.root?.children) {
    return "";
  }

  const children = lexicalContent.root.children;

  function nodeToHtml(node: any): string {
    if (!node) return "";

    if (node.type === "text") {
      return node.text || "";
    }

    if (node.type === "linebreak") {
      return "<br>";
    }

    const childHtml = node.children?.map(nodeToHtml).join("") || "";

    switch (node.type) {
      case "paragraph":
        return `<p>${childHtml}</p>`;
      case "heading":
        const tag = node.tag || "1";
        return `<h${tag}>${childHtml}</h${tag}>`;
      case "list":
        const listTag = node.tag === "numbered" ? "ol" : "ul";
        return `<${listTag}>${childHtml}</${listTag}>`;
      case "listitem":
        return `<li>${childHtml}</li>`;
      case "quote":
        return `<blockquote>${childHtml}</blockquote>`;
      case "link":
        return `<a href="${node.fields?.doc?.source || "#"}">${childHtml}</a>`;
      default:
        return childHtml;
    }
  }

  return children.map(nodeToHtml).join("");
}

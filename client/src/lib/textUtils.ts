export const formatMarkdownText = (text: string) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/### (.*?)\n/g, '$1\n') // Remove h3 markdown
    .replace(/## (.*?)\n/g, '$1\n') // Remove h2 markdown
    .replace(/# (.*?)\n/g, '$1\n') // Remove h1 markdown
    .replace(/^\s*-\s*/gm, '• ') // Convert dashes to bullets
    .replace(/^\s*\*\s*/gm, '• ') // Convert asterisk bullets to proper bullets
    .replace(/^\s*\d+\.\s*/gm, (match) => match) // Keep numbered lists as is
    .trim();
};
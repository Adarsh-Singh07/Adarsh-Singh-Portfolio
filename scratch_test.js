const markdown = `Most AI systems work like a drive-thru window. You ask a question, the AI gives you an answer, and the interaction is over. 

But what if you need the AI to do something complex, like write a software program, test it, and fix its own bugs? A simple drive-thru won't work. You need the AI to think in **loops**.

## Enter LangGraph
LangGraph is a framework that allows Large Language Models (LLMs) to operate in cycles. 

Instead of a straight line, imagine a flowchart. 
1. The **Generator** writes the code.
2. The **Reviewer** looks at the code and runs tests.
3. If the tests fail, the Reviewer sends it *back* to the Generator with a list of errors.

This loop continues until the code works perfectly.

## Why does this matter?
By giving AI the ability to reflect and retry, we see a massive jump in quality. It's the difference between asking someone to write an essay in one draft without looking at it, versus letting them revise it five times. LangGraph gives your AI the power of revision.`;

const extractHeadings = (markdown) => {
  const extracted = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  const slugCounts = new Map();

  for (const line of lines) {
    if (line.trim().startsWith('\`\`\`')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock) {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        let text = match[2].trim();
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        text = text.replace(/[*_~\`]/g, '');
        text = text.replace(/<[^>]+>/g, '');
        
        let id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
        
        if (slugCounts.has(id)) {
          const count = slugCounts.get(id) + 1;
          slugCounts.set(id, count);
          id = `${id}-${count}`;
        } else {
          slugCounts.set(id, 0);
        }
        
        if (text) extracted.push({ id, text, level });
      }
    }
  }
  return extracted;
};

console.log(extractHeadings(markdown));

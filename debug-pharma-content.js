// Debug script to test reference extraction
const testContent = `### Executive Summary

The pharmaceutical industry is witnessing significant developments, driven by regulatory actions, clinical advancements, and market movements. One of the most notable developments is the Trump administration's plan to lower U.S. drug prices through a "most-favored nation" policy. This policy aims to ensure that Americans pay no more than the lowest price for drugs paid by peer nations.

### References:
- BioPharma Dive: "FDA clears Nuvation lung cancer drug, setting up battle with Bristol Myers and Roche"
- STAT News: "Trump executive order on drug prices has pharma firms on edge"
- STAT News: "Braced for details on Trump's 'most favored nation' policy"
- BioPharma Dive: "New data visualizations published by BioPharma Dive capture the year-to-date funding trends for 2025"`;

// Test reference extraction with updated regex
function extractDetailedSources(text) {
  const sources = [];
  
  // Look for "References:" section first
  const referencesMatch = text.match(/References:\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
  if (referencesMatch) {
    console.log('Found references section:', referencesMatch[1]);
    
    const referencesText = referencesMatch[1];
    const referenceLines = referencesText.split('\n').filter(line => line.trim().startsWith('-'));
    
    console.log('Reference lines:', referenceLines);
    
    referenceLines.forEach((line, index) => {
      console.log(`Processing line ${index}:`, line);
      // Match pattern: - Source: "Title" (handle curly quotes)
      const match = line.match(/^-\s*([^:]+):\s*[""]([^""]+)[""]?/);
      if (match) {
        console.log('Match found:', match);
        const source = match[1].trim();
        const title = match[2].trim();
        sources.push({ title, source });
      } else {
        console.log('No match for line:', line);
      }
    });
  } else {
    console.log('No references section found');
  }
  
  return sources;
}

const result = extractDetailedSources(testContent);
console.log('Final result:', result);
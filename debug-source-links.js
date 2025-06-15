// Debug source links extraction
const testSourcesSection = `

**Intelligence Sources & References:**

1. [Novel Drug Approvals for 2025](https://www.fda.gov/drugs/novel-drug-approvals-fda/novel-drug-approvals-2025)
2. [Oncology (Cancer)/Hematologic Malignancies Approval Notifications](https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancerhematologic-malignancies-approval-notifications)
3. [FDA approves taletrectinib for ROS1-positive non-small cell lung cancer](https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-taletrectinib-ros1-positive-non-small-cell-lung-cancer)
4. [Trump administration demands pharma companies begin drug price negotiations, a day after key deadline](https://www.statnews.com/2025/06/12/trump-administration-demands-drug-companies-start-negotiating-prices/)
5. [Braced for details on Trump's 'most favored nation' policy, pharma industry is still waiting](https://www.statnews.com/2025/06/11/trump-pharma-most-favored-nation-policy-details/)
`;

function extractReferences(sourcesSection) {
  if (!sourcesSection) return [];
  
  const references = [];
  
  // Parse markdown links: [Title](URL)
  const markdownLinks = sourcesSection.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
  console.log('Found markdown links:', markdownLinks);
  
  if (markdownLinks) {
    markdownLinks.forEach(link => {
      const match = link.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const title = match[1].trim();
        const url = match[2].trim();
        
        console.log(`Extracted: "${title}" -> "${url}"`);
        
        // Extract source from URL domain
        let source = '';
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          if (domain.includes('fda.gov')) {
            source = 'FDA';
          } else if (domain.includes('statnews.com')) {
            source = 'STAT News';
          } else if (domain.includes('biopharmadive.com')) {
            source = 'BioPharma Dive';
          } else {
            source = domain;
          }
        } catch {
          source = 'External Source';
        }
        
        references.push({ title, source, url });
      }
    });
  }
  
  return references;
}

console.log('Testing source extraction...');
const results = extractReferences(testSourcesSection);
console.log('Results:', JSON.stringify(results, null, 2));
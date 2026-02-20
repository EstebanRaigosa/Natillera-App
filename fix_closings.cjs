const fs = require('fs');
const path = require('path');

// This script finds each <ModalWrapper ...> and then finds the matching closing divs
// to replace them with </ModalWrapper>

function fixClosingsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const useCRLF = content.includes('\r\n');
  const nl = useCRLF ? '\r\n' : '\n';
  
  let changes = 0;
  
  // Find all ModalWrapper opening tags and track which ones need closing fixes
  // We look for patterns where ModalWrapper was just added (no </ModalWrapper> nearby)
  // Strategy: For each <ModalWrapper that is NOT immediately followed by a matching </ModalWrapper>,
  // we need to count divs to find where the old </div></div> closings are
  
  // Actually, simpler approach: after migration, the structure is:
  // <ModalWrapper ...>     <- this replaced 3 opening lines (overlay, backdrop, card)
  //   ... content ...
  // </div>                 <- old card closing (NEEDS TO BE REMOVED)  
  // </div>                 <- old overlay closing (NEEDS TO BE REPLACED with </ModalWrapper>)
  
  // So we need to find each ModalWrapper block, then find the corresponding extra </div> tags
  
  // Let's use a different approach: find each </ModalWrapper> that doesn't exist yet
  // and each sequence of </div>\n  </div> that should be </ModalWrapper>
  
  // Better: find each <ModalWrapper, then scan forward counting open/close tags to find
  // where the content ends, and fix the closing
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('<ModalWrapper')) {
      // Find the closing > of this tag
      let j = i;
      while (j < lines.length && !lines[j].trim().endsWith('>')) j++;
      
      // Now scan forward from j+1, counting div nesting
      // The content is at depth 0 (it's the slot content)
      // We need to find where the content's structure ends
      // Since we removed the card div opening but left its closing, there's an extra </div>
      // at the end, followed by another </div> for the overlay
      
      // Actually, let me think about this differently.
      // Before migration:
      //   <div overlay>          <- removed
      //     <div backdrop/>      <- removed
      //     <div card>           <- removed
      //       CONTENT
      //     </div>               <- card close - EXTRA, needs removal
      //   </div>                 <- overlay close - should become </ModalWrapper>
      
      // After migration so far:
      //   <ModalWrapper>
      //     CONTENT              <- same content
      //   </div>                 <- was card close - NEEDS TO BE REMOVED
      //   </div>                 <- was overlay close - NEEDS TO BECOME </ModalWrapper>
      
      // So I need to find the LAST two </div> before the next modal/component
      // and replace them: remove first one, change second to </ModalWrapper>
      
      // Let's count: from end of ModalWrapper opening tag, dive into content
      // The content has its own div structure. We need to find where depth goes to -1 (card close)
      // and then -2 (overlay close)
      
      let depth = 0;
      let cardCloseIdx = -1;
      let overlayCloseIdx = -1;
      
      for (let k = j + 1; k < lines.length; k++) {
        const l = lines[k];
        // Count opening divs (not self-closing)
        const opens = (l.match(/<div[\s>]/g) || []).length;
        const closes = (l.match(/<\/div>/g) || []).length;
        // Also count other block elements that open/close
        
        depth += opens - closes;
        
        if (depth === -1 && cardCloseIdx === -1) {
          cardCloseIdx = k;
        } else if (depth === -2 && overlayCloseIdx === -1) {
          overlayCloseIdx = k;
          break;
        }
      }
      
      if (cardCloseIdx !== -1 && overlayCloseIdx !== -1) {
        // Check if they're already been fixed
        if (lines[overlayCloseIdx].trim() === '</ModalWrapper>') {
          continue; // Already fixed
        }
        
        const indent = lines[overlayCloseIdx].match(/^(\s*)/)[1];
        
        // Remove the card close div line
        if (lines[cardCloseIdx].trim() === '</div>') {
          lines[cardCloseIdx] = ''; // Remove it
        }
        
        // Replace overlay close with </ModalWrapper>
        if (lines[overlayCloseIdx].trim() === '</div>') {
          lines[overlayCloseIdx] = indent + '</ModalWrapper>';
          changes++;
          console.log(`  ✓ Fixed closing at line ${overlayCloseIdx + 1} for ModalWrapper at line ${i + 1}`);
        }
      } else {
        console.log(`  ⚠ Could not find closings for ModalWrapper at line ${i + 1} (depth tracking: card=${cardCloseIdx}, overlay=${overlayCloseIdx})`);
      }
    }
  }
  
  // Remove empty lines that resulted from removing card close divs
  const result = lines.filter(l => l !== '').join(nl);
  fs.writeFileSync(filePath, result, 'utf8');
  console.log(`  Saved (${changes} closings fixed): ${filePath}\n`);
}

// Process files
const base = __dirname;
const files = [
  'src/views/actividades/Actividades.vue',
  // Prestamos already done manually
];

for (const f of files) {
  const filePath = path.join(base, f);
  console.log(`=== ${f} ===`);
  fixClosingsInFile(filePath);
}

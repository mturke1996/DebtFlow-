const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace top-level page header pt (usually pt: 2 or pt: 3)
            // Look for borderBottom: ... pt: X, pb: Y, px: Z pattern which is common in these pages
            content = content.replace(/(borderBottom:\s*[^,]+,\s*)pt:\s*([0-9]+)\s*,/g, (match, p1, p2) => {
                modified = true;
                const pxValue = parseInt(p2) * 8; // assuming theme spacing is 8px
                return `${p1}pt: 'calc(${pxValue}px + env(safe-area-inset-top))',`;
            });
            
            // For ClientProfilePage which has a custom top box without borderBottom
            // Look for the main top box pattern:
            content = content.replace(/(bgcolor:\s*(?:theme\.palette\.mode === 'dark'\s*\?\s*alpha\([^)]+\)\s*:\s*alpha\([^)]+\)|alpha\([^)]+\)|[^,]+),\s*)pt:\s*([0-9]+)\s*,/g, (match, p1, p2) => {
                if (match.includes("env(safe-area-inset-top)")) return match; // already modified
                modified = true;
                const pxValue = parseInt(p2) * 8;
                return `${p1}pt: 'calc(${pxValue}px + env(safe-area-inset-top))',`;
            });

            // For FullScreen Dialog Headers
            // Usually they have bgcolor: 'primary.main', color: '...', p: 2,
            // or backgroundColor: theme.palette.primary.main
            content = content.replace(/(bgcolor|backgroundColor):\s*('primary\.main'|theme\.palette\.primary\.main)([^}]*?)p:\s*([0-9]+)\s*,/g, (match, p1, p2, p3, p4) => {
                if (match.includes("env(safe-area-inset-top)")) return match; // already modified
                modified = true;
                const pxValue = parseInt(p4) * 8;
                return `${p1}: ${p2}${p3}p: ${p4}, pt: 'calc(${pxValue}px + env(safe-area-inset-top))',`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Modified: ${fullPath}`);
            }
        }
    }
}

processDirectory(pagesDir);

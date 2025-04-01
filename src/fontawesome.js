// Import Font Awesome CSS using a dynamic import to avoid Rollup resolution issues
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Import Font Awesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css';

// Add all icons to the library
library.add(fas, far, fab);

// Replace i tags with SVG
dom.watch(); 
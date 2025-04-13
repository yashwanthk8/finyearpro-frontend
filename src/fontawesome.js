// Use a simpler approach for Font Awesome with explicit imports
import { library, dom } from '@fortawesome/fontawesome-svg-core';

// Import only the specific icons you need
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

import { 
  faLinkedin, 
  faTwitter, 
  faInstagram, 
  faGithub,
  faDribbble
} from '@fortawesome/free-brands-svg-icons';

// Add only specific icons to reduce bundle size
library.add(
  // Solid icons
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  
  // Brand icons
  faLinkedin,
  faTwitter,
  faInstagram,
  faGithub,
  faDribbble
);

// Set configuration to use CSS
import '@fortawesome/fontawesome-svg-core/styles.css';

// Replace i tags with SVG
dom.watch(); 
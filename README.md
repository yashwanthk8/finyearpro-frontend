# FinYearPro - Financial Document Management and Analysis Platform

FinYearPro is a comprehensive web application for financial document management, analysis, and visualization. The platform allows users to upload various financial documents (Excel, CSV, PDF), analyze data, and visualize insights through interactive charts and statistics.

## Features

- **User Authentication**: Secure login/signup with email and Google OAuth
- **Document Management**: Upload, view, and organize financial documents
- **Automated Analysis**: Intelligent analysis of financial data with customizable options
- **Data Visualization**: Interactive charts and graphs for better insights
- **Dashboard**: Comprehensive view of all analyses and documents
- **Work Auto**: Special workspace for processing and analyzing work-related documents
- **Responsive Design**: Mobile-friendly interface for on-the-go access

## Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, Recharts
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Processing**: XLSX, PDF-parse
- **Data Analysis**: Simple-statistics
- **Styling**: TailwindCSS, Bootstrap, custom CSS

## Getting Started

### Prerequisites

- Node.js (v18.x)
- npm (v9.x)
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/finyearpro.git
cd finyearpro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Supabase Setup

1. Create a Supabase project
2. Run the SQL scripts in the project root to set up tables:
   - `setup_tables.sql` - Initial tables setup
   - `final_fixed_setup.sql` - Updated tables with fixed relationships

3. Configure authentication providers:
   - Enable Email auth
   - Set up Google OAuth (add redirect URI: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`)

## Deployment

This project is set up for deployment on Netlify. The `netlify.toml` file includes the necessary configuration.

```bash
npm run build
```

## Project Structure

- `src/components/` - React components
- `src/contexts/` - Context providers for state management
- `src/services/` - API and service functions
- `src/utils/` - Utility functions
- `src/workers/` - Web workers for heavy processing
- `src/supabase.js` - Supabase client and database functions

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

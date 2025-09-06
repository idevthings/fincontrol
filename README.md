# Fincontrol - Finance Expense Tracking App

A modern Angular application for importing and managing expense data from CSV/JSON files with Supabase backend.

## Features

- 📁 **File Import**: Drag & drop CSV or JSON file upload
- 🔄 **Data Processing**: Robust parsing with validation and error handling
- 🗄️ **Database Storage**: Supabase integration for data persistence
- 📊 **Data Preview**: Real-time processing results and error reporting
- 🎨 **Modern UI**: Clean, responsive interface with progress indicators

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd fincontrol

# Install dependencies
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create the expenses table using the SQL below

### 4. Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'your-supabase-project-url',
  supabaseKey: 'your-supabase-anon-key'
};
```

### 5. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  currency TEXT NOT NULL DEFAULT 'USD',
  account TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_account ON expenses(account);
```

### 6. Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload when you modify source files.

## File Import Best Practices

### CSV Format Support

The app supports flexible CSV formats. Here are the expected column names (case-insensitive):

**Required Fields:**
- `date` or `Date` or `transaction_date` or `Transaction Date`
- `description` or `Description` or `memo` or `Memo`
- `amount` or `Amount` or `value` or `Value`

**Optional Fields:**
- `category` or `Category` or `type` or `Type`
- `currency` or `Currency`
- `account` or `Account` or `account_name` or `Account Name`
- `tags` or `Tags` (comma-separated)

### JSON Format Support

JSON files can be either:
1. **Array format**: `[{ "date": "2024-01-01", "description": "Coffee", "amount": 5.50 }, ...]`
2. **Object with expenses property**: `{ "expenses": [...] }`
3. **Object with data property**: `{ "data": [...] }`

### Sample CSV File

```csv
Date,Description,Amount,Category,Currency,Account
2024-01-15,Coffee Shop,5.50,Food,USD,Checking
2024-01-16,Gas Station,45.00,Transportation,USD,Credit Card
2024-01-17,Grocery Store,125.30,Groceries,USD,Checking
```

### Sample JSON File

```json
[
  {
    "date": "2024-01-15",
    "description": "Coffee Shop",
    "amount": 5.50,
    "category": "Food",
    "currency": "USD",
    "account": "Checking"
  },
  {
    "date": "2024-01-16",
    "description": "Gas Station",
    "amount": 45.00,
    "category": "Transportation",
    "currency": "USD",
    "account": "Credit Card"
  }
]
```

## Data Validation

The app includes comprehensive validation:

- **Date validation**: Parses various date formats
- **Amount validation**: Handles different number formats and currencies
- **Required fields**: Ensures essential data is present
- **Error reporting**: Detailed error messages for invalid rows
- **Data preview**: Shows processed data before import

## Architecture

```
src/app/
├── components/
│   ├── expense-import.component.ts    # Main import interface
│   └── file-upload.component.ts       # File upload with drag & drop
├── services/
│   ├── expense.service.ts             # Supabase operations
│   ├── file-processing.service.ts     # CSV/JSON processing
│   └── supabase.config.ts            # Supabase client setup
├── models/
│   └── expense.model.ts               # TypeScript interfaces
└── environments/
    ├── environment.ts                 # Development config
    └── environment.prod.ts            # Production config
```

## Production Deployment

### Building for Production

```bash
npm run build -- --configuration production
```

The build artifacts will be stored in the `dist/fincontrol/` directory.

### Production Features

✅ **Security & Validation**
- Environment variable validation with helpful error messages
- Input sanitization and XSS protection
- File size limits (10MB max) and type validation
- Client-side data validation with detailed error reporting

✅ **Error Handling**
- Global error boundary with custom error handler
- Structured logging for production (stored in localStorage)
- User-friendly error messages
- Graceful degradation for configuration errors

✅ **Performance Optimizations**
- Bundle optimization and minification
- Source maps disabled in production
- Named chunks disabled for smaller bundles
- Build budgets configured (500KB warning, 1MB error)

✅ **Type Safety**
- Strict TypeScript configuration
- Comprehensive type checking
- Angular compiler optimizations enabled

### Environment Setup for Production

1. **Supabase Configuration:**
   ```typescript
   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     supabaseUrl: 'your-production-supabase-url',
     supabaseKey: 'your-production-supabase-anon-key'
   };
   ```

2. **Database Setup:**
   Run the SQL schema provided in the Database Schema section above.

3. **Deployment:**
   ```bash
   # Build for production
   npm run build -- --configuration production

   # Deploy the dist/fincontrol directory to your hosting service
   # Examples: Vercel, Netlify, AWS S3, Firebase Hosting, etc.
   ```

### Security Considerations

- **Row Level Security (RLS)** is enabled on the expenses table
- **Environment variables** are validated on startup
- **Input sanitization** prevents XSS attacks
- **File validation** prevents malicious file uploads
- **Error logging** is structured for monitoring

### Monitoring & Debugging

- Production errors are logged to localStorage (last 100 entries)
- Use browser dev tools to inspect `localStorage.getItem('app_logs')`
- For production monitoring, integrate with services like Sentry or LogRocket

## Testing

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

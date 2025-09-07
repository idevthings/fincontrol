export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
}

export const SUBCATEGORIES: Subcategory[] = [
  // Housing related
  {
    id: 'improvements',
    name: 'improvements',
    categoryId: 'housing',
    description: 'Home improvements and renovations'
  },
  {
    id: 'upkeep',
    name: 'upkeep',
    categoryId: 'housing',
    description: 'Property upkeep and maintenance'
  },
  {
    id: 'community',
    name: 'community',
    categoryId: 'housing',
    description: 'Community fees and charges'
  },
  {
    id: 'water',
    name: 'water',
    categoryId: 'housing',
    description: 'Water bills and services'
  },
  {
    id: 'rent',
    name: 'Rent',
    categoryId: 'housing',
    description: 'Monthly rent payments'
  },
  {
    id: 'mortgage',
    name: 'mortgage',
    categoryId: 'housing',
    description: 'Mortgage payments'
  },
  {
    id: 'bail',
    name: 'bail',
    categoryId: 'housing',
    description: 'Security deposits and bail'
  },
  {
    id: 'cleaning_service',
    name: 'cleaning service',
    categoryId: 'housing',
    description: 'Professional cleaning services'
  },

  // Fun and Entertainment
  {
    id: 'skiing',
    name: 'Skiing',
    categoryId: 'fun',
    description: 'Skiing and winter sports'
  },
  {
    id: 'experiences',
    name: 'Experiences',
    categoryId: 'fun',
    description: 'Experiences and activities'
  },
  {
    id: 'dining_out',
    name: 'Dining out',
    categoryId: 'fun',
    description: 'Restaurant and dining expenses'
  },
  {
    id: 'cinema',
    name: 'Cinema',
    categoryId: 'fun',
    description: 'Movie theater and cinema'
  },
  {
    id: 'massage',
    name: 'Massage',
    categoryId: 'fun',
    description: 'Massage and spa services'
  },
  {
    id: 'nopor',
    name: 'Nopor',
    categoryId: 'fun',
    description: 'Adult entertainment'
  },

  // Health and Wellness
  {
    id: 'gym',
    name: 'Gym',
    categoryId: 'health',
    description: 'Gym memberships and fitness'
  },
  {
    id: 'psychology',
    name: 'Psychology',
    categoryId: 'health',
    description: 'Psychological services and therapy'
  },
  {
    id: 'sexology',
    name: 'Sexology',
    categoryId: 'health',
    description: 'Sexual health services'
  },

  // Essentials
  {
    id: 'food',
    name: 'Food',
    categoryId: 'essentials',
    description: 'Groceries and food purchases'
  },
  {
    id: 'hygiene',
    name: 'Hygiene',
    categoryId: 'essentials',
    description: 'Personal hygiene products'
  },
  {
    id: 'cleaning_supply',
    name: 'Cleaning Supply',
    categoryId: 'essentials',
    description: 'Cleaning supplies and products'
  },
  {
    id: 'clothes',
    name: 'clothes',
    categoryId: 'essentials',
    description: 'Clothing and apparel'
  },

  // Transportation
  {
    id: 'gas',
    name: 'Gas',
    categoryId: 'essentials',
    description: 'Fuel and gas expenses'
  },
  {
    id: 'toll',
    name: 'Toll',
    categoryId: 'essentials',
    description: 'Toll road payments'
  },

  // Technology and Services
  {
    id: 'internet',
    name: 'Internet',
    categoryId: 'essentials',
    description: 'Internet service and connectivity'
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    categoryId: 'essentials',
    description: 'Service subscriptions'
  },

  // Work and Tools
  {
    id: 'tools',
    name: 'tools',
    categoryId: 'work',
    description: 'Work tools and equipment'
  },
  {
    id: 'management',
    name: 'management',
    categoryId: 'work',
    description: 'Management and administrative expenses'
  },

  // Financial
  {
    id: 'bank',
    name: 'bank',
    categoryId: 'other',
    description: 'Banking fees and services'
  },
  {
    id: 'insurance',
    name: 'insurance',
    categoryId: 'other',
    description: 'Insurance premiums'
  },
  {
    id: 'dividends',
    name: 'Dividends',
    categoryId: 'income',
    description: 'Dividend income'
  },
  {
    id: 'misc_income',
    name: 'Misc Income',
    categoryId: 'income',
    description: 'Miscellaneous income'
  },
  {
    id: 'cashback',
    name: 'cashback',
    categoryId: 'income',
    description: 'Cashback rewards'
  },
  {
    id: 'stock',
    name: 'stock',
    categoryId: 'investment',
    description: 'Stock investments'
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    categoryId: 'investment',
    description: 'Real estate investments'
  },

  // Tax and Government
  {
    id: 'iva',
    name: 'IVA',
    categoryId: 'tax',
    description: 'IVA (Value Added Tax)'
  },
  {
    id: 'ss',
    name: 'SS',
    categoryId: 'tax',
    description: 'Social Security payments'
  },

  // Custom categories that need subcategories
  {
    id: 'general',
    name: 'General',
    categoryId: 'ir_hal6_1drch',
    description: 'General expenses'
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    categoryId: 'ir_hal6_1drch',
    description: 'Miscellaneous expenses'
  },
  {
    id: 'general_z12',
    name: 'General',
    categoryId: 'ir_z12_4izq',
    description: 'General expenses'
  },
  {
    id: 'misc_z12',
    name: 'Miscellaneous',
    categoryId: 'ir_z12_4izq',
    description: 'Miscellaneous expenses'
  },
  {
    id: 'credit_payment',
    name: 'Credit Payment',
    categoryId: 'credits',
    description: 'Credit card payments'
  },
  {
    id: 'loan_payment',
    name: 'Loan Payment',
    categoryId: 'credits',
    description: 'Loan payments'
  },
  {
    id: 'general_other',
    name: 'General',
    categoryId: 'other',
    description: 'General other expenses'
  },
  {
    id: 'fees',
    name: 'Fees',
    categoryId: 'other',
    description: 'Various fees'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    categoryId: 'fun',
    description: 'General entertainment'
  },
  {
    id: 'leisure',
    name: 'Leisure',
    categoryId: 'fun',
    description: 'Leisure activities'
  },
  {
    id: 'medical',
    name: 'Medical',
    categoryId: 'health',
    description: 'Medical expenses'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    categoryId: 'health',
    description: 'Wellness and fitness'
  },
  {
    id: 'rental',
    name: 'Rental',
    categoryId: 'housing',
    description: 'Rental expenses'
  },
  {
    id: 'utilities',
    name: 'Utilities',
    categoryId: 'housing',
    description: 'Utility bills'
  },
  {
    id: 'salary',
    name: 'Salary',
    categoryId: 'income',
    description: 'Salary income'
  },
  {
    id: 'bonus',
    name: 'Bonus',
    categoryId: 'income',
    description: 'Bonus income'
  },
  {
    id: 'income_tax',
    name: 'Income Tax',
    categoryId: 'tax',
    description: 'Income tax payments'
  },
  {
    id: 'property_tax',
    name: 'Property Tax',
    categoryId: 'tax',
    description: 'Property tax payments'
  },
  {
    id: 'apartment_rent',
    name: 'Apartment Rent',
    categoryId: 'pisos',
    description: 'Apartment rental expenses'
  },
  {
    id: 'apartment_maintenance',
    name: 'Maintenance',
    categoryId: 'pisos',
    description: 'Apartment maintenance'
  },
  {
    id: 'apartment_rental',
    name: 'Apartment Rental',
    categoryId: 'apartments',
    description: 'Apartment rental expenses'
  },
  {
    id: 'apartment_management',
    name: 'Management',
    categoryId: 'apartments',
    description: 'Apartment management'
  },
  {
    id: 'recovery',
    name: 'Recovery',
    categoryId: 'addiction',
    description: 'Recovery related expenses'
  },
  {
    id: 'treatment',
    name: 'Treatment',
    categoryId: 'addiction',
    description: 'Treatment expenses'
  },
  {
    id: 'equipment',
    name: 'Equipment',
    categoryId: 'work',
    description: 'Work equipment'
  },
  {
    id: 'software',
    name: 'Software',
    categoryId: 'work',
    description: 'Work software'
  },
  {
    id: 'stocks',
    name: 'Stocks',
    categoryId: 'investment',
    description: 'Stock investments'
  },
  {
    id: 'bonds',
    name: 'Bonds',
    categoryId: 'investment',
    description: 'Bond investments'
  },
  {
    id: 'donations',
    name: 'Donations',
    categoryId: 'charity',
    description: 'Charitable donations'
  },
  {
    id: 'volunteering',
    name: 'Volunteering',
    categoryId: 'charity',
    description: 'Volunteering expenses'
  }
];

export const getSubcategoriesByCategory = (categoryId: string): Subcategory[] => {
  return SUBCATEGORIES.filter(subcategory => subcategory.categoryId === categoryId);
};

export const getSubcategoryById = (id: string): Subcategory | undefined => {
  return SUBCATEGORIES.find(subcategory => subcategory.id === id);
};

export const getSubcategoryByName = (name: string): Subcategory | undefined => {
  return SUBCATEGORIES.find(subcategory => subcategory.name.toLowerCase() === name.toLowerCase());
};


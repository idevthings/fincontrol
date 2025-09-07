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


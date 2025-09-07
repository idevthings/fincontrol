export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'ir_hal6_1drch',
    name: 'ir_hal6_1drch',
    color: '#4a4a4a',
    description: 'Custom category'
  },
  {
    id: 'ir_z12_4izq',
    name: 'ir_z12_4izq',
    color: '#4a4a4a',
    description: 'Custom category'
  },
  {
    id: 'credits',
    name: 'Credits',
    color: '#8b4513',
    description: 'Credit-related expenses and payments'
  },
  {
    id: 'other',
    name: 'Other',
    color: '#a0522d',
    description: 'Miscellaneous expenses'
  },
  {
    id: 'fun',
    name: 'Fun',
    color: '#556b2f',
    description: 'Entertainment and leisure activities'
  },
  {
    id: 'essentials',
    name: 'Essentials',
    color: '#2f4f2f',
    description: 'Essential living expenses'
  },
  {
    id: 'health',
    name: 'Health',
    color: '#8b0000',
    description: 'Healthcare and medical expenses'
  },
  {
    id: 'housing',
    name: 'Housing',
    color: '#a0522d',
    description: 'Rent, mortgage, and housing-related expenses'
  },
  {
    id: 'income',
    name: 'Income',
    color: '#800080',
    description: 'Income and earnings'
  },
  {
    id: 'tax',
    name: 'Tax',
    color: '#000080',
    description: 'Tax payments and obligations'
  },
  {
    id: 'pisos',
    name: 'pisos',
    color: '#a0522d',
    description: 'Apartment-related expenses'
  },
  {
    id: 'apartments',
    name: 'apartments',
    color: '#800080',
    description: 'Apartment and rental expenses'
  },
  {
    id: 'addiction',
    name: 'Addiction',
    color: '#000080',
    description: 'Addiction-related expenses'
  },
  {
    id: 'work',
    name: 'Work',
    color: '#a0522d',
    description: 'Work-related expenses'
  },
  {
    id: 'investment',
    name: 'investment',
    color: '#000080',
    description: 'Investment and savings'
  },
  {
    id: 'charity',
    name: 'charity',
    color: '#4a4a4a',
    description: 'Charitable donations and giving'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(category => category.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(category => category.name.toLowerCase() === name.toLowerCase());
};

export const getAllCategoryNames = (): string[] => {
  return CATEGORIES.map(category => category.name);
};

export const getAllCategoryIds = (): string[] => {
  return CATEGORIES.map(category => category.id);
};

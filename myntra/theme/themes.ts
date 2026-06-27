export type AppTheme = {
  colors: {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    primary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
};

export const lightTheme: AppTheme = {
  colors: {
    background: '#FFFFFF',
    card: '#F8F9FB',
    text: '#111827',
    mutedText: '#6B7280',
    primary: '#0EA5E9',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};

export const darkTheme: AppTheme = {
  colors: {
    background: '#0B0F19',
    card: '#111827',
    text: '#F9FAFB',
    mutedText: '#9CA3AF',
    primary: '#38BDF8',
    border: '#1F2937',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
};

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import ConflictWatch from '../ConflictWatch';

// Mock the API response
const mockConflictsData = [
  {
    id: "gaza-2025",
    country: "Palestinian Territories – Gaza",
    activeSince: "2023-10-07",
    fatalitiesYTD: 14987
  },
  {
    id: "ukraine-2025", 
    country: "Ukraine",
    activeSince: "2014-02-20",
    fatalitiesYTD: 8734
  },
  {
    id: "sudan-2025",
    country: "Sudan", 
    activeSince: "2023-04-15",
    fatalitiesYTD: 42000
  },
  {
    id: "myanmar-2025",
    country: "Myanmar",
    activeSince: "2021-02-01", 
    fatalitiesYTD: 3500
  }
];

// Mock fetch globally
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ConflictWatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockConflictsData,
    });
  });

  it('renders loading state initially', () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    expect(screen.getByText('ConflictWatch')).toBeInTheDocument();
    expect(screen.getByText('Monitoring active global conflicts and casualty data')).toBeInTheDocument();
  });

  it('fetches data from /api/conflicts endpoint only', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/conflicts', expect.any(Object));
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('renders conflict data correctly', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Palestinian Territories – Gaza')).toBeInTheDocument();
      expect(screen.getByText('Ukraine')).toBeInTheDocument(); 
      expect(screen.getByText('Sudan')).toBeInTheDocument();
      expect(screen.getByText('Myanmar')).toBeInTheDocument();
    });

    // Check fatality numbers are displayed
    expect(screen.getByText('14,987')).toBeInTheDocument();
    expect(screen.getByText('8,734')).toBeInTheDocument();
    expect(screen.getByText('42,000')).toBeInTheDocument();
    expect(screen.getByText('3,500')).toBeInTheDocument();
  });

  it('highlights high fatality numbers in red', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const highFatalityElement = screen.getByText('14,987');
      expect(highFatalityElement).toHaveClass('text-red-600');
      expect(highFatalityElement).toHaveClass('font-bold');
      
      const criticalFatalityElement = screen.getByText('42,000');
      expect(criticalFatalityElement).toHaveClass('text-red-600');
      expect(criticalFatalityElement).toHaveClass('font-bold');
    });
  });

  it('shows regular styling for lower fatality numbers', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const lowFatalityElement = screen.getByText('3,500');
      expect(lowFatalityElement).toHaveClass('text-slate-900');
      expect(lowFatalityElement).toHaveClass('font-semibold');
      expect(lowFatalityElement).not.toHaveClass('text-red-600');
    });
  });

  it('truncates long country names and shows tooltip on hover', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const longNameElement = screen.getByText('Palestinian Territories – Gaza');
      expect(longNameElement).toHaveClass('truncate');
      
      // Simulate hover to show tooltip
      fireEvent.mouseEnter(longNameElement);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('filters conflicts by country name', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Ukraine')).toBeInTheDocument();
      expect(screen.getByText('Sudan')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by country name...');
    fireEvent.change(searchInput, { target: { value: 'Ukraine' } });

    expect(screen.getByText('Ukraine')).toBeInTheDocument();
    expect(screen.queryByText('Sudan')).not.toBeInTheDocument();
  });

  it('shows correct conflict count', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('4 active conflicts found')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by country name...');
    fireEvent.change(searchInput, { target: { value: 'Ukraine' } });

    expect(screen.getByText('1 active conflict found')).toBeInTheDocument();
  });

  it('displays no results message when search yields no matches', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Ukraine')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by country name...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentCountry' } });

    expect(screen.getByText('No conflicts found')).toBeInTheDocument();
    expect(screen.getByText(/No conflicts match "NonexistentCountry"/)).toBeInTheDocument();
  });

  it('displays appropriate severity badges', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      // Critical (>50,000)
      expect(screen.getByText('Critical')).toBeInTheDocument();
      
      // High (>10,000)
      const highBadges = screen.getAllByText('High');
      expect(highBadges.length).toBeGreaterThan(0);
      
      // Medium/Low for smaller numbers
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as any).mockRejectedValue(new Error('API Error'));
    
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load conflict data')).toBeInTheDocument();
      expect(screen.getByText('Please check your connection and try again.')).toBeInTheDocument();
    });
  });

  it('cards stay within container bounds on different screen sizes', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const cards = screen.getAllByRole('article');
      cards.forEach(card => {
        expect(card).toHaveClass('overflow-hidden');
        expect(card).toHaveClass('rounded-xl');
      });
    });
  });

  it('uses responsive grid layout classes', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('xl:grid-cols-4');
    });
  });

  it('displays formatted dates correctly', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Oct 7, 2023')).toBeInTheDocument();
      expect(screen.getByText('Feb 20, 2014')).toBeInTheDocument();
    });
  });

  it('calculates and displays duration correctly', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      // Should show duration in days for each conflict
      const durationElements = screen.getAllByText(/\d+ days/);
      expect(durationElements.length).toBe(4);
    });
  });

  it('does not render pharma or energy data', async () => {
    render(<ConflictWatch />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      // Should not contain any pharmaceutical company names
      expect(screen.queryByText('Pfizer')).not.toBeInTheDocument();
      expect(screen.queryByText('Moderna')).not.toBeInTheDocument();
      expect(screen.queryByText('Johnson & Johnson')).not.toBeInTheDocument();
      
      // Should not contain any energy company names
      expect(screen.queryByText('ExxonMobil')).not.toBeInTheDocument();
      expect(screen.queryByText('Chevron')).not.toBeInTheDocument();
      expect(screen.queryByText('Shell')).not.toBeInTheDocument();
    });
  });
});
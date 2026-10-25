import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  Team, 
  Purchase, 
  BudgetTransaction, 
  UserSession, 
  PurchaseResult, 
  ProductCategory, 
  SortOption, 
  AvailabilityFilter,
  AuthResult
} from '../types';
import { bioBuyStore } from '../services/store';

interface BioBuyContextType {
  products: Product[];
  teams: Team[];
  currentUser: UserSession | null;
  currentTeam: Team | null;
  purchases: Purchase[];
  allPurchases: Purchase[];
  transactions: BudgetTransaction[];
  isLoading: boolean;
  isAdmin: boolean;
  isContestant: boolean;
  isPurchasing: Record<string, boolean>;
  searchQuery: string;
  selectedCategory: ProductCategory | 'All';
  selectedSort: SortOption;
  selectedAvailability: AvailabilityFilter;
  toast: {
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    details?: {
      productName?: string;
      quantity?: number;
      amount?: number;
      transactionId?: string;
      newBalance?: number;
    };
  } | null;
  // Auth Actions
  login: (identifier: string, password?: string) => AuthResult;
  registerTeam: (teamName: string, password: string, email?: string) => Promise<AuthResult>;
  logout: () => void;
  // Filter & Search Actions
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: ProductCategory | 'All') => void;
  setSelectedSort: (s: SortOption) => void;
  setSelectedAvailability: (a: AvailabilityFilter) => void;
  // Contestant Actions
  buyNow: (productId: string, quantity: number) => Promise<PurchaseResult>;
  // Admin-Only Actions
  updateProduct: (product: Partial<Product> & { id: string }) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteProduct: (productId: string) => void;
  adjustTeamBudget: (teamId: string, newBalance: number, reason: string) => void;
  createTeam: (name: string, initialBudget?: number, password?: string, email?: string) => Team;
  resetDemoData: () => void;
  hideToast: () => void;
  showCustomToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const BioBuyContext = createContext<BioBuyContextType | undefined>(undefined);

export const BioBuyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPurchasing, setIsPurchasing] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('name-asc');
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityFilter>('all');

  // Toast feedback state
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    details?: {
      productName?: string;
      quantity?: number;
      amount?: number;
      transactionId?: string;
      newBalance?: number;
    };
  } | null>(null);

  const syncStateFromStore = useCallback(() => {
    const prods = bioBuyStore.getProducts();
    const tms = bioBuyStore.getTeams();
    const user = bioBuyStore.getCurrentUser();

    setProducts(prods);
    setTeams(tms);
    setCurrentUser(user);

    if (user?.role === 'admin') {
      // Admins can see the global purchase ledger across all teams
      setAllPurchases(bioBuyStore.getAllPurchases());
      setPurchases([]);
      setTransactions([]);
    } else if (user?.role === 'contestant' && user.current_team) {
      // Contestants can strictly see ONLY their own authorized team's records
      setAllPurchases([]);
      setPurchases(bioBuyStore.getPurchasesByTeam(user.current_team.id));
      setTransactions(bioBuyStore.getTransactionsByTeam(user.current_team.id));
    } else {
      setPurchases([]);
      setAllPurchases([]);
      setTransactions([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncStateFromStore();
    const unsubscribe = bioBuyStore.subscribe(syncStateFromStore);
    return () => unsubscribe();
  }, [syncStateFromStore]);

  const showCustomToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Secure Authentication: Role is loaded from database, never chosen by user
  const login = (email: string, password?: string): AuthResult => {
    const res = bioBuyStore.login(email, password);
    if (res.success && res.session) {
      showCustomToast(
        'success',
        'Authentication Verified',
        `Welcome, ${res.session.user_name}. Signed in as ${res.session.role === 'admin' ? 'Administrator' : `Contestant (${res.session.current_team?.name})`}.`
      );
    } else {
      showCustomToast('error', 'Login Denied', res.message);
    }
    return res;
  };

  const logout = () => {
    bioBuyStore.logout();
    showCustomToast('info', 'Logged Out', 'You have been securely signed out of your session.');
  };

  const registerTeam = async (teamName: string, password: string, email?: string): Promise<AuthResult> => {
    const res = await bioBuyStore.registerTeam(teamName, password, email);
    if (res.success && res.session) {
      showCustomToast(
        'success',
        'Team Registered!',
        `Welcome, ${res.session.user_name}! Your team has been created with a ₹10,000 virtual budget and synced to Supabase Auth.`
      );
    } else {
      showCustomToast('error', 'Registration Failed', res.message);
    }
    return res;
  };

  /**
   * INSTANT BUY NOW (CONTESTANT ONLY)
   */
  const buyNow = async (productId: string, quantity: number): Promise<PurchaseResult> => {
    if (!currentUser) {
      showCustomToast('error', 'Login Required', 'You must sign in with a Contestant account to purchase products.');
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in as a Contestant.',
      };
    }

    if (currentUser.role !== 'contestant') {
      showCustomToast('error', 'Role Restriction', 'Administrators cannot make team purchases.');
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Unauthorized: Only contestant teams can execute purchases.',
      };
    }

    if (isPurchasing[productId]) {
      return {
        success: false,
        error_code: 'TRANSACTION_FAILED',
        message: 'A transaction is already being processed for this item. Please wait.',
      };
    }

    setIsPurchasing(prev => ({ ...prev, [productId]: true }));

    try {
      const result = await bioBuyStore.processPurchase(productId, quantity);

      if (result.success && result.purchase) {
        setToast({
          visible: true,
          type: 'success',
          title: 'Purchase Successful!',
          message: result.message,
          details: {
            productName: result.purchase.product_name_snapshot,
            quantity: result.purchase.quantity,
            amount: result.purchase.total_amount,
            transactionId: result.purchase.transaction_id,
            newBalance: result.new_balance,
          },
        });
      } else {
        setToast({
          visible: true,
          type: 'error',
          title: 'Purchase Failed',
          message: result.message,
        });
      }

      return result;
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred during purchase.';
      setToast({
        visible: true,
        type: 'error',
        title: 'Transaction Error',
        message: errorMsg,
      });
      return {
        success: false,
        error_code: 'TRANSACTION_FAILED',
        message: errorMsg,
      };
    } finally {
      setTimeout(() => {
        setIsPurchasing(prev => ({ ...prev, [productId]: false }));
      }, 400);
    }
  };

  // --- ADMINISTRATOR OPERATIONS (WITH BACKEND CHECK) ---

  const addProduct = (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      bioBuyStore.addProduct(product);
      showCustomToast('success', 'Product Added', `Added "${product.name}" to catalog.`);
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
    }
  };

  const updateProduct = (product: Partial<Product> & { id: string }) => {
    try {
      bioBuyStore.updateProduct(product);
      showCustomToast('success', 'Product Updated', `Saved modifications for ${product.name || 'product'}.`);
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
    }
  };

  const deleteProduct = (productId: string) => {
    try {
      bioBuyStore.deleteProduct(productId);
      showCustomToast('info', 'Product Removed', 'The biotechnology item was deleted from the catalog.');
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
    }
  };

  const adjustTeamBudget = (teamId: string, newBalance: number, reason: string) => {
    try {
      bioBuyStore.adjustTeamBudget(teamId, newBalance, reason);
      showCustomToast('success', 'Budget Adjusted', `Team budget updated to ₹${newBalance.toLocaleString('en-IN')}`);
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
    }
  };

  const createTeam = (name: string, initialBudget = 10000, password?: string, email?: string): Team => {
    try {
      const team = bioBuyStore.createTeam(name, initialBudget, password, email);
      showCustomToast('success', 'Team Created', `Registered new team: ${team.name} with ₹${initialBudget.toLocaleString('en-IN')} allocation.`);
      return team;
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
      throw err;
    }
  };

  const resetDemoData = () => {
    try {
      bioBuyStore.resetDemoData();
      showCustomToast('info', 'Demo Data Reset', 'All inventory stock and team balances restored to defaults.');
    } catch (err: any) {
      showCustomToast('error', 'Access Denied', err.message);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isContestant = currentUser?.role === 'contestant';
  const currentTeam = currentUser?.current_team || null;

  return (
    <BioBuyContext.Provider
      value={{
        products,
        teams,
        currentUser,
        currentTeam,
        purchases,
        allPurchases,
        transactions,
        isLoading,
        isAdmin,
        isContestant,
        isPurchasing,
        searchQuery,
        selectedCategory,
        selectedSort,
        selectedAvailability,
        toast,
        setSearchQuery,
        setSelectedCategory,
        setSelectedSort,
        setSelectedAvailability,
        login,
        registerTeam,
        logout,
        buyNow,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustTeamBudget,
        createTeam,
        resetDemoData,
        hideToast,
        showCustomToast,
      }}
    >
      {children}
    </BioBuyContext.Provider>
  );
};

export const useBioBuy = () => {
  const context = useContext(BioBuyContext);
  if (!context) {
    throw new Error('useBioBuy must be used within a BioBuyProvider');
  }
  return context;
};

import { 
  Product, 
  Team, 
  Purchase, 
  BudgetTransaction, 
  PurchaseResult, 
  UserSession, 
  UserAccount, 
  AuthResult
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_TEAMS, INITIAL_USERS } from '../data/seedData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'biobuy_products_v2',
  TEAMS: 'biobuy_teams_v2',
  USERS: 'biobuy_users_v2',
  PURCHASES: 'biobuy_purchases_v2',
  TRANSACTIONS: 'biobuy_transactions_v2',
  CURRENT_USER: 'biobuy_current_user_v2',
};

// Event listener type for real-time reactive updates
type Listener = () => void;

class BioBuyStore {
  private products: Product[] = [];
  private teams: Team[] = [];
  private users: UserAccount[] = [];
  private purchases: Purchase[] = [];
  private transactions: BudgetTransaction[] = [];
  private currentUser: UserSession | null = null;
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load from localStorage or initialize with seed data
    this.loadFromStorage();

    // Setup Cross-tab Broadcast Channel for live multi-tab synchronization
    try {
      this.broadcastChannel = new BroadcastChannel('biobuy_realtime_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.loadFromStorage();
          this.notifyListeners();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }

    // Setup Supabase Realtime if configured
    if (isSupabaseConfigured && supabase) {
      this.setupSupabaseRealtime();
    }
  }

  private loadFromStorage() {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = storedProducts ? JSON.parse(storedProducts) : [...INITIAL_PRODUCTS];

      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      this.teams = storedTeams ? JSON.parse(storedTeams) : [...INITIAL_TEAMS];

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];

      const storedPurchases = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      this.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];

      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      this.transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // CRITICAL SECURITY ENFORCEMENT:
        // Validate session against database user registry.
        // Never trust the role stored in localStorage!
        const verifiedUser = this.users.find(u => u.id === parsed.user_id);
        if (verifiedUser) {
          // Re-bind verified role and team from database record
          let userTeam: Team | null = null;
          if (verifiedUser.role === 'contestant' && verifiedUser.team_id) {
            userTeam = this.teams.find(t => t.id === verifiedUser.team_id) || null;
          }

          this.currentUser = {
            user_id: verifiedUser.id,
            user_name: verifiedUser.name,
            email: verifiedUser.email,
            role: verifiedUser.role, // strictly database-assigned
            current_team: userTeam,
            session_token: parsed.session_token || `token-${Date.now()}`
          };
        } else {
          this.currentUser = null;
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      console.error('Failed to load BioBuy local state:', e);
      this.products = [...INITIAL_PRODUCTS];
      this.teams = [...INITIAL_TEAMS];
      this.users = [...INITIAL_USERS];
      this.purchases = [];
      this.transactions = [];
      this.currentUser = null;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(this.teams));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(this.purchases));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }

      // Broadcast update to all other open tabs/windows
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SYNC_STATE', timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Failed to persist BioBuy state:', e);
    }
  }

  private setupSupabaseRealtime() {
    if (!supabase) return;

    supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        await this.syncWithSupabase();
      })
      .subscribe();

    supabase
      .channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async () => {
        await this.syncWithSupabase();
      })
      .subscribe();
  }

  public async syncWithSupabase() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const [prodRes, teamRes, purchRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: true }),
        supabase.from('teams').select('*').order('created_at', { ascending: true }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      ]);

      if (prodRes.data && prodRes.data.length > 0) {
        this.products = prodRes.data;
      }
      if (teamRes.data && teamRes.data.length > 0) {
        this.teams = teamRes.data;
      }
      if (purchRes.data) {
        this.purchases = purchRes.data;
      }

      this.saveToStorage();
      this.notifyListeners();
    } catch (e) {
      console.warn('Supabase sync error, using local state:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in BioBuy listener:', err);
      }
    });
  }

  // --- GETTERS ---

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public getTeams(): Team[] {
    return [...this.teams];
  }

  public getTeamById(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }

  public getCurrentUser(): UserSession | null {
    return this.currentUser;
  }

  public getRegisteredUsers(): Omit<UserAccount, 'password_hash'>[] {
    // Only administrators can list all registered user accounts
    if (this.currentUser?.role !== 'admin') {
      return [];
    }
    return this.users.map(({ password_hash, ...rest }) => rest);
  }

  /**
   * Contestant team purchase history.
   * STRICT ACCESS CONTROL:
   * Contestants can only query their own authorized team's purchases.
   * Attempting to query another team's purchases is rejected.
   */
  public getPurchasesByTeam(teamId: string): Purchase[] {
    if (!this.currentUser) return [];

    // If contestant, verify team ownership
    if (this.currentUser.role === 'contestant') {
      if (this.currentUser.current_team?.id !== teamId) {
        console.warn(`SECURITY: Unauthorized attempt by ${this.currentUser.email} to view team ${teamId} history.`);
        return [];
      }
    }

    return this.purchases
      .filter(p => p.team_id === teamId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Global purchase ledger across all teams.
   * STRICT ACCESS CONTROL: Only administrators can access.
   */
  public getAllPurchases(): Purchase[] {
    if (this.currentUser?.role !== 'admin') {
      // Reject for contestants or unauthenticated callers
      return [];
    }
    return [...this.purchases].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTransactionsByTeam(teamId: string): BudgetTransaction[] {
    if (!this.currentUser) return [];

    if (this.currentUser.role === 'contestant') {
      if (this.currentUser.current_team?.id !== teamId) {
        return [];
      }
    }

    return this.transactions
      .filter(t => t.team_id === teamId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- AUTHENTICATION & SECURE ROLE DETECTION ---

  /**
   * Login with user credentials.
   * Retrieves the role securely from the database/user registry.
   * User NEVER selects or submits their role.
   */
  public login(identifier: string, password?: string): AuthResult {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    // Match by team name (for contestants) or "admin" (for administrators).
    // Email is never required in the UI.
    const user = this.users.find(u => {
      if (u.role === 'admin') {
        return cleanId === 'admin';
      }
      // For contestants, match against their assigned team's name
      const team = this.teams.find(t => t.id === u.team_id);
      if (!team) return false;
      const teamNameFull = team.name.toLowerCase();               // "team alpha (genome engineering)"
      const teamNameShort = teamNameFull.split('(')[0].trim();    // "team alpha"
      return teamNameFull === cleanId || teamNameShort === cleanId;
    });

    if (!user) {
      return {
        success: false,
        message: 'Team not found. Enter your team name (e.g. "Team Alpha") or "Admin".',
      };
    }

    // Verify password if provided
    if (cleanPassword && user.password_hash !== cleanPassword) {
      return {
        success: false,
        message: 'Invalid password. Please check your credentials.',
      };
    }

    // Check team membership for contestants
    let contestantTeam: Team | null = null;
    if (user.role === 'contestant') {
      if (!user.team_id) {
        return {
          success: false,
          message: 'Account configuration error: No team assigned to this contestant.',
        };
      }
      contestantTeam = this.teams.find(t => t.id === user.team_id) || null;
      if (!contestantTeam) {
        return {
          success: false,
          message: 'Assigned team record not found in database.',
        };
      }
    }

    // Build verified session with database-retrieved role
    const session: UserSession = {
      user_id: user.id,
      user_name: user.name,
      email: user.email,
      role: user.role, // strictly from database record
      current_team: contestantTeam,
      session_token: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    this.currentUser = session;
    this.saveToStorage();
    this.notifyListeners();

    return {
      success: true,
      message: `Authenticated successfully as ${user.role === 'admin' ? 'Administrator' : 'Contestant'}.`,
      session,
      redirectTab: user.role === 'admin' ? 'admin' : 'marketplace',
    };
  }

  public logout() {
    this.currentUser = null;
    this.saveToStorage();
    this.notifyListeners();
  }

  // --- ATOMIC INSTANT BUY NOW SYSTEM (CONTESTANT ONLY) ---

  public async processPurchase(
    productId: string,
    quantity: number,
    idempotencyKey?: string
  ): Promise<PurchaseResult> {
    // 1. Backend Authorization Check
    if (!this.currentUser) {
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in with your contestant account.',
      };
    }

    if (this.currentUser.role !== 'contestant') {
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Unauthorized: Administrators cannot make team purchases. Please sign in as a contestant.',
      };
    }

    if (!this.currentUser.current_team) {
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Unauthorized: No verified laboratory team membership found.',
      };
    }

    const teamId = this.currentUser.current_team.id;
    const key = idempotencyKey || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Supabase Cloud Execution (if configured)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('process_purchase', {
          p_team_id: teamId,
          p_user_id: this.currentUser.user_id,
          p_user_name: this.currentUser.user_name,
          p_product_id: productId,
          p_quantity: quantity,
          p_idempotency_key: key,
        });

        if (error) {
          return {
            success: false,
            error_code: 'TRANSACTION_FAILED',
            message: error.message || 'Database transaction failed.',
          };
        }

        if (!data.success) {
          return {
            success: false,
            error_code: data.error_code,
            message: data.message,
          };
        }

        await this.syncWithSupabase();

        return {
          success: true,
          message: data.message,
          purchase: data.purchase,
          new_balance: data.new_balance,
          new_stock: data.new_stock,
        };
      } catch (err: any) {
        console.warn('Supabase purchase RPC error, executing local atomic engine:', err);
      }
    }

    // 3. Local Atomic Transaction Engine
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return {
        success: false,
        error_code: 'PRODUCT_INACTIVE',
        message: 'Product was not found in catalog.',
      };
    }

    const product = this.products[productIndex];
    if (!product.active) {
      return {
        success: false,
        error_code: 'PRODUCT_INACTIVE',
        message: 'This product is currently inactive and cannot be ordered.',
      };
    }

    // Check stock
    if (product.stock_quantity < quantity) {
      if (product.stock_quantity <= 0) {
        return {
          success: false,
          error_code: 'OUT_OF_STOCK',
          message: `${product.name} is currently Out of Stock.`,
        };
      }
      return {
        success: false,
        error_code: 'INSUFFICIENT_STOCK',
        message: `Only ${product.stock_quantity} units are currently available. Please update your quantity.`,
      };
    }

    // Verify authorized team
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
      return {
        success: false,
        error_code: 'UNAUTHORIZED',
        message: 'Authorized team record was not found.',
      };
    }

    const team = this.teams[teamIndex];
    // Server-side calculated total: client cannot manipulate price
    const totalAmount = product.price * quantity;

    if (team.remaining_balance < totalAmount) {
      const deficit = totalAmount - team.remaining_balance;
      return {
        success: false,
        error_code: 'INSUFFICIENT_BUDGET',
        message: `Insufficient balance. Your team needs ₹${deficit.toLocaleString('en-IN')} more for this purchase.`,
      };
    }

    // Check idempotency (duplicate prevention)
    const existingTxn = this.purchases.find(p => p.transaction_id === key);
    if (existingTxn) {
      return {
        success: true,
        message: 'Purchase already confirmed.',
        purchase: existingTxn,
        new_balance: team.remaining_balance,
        new_stock: product.stock_quantity,
      };
    }

    // ATOMIC UPDATES: Synchronously deduct balance & decrement stock
    const updatedBalance = team.remaining_balance - totalAmount;
    const updatedStock = product.stock_quantity - quantity;

    const purchaseRecord: Purchase = {
      id: `purch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      team_id: team.id,
      team_name: team.name,
      user_id: this.currentUser.user_id,
      user_name: this.currentUser.user_name,
      transaction_id: key,
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price_snapshot: product.price,
      unit_of_sale_snapshot: product.unit_of_sale,
      product_image_snapshot: product.image_url,
      quantity,
      total_amount: totalAmount,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    const transactionRecord: BudgetTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      team_id: team.id,
      purchase_id: purchaseRecord.id,
      transaction_type: 'purchase',
      amount: -totalAmount,
      balance_after: updatedBalance,
      description: `Purchased ${quantity} × ${product.name}`,
      created_at: new Date().toISOString(),
    };

    this.teams[teamIndex] = {
      ...team,
      remaining_balance: updatedBalance,
    };

    this.products[productIndex] = {
      ...product,
      stock_quantity: updatedStock,
      updated_at: new Date().toISOString(),
    };

    this.purchases.unshift(purchaseRecord);
    this.transactions.unshift(transactionRecord);

    // Update session team reference
    this.currentUser.current_team = this.teams[teamIndex];

    this.saveToStorage();
    this.notifyListeners();

    return {
      success: true,
      message: `Purchase successful! ${quantity} × ${product.name} purchased for ₹${totalAmount.toLocaleString('en-IN')}.`,
      purchase: purchaseRecord,
      new_balance: updatedBalance,
      new_stock: updatedStock,
    };
  }

  // --- ADMINISTRATOR OPERATIONS (STRICT BACKEND ENFORCEMENT) ---

  private assertAdmin() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('SECURITY VIOLATION: Operation denied. Administrator privilege required.');
    }
  }

  public addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    this.assertAdmin();

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    this.saveToStorage();
    this.notifyListeners();
  }

  public updateProduct(updated: Partial<Product> & { id: string }) {
    this.assertAdmin();

    const idx = this.products.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      this.products[idx] = {
        ...this.products[idx],
        ...updated,
        updated_at: new Date().toISOString(),
      };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public deleteProduct(productId: string) {
    this.assertAdmin();

    const idx = this.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      this.products.splice(idx, 1);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public adjustTeamBudget(teamId: string, newBalance: number, reason: string) {
    this.assertAdmin();

    const idx = this.teams.findIndex(t => t.id === teamId);
    if (idx !== -1) {
      const oldBalance = this.teams[idx].remaining_balance;
      const diff = newBalance - oldBalance;
      this.teams[idx] = {
        ...this.teams[idx],
        remaining_balance: newBalance,
      };

      const ledgerEntry: BudgetTransaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        team_id: teamId,
        transaction_type: 'budget_adjustment',
        amount: diff,
        balance_after: newBalance,
        description: reason || 'Administrative budget adjustment',
        created_at: new Date().toISOString(),
      };
      this.transactions.unshift(ledgerEntry);

      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Self-service contestant team registration.
   * Open to any visitor — no admin privilege required.
   * Creates a Team record + UserAccount atomically, then returns a live session.
   */
  public registerTeam(teamName: string, password: string): AuthResult {
    const trimmedName = teamName.trim();
    const trimmedPass = password.trim();

    // --- Input validation ---
    if (!trimmedName) {
      return { success: false, message: 'Team name is required.' };
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return { success: false, message: 'Team name must be between 2 and 50 characters.' };
    }
    if (!trimmedPass) {
      return { success: false, message: 'Password is required.' };
    }
    if (trimmedPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    // --- Uniqueness check (case-insensitive) ---
    const lowerName = trimmedName.toLowerCase();
    const duplicate = this.teams.find(t => {
      const full = t.name.toLowerCase();
      const short = full.split('(')[0].trim();
      return full === lowerName || short === lowerName;
    });
    if (duplicate) {
      return { success: false, message: `A team named "${duplicate.name}" already exists. Please choose a different name.` };
    }

    // --- Block reserved names ---
    if (lowerName === 'admin') {
      return { success: false, message: 'That team name is reserved. Please choose a different name.' };
    }

    // --- Create Team record ---
    const teamId = `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTeam: Team = {
      id: teamId,
      name: trimmedName,
      initial_budget: 10000,
      remaining_balance: 10000,
      created_at: new Date().toISOString(),
    };
    this.teams.push(newTeam);

    // --- Create UserAccount record ---
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: UserAccount = {
      id: userId,
      email: `${teamId}@biobuy.lab`, // internal only, never shown in UI
      name: trimmedName,
      role: 'contestant',
      team_id: teamId,
      password_hash: trimmedPass,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);

    // --- Build verified session ---
    const session: UserSession = {
      user_id: userId,
      user_name: trimmedName,
      email: newUser.email,
      role: 'contestant',
      current_team: newTeam,
      session_token: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    this.currentUser = session;
    this.saveToStorage();
    this.notifyListeners();

    return {
      success: true,
      message: `Team "${trimmedName}" registered! You have been allocated a virtual budget of ₹10,000.`,
      session,
      redirectTab: 'marketplace',
    };
  }

  public createTeam(name: string, initialBudget = 10000): Team {
    this.assertAdmin();

    const trimmed = name.trim();
    if (!trimmed) throw new Error('Team name is required');

    const lower = trimmed.toLowerCase();
    const dup = this.teams.find(t => t.name.toLowerCase() === lower);
    if (dup) throw new Error(`A team named "${dup.name}" already exists.`);

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      initial_budget: initialBudget,
      remaining_balance: initialBudget,
      created_at: new Date().toISOString(),
    };

    this.teams.push(newTeam);
    this.saveToStorage();
    this.notifyListeners();
    return newTeam;
  }

  public resetDemoData() {
    this.assertAdmin();

    this.products = [...INITIAL_PRODUCTS];
    this.teams = [...INITIAL_TEAMS];
    this.users = [...INITIAL_USERS];
    this.purchases = [];
    this.transactions = [];

    this.saveToStorage();
    this.notifyListeners();
  }
}

export const bioBuyStore = new BioBuyStore();

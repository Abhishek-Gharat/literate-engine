/**
 * Demo Project Data Models
 * Pre-computed analyzer output for the demo experience
 */

export const DEMO_PROJECT_SUMMARY = {
  id: 'demo-project',
  name: 'ShopApp Demo',
  description: 'E-commerce React demo with shared state and multi-page flow',
  entryPoint: 'src/main.jsx',
  totalFiles: 15,
  totalComponents: 6,
  totalPages: 4,
  totalHooks: 3,
  totalContexts: 2,
  totalUtils: 0,
  totalConfigs: 1,
  createdAt: new Date().toISOString()
}

export const DEMO_AI_SUMMARY = {
  title: 'Project Overview',
  description: 'This is a React e-commerce application built with Vite and React Router.',
  keyPoints: [
    'Main entry point: main.jsx with React 18 root API',
    'Shared state is managed through CartContext and AuthContext',
    'Main user flow: Home → Product → Cart → Checkout',
    'Custom hooks handle data fetching (useProducts) and cart state (useCart)'
  ],
  architecturePattern: 'Container/Presentational with Context for global state'
}

export const DEMO_FINDINGS = [
  {
    id: 'finding-1',
    type: 'positive',
    title: 'No circular dependencies detected',
    description: 'All imports form a clean DAG. No circular references between modules.',
    impact: 'high',
    category: 'architecture'
  },
  {
    id: 'finding-2',
    type: 'info',
    title: 'Checkout page has the highest dependency count',
    description: 'Checkout.jsx depends on 4 components and 2 hooks, making it the most complex page.',
    impact: 'medium',
    category: 'complexity'
  },
  {
    id: 'finding-3',
    type: 'info',
    title: 'CartContext is central to purchase flow',
    description: 'Used by 5 components including Cart, Checkout, ProductCard, and CartDrawer.',
    impact: 'high',
    category: 'data-flow'
  },
  {
    id: 'finding-4',
    type: 'suggestion',
    title: 'Navbar is the most connected shared component',
    description: 'Imported by all 4 pages. Consider lazy-loading if bundle size becomes an issue.',
    impact: 'low',
    category: 'performance'
  },
  {
    id: 'finding-5',
    type: 'positive',
    title: 'Clean separation between UI and state logic',
    description: 'Custom hooks encapsulate cart and product logic, making components easier to test.',
    impact: 'medium',
    category: 'maintainability'
  }
]

export const DEMO_ARCHITECTURE_SNAPSHOT = {
  entryPoints: [
    { path: 'src/main.jsx', description: 'Application bootstrap' }
  ],
  mostConnectedComponent: {
    name: 'CartContext',
    connectionCount: 7,
    description: 'Central state management for cart'
  },
  dependencyDepth: {
    max: 4,
    average: 2.3
  },
  fileCategories: [
    { category: 'Pages', count: 4, percentage: 27 },
    { category: 'Components', count: 6, percentage: 40 },
    { category: 'Hooks', count: 3, percentage: 20 },
    { category: 'Contexts', count: 2, percentage: 13 }
  ]
}

export const DEMO_NODES = [
  // Entry point
  {
    id: 'main',
    label: 'main.jsx',
    nodeType: 'root',
    filePath: 'src/main.jsx',
    imports: ['App', 'CartProvider', 'AuthProvider'],
    importedBy: [],
    isEntryPoint: true
  },
  // Pages
  {
    id: 'home',
    label: 'Home.jsx',
    nodeType: 'page',
    filePath: 'src/pages/Home.jsx',
    imports: ['useProducts', 'ProductCard', 'SearchBar'],
    importedBy: ['App'],
    isEntryPoint: false
  },
  {
    id: 'product',
    label: 'Product.jsx',
    nodeType: 'page',
    filePath: 'src/pages/Product.jsx',
    imports: ['useProducts', 'useCart'],
    importedBy: ['App'],
    isEntryPoint: false
  },
  {
    id: 'cart',
    label: 'Cart.jsx',
    nodeType: 'page',
    filePath: 'src/pages/Cart.jsx',
    imports: ['useCart'],
    importedBy: ['App'],
    isEntryPoint: false
  },
  {
    id: 'checkout',
    label: 'Checkout.jsx',
    nodeType: 'page',
    filePath: 'src/pages/Checkout.jsx',
    imports: ['CheckoutForm', 'useCart'],
    importedBy: ['App'],
    isEntryPoint: false
  },
  // Components
  {
    id: 'navbar',
    label: 'Navbar.jsx',
    nodeType: 'component',
    filePath: 'src/components/Navbar.jsx',
    imports: ['useCart', 'useAuth'],
    importedBy: ['Home', 'Product', 'Cart', 'Checkout'],
    isEntryPoint: false
  },
  {
    id: 'productcard',
    label: 'ProductCard.jsx',
    nodeType: 'component',
    filePath: 'src/components/ProductCard.jsx',
    imports: ['useCart'],
    importedBy: ['Home'],
    isEntryPoint: false
  },
  {
    id: 'searchbar',
    label: 'SearchBar.jsx',
    nodeType: 'component',
    filePath: 'src/components/SearchBar.jsx',
    imports: ['useSearch'],
    importedBy: ['Home'],
    isEntryPoint: false
  },
  {
    id: 'cartdrawer',
    label: 'CartDrawer.jsx',
    nodeType: 'component',
    filePath: 'src/components/CartDrawer.jsx',
    imports: ['useCart'],
    importedBy: ['App'],
    isEntryPoint: false
  },
  {
    id: 'checkoutform',
    label: 'CheckoutForm.jsx',
    nodeType: 'component',
    filePath: 'src/components/CheckoutForm.jsx',
    imports: ['useCart'],
    importedBy: ['Checkout'],
    isEntryPoint: false
  },
  // Hooks
  {
    id: 'useproducts',
    label: 'useProducts.js',
    nodeType: 'hook',
    filePath: 'src/hooks/useProducts.js',
    imports: [],
    importedBy: ['Home', 'Product'],
    isEntryPoint: false
  },
  {
    id: 'usecart',
    label: 'useCart.js',
    nodeType: 'hook',
    filePath: 'src/hooks/useCart.js',
    imports: [],
    importedBy: ['Cart', 'Checkout', 'ProductCard', 'CheckoutForm', 'CartDrawer', 'Navbar'],
    isEntryPoint: false
  },
  {
    id: 'usesearch',
    label: 'useSearch.js',
    nodeType: 'hook',
    filePath: 'src/hooks/useSearch.js',
    imports: [],
    importedBy: ['SearchBar'],
    isEntryPoint: false
  },
  // Contexts
  {
    id: 'cartcontext',
    label: 'CartContext.jsx',
    nodeType: 'index',
    filePath: 'src/context/CartContext.jsx',
    imports: [],
    importedBy: ['main', 'useCart'],
    isEntryPoint: false
  },
  {
    id: 'authcontext',
    label: 'AuthContext.jsx',
    nodeType: 'index',
    filePath: 'src/context/AuthContext.jsx',
    imports: [],
    importedBy: ['main', 'Navbar'],
    isEntryPoint: false
  },
  // Config
  {
    id: 'app',
    label: 'App.jsx',
    nodeType: 'component',
    filePath: 'src/App.jsx',
    imports: ['Navbar', 'CartDrawer', 'Home', 'Product', 'Cart', 'Checkout'],
    importedBy: ['main'],
    isEntryPoint: false
  }
]

export const DEMO_EDGES = [
  // From main
  { id: 'e1', source: 'main', target: 'app' },
  { id: 'e2', source: 'main', target: 'cartcontext' },
  { id: 'e3', source: 'main', target: 'authcontext' },
  
  // From App
  { id: 'e4', source: 'app', target: 'navbar' },
  { id: 'e5', source: 'app', target: 'cartdrawer' },
  { id: 'e6', source: 'app', target: 'home' },
  { id: 'e7', source: 'app', target: 'product' },
  { id: 'e8', source: 'app', target: 'cart' },
  { id: 'e9', source: 'app', target: 'checkout' },
  
  // From Home
  { id: 'e10', source: 'home', target: 'useproducts' },
  { id: 'e11', source: 'home', target: 'productcard' },
  { id: 'e12', source: 'home', target: 'searchbar' },
  
  // From Product
  { id: 'e13', source: 'product', target: 'useproducts' },
  { id: 'e14', source: 'product', target: 'usecart' },
  
  // From Cart
  { id: 'e15', source: 'cart', target: 'usecart' },
  
  // From Checkout
  { id: 'e16', source: 'checkout', target: 'checkoutform' },
  { id: 'e17', source: 'checkout', target: 'usecart' },
  
  // From Components
  { id: 'e18', source: 'productcard', target: 'usecart' },
  { id: 'e19', source: 'searchbar', target: 'usesearch' },
  { id: 'e20', source: 'cartdrawer', target: 'usecart' },
  { id: 'e21', source: 'checkoutform', target: 'usecart' },
  { id: 'e22', source: 'navbar', target: 'usecart' },
  { id: 'e23', source: 'navbar', target: 'authcontext' },
  
  // From hooks
  { id: 'e24', source: 'usecart', target: 'cartcontext' }
]

export const DEMO_ISSUES = []

export const DEMO_STATS = {
  totalFiles: 15,
  totalComponents: 6,
  totalPages: 4,
  totalHooks: 3,
  totalContexts: 2,
  totalConfigs: 1,
  totalEdges: 24,
  cyclesFound: 0,
  maxDepth: 4,
  avgDepth: 2.3
}

export const DEMO_ANALYSIS_RESULT = {
  nodes: DEMO_NODES,
  edges: DEMO_EDGES,
  depMap: buildDepMap(DEMO_NODES, DEMO_EDGES),
  stats: DEMO_STATS,
  cyclicEdges: [],
  unresolvedImports: [],
  analysisErrors: []
}

function buildDepMap(nodes, edges) {
  const map = new Map()
  
  nodes.forEach(node => {
    const imports = edges
      .filter(e => e.source === node.id)
      .map(e => nodes.find(n => n.id === e.target))
      .filter(Boolean)
    
    const importedBy = edges
      .filter(e => e.target === node.id)
      .map(e => nodes.find(n => n.id === e.source))
      .filter(Boolean)
    
    map.set(node.id, {
      ...node,
      imports,
      importedBy
    })
  })
  
  return map
}

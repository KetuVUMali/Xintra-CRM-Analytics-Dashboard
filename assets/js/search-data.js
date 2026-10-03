/*!
 * NimbusDesk — search-data.js
 * Local dummy dataset for the global search (Ctrl/Cmd+K). No network calls.
 * Paths are root-relative; main.js prepends window.NIMBUS_BASE at render time.
 */
window.NIMBUS_SEARCH_INDEX = [
  { group: "Pages", title: "Sales Dashboard", subtitle: "Dashboards / Sales", icon: "bi-graph-up-arrow", url: "pages/sales.html" },
  { group: "Pages", title: "Analytics Dashboard", subtitle: "Dashboards / Analytics", icon: "bi-bar-chart-line", url: "pages/analytics.html" },
  { group: "Pages", title: "Ecommerce Dashboard", subtitle: "Dashboards / Ecommerce", icon: "bi-cart3", url: "pages/ecommerce.html" },
  { group: "Pages", title: "CRM Dashboard", subtitle: "Dashboards / CRM", icon: "bi-person-lines-fill", url: "pages/crm.html" },
  { group: "Pages", title: "HRM Dashboard", subtitle: "Dashboards / HRM", icon: "bi-people", url: "pages/hrm.html" },
  { group: "Pages", title: "Crypto Dashboard", subtitle: "Dashboards / Crypto", icon: "bi-currency-bitcoin", url: "pages/crypto.html" },
  { group: "Pages", title: "Medical Dashboard", subtitle: "Dashboards / Medical", icon: "bi-heart-pulse", url: "pages/medical.html" },
  { group: "Pages", title: "Projects Dashboard", subtitle: "Dashboards / Projects", icon: "bi-kanban", url: "pages/projects.html" },
  { group: "Pages", title: "POS System", subtitle: "Dashboards / POS", icon: "bi-shop", url: "pages/pos-system.html" },
  { group: "Pages", title: "Chat", subtitle: "Applications / Chat", icon: "bi-chat-dots", url: "pages/chat.html" },
  { group: "Pages", title: "Mail", subtitle: "Applications / Mail", icon: "bi-envelope", url: "pages/mail.html" },
  { group: "Pages", title: "Team", subtitle: "Applications / Team", icon: "bi-people-fill", url: "pages/team.html" },
  { group: "Pages", title: "Pricing", subtitle: "Applications / Pricing", icon: "bi-tag", url: "pages/pricing.html" },
  { group: "Pages", title: "Products", subtitle: "Ecommerce / Products", icon: "bi-box-seam", url: "pages/ecommerce/products.html" },
  { group: "Pages", title: "Orders", subtitle: "Ecommerce / Orders", icon: "bi-receipt", url: "pages/ecommerce/orders.html" },
  { group: "Pages", title: "Settings", subtitle: "System / Settings", icon: "bi-gear", url: "pages/settings.html" },

  { group: "Users", title: "Arlene Rodriguez", subtitle: "Product Designer · UI Team", icon: "bi-person", url: "pages/team.html" },
  { group: "Users", title: "Jason Doe", subtitle: "Frontend Engineer", icon: "bi-person", url: "pages/team.html" },
  { group: "Users", title: "Sara Khan", subtitle: "HR Manager", icon: "bi-person", url: "pages/hrm.html" },
  { group: "Users", title: "Marco Polo", subtitle: "Sales Executive", icon: "bi-person", url: "pages/crm.html" },
  { group: "Users", title: "Lena Trent", subtitle: "Support Specialist", icon: "bi-person", url: "pages/team.html" },

  { group: "Products", title: "Aria Wireless Headphones", subtitle: "Electronics · In stock", icon: "bi-earbuds", url: "pages/ecommerce/product-details.html" },
  { group: "Products", title: "Nimbus Running Shoes", subtitle: "Footwear · In stock", icon: "bi-bag", url: "pages/ecommerce/product-details.html" },
  { group: "Products", title: "Lumen Desk Lamp", subtitle: "Home · Low stock", icon: "bi-lightbulb", url: "pages/ecommerce/product-details.html" },
  { group: "Products", title: "Pulse Smart Watch", subtitle: "Wearables · In stock", icon: "bi-smartwatch", url: "pages/ecommerce/product-details.html" },

  { group: "Projects", title: "Mobile App Redesign", subtitle: "Projects · 68% complete", icon: "bi-kanban", url: "pages/projects.html" },
  { group: "Projects", title: "Marketing Website Revamp", subtitle: "Projects · 42% complete", icon: "bi-kanban", url: "pages/projects.html" },
  { group: "Projects", title: "API Gateway Migration", subtitle: "Projects · 90% complete", icon: "bi-kanban", url: "pages/projects.html" },

  { group: "Documents", title: "Q2 Revenue Report.pdf", subtitle: "Modified 2 days ago", icon: "bi-file-earmark-pdf", url: "pages/file-manager.html" },
  { group: "Documents", title: "Brand Guidelines.fig", subtitle: "Modified 5 days ago", icon: "bi-file-earmark-richtext", url: "pages/file-manager.html" },
  { group: "Documents", title: "Employee Handbook.docx", subtitle: "Modified 1 week ago", icon: "bi-file-earmark-word", url: "pages/file-manager.html" }
];

/**
 * Navigation Manager Panel
 * Pure frontend implementation with localStorage persistence
 */

// ==================== State Management ====================
const AppState = {
    currentBoard: 'default',
    currentTab: null,
    selectedItem: null,
    draggedItem: null,
    draggedTab: null,
    theme: 'default',
    data: {
        boards: {
            default: {
                name: '默认看板',
                tabs: [],
                items: {}
            }
        }
    },
    history: []
};

// ==================== Storage Keys ====================
const STORAGE_KEY = 'navManager_data';
const THEME_KEY = 'navManager_theme';
const HISTORY_KEY = 'navManager_history';
const BG_KEY = 'navManager_background';

// ==================== Preset Icons ====================
const PRESET_ICONS = {
    '常用': ['🔗', '📎', '📌', '📍', '📎', '✂️', '🗑️', '🔍', '🔎', '🔒', '🔓', '🔐', '🔑', '🗝️', '⚙️', '🔧', '🔨', '🛠️', '⛏️', '🪛', '🔩', '🔧', '🧰', '🧲', '🧪'],
    '开发': ['💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '📀', '🧮', '📱', '☎️', '📞', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳'],
    '文档': ['📄', '📃', '📑', '📊', '📈', '📉', '📋', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐'],
    '媒体': ['🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🎸', '🎻', '🪕', '🥁', '🎷', '🎺', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹'],
    '社交': ['💬', '💭', '🗯️', '👁️‍🗨️', '💌', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📪'],
    '办公': ['📊', '📈', '📉', '📋', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗑️', '🔒', '🔓'],
    '学习': ['📚', '📖', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '📛', '📜', '📃', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼'],
    '生活': ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺'],
    '自然': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🦞'],
    '符号': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯']
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadTheme();
    loadBackground();
    loadHistory();
    initEventListeners();
    ensureCurrentTab();
    render();
    showToast('导航管理面板已加载');
});

// ==================== Data Management ====================
function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            AppState.data = JSON.parse(saved);
        } else {
            // Initialize with sample data
            initSampleData();
        }
    } catch (e) {
        console.error('Failed to load data:', e);
        initSampleData();
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.data));
    } catch (e) {
        console.error('Failed to save data:', e);
        showToast('保存失败，存储空间可能已满', 'error');
    }
}

function initSampleData() {
    const defaultTabs = [
        { id: 'tab_1', name: '常用工具', icon: '🔧' },
        { id: 'tab_2', name: '开发资源', icon: '💻' },
        { id: 'tab_3', name: '学习网站', icon: '📚' }
    ];

    const defaultItems = {
        'tab_1': [
            { id: 'item_1', name: 'Google', url: 'https://google.com', icon: '🔍', priority: 'high', category: '搜索引擎' },
            { id: 'item_2', name: 'GitHub', url: 'https://github.com', icon: '🐙', priority: 'high', category: '代码托管' },
            { id: 'item_3', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '❓', priority: 'medium', category: '问答社区' }
        ],
        'tab_2': [
            { id: 'item_4', name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖', priority: 'high', category: '文档' },
            { id: 'item_5', name: 'Can I Use', url: 'https://caniuse.com', icon: '✅', priority: 'medium', category: '工具' }
        ],
        'tab_3': [
            { id: 'item_6', name: 'Coursera', url: 'https://coursera.org', icon: '🎓', priority: 'medium', category: '在线课程' },
            { id: 'item_7', name: 'YouTube', url: 'https://youtube.com', icon: '📺', priority: 'low', category: '视频' }
        ]
    };

    AppState.data.boards.default.tabs = defaultTabs;
    AppState.data.boards.default.items = defaultItems;
    AppState.currentTab = 'tab_1';
    saveData();
}

function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        AppState.theme = saved;
        document.documentElement.setAttribute('data-theme', saved);
    }
}

function saveTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}

function loadBackground() {
    try {
        const saved = localStorage.getItem(BG_KEY);
        if (saved) {
            const bgData = JSON.parse(saved);
            applyBackground(bgData);
        }
    } catch (e) {
        console.error('Failed to load background:', e);
    }
}

function saveBackground(bgData) {
    try {
        localStorage.setItem(BG_KEY, JSON.stringify(bgData));
    } catch (e) {
        console.error('Failed to save background:', e);
        showToast('背景保存失败', 'error');
    }
}

function applyBackground(bgData) {
    const body = document.body;

    // Remove existing background classes
    body.classList.remove('has-custom-bg', 'bg-overlay-none', 'bg-overlay-blur', 'bg-overlay-dark');
    body.style.backgroundImage = '';

    if (!bgData || bgData.type === 'none') {
        return;
    }

    if (bgData.type === 'custom' && bgData.image) {
        body.classList.add('has-custom-bg');
        body.style.backgroundImage = `url(${bgData.image})`;

        // Only apply overlay when there's a custom background
        const overlay = bgData.overlay || 'none';
        if (overlay !== 'none') {
            body.classList.add(`bg-overlay-${overlay}`);
        }
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            AppState.history = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

function ensureCurrentTab() {
    const board = AppState.data.boards[AppState.currentBoard];
    // If no current tab or current tab doesn't exist in this board, select the first tab
    if (!AppState.currentTab || !board.tabs.find(t => t.id === AppState.currentTab)) {
        if (board.tabs.length > 0) {
            AppState.currentTab = board.tabs[0].id;
        } else {
            AppState.currentTab = null;
        }
    }
}

function saveHistory() {
    try {
        // Keep only last 100 entries
        if (AppState.history.length > 100) {
            AppState.history = AppState.history.slice(-100);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(AppState.history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function addHistory(action, details = '') {
    const entry = {
        time: new Date().toISOString(),
        action,
        details,
        board: AppState.currentBoard
    };
    AppState.history.push(entry);
    saveHistory();
}

// ==================== Event Listeners ====================
function initEventListeners() {
    // Board selector
    document.getElementById('boardSelect').addEventListener('change', (e) => {
        switchBoard(e.target.value);
    });

    // Add board
    document.getElementById('addBoardBtn').addEventListener('click', () => {
        openModal('boardModal');
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleThemePanel();
    });

    // Background toggle
    document.getElementById('bgToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBgPanel();
    });

    // Background file upload
    document.getElementById('bgFile').addEventListener('change', handleBgFileSelect);

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);

    // History
    document.getElementById('historyBtn').addEventListener('click', showHistory);

    // Add tab
    document.getElementById('addTabBtn').addEventListener('click', () => {
        openTabModal();
    });

    // Forms
    document.getElementById('itemForm').addEventListener('submit', handleItemSubmit);
    document.getElementById('tabForm').addEventListener('submit', handleTabSubmit);
    document.getElementById('boardForm').addEventListener('submit', handleBoardSubmit);
    document.getElementById('deleteTabBtn').addEventListener('click', deleteCurrentTab);

    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            saveTheme(theme);
            toggleThemePanel();
            showToast(`已切换到${option.querySelector('span').textContent}主题`);
            addHistory('切换主题', theme);
        });
    });

    // Context menu
    document.addEventListener('click', hideContextMenu);
    document.querySelectorAll('.context-menu .menu-item').forEach(item => {
        item.addEventListener('click', handleContextMenuAction);
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Close theme panel on outside click
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('themePanel');
        const toggle = document.getElementById('themeToggle');
        if (!panel.contains(e.target) && e.target !== toggle) {
            panel.classList.remove('active');
        }
    });

    // Close background panel on outside click
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('bgPanel');
        const toggle = document.getElementById('bgToggle');
        if (!panel.contains(e.target) && e.target !== toggle) {
            panel.classList.remove('active');
        }
    });

    // Icon file inputs
    document.getElementById('itemIconFile').addEventListener('change', (e) => handleIconFileSelect(e, 'itemIcon', 'itemIconPreview'));
    document.getElementById('tabIconFile').addEventListener('change', (e) => handleIconFileSelect(e, 'tabIcon', 'tabIconPreview'));
}

// ==================== Rendering ====================
function render() {
    renderBoardSelector();
    renderTabs();
    renderNavItems();
    updateStatus();
}

function renderBoardSelector() {
    const select = document.getElementById('boardSelect');
    const currentValue = select.value;
    select.innerHTML = '';

    Object.entries(AppState.data.boards).forEach(([id, board]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = board.name;
        select.appendChild(option);
    });

    select.value = AppState.currentBoard;
}

function renderTabs() {
    const board = AppState.data.boards[AppState.currentBoard];
    const tabList = document.getElementById('tabList');
    tabList.innerHTML = '';

    board.tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab-item ${tab.id === AppState.currentTab ? 'active' : ''}`;
        tabEl.dataset.tabId = tab.id;
        tabEl.draggable = true;

        const items = board.items[tab.id] || [];
        const count = items.length;

        // Determine icon content - if it's a data URL or http URL, use img tag
        let iconContent;
        if (tab.icon && (tab.icon.startsWith('data:') || tab.icon.match(/^https?:\/\//))) {
            iconContent = `<img src="${tab.icon}" alt="" style="width: 1.25rem; height: 1.25rem; object-fit: contain; border-radius: 2px;">`;
        } else {
            iconContent = tab.icon || '📁';
        }

        tabEl.innerHTML = `
            <span class="tab-icon">${iconContent}</span>
            <span class="tab-name">${escapeHtml(tab.name)}</span>
            <span class="tab-count">${count}</span>
            <div class="tab-actions">
                <button class="tab-action-btn" data-action="edit" title="编辑">✏️</button>
                <button class="tab-action-btn" data-action="delete" title="删除">🗑️</button>
            </div>
        `;

        // Tab click
        tabEl.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-actions')) {
                switchTab(tab.id);
            }
        });

        // Tab actions
        tabEl.querySelectorAll('.tab-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'edit') {
                    openTabModal(tab.id);
                } else if (action === 'delete') {
                    if (confirm(`确定要删除标签"${tab.name}"吗？其中的导航项也会被删除。`)) {
                        deleteTab(tab.id);
                    }
                }
            });
        });

        // Tab drag events
        tabEl.addEventListener('dragstart', (e) => {
            AppState.draggedTab = tab;
            tabEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        tabEl.addEventListener('dragend', () => {
            tabEl.classList.remove('dragging');
            AppState.draggedTab = null;
        });

        tabEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (AppState.draggedTab && AppState.draggedTab.id !== tab.id) {
                const rect = tabEl.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;
                if (e.clientX < midX) {
                    tabEl.parentNode.insertBefore(AppState.draggedTab.element || tabEl, tabEl);
                } else {
                    tabEl.parentNode.insertBefore(AppState.draggedTab.element || tabEl, tabEl.nextSibling);
                }
            }
        });

        tabEl.addEventListener('drop', (e) => {
            e.preventDefault();
            if (AppState.draggedTab && AppState.draggedTab.id !== tab.id) {
                reorderTabs(AppState.draggedTab.id, tab.id);
            }
        });

        tabList.appendChild(tabEl);
    });
}

function renderNavItems() {
    const board = AppState.data.boards[AppState.currentBoard];
    const container = document.getElementById('navContainer');
    container.innerHTML = '';

    if (!AppState.currentTab) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <div class="empty-state-text">请选择一个标签</div>
            </div>
        `;
        return;
    }

    const items = board.items[AppState.currentTab] || [];

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">暂无导航项</div>
                <button class="btn-primary" onclick="openItemModal()">添加导航项</button>
            </div>
        `;
        return;
    }

    // Group items by category
    const grouped = groupByCategory(items);

    Object.entries(grouped).forEach(([category, categoryItems]) => {
        const section = document.createElement('div');
        section.className = 'category-section';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <div class="category-title">
                <span>${category === 'uncategorized' ? '📁 未分类' : `📂 ${escapeHtml(category)}`}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">(${categoryItems.length})</span>
            </div>
            <div class="category-actions">
                <button class="btn-primary btn-small" onclick="openItemModal(null, '${category}')">+ 添加</button>
            </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'nav-grid';

        categoryItems.forEach(item => {
            const itemEl = createNavItemElement(item);
            grid.appendChild(itemEl);
        });

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);
    });
}

function createNavItemElement(item) {
    const el = document.createElement('a');
    el.className = `nav-item priority-${item.priority} ${AppState.selectedItem === item.id ? 'selected' : ''}`;
    el.href = item.url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.draggable = true;
    el.dataset.itemId = item.id;

    // Determine icon content - if it's a data URL or http URL, use img tag
    let iconContent;
    if (item.icon && (item.icon.startsWith('data:') || item.icon.match(/^https?:\/\//))) {
        iconContent = `<img src="${item.icon}" alt="" style="width: 100%; height: 100%; object-fit: contain;">`;
    } else {
        iconContent = item.icon || '🔗';
    }

    el.innerHTML = `
        <div class="nav-icon">${iconContent}</div>
        <div class="nav-info">
            <div class="nav-name">${escapeHtml(item.name)}</div>
            <div class="nav-url">${escapeHtml(new URL(item.url).hostname)}</div>
        </div>
        <div class="nav-priority ${item.priority}"></div>
    `;

    // Click to select
    el.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectItem(item.id);
        }
    });

    // Context menu
    el.addEventListener('contextmenu', (e) => {
        showContextMenu(e, item, el);
    });

    // Drag events
    el.addEventListener('dragstart', (e) => {
        AppState.draggedItem = item;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);

        // Create ghost
        const ghost = document.getElementById('dragGhost');
        ghost.textContent = item.name;
        ghost.classList.add('active');
    });

    el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        AppState.draggedItem = null;
        document.getElementById('dragGhost').classList.remove('active');
    });

    el.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (AppState.draggedItem && AppState.draggedItem.id !== item.id) {
            el.classList.add('drag-over');
        }
    });

    el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over');
    });

    el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        if (AppState.draggedItem && AppState.draggedItem.id !== item.id) {
            reorderItems(AppState.draggedItem.id, item.id);
        }
    });

    return el;
}

// ==================== Actions ====================
function switchBoard(boardId) {
    AppState.currentBoard = boardId;
    const board = AppState.data.boards[boardId];
    AppState.currentTab = board.tabs.length > 0 ? board.tabs[0].id : null;
    render();
    addHistory('切换看板', board.name);
}

function switchTab(tabId) {
    AppState.currentTab = tabId;
    AppState.selectedItem = null;
    render();
}

function selectItem(itemId) {
    AppState.selectedItem = AppState.selectedItem === itemId ? null : itemId;
    render();
}

function groupByCategory(items) {
    const grouped = {};
    items.forEach(item => {
        const category = item.category || 'uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    });
    return grouped;
}

// ==================== CRUD Operations ====================
function openItemModal(itemId = null, defaultCategory = '') {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    const board = AppState.data.boards[AppState.currentBoard];

    // Clear icon preview
    document.getElementById('itemIconPreview').innerHTML = '';

    // Populate tab select
    const tabSelect = document.getElementById('itemTab');
    tabSelect.innerHTML = '';
    board.tabs.forEach(tab => {
        const option = document.createElement('option');
        option.value = tab.id;
        option.textContent = tab.name;
        tabSelect.appendChild(option);
    });

    if (itemId) {
        // Edit mode
        const item = findItem(itemId);
        if (!item) return;

        document.getElementById('itemModalTitle').textContent = '编辑导航项';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemUrl').value = item.url;
        document.getElementById('itemIcon').value = item.icon || '';
        document.getElementById('itemPriority').value = item.priority;
        document.getElementById('itemTab').value = findItemTab(itemId);
        document.getElementById('itemCategory').value = item.category || '';

        // Show preview if icon is a data URL or image URL
        if (item.icon && (item.icon.startsWith('data:') || item.icon.match(/^https?:\/\//))) {
            showIconPreview('itemIconPreview', item.icon);
        }
    } else {
        // Add mode
        document.getElementById('itemModalTitle').textContent = '添加导航项';
        form.reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemTab').value = AppState.currentTab || '';
        document.getElementById('itemCategory').value = defaultCategory;
    }

    openModal('itemModal');
}

function handleItemSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const url = document.getElementById('itemUrl').value.trim();
    const icon = document.getElementById('itemIcon').value.trim();
    const priority = document.getElementById('itemPriority').value;
    const tabId = document.getElementById('itemTab').value;
    const category = document.getElementById('itemCategory').value.trim();

    // Ensure URL has protocol
    let finalUrl = url;
    if (!url.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + url;
    }

    const board = AppState.data.boards[AppState.currentBoard];

    if (id) {
        // Update existing
        const oldTabId = findItemTab(id);
        const item = findItem(id);

        if (oldTabId !== tabId) {
            // Move to different tab
            board.items[oldTabId] = board.items[oldTabId].filter(i => i.id !== id);
            if (!board.items[tabId]) board.items[tabId] = [];
            board.items[tabId].push({ ...item, name, url: finalUrl, icon, priority, category });
        } else {
            // Update in place
            const index = board.items[tabId].findIndex(i => i.id === id);
            if (index !== -1) {
                board.items[tabId][index] = { ...item, name, url: finalUrl, icon, priority, category };
            }
        }

        addHistory('更新导航项', name);
        showToast('导航项已更新');
    } else {
        // Create new
        const newItem = {
            id: 'item_' + Date.now(),
            name,
            url: finalUrl,
            icon,
            priority,
            category
        };

        if (!board.items[tabId]) board.items[tabId] = [];
        board.items[tabId].push(newItem);

        addHistory('创建导航项', name);
        showToast('导航项已创建');
    }

    saveData();
    closeModal('itemModal');
    render();
}

function openTabModal(tabId = null) {
    const modal = document.getElementById('tabModal');
    const deleteBtn = document.getElementById('deleteTabBtn');

    // Clear icon preview
    document.getElementById('tabIconPreview').innerHTML = '';

    if (tabId) {
        const board = AppState.data.boards[AppState.currentBoard];
        const tab = board.tabs.find(t => t.id === tabId);
        if (!tab) return;

        document.getElementById('tabModalTitle').textContent = '编辑标签';
        document.getElementById('tabId').value = tab.id;
        document.getElementById('tabName').value = tab.name;
        document.getElementById('tabIcon').value = tab.icon || '';
        deleteBtn.style.display = 'inline-block';

        // Show preview if icon is a data URL or image URL
        if (tab.icon && (tab.icon.startsWith('data:') || tab.icon.match(/^https?:\/\//))) {
            showIconPreview('tabIconPreview', tab.icon);
        }
    } else {
        document.getElementById('tabModalTitle').textContent = '添加标签';
        document.getElementById('tabForm').reset();
        document.getElementById('tabId').value = '';
        deleteBtn.style.display = 'none';
    }

    openModal('tabModal');
}

function handleTabSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('tabId').value;
    const name = document.getElementById('tabName').value.trim();
    const icon = document.getElementById('tabIcon').value.trim();

    const board = AppState.data.boards[AppState.currentBoard];

    if (id) {
        // Update
        const index = board.tabs.findIndex(t => t.id === id);
        if (index !== -1) {
            board.tabs[index] = { ...board.tabs[index], name, icon };
            addHistory('更新标签', name);
            showToast('标签已更新');
        }
    } else {
        // Create
        const newTab = {
            id: 'tab_' + Date.now(),
            name,
            icon
        };
        board.tabs.push(newTab);
        board.items[newTab.id] = [];

        if (!AppState.currentTab) {
            AppState.currentTab = newTab.id;
        }

        addHistory('创建标签', name);
        showToast('标签已创建');
    }

    saveData();
    closeModal('tabModal');
    render();
}

function deleteTab(tabId) {
    const board = AppState.data.boards[AppState.currentBoard];
    const tab = board.tabs.find(t => t.id === tabId);
    if (!tab) return;

    board.tabs = board.tabs.filter(t => t.id !== tabId);
    delete board.items[tabId];

    if (AppState.currentTab === tabId) {
        AppState.currentTab = board.tabs.length > 0 ? board.tabs[0].id : null;
    }

    addHistory('删除标签', tab.name);
    saveData();
    render();
    showToast('标签已删除');
}

function deleteCurrentTab() {
    const tabId = document.getElementById('tabId').value;
    if (tabId) {
        const board = AppState.data.boards[AppState.currentBoard];
        const tab = board.tabs.find(t => t.id === tabId);
        if (confirm(`确定要删除标签"${tab.name}"吗？其中的导航项也会被删除。`)) {
            closeModal('tabModal');
            deleteTab(tabId);
        }
    }
}

function deleteItem(itemId) {
    const board = AppState.data.boards[AppState.currentBoard];
    const tabId = findItemTab(itemId);
    const item = findItem(itemId);

    if (tabId && item) {
        board.items[tabId] = board.items[tabId].filter(i => i.id !== itemId);
        addHistory('删除导航项', item.name);
        saveData();
        render();
        showToast('导航项已删除');
    }
}

function handleBoardSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('boardName').value.trim();
    const id = 'board_' + Date.now();

    AppState.data.boards[id] = {
        name,
        tabs: [],
        items: {}
    };

    addHistory('创建看板', name);
    saveData();
    closeModal('boardModal');

    AppState.currentBoard = id;
    AppState.currentTab = null;
    render();
    showToast('看板已创建');
}

// ==================== Reordering ====================
function reorderTabs(draggedId, targetId) {
    const board = AppState.data.boards[AppState.currentBoard];
    const draggedIndex = board.tabs.findIndex(t => t.id === draggedId);
    const targetIndex = board.tabs.findIndex(t => t.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = board.tabs.splice(draggedIndex, 1);
        board.tabs.splice(targetIndex, 0, removed);
        saveData();
        render();
        addHistory('重新排序标签');
    }
}

function reorderItems(draggedId, targetId) {
    const board = AppState.data.boards[AppState.currentBoard];
    const tabId = findItemTab(draggedId);

    if (!tabId) return;

    const items = board.items[tabId];
    const draggedIndex = items.findIndex(i => i.id === draggedId);
    const targetIndex = items.findIndex(i => i.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, removed);
        saveData();
        render();
        addHistory('重新排序导航项');
    }
}

// ==================== Helper Functions ====================
function findItem(itemId) {
    const board = AppState.data.boards[AppState.currentBoard];
    for (const tabId in board.items) {
        const item = board.items[tabId].find(i => i.id === itemId);
        if (item) return item;
    }
    return null;
}

function findItemTab(itemId) {
    const board = AppState.data.boards[AppState.currentBoard];
    for (const tabId in board.items) {
        if (board.items[tabId].some(i => i.id === itemId)) {
            return tabId;
        }
    }
    return null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== UI Helpers ====================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function updateStatus() {
    const board = AppState.data.boards[AppState.currentBoard];
    let totalItems = 0;
    for (const tabId in board.items) {
        totalItems += board.items[tabId].length;
    }
    document.getElementById('statusText').textContent = 
        `${board.name} | ${board.tabs.length} 个标签 | ${totalItems} 个导航项`;
}

function toggleThemePanel() {
    document.getElementById('themePanel').classList.toggle('active');
}

// ==================== Background Panel ====================
function toggleBgPanel() {
    const panel = document.getElementById('bgPanel');
    const isActive = panel.classList.contains('active');

    if (!isActive) {
        renderBgPanel();
        panel.classList.add('active');
    } else {
        panel.classList.remove('active');
    }
}

function renderBgPanel() {
    const panel = document.getElementById('bgPanel');

    // Get current background settings
    let currentBg = { type: 'none', overlay: 'none' };
    try {
        const saved = localStorage.getItem(BG_KEY);
        if (saved) {
            currentBg = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load background:', e);
    }

    // Update overlay options active state
    panel.querySelectorAll('.bg-option').forEach(option => {
        option.classList.toggle('active', option.dataset.bg === currentBg.overlay);
    });

    // Add click handlers for overlay options
    panel.querySelectorAll('.bg-option').forEach(option => {
        option.addEventListener('click', () => {
            const overlay = option.dataset.bg;
            // Only allow overlay effects when there's a custom background
            if (overlay !== 'none' && currentBg.type !== 'custom') {
                showToast('请先上传自定义背景', 'error');
                return;
            }
            const bgData = { ...currentBg, overlay };
            applyBackground(bgData);
            saveBackground(bgData);
            renderBgPanel();
            showToast('背景效果已更新');
        });
    });

    // Show current background preview
    const previewContainer = document.getElementById('bgPreview');
    if (currentBg.type === 'custom' && currentBg.image) {
        previewContainer.innerHTML = `
            <img src="${currentBg.image}" alt="当前背景">
            <div class="bg-info">当前自定义背景</div>
            <button class="btn-danger btn-small" onclick="removeBackground()" style="margin-top: 0.5rem; width: 100%;">移除背景</button>
        `;
    } else {
        previewContainer.innerHTML = '';
    }
}

function handleBgFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('图片大小不能超过2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const bgData = {
            type: 'custom',
            image: dataUrl,
            overlay: 'blur'
        };
        applyBackground(bgData);
        saveBackground(bgData);
        renderBgPanel();
        showToast('背景已设置');
        addHistory('设置自定义背景');
    };
    reader.onerror = () => {
        showToast('读取文件失败', 'error');
    };
    reader.readAsDataURL(file);

    // Clear file input
    event.target.value = '';
}

function removeBackground() {
    const bgData = { type: 'none', overlay: 'none' };
    applyBackground(bgData);
    saveBackground(bgData);
    renderBgPanel();
    showToast('背景已移除');
    addHistory('移除背景');
}

// ==================== Icon Picker ====================
function toggleIconPicker(pickerId) {
    const picker = document.getElementById(pickerId);
    const isActive = picker.classList.contains('active');

    // Close all other pickers
    document.querySelectorAll('.icon-picker').forEach(p => p.classList.remove('active'));

    if (!isActive) {
        renderIconPicker(pickerId);
        picker.classList.add('active');
    }
}

function renderIconPicker(pickerId) {
    const picker = document.getElementById(pickerId);
    const inputId = pickerId.replace('Picker', '');

    let html = '';
    for (const [category, icons] of Object.entries(PRESET_ICONS)) {
        html += `
            <div class="icon-picker-category">
                <div class="icon-picker-title">${category}</div>
                <div class="icon-picker-grid">
                    ${icons.map(icon => `
                        <div class="icon-picker-item" data-icon="${icon}" title="${icon}">${icon}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    picker.innerHTML = html;

    // Add click handlers
    picker.querySelectorAll('.icon-picker-item').forEach(item => {
        item.addEventListener('click', () => {
            const icon = item.dataset.icon;
            document.getElementById(inputId).value = icon;

            // Show preview
            const previewId = inputId + 'Preview';
            const preview = document.getElementById(previewId);
            preview.innerHTML = `
                <div class="nav-icon" style="width: 40px; height: 40px; font-size: 1.5rem;">${icon}</div>
                <span class="preview-text">${icon}</span>
            `;

            // Close picker
            picker.classList.remove('active');
        });
    });
}

// Close icon pickers when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-picker') && !e.target.closest('.btn-icon-import')) {
        document.querySelectorAll('.icon-picker').forEach(p => p.classList.remove('active'));
    }
    if (!e.target.closest('.category-picker') && !e.target.closest('.category-input-wrapper')) {
        document.getElementById('categoryPicker').classList.remove('active');
    }
});

// ==================== Category Picker ====================
function toggleCategoryPicker() {
    const picker = document.getElementById('categoryPicker');
    const isActive = picker.classList.contains('active');

    if (!isActive) {
        renderCategoryPicker();
        picker.classList.add('active');
    } else {
        picker.classList.remove('active');
    }
}

function renderCategoryPicker() {
    const picker = document.getElementById('categoryPicker');
    const tabId = document.getElementById('itemTab').value;
    const board = AppState.data.boards[AppState.currentBoard];

    // Get unique categories from current tab
    const items = board.items[tabId] || [];
    const categories = [...new Set(items
        .map(item => item.category)
        .filter(cat => cat && cat.trim() !== '')
    )].sort();

    if (categories.length === 0) {
        picker.innerHTML = '<div class="category-picker-empty">该标签下暂无分类</div>';
        return;
    }

    let html = '<div class="category-picker-list">';
    categories.forEach(cat => {
        html += `<div class="category-picker-item" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</div>`;
    });
    html += '</div>';

    picker.innerHTML = html;

    // Add click handlers
    picker.querySelectorAll('.category-picker-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            document.getElementById('itemCategory').value = category;
            picker.classList.remove('active');
        });
    });
}

// Update category picker when tab changes
document.getElementById('itemTab').addEventListener('change', () => {
    const picker = document.getElementById('categoryPicker');
    if (picker.classList.contains('active')) {
        renderCategoryPicker();
    }
});

// ==================== Icon File Handler ====================
function handleIconFileSelect(event, inputId, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
        showToast('图片大小不能超过500KB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        document.getElementById(inputId).value = dataUrl;
        showIconPreview(previewId, dataUrl);
        showToast('图标已导入');
    };
    reader.onerror = () => {
        showToast('读取文件失败', 'error');
    };
    reader.readAsDataURL(file);

    // Clear file input
    event.target.value = '';
}

function showIconPreview(previewId, dataUrl) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = `
        <img src="${dataUrl}" alt="图标预览">
        <span class="preview-text">图标预览</span>
    `;
}

// ==================== Context Menu ====================
function showContextMenu(e, item, navElement) {
    e.preventDefault();
    const menu = document.getElementById('contextMenu');
    
    // Position the menu relative to the nav item
    const rect = navElement.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + window.scrollY) + 'px';
    menu.classList.add('active');
    menu.dataset.itemId = item.id;
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.remove('active');
}

function handleContextMenuAction(e) {
    const action = e.target.dataset.action;
    const menu = document.getElementById('contextMenu');
    const itemId = menu.dataset.itemId;

    if (!itemId) return;

    switch (action) {
        case 'edit':
            openItemModal(itemId);
            break;
        case 'delete':
            if (confirm('确定要删除这个导航项吗？')) {
                deleteItem(itemId);
            }
            break;
        case 'priority-high':
        case 'priority-medium':
        case 'priority-low':
            updateItemPriority(itemId, action.replace('priority-', ''));
            break;
    }

    hideContextMenu();
}



function updateItemPriority(itemId, priority) {
    const tabId = findItemTab(itemId);
    const board = AppState.data.boards[AppState.currentBoard];

    if (tabId && board.items[tabId]) {
        const item = board.items[tabId].find(i => i.id === itemId);
        if (item) {
            item.priority = priority;
            saveData();
            render();
            addHistory('更新优先级', `${item.name} -> ${priority}`);
            showToast('优先级已更新');
        }
    }
}

// ==================== Keyboard Shortcuts ====================
function handleKeyboard(e) {
    // Ctrl/Cmd + N: New item
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openItemModal();
        return;
    }

    // Ctrl/Cmd + S: Save (trigger form submit if modal is open)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const form = activeModal.querySelector('form');
            if (form) form.dispatchEvent(new Event('submit'));
        }
        return;
    }

    // Ctrl/Cmd + T: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleThemePanel();
        return;
    }

    // Escape: Close modal
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
        hideContextMenu();
        return;
    }

    // Delete: Delete selected item
    if (e.key === 'Delete' && AppState.selectedItem) {
        if (confirm('确定要删除选中的导航项吗？')) {
            deleteItem(AppState.selectedItem);
            AppState.selectedItem = null;
        }
    }

    // Arrow keys: Navigate tabs
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const board = AppState.data.boards[AppState.currentBoard];
        if (board.tabs.length === 0) return;

        const currentIndex = board.tabs.findIndex(t => t.id === AppState.currentTab);
        let newIndex;

        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex <= 0 ? board.tabs.length - 1 : currentIndex - 1;
        } else {
            newIndex = currentIndex >= board.tabs.length - 1 ? 0 : currentIndex + 1;
        }

        switchTab(board.tabs[newIndex].id);
    }
}

// ==================== Export/Import ====================
function exportData() {
    const data = {
        ...AppState.data,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navigation_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addHistory('导出数据');
    showToast('数据已导出');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (!data.boards) {
                throw new Error('Invalid data format');
            }

            if (confirm('导入数据将覆盖现有数据，是否继续？')) {
                AppState.data = data;
                AppState.currentBoard = Object.keys(data.boards)[0] || 'default';
                const board = AppState.data.boards[AppState.currentBoard];
                AppState.currentTab = board.tabs.length > 0 ? board.tabs[0].id : null;

                saveData();
                render();
                addHistory('导入数据');
                showToast('数据已导入');
            }
        } catch (err) {
            showToast('导入失败：无效的数据格式', 'error');
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ==================== History ====================
function showHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    if (AppState.history.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无活动记录</div></div>';
    } else {
        // Show in reverse order (newest first)
        [...AppState.history].reverse().forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const time = new Date(entry.time);
            const timeStr = time.toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            item.innerHTML = `
                <span class="history-time">${timeStr}</span>
                <span class="history-action">${escapeHtml(entry.action)}${entry.details ? ` - ${escapeHtml(entry.details)}` : ''}</span>
            `;
            list.appendChild(item);
        });
    }

    openModal('historyModal');
}

function clearHistory() {
    if (confirm('确定要清空所有活动记录吗？')) {
        AppState.history = [];
        saveHistory();
        showHistory();
        showToast('历史记录已清空');
    }
}

// ==================== Drag Ghost Position ====================
document.addEventListener('dragover', (e) => {
    const ghost = document.getElementById('dragGhost');
    if (ghost.classList.contains('active')) {
        ghost.style.left = (e.clientX + 10) + 'px';
        ghost.style.top = (e.clientY + 10) + 'px';
    }
});

// ==================== Service Worker (Optional PWA support) ====================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Silent fail - PWA features are optional
    });
}

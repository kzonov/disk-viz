export function createContextMenu() {
  let currentMenu = null;
  
  function show(x, y, options) {
    hide();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    options.forEach(option => {
      const item = document.createElement('button');
      item.className = `context-menu-item${option.dangerous ? ' dangerous' : ''}`;
      
      const icon = document.createElement('span');
      icon.className = 'context-menu-icon';
      icon.textContent = option.icon;
      
      const text = document.createElement('span');
      text.textContent = option.label;
      
      item.appendChild(icon);
      item.appendChild(text);
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        option.action();
        hide();
      });
      
      menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    currentMenu = menu;
    
    // Position menu, ensuring it stays within viewport
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 10;
    }
    
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    // Show menu with animation
    setTimeout(() => menu.classList.add('visible'), 10);
    
    // Close menu on outside click or escape
    const closeHandler = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'click' && menu.contains(e.target)) return;
      
      hide();
      document.removeEventListener('click', closeHandler);
      document.removeEventListener('keydown', closeHandler);
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
      document.addEventListener('keydown', closeHandler);
    }, 100);
  }
  
  function hide() {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
    }
  }
  
  return { show, hide };
}
/* UI Modern JS - lightweight interactions: theme, cart, toasts, animations */
document.addEventListener('DOMContentLoaded', ()=>{
  // Theme toggle
  const root = document.documentElement;
  const saved = localStorage.getItem('ui-theme');
  if(saved==='light') root.classList.add('light');

  document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const isLight = root.classList.toggle('light');
      localStorage.setItem('ui-theme', isLight? 'light':'dark');
    });
  });

  // Simple cart implementation using localStorage
  const CART_KEY = 'ui_cart_v1';
  const cartBtn = document.querySelector('#floatingCartBtn');
  const cartPanel = document.querySelector('#cartPanel');
  const cartItemsEl = document.querySelector('#cartItems');
  const cartCount = document.querySelector('#cartCount');

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch(e){ return []; }
  }
  function saveCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); renderCart(); }

  function renderCart(){
    const items = loadCart();
    cartItemsEl.innerHTML = '';
    let total = 0;
    items.forEach((it, idx)=>{
      total += it.price * it.qty;
      const el = document.createElement('div'); el.className='cart-item';
      el.innerHTML = `
        <div class="cart-thumb"><img src="${it.img}" style="width:100%;height:100%;object-fit:cover"></div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between"><strong>${it.name}</strong><span class="muted">$${(it.price*it.qty).toFixed(2)}</span></div>
          <div class="qty">
            <button data-action="dec" data-idx="${idx}">−</button>
            <div style="padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:8px">${it.qty}</div>
            <button data-action="inc" data-idx="${idx}">+</button>
            <button data-action="rm" data-idx="${idx}" style="margin-left:8px;color:#ff6b6b">Remove</button>
          </div>
        </div>`;
      cartItemsEl.appendChild(el);
    });
    cartCount.textContent = items.reduce((s,i)=>s+i.qty,0);
    document.querySelector('#cartTotal').textContent = '$'+total.toFixed(2);
  }

  // cart button toggle
  cartBtn && cartBtn.addEventListener('click', ()=>{
    cartPanel.classList.toggle('open'); renderCart();
  });

  // delegate cart actions
  cartItemsEl && cartItemsEl.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const idx = Number(btn.dataset.idx); const items = loadCart();
    if(btn.dataset.action==='inc'){ items[idx].qty++; saveCart(items); }
    if(btn.dataset.action==='dec'){ items[idx].qty = Math.max(1, items[idx].qty-1); saveCart(items); }
    if(btn.dataset.action==='rm'){ items.splice(idx,1); saveCart(items); showToast('Removed from cart'); }
  });

  // add to cart buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id; const name = btn.dataset.name; const price = parseFloat(btn.dataset.price||0); const img = btn.dataset.img||'/images/placeholder_plate.svg';
      const items = loadCart();
      const found = items.find(i=>i.id===id);
      if(found){ found.qty += 1; } else { items.push({id,name,price,qty:1,img}); }
      saveCart(items); showToast('Added to cart');
      // small pulse animation
      btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:320});
    });
  });

  // Checkout form basic validation
  const checkoutForm = document.querySelector('#checkoutForm');
  if(checkoutForm){
    checkoutForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = checkoutForm.querySelector('[name="name"]').value.trim();
      const email = checkoutForm.querySelector('[name="email"]').value.trim();
      if(!name || !email){
        showToast('Please fill required fields', true); return;
      }
      // success effect
      showToast('Order placed — Thank you!');
      localStorage.removeItem(CART_KEY); renderCart();
      setTimeout(()=>{ cartPanel.classList.remove('open'); },400);
    });
  }

  // toast
  const toast = document.querySelector('#uiToast');
  function showToast(msg, isError){
    if(!toast) return; toast.textContent = msg; toast.classList.add('show');
    // apply variant classes for cleaner styling
    toast.classList.remove('success','error','info');
    if(isError===true) toast.classList.add('error');
    else if(isError==='info') toast.classList.add('info');
    else toast.classList.add('success');
    setTimeout(()=>{ toast.classList.remove('show'); }, 1800);
  }

  // initial render
  renderCart();

  // GSAP entrance animation for cards, if available
  try{
    if(window.gsap){
      const cards = document.querySelectorAll('.food-card');
      gsap.from(cards, {duration:0.9, y:18, opacity:0, stagger:0.08, ease:'power3.out'});
      // subtle hover tilt
      cards.forEach(c=>{
        c.addEventListener('mousemove', (e)=>{
          const w = c.offsetWidth, h = c.offsetHeight; const rect = c.getBoundingClientRect();
          const x = (e.clientX - rect.left - w/2)/(w/2); const y = (e.clientY - rect.top - h/2)/(h/2);
          gsap.to(c, {duration:0.4, rotationY: x*3, rotationX: -y*3, transformPerspective:600, transformOrigin:'center', ease:'power3.out'});
        });
        c.addEventListener('mouseleave', ()=> gsap.to(c, {duration:0.6, rotationY:0, rotationX:0, scale:1, ease:'elastic.out(1,0.6)'}));
      });
    }
  }catch(e){ /* ignore gsap errors */ }
});

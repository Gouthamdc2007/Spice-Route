
// ── DATA ──────────────────────────────────
const dishes = {
  samosa:    {name:"Samosa Chaat",      price:180,  badge:"VEG",    region:"Punjab",  img:"images/samosa.jpg",              emoji:"&#129455;", desc:"Crispy samosas topped with chole, sweet chutneys, yoghurt & sev. A street-food classic elevated.", ingredients:["Wheat flour","Potato","Peas","Chana","Tamarind chutney","Green chutney","Yoghurt","Sev","Chaat masala","Red chilli"], cal:310, protein:"8g", carbs:"42g", fat:"11g", spice:"Medium"},
  ptikka:    {name:"Paneer Tikka",      price:320,  badge:"VEG",    region:"Punjab",  img:"images/paneer-tikka.jpg",         emoji:"&#129472;", desc:"Marinated cottage cheese cubes grilled in tandoor with bell peppers, onions & mint chutney.", ingredients:["Paneer","Bell peppers","Onion","Hung curd","Ginger-garlic paste","Ajwain","Red chilli","Garam masala","Kasuri methi","Lemon"], cal:380, protein:"18g", carbs:"14g", fat:"28g", spice:"Mild"},
  ctikka:    {name:"Chicken Malai Tikka",price:380, badge:"NON-VEG",region:"Mughlai", img:"images/chicken-tikka.jpg",        emoji:"&#127831;", desc:"Tender chicken marinated in cream, cashew paste & mild spices. Melt-in-mouth texture.", ingredients:["Chicken breast","Fresh cream","Cashew paste","Curd","Green chilli","Ginger","Garlic","Cardamom","White pepper","Lemon"], cal:420, protein:"34g", carbs:"6g",  fat:"29g", spice:"Mild"},
  dahipuri:  {name:"Dahi Puri",         price:150,  badge:"VEG",    region:"Mumbai",  img:"images/dahi-puri.jpg",            emoji:"&#129381;", desc:"Hollow puris filled with spiced potato, sweet yoghurt, tamarind & green chutney. Mumbai favourite.", ingredients:["Semolina puri","Boiled potato","Yoghurt","Tamarind chutney","Green chutney","Onion","Sev","Pomegranate","Chaat masala","Black salt"], cal:220, protein:"6g",  carbs:"34g", fat:"7g",  spice:"Mild"},
  seekh:     {name:"Veg Seekh Kebab",   price:280,  badge:"VEG",    region:"Awadh",   img:"images/seekh-kebab.jpg",          emoji:"&#127830;", desc:"Minced vegetables & paneer shaped on skewers, grilled in tandoor with chaat masala finish.", ingredients:["Paneer","Mixed vegetables","Besan","Ginger","Green chilli","Onion","Coriander","Garam masala","Chaat masala","Mustard oil"], cal:290, protein:"12g", carbs:"22g", fat:"17g", spice:"Medium"},
  shorba:    {name:"Tamatar Shorba",    price:160,  badge:"VEG",    region:"Mughlai", img:"images/tomato-shorba.jpg",        emoji:"&#127858;", desc:"Royal Mughlai tomato soup with fresh cream, cardamom, ginger & coriander. Silky smooth.", ingredients:["Tomatoes","Fresh cream","Onion","Ginger","Garlic","Cardamom","Bay leaf","Cumin","Coriander","Butter"], cal:160, protein:"4g",  carbs:"18g", fat:"9g",  spice:"Mild"},
  daltadka:  {name:"Dal Tadka",         price:220,  badge:"VEG",    region:"Punjab",  img:"images/dal-tadka.jpg",            emoji:"&#129365;", desc:"Yellow lentils tempered with cumin, garlic, dried red chillies & ghee. Soul-warming comfort.", ingredients:["Yellow lentils","Ghee","Cumin seeds","Garlic","Onion","Tomato","Dried red chilli","Garam masala","Coriander","Turmeric"], cal:240, protein:"12g", carbs:"30g", fat:"8g",  spice:"Mild"},
  naan:      {name:"Garlic Butter Naan",price:80,   badge:"VEG",    region:"Punjab",  img:"images/garlic-naan.jpg",          emoji:"&#129362;", desc:"Soft leavened bread baked in tandoor, brushed with garlic butter & coriander.", ingredients:["Maida","Yeast","Milk","Curd","Garlic","Butter","Coriander","Salt","Sugar","Oil"], cal:260, protein:"7g",  carbs:"40g", fat:"9g",  spice:"None"},
  roti:      {name:"Tandoori Roti",     price:40,   badge:"VEG",    region:"North India",img:"images/tandoori-roti.jpg",     emoji:"&#129362;", desc:"Whole wheat flatbread cooked directly on tandoor walls. Light, wholesome, traditional.", ingredients:["Whole wheat flour","Water","Salt","Ghee","Yeast (optional)"], cal:120, protein:"4g",  carbs:"22g", fat:"3g",  spice:"None"},
  basket:    {name:"Royal Bread Basket",price:180,  badge:"VEG",    region:"North India",img:"images/bread-basket.jpg",     emoji:"&#127838;", desc:"Assorted naan, paratha, kulcha & missi roti. Served with three dipping chutneys.", ingredients:["Naan","Paratha","Kulcha","Missi roti","Mint chutney","Tamarind chutney","Pickle"], cal:480, protein:"14g", carbs:"70g", fat:"16g", spice:"None"},
  pbm:       {name:"Paneer Butter Masala",price:320,badge:"VEG",    region:"Punjab",  img:"images/paneer-butter-masala.jpg", emoji:"&#127859;", desc:"Rich tomato-cream gravy with soft paneer cubes, kasuri methi & butter.", ingredients:["Paneer","Tomato","Butter","Fresh cream","Cashews","Onion","Ginger","Garlic","Kasuri methi","Garam masala"], cal:420, protein:"16g", carbs:"18g", fat:"32g", spice:"Mild"},
  palak:     {name:"Palak Paneer",      price:300,  badge:"VEG",    region:"Punjab",  img:"images/palak-paneer.jpg",         emoji:"&#129382;", desc:"Blanched spinach puree with cottage cheese, garam masala & ginger. Nutritious and aromatic.", ingredients:["Spinach","Paneer","Onion","Tomato","Ginger","Garlic","Green chilli","Garam masala","Cream","Cumin"], cal:360, protein:"15g", carbs:"14g", fat:"26g", spice:"Mild"},
  dalm:      {name:"Dal Makhani",       price:280,  badge:"VEG",    region:"Punjab",  img:"images/dal-makhani.jpg",          emoji:"&#129365;", desc:"Slow-cooked black lentils with butter, cream & tomatoes simmered overnight.", ingredients:["Black lentils","Kidney beans","Butter","Cream","Tomato","Onion","Ginger","Garlic","Garam masala","Cumin"], cal:390, protein:"14g", carbs:"34g", fat:"20g", spice:"Mild"},
  chana:     {name:"Chana Masala",      price:260,  badge:"VEG",    region:"Punjab",  img:"images/chana-masala.jpg",         emoji:"&#129384;", desc:"Hearty chickpeas in tangy spiced tomato gravy with amchur, cumin & coriander.", ingredients:["Chickpeas","Tomato","Onion","Ginger","Garlic","Amchur","Cumin","Coriander","Garam masala","Pomegranate seeds"], cal:340, protein:"14g", carbs:"46g", fat:"10g", spice:"Medium"},
  vbiriyani: {name:"Veg Dum Biryani",   price:340,  badge:"VEG",    region:"Hyderabad",img:"images/veg-biryani.jpg",        emoji:"&#127859;", desc:"Fragrant basmati layered with seasonal vegetables, saffron & rose water. Sealed dum-style.", ingredients:["Basmati rice","Mixed vegetables","Saffron","Rose water","Fried onions","Ghee","Whole spices","Mint","Curd","Kewra"], cal:520, protein:"10g", carbs:"80g", fat:"18g", spice:"Medium"},
  bc:        {name:"Butter Chicken",    price:420,  badge:"NON-VEG",region:"Delhi",   img:"images/butter-chicken.jpg",       emoji:"&#127831;", desc:"Tandoor-grilled chicken in velvety tomato-cream sauce with fenugreek & aromatic spices.", ingredients:["Chicken","Tomato","Butter","Cream","Kasuri methi","Ginger","Garlic","Cardamom","Red chilli","Garam masala"], cal:480, protein:"36g", carbs:"16g", fat:"30g", spice:"Mild"},
  rogan:     {name:"Mutton Rogan Josh", price:480,  badge:"NON-VEG",region:"Kashmir", img:"images/rogan-josh.jpg",           emoji:"&#129385;", desc:"Slow-braised Kashmiri mutton in aromatic gravy of fennel, dried ginger & whole spices.", ingredients:["Mutton","Kashmiri chilli","Fennel","Dry ginger","Cardamom","Cloves","Cinnamon","Mustard oil","Yoghurt","Onion"], cal:560, protein:"42g", carbs:"8g",  fat:"38g", spice:"Hot"},
  fish:      {name:"Kerala Fish Curry", price:420,  badge:"NON-VEG",region:"Kerala",  img:"images/fish-curry.jpg",           emoji:"&#128031;", desc:"Fresh coastal fish in tangy coconut-tamarind gravy with curry leaves & raw mango.", ingredients:["Fish","Coconut milk","Tamarind","Raw mango","Curry leaves","Mustard seeds","Green chilli","Turmeric","Kokum","Coconut oil"], cal:410, protein:"38g", carbs:"14g", fat:"22g", spice:"Hot"},
  cbiriyani: {name:"Hyderabadi Chicken Biryani",price:380,badge:"NON-VEG",region:"Hyderabad",img:"images/chicken-biryani.jpg",emoji:"&#127859;", desc:"Slow dum-cooked biryani with bone-in chicken, kewra water & caramelised onions.", ingredients:["Basmati rice","Chicken","Saffron","Kewra water","Fried onions","Mint","Curd","Whole spices","Ghee","Green chilli"], cal:680, protein:"38g", carbs:"76g", fat:"24g", spice:"Medium"},
  prawn:     {name:"Goan Prawn Masala", price:520,  badge:"NON-VEG",region:"Goa",     img:"images/prawn-masala.jpg",         emoji:"&#129424;", desc:"Jumbo prawns in fiery Goan red masala with kokum, coconut vinegar & coastal spice blend.", ingredients:["Prawns","Coconut","Kokum","Coconut vinegar","Onion","Tomato","Red chilli","Turmeric","Mustard","Curry leaves"], cal:390, protein:"34g", carbs:"10g", fat:"24g", spice:"Hot"},
  gulab:     {name:"Gulab Jamun",       price:120,  badge:"VEG",    region:"North India",img:"images/gulab-jamun.jpg",       emoji:"&#129361;", desc:"Soft khoya dumplings soaked in saffron-rose water sugar syrup.", ingredients:["Khoya","Maida","Baking soda","Ghee","Sugar syrup","Saffron","Rose water","Cardamom","Pistachios"], cal:320, protein:"6g",  carbs:"46g", fat:"13g", spice:"None"},
  rasmalai:  {name:"Rasmalai",          price:160,  badge:"VEG",    region:"Bengal",  img:"images/rasmalai.jpg",             emoji:"&#129368;", desc:"Soft cottage cheese patties soaked in thickened saffron milk with pistachios & cardamom.", ingredients:["Chenna","Milk","Sugar","Saffron","Cardamom","Pistachios","Rose water","Almonds"], cal:280, protein:"10g", carbs:"38g", fat:"10g", spice:"None"},
  kulfi:     {name:"Kulfi Falooda",     price:180,  badge:"VEG",    region:"Old Delhi",img:"images/kulfi-falooda.jpg",       emoji:"&#127846;", desc:"Pistachio kulfi over rose falooda noodles, basil seeds & cold milk.", ingredients:["Milk","Cream","Pistachios","Sugar","Cardamom","Falooda noodles","Rose syrup","Basil seeds"], cal:350, protein:"8g",  carbs:"44g", fat:"16g", spice:"None"},
  halwa:     {name:"Gajar Ka Halwa",    price:140,  badge:"VEG",    region:"Punjab",  img:"images/gajar-halwa.jpg",          emoji:"&#129380;", desc:"Slow-cooked grated carrots in milk, sugar, ghee & cardamom. Topped with dry fruits.", ingredients:["Carrots","Milk","Ghee","Sugar","Cardamom","Cashews","Raisins","Almonds","Khoya"], cal:310, protein:"6g",  carbs:"40g", fat:"14g", spice:"None"},
  lassi:     {name:"Mango Lassi",       price:120,  badge:"VEG",    region:"Punjab",  img:"images/mango-lassi.jpg",          emoji:"&#129389;", desc:"Thick Alphonso mango blended with creamy yoghurt, cardamom & a hint of saffron.", ingredients:["Alphonso mango","Yoghurt","Milk","Sugar","Cardamom","Saffron","Ice"], cal:240, protein:"6g",  carbs:"38g", fat:"8g",  spice:"None"}
};

// ── CART ──────────────────────────────────
let cart = {};

function changeQty(e, id, delta) {
  e.stopPropagation();
  const el = document.getElementById('qty-' + id);
  if (!el) return;
  let v = parseInt(el.textContent) + delta;
  if (v < 1) v = 1;
  el.textContent = v;
}

function addToCart(e, id, name, price) {
  e.stopPropagation();
  const qtyEl = document.getElementById('qty-' + id);
  const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
  if (cart[id]) {
    cart[id].qty += qty;
  } else {
    cart[id] = { name, price, qty };
  }
  renderCart();
  // flash feedback
  const btn = e.target;
  const orig = btn.textContent;
  btn.textContent = 'Added!';
  btn.style.background = '#4CAF50';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1000);
}

function renderCart() {
  const items = document.getElementById('cartItems');
  const ftr = document.getElementById('cartFtr');
  const cnt = document.getElementById('cartCount');
  const keys = Object.keys(cart);
  let total = 0;
  cnt.textContent = keys.reduce((a, k) => a + cart[k].qty, 0);
  if (keys.length === 0) {
    items.innerHTML = '<p class="cart-empty">Your cart is empty.<br/>Add items from the menu!</p>';
    ftr.style.display = 'none';
    return;
  }
  ftr.style.display = 'block';
  items.innerHTML = keys.map(k => {
    const it = cart[k];
    total += it.price * it.qty;
    return `<div class="cart-item">
      <div class="ci-info"><h4>${it.name}</h4><span>&#8377;${it.price} x ${it.qty} = &#8377;${it.price * it.qty}</span></div>
      <div class="ci-qty">
        <button onclick="cartQty('${k}',-1)">&#8722;</button>
        <span>${it.qty}</span>
        <button onclick="cartQty('${k}',1)">&#43;</button>
      </div>
      <button class="ci-del" onclick="cartDel('${k}')">&#128465;</button>
    </div>`;
  }).join('');
  const gst = Math.round(total * 0.05);
  document.getElementById('cartSub').textContent = '\u20B9' + total;
  document.getElementById('cartGst').textContent = '\u20B9' + gst;
  document.getElementById('cartTot').textContent = '\u20B9' + (total + gst);
}

function cartQty(id, delta) {
  cart[id].qty += delta;
  if (cart[id].qty < 1) delete cart[id];
  renderCart();
}
function cartDel(id) { delete cart[id]; renderCart(); }
function clearCart() { cart = {}; renderCart(); }

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

// ── DOWNLOAD BILL ─────────────────────────
function downloadBill() {
  const keys = Object.keys(cart);
  if (!keys.length) return;
  let rows = '', sub = 0;
  keys.forEach(k => {
    const it = cart[k];
    const line = it.price * it.qty;
    sub += line;
    rows += `<tr><td>${it.name}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">&#8377;${it.price}</td><td style="text-align:right">&#8377;${line}</td></tr>`;
  });
  const gst = Math.round(sub * 0.05);
  const now = new Date().toLocaleString('en-IN');
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Spice Route - Bill</title>
  <style>
    body{font-family:Georgia,serif;margin:40px;color:#1a0e08}
    .hd{text-align:center;border-bottom:2px solid #E8621A;padding-bottom:16px;margin-bottom:24px}
    h1{color:#E8621A;font-size:2rem;margin:0}
    .sub{color:#8B1A1A;font-size:.85rem;margin-top:6px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{background:#E8621A;color:#fff;padding:10px;font-size:.85rem;text-align:left}
    td{padding:9px 10px;border-bottom:1px solid #eee;font-size:.88rem}
    tr:nth-child(even)td{background:#fdf7f0}
    .tot-row td{font-weight:bold;border-top:2px solid #E8621A}
    .gst-row td{color:#666;font-size:.82rem}
    .final td{font-size:1.1rem;color:#E8621A;font-weight:bold}
    .footer{text-align:center;margin-top:32px;font-size:.78rem;color:#666;border-top:1px solid #ddd;padding-top:14px}
    @media print{.no-print{display:none}}
  </style></head><body>
  <div class="hd"><h1>Spice Route</h1><div class="sub">Authentic Indian Fine Dining | 12 Chandni Chowk Lane, Old Delhi</div><div class="sub">Bill Date: ${now}</div></div>
  <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rows}
  <tr class="gst-row"><td colspan="3">Subtotal</td><td style="text-align:right">&#8377;${sub}</td></tr>
  <tr class="gst-row"><td colspan="3">GST @ 5%</td><td style="text-align:right">&#8377;${gst}</td></tr>
  <tr class="final"><td colspan="3"><b>Total Payable</b></td><td style="text-align:right"><b>&#8377;${sub+gst}</b></td></tr>
  </tbody></table>
  <div class="footer">Thank you for dining with us! | +91 98765 43210 | hello@spiceroute.in<br/>UPI | Card | Cash | Crypto accepted</div>
  <br/><button class="no-print" onclick="window.print()" style="background:#E8621A;color:#fff;border:none;padding:10px 24px;font-size:1rem;cursor:pointer;border-radius:4px">Print / Save as PDF</button>
  </body></html>`);
  win.document.close();
}

// ── MODAL ──────────────────────────────────
function openModal(id) {
  const d = dishes[id];
  if (!d) return;
  document.getElementById('modalImg').src = d.img;
  document.getElementById('modalImgFallback').innerHTML = d.emoji || '';
  const imgEl = document.getElementById('modalImg');
  imgEl.onerror = function(){ this.style.display='none'; document.getElementById('modalImgFallback').style.display='flex'; };
  const badge = document.getElementById('modalBadge');
  badge.textContent = d.badge;
  badge.className = 'modal-badge ' + (d.badge === 'VEG' ? 'veg' : 'nonveg');
  document.getElementById('modalRegion').textContent = d.region;
  document.getElementById('modalName').textContent = d.name;
  document.getElementById('modalDesc').textContent = d.desc;
  document.getElementById('modalIngredients').innerHTML = d.ingredients.map(i => `<span>${i}</span>`).join('');
  document.getElementById('mnCal').textContent = d.cal;
  document.getElementById('mnProtein').textContent = d.protein;
  document.getElementById('mnCarbs').textContent = d.carbs;
  document.getElementById('mnFat').textContent = d.fat;
  document.getElementById('modalPrice').innerHTML = '&#8377;' + d.price;
  document.getElementById('modalSpice').textContent = 'Spice: ' + d.spice;
  const addBtn = document.getElementById('modalAddBtn');
  addBtn.textContent = '+ Add to Cart';
  addBtn.onclick = () => {
    if (cart[id]) cart[id].qty++;
    else cart[id] = { name: d.name, price: d.price, qty: 1 };
    renderCart();
    addBtn.textContent = 'Added!';
    addBtn.style.background = '#4CAF50';
    setTimeout(() => { addBtn.textContent = '+ Add to Cart'; addBtn.style.background = ''; }, 1000);
  };
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── TABS ───────────────────────────────────
document.querySelectorAll('.mtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const pane = document.getElementById(btn.dataset.tab);
    pane.classList.add('active');
    pane.querySelectorAll('.fade-in').forEach((el, i) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), i * 60);
    });
  });
});

// ── NAVBAR SCROLL ─────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('topBtn').classList.toggle('show', window.scrollY > 400);
});

// ── HAMBURGER ─────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
});

// ── FADE-IN OBSERVER ──────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 70);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

// ── RESERVATION ───────────────────────────
const dateInput = document.getElementById('resDate');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

function submitRes(e) {
  e.preventDefault();
  document.getElementById('resForm').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('resForm').style.display = 'none';
    document.getElementById('resSuccess').classList.add('show');
  }, 300);
}

// ── SMOOTH SCROLL ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ============================================================
//  cart.js — Seamless UPI, Dynamic QR & Food Ordering
//  - Dynamic Scannable UPI QR Code (Auto-amount)
//  - 1-Tap Mobile App Launchers (GPay, PhonePe, Paytm)
//  - 1-Click Instant Payment Confirmation
//  - Customer Payment Success Confirmation Screen
//  - Automated Itemized GST Tax Invoice / Bill PDF Generator & Viewer
// ============================================================

// ── UPI & PAYMENT CONFIGURATION ─────────────────────────────
let RESTAURANT_UPI_ID = localStorage.getItem('spiceRoute_upi_id') || 'gowtham57845@okhdfcbank';

function setRestaurantUPI(vpa) {
  if (vpa) {
    RESTAURANT_UPI_ID = vpa.trim();
    localStorage.setItem('spiceRoute_upi_id', RESTAURANT_UPI_ID);
  }
}

// ── Cart State (persisted in localStorage) ─────────────────
let cart = loadCart();
let currentDeliveryAddress = null;

function loadCart() {
  try { return JSON.parse(localStorage.getItem('spiceRouteCart') || '{}'); } catch(e) { return {}; }
}
function saveCart() {
  localStorage.setItem('spiceRouteCart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const total = Object.values(cart).reduce((a, i) => a + (Number(i.qty) || 0), 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

// ── Add to Cart (Requires Google Login) ─────────────────────
function addToCart(e, id, name, price) {
  if (e) e.stopPropagation();

  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user) {
    if (typeof requireLoginModal === 'function') {
      requireLoginModal(() => addToCart(null, id, name, price));
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  const qtyEl = document.getElementById('qty-' + id);
  const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
  if (cart[id]) {
    cart[id].qty += qty;
  } else {
    cart[id] = { name, price: Number(price), qty };
  }
  saveCart();
  renderCart();

  const btn = e && e.target;
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Added!';
    btn.style.background = '#4CAF50';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1000);
  }
  showToast(name + ' added to your order!');
}

function changeQty(e, id, delta) {
  if (e) e.stopPropagation();
  const el = document.getElementById('qty-' + id);
  if (!el) return;
  let v = parseInt(el.textContent, 10) + delta;
  if (v < 1) v = 1;
  el.textContent = v;
}

function cartQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty < 1) delete cart[id];
  saveCart();
  renderCart();
}

function cartDel(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function renderCart() {
  const items = document.getElementById('cartItems');
  const ftr = document.getElementById('cartFtr');
  if (!items) return;
  const keys = Object.keys(cart);
  updateCartCount();

  if (!keys.length) {
    items.innerHTML = `
      <div style="text-align:center;padding:40px 10px;color:var(--muted)">
        <div style="font-size:3rem;margin-bottom:12px;opacity:0.6">&#128722;</div>
        <p style="font-size:0.9rem;font-weight:500;color:#E5D5C5">Your food cart is empty</p>
        <p style="font-size:0.78rem;margin-top:6px">Select authentic dishes from our menu to begin ordering!</p>
      </div>
    `;
    if (ftr) ftr.style.display = 'none';
    return;
  }

  let sub = 0;
  items.innerHTML = keys.map(k => {
    const it = cart[k];
    const line = it.price * it.qty;
    sub += line;
    return `
      <div class="cart-item">
        <div class="ci-info">
          <h4>${it.name}</h4>
          <span>&#8377;${it.price} &times; ${it.qty} = <b style="color:var(--gold)">&#8377;${line}</b></span>
        </div>
        <div class="ci-qty">
          <button onclick="cartQty('${k}',-1)">&#8722;</button>
          <span>${it.qty}</span>
          <button onclick="cartQty('${k}',1)">+</button>
        </div>
        <button class="ci-del" onclick="cartDel('${k}')" title="Remove item">&#128465;</button>
      </div>
    `;
  }).join('');

  if (ftr) {
    ftr.style.display = 'block';
    const gst = Math.round(sub * 0.05);
    const total = sub + gst;
    const subEl = document.getElementById('cartSub');
    const gstEl = document.getElementById('cartGst');
    const totEl = document.getElementById('cartTot');
    if (subEl) subEl.textContent = '₹' + sub;
    if (gstEl) gstEl.textContent = '₹' + gst;
    if (totEl) totEl.textContent = '₹' + total;
  }
}

function toggleCart() {
  document.getElementById('cartSidebar')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('open');
}

// ── STEP 1: Delivery Address Form Modal ─────────────────────
function initiatePayment() {
  const keys = Object.keys(cart);
  if (!keys.length) {
    showToast('Please add delicious food items to your cart first!');
    return;
  }

  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user) {
    if (typeof requireLoginModal === 'function') {
      requireLoginModal(() => initiatePayment());
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  let sub = Object.values(cart).reduce((a, i) => a + (i.price * i.qty), 0);
  const gst = Math.round(sub * 0.05);
  const total = sub + gst;

  openDeliveryAddressModal(total, gst, sub, user);
}

function openDeliveryAddressModal(total, gst, sub, user) {
  let modal = document.getElementById('deliveryAddressModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deliveryAddressModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);overflow-y:auto';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#180C06;border:1px solid rgba(212,175,55,0.4);max-width:520px;width:100%;padding:28px 24px;border-radius:8px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <button onclick="document.getElementById('deliveryAddressModal').style.display='none'" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:1.5rem;cursor:pointer;line-height:1">&times;</button>
      
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2rem;color:var(--saffron);margin-bottom:4px">&#128666;</div>
        <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.5rem;margin:0 0 4px">Doorstep Delivery Address</h2>
        <p style="color:var(--muted);font-size:0.8rem">Enter your location to proceed to payment</p>
      </div>

      <form id="deliveryAddressForm" onsubmit="handleDeliverySubmit(event, ${total}, ${gst}, ${sub})">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Full Name *</label>
            <input type="text" id="delName" required value="${user ? (user.name || '') : ''}" placeholder="e.g. Rahul Sharma"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
          </div>
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Mobile Number *</label>
            <input type="tel" id="delPhone" required placeholder="10-digit mobile" maxlength="10" pattern="[0-9]{10}"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Flat / House No. / Building / Street Address *</label>
          <input type="text" id="delStreet" required placeholder="e.g. Flat 402, Block B, Royal Palms, Main Road"
            style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">City *</label>
            <input type="text" id="delCity" required value="Delhi"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
          </div>
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Pincode *</label>
            <input type="text" id="delPincode" required placeholder="e.g. 110006" maxlength="6" pattern="[0-9]{6}"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
          </div>
        </div>

        <div style="margin-bottom:16px">
          <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Landmark / Delivery Instructions (Optional)</label>
          <input type="text" id="delNotes" placeholder="e.g. Near Metro Gate 2, Ring bell on 4th floor"
            style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.14);color:#fff;padding:10px;font-size:0.85rem;border-radius:4px;outline:none"/>
        </div>

        <div style="background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.3);padding:10px 14px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
          <div>
            <div style="font-size:0.82rem;color:#fff;font-weight:600">Total Payable Amount</div>
            <div style="font-size:0.7rem;color:var(--muted)">Includes food subtotal + 5% GST</div>
          </div>
          <b style="color:var(--gold);font-size:1.3rem">&#8377;${total}</b>
        </div>

        <button type="submit" class="btn btn-saffron w100" style="padding:14px;font-size:0.85rem;font-weight:700;letter-spacing:1.5px;border-radius:4px">
          &#128247; Proceed to Payment &rarr;
        </button>
      </form>
    </div>
  `;
  modal.style.display = 'flex';
}

function handleDeliverySubmit(e, total, gst, sub) {
  e.preventDefault();
  currentDeliveryAddress = {
    name: document.getElementById('delName').value.trim(),
    phone: document.getElementById('delPhone').value.trim(),
    street: document.getElementById('delStreet').value.trim(),
    city: document.getElementById('delCity').value.trim(),
    pincode: document.getElementById('delPincode').value.trim(),
    notes: document.getElementById('delNotes').value.trim()
  };

  document.getElementById('deliveryAddressModal').style.display = 'none';
  openCompletePaymentPortal(total, gst, sub);
}

// ── STEP 2: CLEAN DYNAMIC UPI QR & 1-TAP APP PAYMENT PORTAL ──
function openCompletePaymentPortal(total, gst, sub) {
  let modal = document.getElementById('mainPaymentPortalModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mainPaymentPortalModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;backdrop-filter:blur(8px);overflow-y:auto';
    document.body.appendChild(modal);
  }

  const orderRef = 'SR-' + Date.now().toString().slice(-6);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(RESTAURANT_UPI_ID)}&pn=Spice%20Route%20Restaurant&am=${total}&cu=INR&tn=Order%20${orderRef}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}&margin=10`;

  modal.innerHTML = `
    <div style="background:#180C06;border:1.5px solid var(--gold);max-width:620px;width:100%;max-height:92vh;overflow-y:auto;padding:24px 20px;border-radius:10px;position:relative;box-shadow:0 24px 70px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <button onclick="document.getElementById('mainPaymentPortalModal').style.display='none'" style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--muted);font-size:1.5rem;cursor:pointer;line-height:1">&times;</button>
      
      <!-- TOP BANNER -->
      <div style="text-align:center;border-bottom:1px solid rgba(212,175,55,0.25);padding-bottom:12px;margin-bottom:16px">
        <div style="font-size:1.8rem;color:var(--saffron);margin-bottom:2px">&#2384;</div>
        <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.4rem;margin:0 0 4px">Pay with UPI / QR Code</h2>
        <div style="background:rgba(232,98,26,0.14);border:1px solid rgba(232,98,26,0.4);padding:6px 14px;border-radius:6px;display:inline-block;margin-top:4px">
          <span style="color:var(--muted);font-size:0.78rem">Order #${orderRef} &bull; Total Amount: </span>
          <b style="color:var(--gold);font-size:1.35rem">&#8377;${total}</b>
          <span style="font-size:0.72rem;color:var(--muted)"> (incl. 5% GST)</span>
        </div>
      </div>

      <!-- MAIN PAYMENT CONTENT -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;align-items:center;margin-bottom:20px">
        
        <!-- QR CODE COLUMN -->
        <div style="text-align:center;background:#231209;border:1px solid rgba(212,175,55,0.3);padding:14px;border-radius:8px">
          <div style="font-size:0.72rem;letter-spacing:1px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:8px">&#128247; Scan to Pay &#8377;${total}</div>
          
          <div style="background:#fff;padding:10px;display:inline-block;border-radius:8px;border:3px solid var(--gold);box-shadow:0 8px 24px rgba(0,0,0,0.6);margin-bottom:8px">
            <img src="${qrImgUrl}" alt="Dynamic UPI QR Code" style="width:170px;height:170px;display:block;margin:0 auto"/>
          </div>

          <p style="color:#fff;font-size:0.75rem;font-weight:600;margin-bottom:4px">Scan with GPay, PhonePe, Paytm, BHIM or CRED</p>
          <div style="background:#180C06;border:1px solid rgba(255,255,255,0.1);padding:5px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:6px;font-size:0.72rem">
            <span style="color:var(--muted)">UPI ID:</span>
            <b style="color:var(--gold);word-break:break-all">${RESTAURANT_UPI_ID}</b>
            <button onclick="navigator.clipboard.writeText('${RESTAURANT_UPI_ID}');showToast('UPI ID copied!')" style="background:none;border:none;color:var(--saffron);cursor:pointer;font-size:0.7rem;text-decoration:underline">Copy</button>
          </div>
        </div>

        <!-- 1-TAP APP BUTTONS -->
        <div>
          <div style="font-size:0.72rem;letter-spacing:1px;text-transform:uppercase;color:var(--saffron);font-weight:700;margin-bottom:8px">&#9889; Or Tap to Pay Directly in App</div>
          
          <div style="display:flex;flex-direction:column;gap:8px">
            <a href="${upiUrl}" style="background:#202124;border:1.5px solid #4285F4;padding:10px 12px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;text-decoration:none">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#4285F4;font-size:1rem">G</div>
                <div>
                  <b style="color:#fff;font-size:0.85rem;display:block">Google Pay</b>
                  <span style="color:#A8C7FA;font-size:0.68rem">Open Google Pay</span>
                </div>
              </div>
              <span style="background:#4285F4;color:#fff;padding:5px 10px;font-size:0.72rem;font-weight:700;border-radius:3px">Pay &#8377;${total}</span>
            </a>

            <a href="${upiUrl}" style="background:#1e0f33;border:1.5px solid #5f259f;padding:10px 12px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;text-decoration:none">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;background:#5f259f;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1rem">&#8377;</div>
                <div>
                  <b style="color:#fff;font-size:0.85rem;display:block">PhonePe</b>
                  <span style="color:#d1b3ff;font-size:0.68rem">Open PhonePe</span>
                </div>
              </div>
              <span style="background:#5f259f;color:#fff;padding:5px 10px;font-size:0.72rem;font-weight:700;border-radius:3px">Pay &#8377;${total}</span>
            </a>

            <a href="${upiUrl}" style="background:#091d30;border:1.5px solid #00b9f5;padding:10px 12px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;text-decoration:none">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;background:#00b9f5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1rem">P</div>
                <div>
                  <b style="color:#fff;font-size:0.85rem;display:block">Paytm UPI</b>
                  <span style="color:#9be2ff;font-size:0.68rem">Open Paytm</span>
                </div>
              </div>
              <span style="background:#00b9f5;color:#fff;padding:5px 10px;font-size:0.72rem;font-weight:700;border-radius:3px">Pay &#8377;${total}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- DIRECT 1-CLICK CONFIRMATION & BILL DOWNLOAD -->
      <div style="text-align:center;margin-bottom:8px">
        <button onclick="finishUpiPayment('${orderRef}', ${total}, ${gst}, ${sub})" class="btn btn-saffron" style="width:100%;padding:15px;font-size:0.95rem;font-weight:700;letter-spacing:1px;border-radius:4px;box-shadow:0 6px 20px rgba(232,98,26,0.45)">
          &#10004; Payment Completed &mdash; View / Download Bill (PDF) &rarr;
        </button>
      </div>

      <!-- FOOTER NOTE -->
      <div style="text-align:center;font-size:0.7rem;color:var(--muted)">
        &#128274; Instant Doorstep Delivery &bull; Real-time Kitchen Order Dispatch &bull; Official Tax Invoice
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function finishUpiPayment(orderRef, total, gst, sub) {
  const paymentId = 'PAY_' + orderRef;
  
  const modal = document.getElementById('mainPaymentPortalModal');
  if (modal) modal.style.display = 'none';

  onPaymentSuccess(paymentId, total, gst, sub, 'UPI Payment');
}

// ── STEP 3: Payment Success Confirmation Screen ─────────────
function onPaymentSuccess(paymentId, total, gst, sub, method) {
  const pModal = document.getElementById('mainPaymentPortalModal');
  if (pModal) pModal.style.display = 'none';

  saveOrderToDatabase(paymentId, total, gst, sub, method);
  showCustomerSuccessScreen(paymentId, total, gst, sub);
  clearCart();
  toggleCart();
}

function showCustomerSuccessScreen(paymentId, total, gst, sub) {
  let overlay = document.getElementById('customerSuccessModal');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'customerSuccessModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);overflow-y:auto';
  
  const addr = currentDeliveryAddress || { name: 'Valued Customer', phone: '', street: 'Delivery Address', city: 'Delhi', pincode: '110006' };
  
  overlay.innerHTML = `
    <div style="background:#180C06;border:2px solid #4CAF50;max-width:540px;width:100%;padding:32px 24px;border-radius:10px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <div style="width:70px;height:70px;background:rgba(76,175,80,0.18);border:2.5px solid #4CAF50;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 14px;color:#4CAF50;box-shadow:0 0 25px rgba(76,175,80,0.4)">
        &#10004;
      </div>

      <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.75rem;margin:0 0 4px">Payment Successful!</h2>
      <p style="color:#4CAF50;font-size:0.88rem;font-weight:600;margin-bottom:18px">&#127859; Order Placed &amp; Dispatched to Kitchen</p>

      <!-- LIVE PROGRESS TRACKER -->
      <div style="background:#231209;border:1px solid rgba(255,255,255,0.08);padding:14px 12px;border-radius:6px;margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;position:relative">
          <div style="text-align:center;flex:1">
            <div style="width:22px;height:22px;background:#4CAF50;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;margin:0 auto 4px;font-weight:700">&#10003;</div>
            <span style="font-size:0.68rem;color:#4CAF50;font-weight:600">Paid &amp; Placed</span>
          </div>
          <div style="height:2px;background:#4CAF50;flex:1;margin-bottom:14px"></div>
          <div style="text-align:center;flex:1">
            <div style="width:22px;height:22px;background:var(--saffron);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;margin:0 auto 4px;font-weight:700">&#127859;</div>
            <span style="font-size:0.68rem;color:var(--saffron);font-weight:600">In Tandoor Prep</span>
          </div>
          <div style="height:2px;background:rgba(255,255,255,0.15);flex:1;margin-bottom:14px"></div>
          <div style="text-align:center;flex:1">
            <div style="width:22px;height:22px;background:#333;color:var(--muted);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;margin:0 auto 4px">&#128666;</div>
            <span style="font-size:0.68rem;color:var(--muted)">Doorstep (30-45m)</span>
          </div>
        </div>
      </div>

      <!-- TRANSACTION SUMMARY -->
      <div style="background:#231209;border:1px solid rgba(255,255,255,0.08);padding:16px;border-radius:6px;text-align:left;font-size:0.82rem;margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:var(--muted)">Payment Reference ID:</span>
          <b style="color:#fff;font-family:monospace">${paymentId}</b>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:var(--muted)">Total Amount Paid:</span>
          <b style="color:var(--gold);font-size:1.05rem">&#8377;${total} <span style="font-size:0.7rem;color:var(--muted)">(5% GST incl.)</span></b>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0"/>
        <div style="color:var(--muted);font-size:0.78rem">
          <b style="color:#fff">Delivery To:</b> ${addr.name} &bull; <span style="color:var(--gold)">📞 ${addr.phone}</span><br/>
          ${addr.street}, ${addr.city} &mdash; ${addr.pincode}
        </div>
      </div>

      <!-- ACTION BUTTONS: VIEW & DOWNLOAD BILL -->
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button onclick="downloadBill('${paymentId}', ${total}, ${gst}, ${sub})" class="btn btn-saffron" style="padding:12px 24px;font-size:0.88rem;font-weight:700;border-radius:4px;box-shadow:0 6px 20px rgba(232,98,26,0.4)">
          &#128196; View &amp; Download Bill (PDF)
        </button>
        <button onclick="document.getElementById('customerSuccessModal').remove()" class="btn btn-ghost" style="padding:12px 20px;font-size:0.82rem;border-radius:4px">
          Continue Browsing
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Automatically open the tax invoice
  setTimeout(() => {
    downloadBill(paymentId, total, gst, sub);
  }, 800);
}

function saveOrderToDatabase(paymentId, total, gst, sub, method) {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  const orderData = {
    paymentId,
    paymentMethod: method || 'UPI Payment',
    customer: {
      name: currentDeliveryAddress ? currentDeliveryAddress.name : (user ? user.name : 'Valued Customer'),
      email: user ? (user.email || '') : '',
      phone: currentDeliveryAddress ? currentDeliveryAddress.phone : ''
    },
    deliveryAddress: currentDeliveryAddress || {},
    items: Object.values(cart).map(i => ({ name: i.name, price: i.price, qty: i.qty })),
    subtotal: sub,
    gst,
    total,
    status: 'Paid & In Preparation',
    createdAt: new Date().toISOString()
  };

  try {
    const list = JSON.parse(localStorage.getItem('spiceRoute_db_orders') || '[]');
    list.unshift(orderData);
    localStorage.setItem('spiceRoute_db_orders', JSON.stringify(list));
  } catch(e) {}

  if (typeof ordersCol !== 'undefined' && ordersCol && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    ordersCol.add({
      ...orderData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.warn('Firestore order save error:', err));
  }
}

// ── STEP 4: Official Itemized GST Tax Invoice / Bill PDF Generator & Viewer ──
function downloadBill(paymentId, total, gst, sub) {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const savedOrders = JSON.parse(localStorage.getItem('spiceRoute_db_orders') || '[]');
  const lastOrder = savedOrders[0];
  const items = (lastOrder && lastOrder.items) ? lastOrder.items : Object.values(cart);
  const addr = (lastOrder && lastOrder.deliveryAddress) ? lastOrder.deliveryAddress : (currentDeliveryAddress || {});

  let rows = '';
  items.forEach(it => {
    const line = it.price * it.qty;
    rows += `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;font-size:0.9rem"><b>${it.name}</b></td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:center;font-size:0.9rem">${it.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:right;font-size:0.9rem">&#8377;${it.price}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:right;font-size:0.9rem"><b>&#8377;${line}</b></td>
      </tr>
    `;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Tax Invoice &mdash; Spice Route Restaurant</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Georgia,serif;padding:36px;color:#1a0e08;background:#fff;max-width:760px;margin:0 auto}
  .header{text-align:center;border-bottom:3px solid #E8621A;padding-bottom:18px;margin-bottom:20px;position:relative}
  .logo{font-size:2.4rem;color:#E8621A;font-weight:700;letter-spacing:2px}
  .sub{color:#666;font-size:0.84rem;margin-top:3px}
  .paid-stamp{display:inline-block;border:2.5px solid #4CAF50;color:#4CAF50;padding:5px 18px;font-size:0.92rem;font-weight:800;letter-spacing:3px;margin-top:10px;border-radius:4px;transform:rotate(-2deg)}
  .order-meta{display:flex;justify-content:space-between;background:#fdf7f0;padding:14px 18px;border-left:4px solid #E8621A;margin-bottom:18px;font-size:0.86rem;border-radius:4px}
  table{width:100%;border-collapse:collapse;margin:18px 0}
  th{background:#E8621A;color:#fff;padding:11px 12px;font-size:0.84rem;text-align:left;letter-spacing:1px;text-transform:uppercase}
  tr:nth-child(even) td{background:#fcf9f5}
  .sum-row td{border:none;padding:7px 12px;color:#555;font-size:0.88rem}
  .total-row td{border-top:2px solid #E8621A;border-bottom:2px solid #E8621A;font-weight:800;font-size:1.15rem;color:#E8621A;padding:12px}
  .footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e0d0c0;font-size:0.8rem;color:#777;line-height:1.8}
  @media print{.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <div class="logo">&#2384; Spice Route</div>
  <div class="sub"><b>Authentic Indian Cuisine &bull; Doorstep Delivery Kitchen</b></div>
  <div class="sub">12, Chandni Chowk Lane, Old Delhi &mdash; 110006 | Helpline: +91 98765 43210</div>
  <div class="sub">GSTIN: <b>07AABCS1234Z1ZA</b> &bull; FSSAI Lic. No: <b>10019011005678</b></div>
  <div><span class="paid-stamp">PAID &amp; CONFIRMED &#10004;</span></div>
</div>

<div class="order-meta">
  <div>
    <b>Invoice No:</b> INV-${paymentId.slice(-8).toUpperCase()}<br/>
    <b>Payment Reference:</b> ${paymentId}<br/>
    <b>Transaction Date:</b> ${now}<br/>
    <b>Status:</b> <span style="color:#4CAF50;font-weight:700">Confirmed (Paid Online)</span>
  </div>
  <div style="text-align:right">
    <b>Deliver To:</b> ${addr.name || 'Valued Customer'}<br/>
    <b>Contact Phone:</b> ${addr.phone || 'N/A'}<br/>
    <b>Address:</b> ${addr.street || ''}, ${addr.city || 'Delhi'} ${addr.pincode ? '&mdash; ' + addr.pincode : ''}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:45%">Dish Item</th>
      <th style="text-align:center;width:15%">Qty</th>
      <th style="text-align:right;width:20%">Rate (&#8377;)</th>
      <th style="text-align:right;width:20%">Amount (&#8377;)</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="sum-row">
      <td colspan="3" style="text-align:right">Food Subtotal:</td>
      <td style="text-align:right">&#8377;${sub}</td>
    </tr>
    <tr class="sum-row">
      <td colspan="3" style="text-align:right">CGST @ 2.5%:</td>
      <td style="text-align:right">&#8377;${Math.round(gst / 2)}</td>
    </tr>
    <tr class="sum-row">
      <td colspan="3" style="text-align:right">SGST @ 2.5%:</td>
      <td style="text-align:right">&#8377;${Math.round(gst / 2)}</td>
    </tr>
    <tr class="total-row">
      <td colspan="3" style="text-align:right">Grand Total Paid:</td>
      <td style="text-align:right">&#8377;${total}</td>
    </tr>
  </tbody>
</table>

<div class="footer">
  <b>Thank you for ordering with Spice Route!</b><br/>
  Your food is being prepared fresh and will be delivered in thermal insulated packaging.<br/>
  For delivery support, contact <b>+91 98765 43210</b> or <b>orders@spiceroute.in</b>
</div>

<br/>
<div style="text-align:center" class="no-print">
  <button onclick="window.print()" style="background:#E8621A;color:#fff;border:none;padding:12px 30px;font-size:0.95rem;font-weight:700;cursor:pointer;border-radius:4px">
    &#128424; Print Tax Invoice / Save PDF
  </button>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#E8621A;color:#fff;padding:12px 24px;font-family:Poppins,sans-serif;font-size:0.85rem;font-weight:500;z-index:999999;border-radius:4px;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2)';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s ease'; }, 2400);
  setTimeout(() => t.remove(), 2900);
}

// ── Ingredients & Nutrition Modal ───────────────────────────
function openModal(id) {
  const d = window.ALL_DISHES?.find(x => x.id === id);
  if (!d) return;
  const ov = document.getElementById('modalOverlay');
  if (!ov) return;
  
  const imgEl = document.getElementById('modalImg');
  const fallbackEl = document.getElementById('modalImgFallback');
  if (imgEl && fallbackEl) {
    imgEl.src = d.img;
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
      fallbackEl.style.display = 'flex';
      fallbackEl.innerHTML = d.emoji;
    };
    imgEl.style.display = 'block';
    fallbackEl.style.display = 'none';
  }

  const badge = document.getElementById('modalBadge');
  if (badge) {
    badge.textContent = d.badge;
    badge.className = 'modal-badge ' + (d.badge === 'VEG' ? 'veg' : 'nonveg');
  }
  
  document.getElementById('modalRegion') && (document.getElementById('modalRegion').textContent = d.region);
  document.getElementById('modalName') && (document.getElementById('modalName').textContent = d.name);
  document.getElementById('modalDesc') && (document.getElementById('modalDesc').textContent = d.desc);
  
  const ingEl = document.getElementById('modalIngredients');
  if (ingEl) ingEl.innerHTML = d.ingredients.map(i => `<span>${i}</span>`).join('');

  document.getElementById('mnCal') && (document.getElementById('mnCal').textContent = d.cal);
  document.getElementById('mnProtein') && (document.getElementById('mnProtein').textContent = d.protein);
  document.getElementById('mnCarbs') && (document.getElementById('mnCarbs').textContent = d.carbs);
  document.getElementById('mnFat') && (document.getElementById('mnFat').textContent = d.fat);
  document.getElementById('modalPrice') && (document.getElementById('modalPrice').innerHTML = '&#8377;' + d.price);
  document.getElementById('modalSpice') && (document.getElementById('modalSpice').textContent = 'Spice Level: ' + d.spice);

  const addBtn = document.getElementById('modalAddBtn');
  if (addBtn) {
    addBtn.textContent = '+ Add to Cart';
    addBtn.style.background = '';
    addBtn.onclick = () => {
      addToCart(null, id, d.name, d.price);
      addBtn.textContent = 'Added!';
      addBtn.style.background = '#4CAF50';
      setTimeout(() => { addBtn.textContent = '+ Add to Cart'; addBtn.style.background = ''; }, 1000);
    };
  }

  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── DOM Content Loaded Lifecycle ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();

  const nb = document.getElementById('navbar');
  if (nb) {
    window.addEventListener('scroll', () => {
      nb.classList.toggle('scrolled', window.scrollY > 50);
      const tb = document.getElementById('topBtn');
      if (tb) tb.classList.toggle('show', window.scrollY > 400);
    });
  }

  const hb = document.getElementById('hamburger');
  const nl = document.getElementById('navLinks');
  if (hb && nl) {
    hb.addEventListener('click', () => nl.classList.toggle('open'));
    nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nl.classList.remove('open')));
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach((en, i) => {
      if (en.isIntersecting) setTimeout(() => en.target.classList.add('visible'), i * 60);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  document.querySelectorAll('.mtab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(btn.dataset.tab);
      if (pane) {
        pane.classList.add('active');
        pane.querySelectorAll('.fade-in').forEach((el, i) => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), i * 40);
        });
      }
    });
  });

  const ctForm = document.getElementById('contactForm');
  if (ctForm) ctForm.addEventListener('submit', submitContact);
});

function submitContact(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {
    name: fd.get('name') || '',
    email: fd.get('email') || '',
    subject: fd.get('subject') || '',
    message: fd.get('message') || '',
    createdAt: new Date().toISOString()
  };

  try {
    const list = JSON.parse(localStorage.getItem('spiceRoute_db_contacts') || '[]');
    list.unshift(data);
    localStorage.setItem('spiceRoute_db_contacts', JSON.stringify(list));
  } catch(e) {}

  const form = document.getElementById('contactForm');
  const succ = document.getElementById('contactSuccess');
  if (form && succ) {
    form.style.opacity = '0';
    setTimeout(() => { form.style.display = 'none'; succ.style.display = 'block'; }, 300);
  }

  if (typeof contactsCol !== 'undefined' && contactsCol && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    contactsCol.add(data).catch(err => console.warn('Firebase contact save error:', err));
  }
}

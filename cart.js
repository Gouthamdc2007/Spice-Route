// ============================================================
//  cart.js — Cart, Delivery Address, GPay, PhonePe, Paytm & Bill
// ============================================================

// ── PAYMENT CONFIGURATION ──────────────────────────────────
const RAZORPAY_KEY_ID = 'rzp_test_TUjGfgBnKBC8pe';
const RESTAURANT_UPI_ID = 'spiceroute.restaurant@okhdfcbank';

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
  const total = Object.values(cart).reduce((a,i) => a + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

// ── Add to Cart (Requires Google Login) ─────────────────────
function addToCart(e, id, name, price) {
  if (e) e.stopPropagation();

  if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
    if (typeof requireLoginModal === 'function') {
      requireLoginModal(() => addToCart(null, id, name, price));
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  const qtyEl = document.getElementById('qty-' + id);
  const qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
  if (cart[id]) cart[id].qty += qty;
  else cart[id] = { name, price, qty };
  saveCart();
  renderCart();
  
  const btn = e && e.target;
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Added!';
    btn.style.background = '#4CAF50';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1000);
  }
  showToast(name + ' added to cart!');
}

function changeQty(e, id, delta) {
  if (e) e.stopPropagation();
  const el = document.getElementById('qty-' + id);
  if (!el) return;
  let v = parseInt(el.textContent) + delta;
  if (v < 1) v = 1;
  el.textContent = v;
}
function cartQty(id, delta) {
  cart[id].qty += delta;
  if (cart[id].qty < 1) delete cart[id];
  saveCart();
  renderCart();
}
function cartDel(id) { delete cart[id]; saveCart(); renderCart(); }
function clearCart()  { cart = {}; saveCart(); renderCart(); }

function renderCart() {
  const items = document.getElementById('cartItems');
  const ftr   = document.getElementById('cartFtr');
  if (!items) return;
  const keys  = Object.keys(cart);
  updateCartCount();
  if (!keys.length) {
    items.innerHTML = '<p class="cart-empty">Your cart is empty.<br/>Select delicious dishes from our menu to order!</p>';
    if (ftr) ftr.style.display = 'none';
    return;
  }
  let sub = 0;
  items.innerHTML = keys.map(k => {
    const it = cart[k];
    const line = it.price * it.qty;
    sub += line;
    return `<div class="cart-item">
      <div class="ci-info"><h4>${it.name}</h4><span>&#8377;${it.price} &times; ${it.qty} = <b>&#8377;${line}</b></span></div>
      <div class="ci-qty">
        <button onclick="cartQty('${k}',-1)">&#8722;</button>
        <span>${it.qty}</span>
        <button onclick="cartQty('${k}',1)">+</button>
      </div>
      <button class="ci-del" onclick="cartDel('${k}')" title="Remove">&#128465;</button>
    </div>`;
  }).join('');
  if (ftr) {
    ftr.style.display = 'block';
    const gst   = Math.round(sub * 0.05);
    const total = sub + gst;
    document.getElementById('cartSub') && (document.getElementById('cartSub').textContent = '\u20B9' + sub);
    document.getElementById('cartGst') && (document.getElementById('cartGst').textContent = '\u20B9' + gst);
    document.getElementById('cartTot') && (document.getElementById('cartTot').textContent = '\u20B9' + total);
  }
}

function toggleCart() {
  document.getElementById('cartSidebar')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('open');
}

// ── STEP 1: Click Checkout -> Open Delivery Address Modal ───
function initiatePayment() {
  const keys = Object.keys(cart);
  if (!keys.length) { showToast('Add items to cart first!'); return; }

  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user) {
    if (typeof requireLoginModal === 'function') {
      requireLoginModal(() => initiatePayment());
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  let sub = Object.values(cart).reduce((a,i) => a + (i.price * i.qty), 0);
  const gst   = Math.round(sub * 0.05);
  const total = sub + gst;

  openDeliveryAddressModal(total, gst, sub, user);
}

// ── STEP 2: Delivery Address Form Modal ─────────────────────
function openDeliveryAddressModal(total, gst, sub, user) {
  let modal = document.getElementById('deliveryAddressModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deliveryAddressModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);overflow-y:auto';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#180C06;border:1px solid rgba(212,175,55,0.35);max-width:520px;width:100%;padding:32px 26px;border-radius:6px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <button onclick="document.getElementById('deliveryAddressModal').style.display='none'" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--muted);font-size:1.4rem;cursor:pointer;line-height:1">&times;</button>
      
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:1.8rem;color:var(--saffron);margin-bottom:2px">&#128666;</div>
        <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.5rem;margin:0 0 4px">Delivery Address</h2>
        <p style="color:var(--muted);font-size:0.82rem">Enter your delivery details to proceed to payment</p>
      </div>

      <form id="deliveryAddressForm" onsubmit="handleDeliverySubmit(event, ${total}, ${gst}, ${sub})">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Full Name *</label>
            <input type="text" id="delName" required value="${user ? user.name : ''}" placeholder="e.g. Rahul Sharma"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
          </div>
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Phone Number *</label>
            <input type="tel" id="delPhone" required placeholder="e.g. 9876543210" maxlength="10"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Flat / House No. / Building / Street Address *</label>
          <input type="text" id="delStreet" required placeholder="e.g. Flat 402, Royal Enclave, Chandni Chowk"
            style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">City *</label>
            <input type="text" id="delCity" required value="Delhi"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
          </div>
          <div>
            <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Pincode *</label>
            <input type="text" id="delPincode" required placeholder="e.g. 110006" maxlength="6"
              style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <label style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--saffron);display:block;margin-bottom:5px">Landmark / Delivery Instructions (Optional)</label>
          <input type="text" id="delNotes" placeholder="e.g. Near Metro Gate 2, Ring the bell"
            style="width:100%;background:#231209;border:1px solid rgba(255,255,255,0.12);color:#fff;padding:10px;font-size:0.85rem;border-radius:3px;outline:none"/>
        </div>

        <div style="background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);padding:10px 14px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
          <span style="font-size:0.82rem;color:#E5D5C5">Total Payable (incl. GST):</span>
          <b style="color:var(--gold);font-size:1.25rem">&#8377;${total}</b>
        </div>

        <button type="submit" class="btn btn-saffron w100" style="padding:14px;font-size:0.85rem;font-weight:700;letter-spacing:1.5px">
          Proceed to Payment &rarr;
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
  openPaymentPortal(total, gst, sub);
}

// ── STEP 3: Payment Portal (Dedicated GPay, PhonePe, Paytm, QR & Razorpay) ──
function openPaymentPortal(total, gst, sub) {
  let modal = document.getElementById('upiPaymentModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'upiPaymentModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);overflow-y:auto';
    document.body.appendChild(modal);
  }

  const orderNum = 'SR' + Math.floor(100000 + Math.random() * 900000);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(RESTAURANT_UPI_ID)}&pn=Spice%20Route&am=${total}&cu=INR&tn=Order%20${orderNum}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}&margin=10`;

  modal.innerHTML = `
    <div style="background:#180C06;border:1px solid rgba(212,175,55,0.35);max-width:520px;width:100%;padding:28px 24px;border-radius:6px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <button onclick="document.getElementById('upiPaymentModal').style.display='none'" style="position:absolute;top:12px;right:14px;background:none;border:none;color:var(--muted);font-size:1.4rem;cursor:pointer;line-height:1">&times;</button>
      
      <!-- HEADER -->
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:1.8rem;color:var(--saffron);margin-bottom:2px">&#2384;</div>
        <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.45rem;margin:0 0 4px">Payment Portal</h2>
        <div style="background:rgba(232,98,26,0.12);border:1px solid rgba(232,98,26,0.35);padding:8px 14px;border-radius:4px;display:inline-block;margin-top:4px">
          <span style="color:var(--muted);font-size:0.82rem">Payable Amount: </span>
          <b style="color:var(--gold);font-size:1.35rem">&#8377;${total}</b>
          <span style="font-size:0.75rem;color:var(--muted)"> (incl. 5% GST)</span>
        </div>
      </div>

      <!-- PAYMENT APP OPTIONS (GPAY, PHONEPE, PAYTM, QR) -->
      <div style="display:flex;gap:6px;margin-bottom:16px;background:#231209;padding:4px;border-radius:4px">
        <button onclick="switchPayTab('apps', ${total}, ${gst}, ${sub})" id="tabBtnApps" style="flex:1;background:var(--saffron);color:#fff;border:none;padding:10px 4px;font-size:0.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:0.2s">
          &#9889; GPay / PhonePe / Paytm
        </button>
        <button onclick="switchPayTab('qr', ${total}, ${gst}, ${sub})" id="tabBtnQR" style="flex:1;background:transparent;color:var(--muted);border:none;padding:10px 4px;font-size:0.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:0.2s">
          &#128247; Scan QR Code
        </button>
        <button onclick="switchPayTab('cards', ${total}, ${gst}, ${sub})" id="tabBtnCards" style="flex:1;background:transparent;color:var(--muted);border:none;padding:10px 4px;font-size:0.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:0.2s">
          &#128179; Card / Razorpay
        </button>
      </div>

      <!-- TAB 1: DEDICATED GPAY, PHONEPE, PAYTM -->
      <div id="payPaneApps" style="padding:6px 0">
        <p style="font-size:0.78rem;color:var(--muted);text-align:center;margin-bottom:12px">Choose your preferred UPI payment app to pay &#8377;${total}:</p>
        
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
          <!-- GOOGLE PAY (GPAY) -->
          <div onclick="selectAppPayment('Google Pay', '${orderNum}', ${total}, ${gst}, ${sub}, '${upiUrl}')" style="background:#202124;border:1.5px solid #4285F4;padding:12px 16px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:0.2s">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:32px;height:32px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#4285F4;font-size:1.1rem">G</div>
              <div>
                <b style="color:#fff;font-size:0.92rem;display:block">Google Pay (GPay)</b>
                <span style="color:#A8C7FA;font-size:0.72rem">Instant UPI payment</span>
              </div>
            </div>
            <span class="btn-saffron" style="padding:6px 14px;font-size:0.75rem;font-weight:700;border-radius:3px;display:inline-block">Pay &#8377;${total}</span>
          </div>

          <!-- PHONEPE -->
          <div onclick="selectAppPayment('PhonePe', '${orderNum}', ${total}, ${gst}, ${sub}, '${upiUrl}')" style="background:#1d1135;border:1.5px solid #5f259f;padding:12px 16px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:0.2s">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:32px;height:32px;background:#5f259f;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1.1rem">&#8377;</div>
              <div>
                <b style="color:#fff;font-size:0.92rem;display:block">PhonePe</b>
                <span style="color:#d1b3ff;font-size:0.72rem">Direct UPI checkout</span>
              </div>
            </div>
            <span style="background:#5f259f;color:#fff;padding:6px 14px;font-size:0.75rem;font-weight:700;border-radius:3px;display:inline-block">Pay &#8377;${total}</span>
          </div>

          <!-- PAYTM -->
          <div onclick="selectAppPayment('Paytm', '${orderNum}', ${total}, ${gst}, ${sub}, '${upiUrl}')" style="background:#0c2238;border:1.5px solid #00b9f5;padding:12px 16px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:0.2s">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:32px;height:32px;background:#00b9f5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:1.1rem">P</div>
              <div>
                <b style="color:#fff;font-size:0.92rem;display:block">Paytm UPI</b>
                <span style="color:#9be2ff;font-size:0.72rem">Paytm wallet / UPI</span>
              </div>
            </div>
            <span style="background:#00b9f5;color:#fff;padding:6px 14px;font-size:0.75rem;font-weight:700;border-radius:3px;display:inline-block">Pay &#8377;${total}</span>
          </div>
        </div>

        <!-- APP PAYMENT VERIFICATION BOX (DYNAMICALLY SHOWN ON CLICK) -->
        <div id="appVerificationBox" style="display:none;background:#231209;border:1px solid rgba(212,175,55,0.3);padding:14px;border-radius:6px;text-align:center;margin-bottom:12px">
          <p style="color:#4CAF50;font-weight:600;font-size:0.85rem;margin-bottom:4px" id="selectedAppNameText">Opening Google Pay...</p>
          <p style="color:var(--muted);font-size:0.75rem;margin-bottom:12px">Approve the payment request of &#8377;${total} in your app and click below:</p>
          <button onclick="onPaymentSuccess('UPI_${orderNum}', ${total}, ${gst}, ${sub})" class="btn btn-saffron w100" style="padding:12px;font-size:0.85rem;font-weight:700">
            &#10004; I Completed Payment in App &mdash; Get Bill (PDF)
          </button>
        </div>
      </div>

      <!-- TAB 2: DYNAMIC QR CODE -->
      <div id="payPaneQR" style="display:none;text-align:center;padding:10px 0">
        <div style="background:#fff;padding:12px;display:inline-block;border-radius:8px;border:3px solid var(--gold);box-shadow:0 8px 24px rgba(0,0,0,0.5);margin-bottom:10px">
          <img src="${qrImgUrl}" alt="UPI Payment QR Code" style="width:200px;height:200px;display:block"/>
        </div>
        <p style="color:#fff;font-weight:600;font-size:0.88rem;margin-bottom:2px">&#128247; Scan to Pay with Any UPI App</p>
        <p style="color:var(--muted);font-size:0.74rem;margin-bottom:12px">Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM &bull; CRED</p>
        
        <div style="background:#231209;border:1px solid rgba(255,255,255,0.08);padding:8px 12px;border-radius:4px;display:inline-flex;align-items:center;gap:8px;font-size:0.78rem;margin-bottom:14px">
          <span style="color:var(--muted)">UPI ID:</span>
          <b style="color:var(--gold)">${RESTAURANT_UPI_ID}</b>
          <button onclick="navigator.clipboard.writeText('${RESTAURANT_UPI_ID}');showToast('UPI ID copied!')" style="background:none;border:none;color:var(--saffron);cursor:pointer;font-size:0.75rem;text-decoration:underline">Copy</button>
        </div>

        <button onclick="onPaymentSuccess('QR_${orderNum}', ${total}, ${gst}, ${sub})" class="btn btn-saffron w100" style="padding:13px;font-size:0.85rem;font-weight:700">
          &#10004; I Scanned &amp; Paid &#8377;${total} &mdash; Download Bill
        </button>
      </div>

      <!-- TAB 3: CARDS & RAZORPAY -->
      <div id="payPaneCards" style="display:none;padding:10px 0;text-align:center">
        <div style="background:#231209;border:1px solid rgba(255,255,255,0.08);padding:16px;border-radius:6px;margin-bottom:14px">
          <p style="font-size:0.85rem;color:#fff;margin-bottom:6px">&#128179; Pay via Razorpay Gateway</p>
          <p style="font-size:0.75rem;color:var(--muted);margin-bottom:14px">Credit / Debit Cards, Net Banking, EMI &amp; Wallets</p>
          <button onclick="launchRazorpayCheckout('${orderNum}', ${total}, ${gst}, ${sub})" class="btn btn-saffron w100" style="padding:12px;font-size:0.85rem;font-weight:700">
            Open Razorpay Checkout Popup &rarr;
          </button>
        </div>
      </div>

      <div style="text-align:center;margin-top:12px;font-size:0.72rem;color:var(--muted)">
        &#128274; 256-bit Encrypted &bull; Instant Bill PDF &bull; Order Auto-Sent to Kitchen
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function selectAppPayment(appName, orderNum, total, gst, sub, upiUrl) {
  const box = document.getElementById('appVerificationBox');
  const txt = document.getElementById('selectedAppNameText');
  if (box && txt) {
    txt.textContent = `🚀 Payment Request for ${appName} (₹${total})`;
    box.style.display = 'block';
    window.location.href = upiUrl; // Open app if on mobile
  }
}

function launchRazorpayCheckout(orderNum, total, gst, sub) {
  const user = getCurrentUser();
  const keys = Object.keys(cart);

  if (typeof Razorpay !== 'undefined' && RAZORPAY_KEY_ID) {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: 'INR',
      name: 'Spice Route',
      description: 'Order #' + orderNum,
      image: 'images/hero-bg.jpg',
      theme: { color: '#E8621A' },
      prefill: {
        name: currentDeliveryAddress ? currentDeliveryAddress.name : (user ? user.name : ''),
        email: user ? user.email : 'customer@spiceroute.in',
        contact: currentDeliveryAddress ? currentDeliveryAddress.phone : '9876543210'
      },
      handler: function(response) {
        const pId = response.razorpay_payment_id || 'RZP_' + Date.now();
        onPaymentSuccess(pId, total, gst, sub);
      },
      modal: {
        ondismiss: function() {
          showToast('Payment window closed');
        }
      }
    };
    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch(e) {
      console.warn("Razorpay error:", e);
    }
  }
}

function switchPayTab(tab, total, gst, sub) {
  document.getElementById('tabBtnApps').style.background = tab === 'apps' ? 'var(--saffron)' : 'transparent';
  document.getElementById('tabBtnApps').style.color = tab === 'apps' ? '#fff' : 'var(--muted)';

  document.getElementById('tabBtnQR').style.background = tab === 'qr' ? 'var(--saffron)' : 'transparent';
  document.getElementById('tabBtnQR').style.color = tab === 'qr' ? '#fff' : 'var(--muted)';

  document.getElementById('tabBtnCards').style.background = tab === 'cards' ? 'var(--saffron)' : 'transparent';
  document.getElementById('tabBtnCards').style.color = tab === 'cards' ? '#fff' : 'var(--muted)';

  document.getElementById('payPaneApps').style.display = tab === 'apps' ? 'block' : 'none';
  document.getElementById('payPaneQR').style.display = tab === 'qr' ? 'block' : 'none';
  document.getElementById('payPaneCards').style.display = tab === 'cards' ? 'block' : 'none';
}

// ── STEP 4: Payment Success Screen & Customer Notification ──
function onPaymentSuccess(paymentId, total, gst, sub) {
  const pModal = document.getElementById('upiPaymentModal');
  if (pModal) pModal.style.display = 'none';

  saveOrderToDatabase(paymentId, total, gst, sub);
  showCustomerSuccessScreen(paymentId, total, gst, sub);
  clearCart();
  toggleCart();
}

function showCustomerSuccessScreen(paymentId, total, gst, sub) {
  const overlay = document.createElement('div');
  overlay.id = 'customerSuccessModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);overflow-y:auto';
  
  const addr = currentDeliveryAddress || { name: 'Customer', phone: '', street: 'Delivery Address', city: 'Delhi', pincode: '' };
  
  overlay.innerHTML = `
    <div style="background:#180C06;border:2px solid #4CAF50;max-width:540px;width:100%;padding:36px 28px;border-radius:8px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.95);color:#E5D5C5;margin:auto">
      <div style="width:70px;height:70px;background:rgba(76,175,80,0.15);border:2px solid #4CAF50;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 16px;color:#4CAF50">
        &#10004;
      </div>

      <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.8rem;margin:0 0 6px">Payment Successful!</h2>
      <p style="color:#4CAF50;font-size:0.92rem;font-weight:600;margin-bottom:18px">&#127859; Order Placed &amp; Sent to Kitchen</p>

      <div style="background:#231209;border:1px solid rgba(255,255,255,0.08);padding:16px;border-radius:6px;text-align:left;font-size:0.84rem;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:var(--muted)">Payment ID:</span>
          <b style="color:#fff">${paymentId}</b>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:var(--muted)">Total Paid:</span>
          <b style="color:var(--gold)">&#8377;${total}</b>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:var(--muted)">Estimated Delivery:</span>
          <b style="color:#4CAF50">&#9200; 30&ndash;45 Minutes</b>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:10px 0"/>
        <div style="color:var(--muted);font-size:0.78rem">
          <b>Delivery To:</b><br/>
          ${addr.name} &bull; ${addr.phone}<br/>
          ${addr.street}, ${addr.city} &mdash; ${addr.pincode}
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button onclick="downloadBill('${paymentId}', ${total}, ${gst}, ${sub})" class="btn btn-saffron" style="padding:13px 26px;font-size:0.85rem;font-weight:700">
          &#128196; Download Bill (PDF)
        </button>
        <button onclick="document.getElementById('customerSuccessModal').remove()" class="btn btn-ghost" style="padding:13px 26px;font-size:0.85rem">
          Continue Browsing
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    downloadBill(paymentId, total, gst, sub);
  }, 800);
}

function saveOrderToDatabase(paymentId, total, gst, sub) {
  const user = getCurrentUser();
  const orderData = {
    paymentId,
    customer: {
      name: currentDeliveryAddress ? currentDeliveryAddress.name : (user ? user.name : 'Customer'),
      email: user ? user.email : '',
      phone: currentDeliveryAddress ? currentDeliveryAddress.phone : ''
    },
    deliveryAddress: currentDeliveryAddress || {},
    items: Object.values(cart).map(i => ({name: i.name, price: i.price, qty: i.qty})),
    subtotal: sub,
    gst,
    total,
    status: 'Confirmed & Preparing',
    createdAt: new Date().toISOString()
  };

  try {
    const list = JSON.parse(localStorage.getItem('spiceRoute_db_orders') || '[]');
    list.unshift(orderData);
    localStorage.setItem('spiceRoute_db_orders', JSON.stringify(list));
  } catch(e){}

  if (typeof ordersCol !== 'undefined' && ordersCol && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    ordersCol.add({
      ...orderData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.warn('Firestore order save error:', err));
  }
}

function downloadBill(paymentId, total, gst, sub) {
  const now = new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'});
  const savedOrders = JSON.parse(localStorage.getItem('spiceRoute_db_orders') || '[]');
  const lastOrder = savedOrders[0];
  const items = (lastOrder && lastOrder.items) ? lastOrder.items : Object.values(cart);
  const addr = (lastOrder && lastOrder.deliveryAddress) ? lastOrder.deliveryAddress : (currentDeliveryAddress || {});

  let rows = '';
  items.forEach(it => {
    const line = it.price * it.qty;
    rows += `<tr><td>${it.name}</td><td style="text-align:center">${it.qty}</td>
      <td style="text-align:right">&#8377;${it.price}</td>
      <td style="text-align:right">&#8377;${line}</td></tr>`;
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Spice Route - Tax Invoice</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Georgia,serif;padding:36px;color:#1a0e08;background:#fff}
  .header{text-align:center;border-bottom:3px solid #E8621A;padding-bottom:18px;margin-bottom:20px}
  .logo{font-size:2.2rem;color:#E8621A;font-weight:700;letter-spacing:2px}
  .sub{color:#8B1A1A;font-size:.85rem;margin-top:4px}
  .paid-stamp{display:inline-block;border:2px solid #4CAF50;color:#4CAF50;padding:4px 16px;font-size:.9rem;font-weight:700;letter-spacing:3px;margin-top:8px;transform:rotate(-2deg)}
  .order-meta{display:flex;justify-content:space-between;background:#fdf7f0;padding:12px 16px;border-left:3px solid #E8621A;margin-bottom:16px;font-size:0.84rem}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#E8621A;color:#fff;padding:10px 12px;font-size:.85rem;text-align:left}
  td{padding:9px 12px;border-bottom:1px solid #f0e8e0;font-size:.88rem}
  tr:nth-child(even) td{background:#fdf7f0}
  .sum-row td{border:none;padding:6px 12px;color:#666;font-size:.85rem}
  .total-row td{border-top:2px solid #E8621A;font-weight:700;font-size:1.05rem;color:#E8621A;padding:10px 12px}
  .footer{text-align:center;margin-top:30px;padding-top:14px;border-top:1px solid #e0d0c0;font-size:.78rem;color:#888;line-height:1.8}
  @media print{.no-print{display:none}}
</style>
</head><body>
<div class="header">
  <div class="logo">&#2384; Spice Route</div>
  <div class="sub">Authentic Indian Cuisine &bull; Online Delivery</div>
  <div class="sub">12, Chandni Chowk Lane, Old Delhi &mdash; 110006 | +91 98765 43210</div>
  <div class="paid-stamp">PAID &amp; CONFIRMED &#10004;</div>
</div>

<div class="order-meta">
  <div>
    <b>Payment ID:</b> ${paymentId}<br/>
    <b>Date &amp; Time:</b> ${now}<br/>
    <b>Payment Gateway:</b> UPI / GPay / PhonePe / Paytm / Razorpay
  </div>
  <div style="text-align:right">
    <b>Deliver To:</b> ${addr.name || 'Customer'}<br/>
    <b>Contact:</b> ${addr.phone || 'N/A'}<br/>
    ${addr.street || ''}, ${addr.city || 'Delhi'} ${addr.pincode ? '&mdash; ' + addr.pincode : ''}
  </div>
</div>

<table>
  <tr><th style="width:40%">Item</th><th style="text-align:center;width:15%">Qty</th><th style="text-align:right;width:22%">Rate</th><th style="text-align:right;width:23%">Amount</th></tr>
  ${rows}
  <tr class="sum-row"><td colspan="3" style="text-align:right">Subtotal</td><td style="text-align:right">&#8377;${sub}</td></tr>
  <tr class="sum-row"><td colspan="3" style="text-align:right">GST @ 5%</td><td style="text-align:right">&#8377;${gst}</td></tr>
  <tr class="total-row"><td colspan="3" style="text-align:right">Total Paid</td><td style="text-align:right">&#8377;${total}</td></tr>
</table>

<div class="footer">
  Thank you for ordering with Spice Route! &bull; GSTIN: 07AABCS1234Z1ZA<br/>
  Your food is freshly prepared and will arrive within 30-45 minutes.<br/>
  hello@spiceroute.in | www.spiceroute.in
</div>

<br/>
<button class="no-print" onclick="window.print()"
  style="background:#E8621A;color:#fff;border:none;padding:12px 28px;font-size:1rem;cursor:pointer;display:block;margin:0 auto;border-radius:4px">
  &#128424; Print / Save as PDF
</button>
</body></html>`;

  const win = window.open('', '_blank', 'width=720,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#E8621A;color:#fff;padding:10px 22px;font-family:Poppins,sans-serif;font-size:.82rem;z-index:9998;border-radius:3px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.4)';
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity='0', 2200);
  setTimeout(() => t.remove(), 2600);
}

function openModal(id) {
  const d = window.ALL_DISHES?.find(x => x.id === id);
  if (!d) return;
  const ov = document.getElementById('modalOverlay');
  if (!ov) return;
  document.getElementById('modalImg').src = d.img;
  const imgEl = document.getElementById('modalImg');
  imgEl.onerror = () => {
    imgEl.style.display = 'none';
    document.getElementById('modalImgFallback').style.display = 'flex';
    document.getElementById('modalImgFallback').innerHTML = d.emoji;
  };
  imgEl.style.display = 'block';
  const badge = document.getElementById('modalBadge');
  badge.textContent = d.badge;
  badge.className = 'modal-badge ' + (d.badge === 'VEG' ? 'veg' : 'nonveg');
  document.getElementById('modalRegion').textContent = d.region;
  document.getElementById('modalName').textContent   = d.name;
  document.getElementById('modalDesc').textContent   = d.desc;
  document.getElementById('modalIngredients').innerHTML = d.ingredients.map(i => `<span>${i}</span>`).join('');
  document.getElementById('mnCal').textContent     = d.cal;
  document.getElementById('mnProtein').textContent = d.protein;
  document.getElementById('mnCarbs').textContent   = d.carbs;
  document.getElementById('mnFat').textContent     = d.fat;
  document.getElementById('modalPrice').innerHTML  = '&#8377;' + d.price;
  document.getElementById('modalSpice').textContent = 'Spice Level: ' + d.spice;
  const addBtn = document.getElementById('modalAddBtn');
  addBtn.textContent = '+ Add to Cart';
  addBtn.style.background = '';
  addBtn.onclick = () => {
    if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
      if (typeof requireLoginModal === 'function') {
        requireLoginModal(() => {
          if (cart[id]) cart[id].qty++;
          else cart[id] = { name: d.name, price: d.price, qty: 1 };
          saveCart(); renderCart();
          showToast(d.name + ' added!');
        });
      } else {
        window.location.href = 'login.html';
      }
      return;
    }
    if (cart[id]) cart[id].qty++;
    else cart[id] = { name: d.name, price: d.price, qty: 1 };
    saveCart(); renderCart();
    addBtn.textContent = 'Added!';
    addBtn.style.background = '#4CAF50';
    setTimeout(() => { addBtn.textContent = '+ Add to Cart'; addBtn.style.background = ''; }, 1000);
    showToast(d.name + ' added!');
  };
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

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
      if (en.isIntersecting) setTimeout(() => en.target.classList.add('visible'), i * 70);
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
          setTimeout(() => el.classList.add('visible'), i * 50);
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
  } catch(e){}

  const form = document.getElementById('contactForm');
  const succ = document.getElementById('contactSuccess');
  form.style.opacity = '0';
  setTimeout(() => { form.style.display = 'none'; succ.style.display = 'block'; }, 300);

  if (typeof contactsCol !== 'undefined' && contactsCol && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    contactsCol.add(data).catch(err => console.warn('Firebase error:', err));
  }
}

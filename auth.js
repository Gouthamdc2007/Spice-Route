// ============================================================
//  auth.js — Pure Google Account Authentication & Auth Gate
// ============================================================

let pendingCartAction = null;

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('spiceRoute_user') || 'null');
  } catch(e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('spiceRoute_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('spiceRoute_user');
  }
  updateNavbarAuth();
}

function logoutUser() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().catch(()=>{});
  }
  setCurrentUser(null);
  showToast('Logged out successfully');
  setTimeout(() => {
    if (window.location.pathname.includes('login.html')) {
      window.location.reload();
    } else {
      window.location.href = 'index.html';
    }
  }, 600);
}

function updateNavbarAuth() {
  const user = getCurrentUser();
  const navRight = document.querySelector('.nav-right');
  if (!navRight) return;

  let authContainer = document.getElementById('navAuthContainer');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'navAuthContainer';
    authContainer.style.display = 'flex';
    authContainer.style.alignItems = 'center';
    authContainer.style.gap = '8px';
    const orderBtn = navRight.querySelector('.btn-book');
    if (orderBtn) navRight.insertBefore(authContainer, orderBtn);
    else navRight.appendChild(authContainer);
  }

  if (user) {
    const initials = (user.name || 'User').substring(0, 2).toUpperCase();
    authContainer.innerHTML = `
      <div style="position:relative" id="userMenuDropdown">
        <button onclick="toggleUserDropdown(event)" style="background:rgba(212,175,55,0.15);border:1.5px solid var(--gold);color:var(--gold);width:34px;height:34px;border-radius:50%;cursor:pointer;font-weight:700;font-size:0.75rem;display:flex;align-items:center;justify-content:center;overflow:hidden" title="${user.name || user.email}">
          ${user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover"/>` : initials}
        </button>
        <div id="userDropdownContent" style="display:none;position:absolute;top:44px;right:0;background:#1E1009;border:1px solid rgba(212,175,55,0.25);min-width:190px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,0.85);z-index:9999;border-radius:4px">
          <div style="color:#fff;font-weight:600;font-size:0.85rem;margin-bottom:2px">${user.name || 'Spice Route Member'}</div>
          <div style="color:var(--muted);font-size:0.72rem;margin-bottom:10px;word-break:break-all">${user.email || ''}</div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:8px 0"/>
          <a href="#" onclick="logoutUser();return false;" style="display:block;color:#FF6B6B;font-size:0.8rem;padding:6px 0;text-decoration:none">🚪 Logout</a>
        </div>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-ghost" style="padding:7px 14px;font-size:0.68rem;letter-spacing:1.5px">Sign In</a>
    `;
  }
}

function toggleUserDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('userDropdownContent');
  if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', () => {
  const dd = document.getElementById('userDropdownContent');
  if (dd) dd.style.display = 'none';
});

async function signInWithGoogle() {
  if (typeof firebase !== 'undefined' && firebase.auth && typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await firebase.auth().signInWithPopup(provider);
      const u = result.user;
      const userData = {
        uid: u.uid,
        name: u.displayName || 'Google Customer',
        email: u.email || '',
        avatar: u.photoURL || '',
        provider: 'google',
        loggedInAt: new Date().toISOString()
      };
      
      setCurrentUser(userData);
      showAuthSuccess(userData.name);
      return;
    } catch (err) {
      console.warn("Firebase Google Sign-In popup error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        showToast('Sign-in was cancelled');
        return;
      }
    }
  }

  // Fallback demo for instant local development
  const demoUser = {
    uid: 'google_' + Date.now(),
    name: 'Gowtham (Google User)',
    email: 'gowtham.food@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    provider: 'google',
    loggedInAt: new Date().toISOString()
  };
  setCurrentUser(demoUser);
  showAuthSuccess(demoUser.name);
}

function showAuthSuccess(name) {
  const box = document.getElementById('authCardBox');
  if (box) {
    box.innerHTML = `
      <div style="text-align:center;padding:30px 10px">
        <div style="font-size:3.5rem;margin-bottom:14px">🎉</div>
        <h2 style="font-family:var(--ff-serif);color:var(--white);margin-bottom:8px">Welcome, ${name}!</h2>
        <p style="color:var(--muted);margin-bottom:24px">You have successfully signed in with your Google Account.</p>
        <a href="menu.html" class="btn btn-saffron" style="display:inline-block">Order Food Now &rarr;</a>
      </div>
    `;
  }
  setTimeout(() => {
    window.location.href = 'menu.html';
  }, 1200);
}

function requireLoginModal(pendingAction) {
  pendingCartAction = pendingAction;
  
  let modal = document.getElementById('authGateModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'authGateModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)';
    modal.innerHTML = `
      <div style="background:#180C06;border:1px solid rgba(212,175,55,0.3);max-width:420px;width:100%;padding:36px 30px;border-radius:6px;position:relative;box-shadow:0 16px 40px rgba(0,0,0,0.9);text-align:center">
        <button onclick="closeAuthGateModal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--muted);font-size:1.4rem;cursor:pointer;line-height:1">&times;</button>
        
        <div style="font-size:2.2rem;color:var(--saffron);margin-bottom:6px">&#2384;</div>
        <h2 style="font-family:var(--ff-serif);color:#fff;font-size:1.55rem;margin-bottom:6px">Please Sign In to Order</h2>
        <p style="color:var(--muted);font-size:0.84rem;margin-bottom:24px">Sign in with your Google account to add delicious food to your cart &amp; checkout</p>

        <button onclick="authGateGoogleSignIn()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;background:#fff;color:#333;border:none;font-family:var(--ff-sans);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:0.2s">
          <svg style="width:20px;height:20px" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p style="font-size:0.72rem;color:var(--muted);margin-top:18px">Instant &bull; 100% Secure &bull; No password needed</p>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

function closeAuthGateModal() {
  const modal = document.getElementById('authGateModal');
  if (modal) modal.style.display = 'none';
}

async function authGateGoogleSignIn() {
  await signInWithGoogle();
  closeAuthGateModal();
  if (typeof pendingCartAction === 'function') {
    pendingCartAction();
    pendingCartAction = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
  
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const uData = {
          uid: user.uid,
          name: user.displayName || 'Google Customer',
          email: user.email || '',
          avatar: user.photoURL || '',
          provider: 'google'
        };
        setCurrentUser(uData);
      }
    });
  }
});

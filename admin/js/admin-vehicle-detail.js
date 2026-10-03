/**
 * Taqwa Motors - Vehicle Detail & Dealership Operations Controller
 * Handles Overview, Purchases, Expenses, Sales, Financials & Private Documents.
 */

let currentVehicleId = null;
let currentVehicle = null;
let currentPurchase = null;
let currentExpenses = [];
let currentSale = null;
let currentDocuments = [];
let allCustomersList = [];

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await window.checkAdminAuth();
  if (!auth) return;

  const urlParams = new URLSearchParams(window.location.search);
  currentVehicleId = urlParams.get('id');

  if (!currentVehicleId) {
    alert('No vehicle ID specified.');
    window.location.href = 'inventory.html';
    return;
  }

  initTabNav();
  initDocumentDropzone();
  initSaleCalculator();

  loadCompleteVehicleData();
});

// Tab Switcher
function initTabNav() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// Master Loader
async function loadCompleteVehicleData() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Fetch Vehicle + Images
    const { data: v, error: vErr } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          id,
          image_url,
          is_primary,
          sort_order
        )
      `)
      .eq('id', currentVehicleId)
      .single();

    if (vErr || !v) {
      alert('Vehicle not found: ' + (vErr ? vErr.message : ''));
      window.location.href = 'inventory.html';
      return;
    }

    currentVehicle = v;
    renderVehicleOverview(v);

    // 2. Fetch Purchase
    loadPurchaseData();

    // 3. Fetch Expenses
    loadExpensesData();

    // 4. Fetch Sale
    loadSaleData();

    // 5. Fetch Documents
    loadDocumentsData();

    // 6. Preload Customers for Sale Modal
    preloadCustomers();

  } catch (err) {
    console.error('Error loading complete vehicle records:', err);
  }
}

/* ==========================================================================
   1. OVERVIEW
   ========================================================================== */
function renderVehicleOverview(v) {
  const titleEl = document.getElementById('detailTitle');
  if (titleEl) titleEl.textContent = `${v.year} ${v.make} ${v.model} ${v.variant || ''}`;
  
  const formattedPrice = Number.isInteger(Number(v.price)) ? Number(v.price).toLocaleString('en-PK') : Number(v.price).toFixed(2);
  const priceEl = document.getElementById('detailPrice');
  if (priceEl) priceEl.textContent = `PKR ${formattedPrice}`;

  const statusEl = document.getElementById('detailStatusBadge');
  if (statusEl) {
    statusEl.className = `status-badge ${v.status}`;
    statusEl.innerHTML = `<span class="status-dot"></span> <span>${v.status}</span>`;
  }

  const statusSelect = document.getElementById('quickStatusSelect');
  if (statusSelect) statusSelect.value = v.status || 'available';

  const editBtn = document.getElementById('editVehicleBtn');
  if (editBtn) editBtn.href = `inventory-edit.html?id=${v.id}`;

  // Gallery
  const images = v.vehicle_images || [];
  const mainImgEl = document.getElementById('galleryMainImg');
  const thumbsStrip = document.getElementById('galleryThumbsStrip');

  if (images.length > 0) {
    const primaryImg = images.find(img => img.is_primary) || images[0];
    if (mainImgEl) mainImgEl.src = primaryImg.image_url;
    if (thumbsStrip) {
      thumbsStrip.innerHTML = images.map((img, i) => `
        <img src="${img.image_url}" alt="Photo ${i + 1}" class="${img.image_url === primaryImg.image_url ? 'active' : ''}" onclick="switchGalleryImage('${img.image_url}', this)">
      `).join('');
    }
  } else {
    if (mainImgEl) mainImgEl.src = '../assets/cars/fortuner_legender.jpg';
    if (thumbsStrip) thumbsStrip.innerHTML = '<span style="font-size: 0.8rem; color: var(--admin-text-muted);">No photos uploaded yet.</span>';
  }

  // Parse Year of Import & Clean Description
  let importYear = v.year_of_import || '';
  let cleanDescription = v.description || '';
  const importMatch = cleanDescription.match(/\[Import:\s*(\d{4})\]/i);
  if (importMatch) {
    importYear = importMatch[1];
    cleanDescription = cleanDescription.replace(/\s*\[Import:\s*\d{4}\]\s*/gi, '').trim();
  }

  // Specs
  if (document.getElementById('specModelYear')) document.getElementById('specModelYear').textContent = v.year;
  if (document.getElementById('specImportYear')) document.getElementById('specImportYear').textContent = importYear || 'Not Specified';
  if (document.getElementById('specCondition')) document.getElementById('specCondition').textContent = v.condition || 'Pre-Owned';
  if (document.getElementById('specMileage')) document.getElementById('specMileage').textContent = v.mileage ? `${v.mileage.toLocaleString()} km` : 'N/A';
  if (document.getElementById('specFuel')) document.getElementById('specFuel').textContent = v.fuel_type || 'Petrol';
  if (document.getElementById('specTransmission')) document.getElementById('specTransmission').textContent = v.transmission || 'Automatic';
  if (document.getElementById('specColor')) document.getElementById('specColor').textContent = v.color || 'Standard';
  if (document.getElementById('specFeatured')) document.getElementById('specFeatured').textContent = v.featured ? 'Yes (Featured)' : 'Standard';

  // Private IDs & Notes
  if (document.getElementById('privateRegNumber')) document.getElementById('privateRegNumber').textContent = v.registration_number || 'Unregistered';
  if (document.getElementById('privateChassisNumber')) document.getElementById('privateChassisNumber').textContent = v.chassis_number || 'Not Recorded';
  if (document.getElementById('privateCreatedDate')) document.getElementById('privateCreatedDate').textContent = new Date(v.created_at).toLocaleString();
  if (document.getElementById('privateUpdatedDate')) document.getElementById('privateUpdatedDate').textContent = new Date(v.updated_at).toLocaleString();
  if (document.getElementById('privateNoteDisplay')) document.getElementById('privateNoteDisplay').textContent = v.private_note || 'No internal private notes recorded.';

  // Description
  if (document.getElementById('detailDescription')) document.getElementById('detailDescription').textContent = cleanDescription || 'No public description recorded.';

  lucide.createIcons();
}

function switchGalleryImage(url, thumbEl) {
  const mainImg = document.getElementById('galleryMainImg');
  if (mainImg) mainImg.src = url;
  document.querySelectorAll('#galleryThumbsStrip img').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

async function handleDetailStatusChange(newStatus) {
  const supabase = window.getSupabaseClient();
  if (!supabase || !currentVehicleId) return;

  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus })
      .eq('id', currentVehicleId);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      currentVehicle.status = newStatus;
      const statusEl = document.getElementById('detailStatusBadge');
      if (statusEl) {
        statusEl.className = `status-badge ${newStatus}`;
        statusEl.innerHTML = `<span class="status-dot"></span> <span>${newStatus}</span>`;
      }
    }
  } catch (err) {
    console.error('Error changing vehicle status:', err);
  }
}

/* ==========================================================================
   2. PURCHASE MANAGEMENT
   ========================================================================== */
async function loadPurchaseData() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const { data: purchase } = await supabase
    .from('purchases')
    .select('*')
    .eq('vehicle_id', currentVehicleId)
    .maybeSingle();

  currentPurchase = purchase;
  renderPurchaseView();
  updateFinancialSummary();
}

function renderPurchaseView() {
  const container = document.getElementById('purchaseContentArea');
  if (!container) return;

  if (!currentPurchase) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i data-lucide="receipt" class="empty-icon"></i>
        <h3 class="empty-title">Purchase Information Not Recorded</h3>
        <p style="font-size: 0.88rem; max-width: 440px; margin: 0 auto 1.5rem;">
          Record purchase cost, seller credentials, and acquisition details for accurate cost and profit tracking.
        </p>
        <button type="button" class="btn-primary" onclick="openPurchaseModal()">
          <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
          <span>Record Vehicle Purchase</span>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--admin-text-main);">
            Acquisition & Cost Details
          </h3>
          <p style="font-size: 0.82rem; color: var(--admin-text-muted);">Confidential dealership purchase record</p>
        </div>
        <button type="button" class="btn-secondary" onclick="openPurchaseModal()">
          <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
          <span>Edit Purchase Info</span>
        </button>
      </div>

      <div class="form-grid-3">
        <div class="spec-item">
          <div class="spec-label">Purchase Price</div>
          <div class="spec-val" style="color: #2563EB; font-size: 1.2rem; font-family: var(--font-heading);">
            PKR ${Number(currentPurchase.purchase_price).toLocaleString('en-PK')}
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Purchase Date</div>
          <div class="spec-val">${new Date(currentPurchase.purchase_date).toLocaleDateString()}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Payment Method</div>
          <div class="spec-val">${currentPurchase.payment_method || 'Bank Transfer'}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Seller / Source Name</div>
          <div class="spec-val">${currentPurchase.seller_name}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Seller Contact</div>
          <div class="spec-val" style="color: #059669;">${currentPurchase.seller_phone || 'N/A'}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Record Added</div>
          <div class="spec-val" style="font-size: 0.82rem; color: var(--admin-text-muted);">${new Date(currentPurchase.created_at).toLocaleDateString()}</div>
        </div>

        <div class="spec-item" style="grid-column: span 3; background: #F8FAFC;">
          <div class="spec-label">Purchase Notes & Conditions</div>
          <div class="spec-val" style="font-weight: 400; font-size: 0.88rem; color: var(--admin-text-secondary); line-height: 1.6;">
            ${currentPurchase.notes || 'No confidential purchase notes recorded.'}
          </div>
        </div>
      </div>
    `;
  }
  lucide.createIcons();
}

function openPurchaseModal() {
  const modal = document.getElementById('purchaseModal');
  if (!modal) return;

  if (currentPurchase) {
    document.getElementById('purchaseSellerName').value = currentPurchase.seller_name || '';
    document.getElementById('purchaseSellerPhone').value = currentPurchase.seller_phone || '';
    document.getElementById('purchaseDate').value = currentPurchase.purchase_date || '';
    document.getElementById('purchasePrice').value = currentPurchase.purchase_price || '';
    document.getElementById('purchasePaymentMethod').value = currentPurchase.payment_method || 'Bank Transfer';
    document.getElementById('purchaseNotes').value = currentPurchase.notes || '';
  } else {
    document.getElementById('purchaseForm').reset();
    document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
  }

  modal.classList.add('open');
}

function closePurchaseModal() {
  document.getElementById('purchaseModal').classList.remove('open');
}

async function handlePurchaseFormSubmit(e) {
  e.preventDefault();
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const seller_name = document.getElementById('purchaseSellerName').value.trim();
  const seller_phone = document.getElementById('purchaseSellerPhone').value.trim();
  const purchase_date = document.getElementById('purchaseDate').value;
  const purchase_price = parseFloat(document.getElementById('purchasePrice').value);
  const payment_method = document.getElementById('purchasePaymentMethod').value;
  const notes = document.getElementById('purchaseNotes').value.trim();

  if (!seller_name || !purchase_date || isNaN(purchase_price) || purchase_price < 0) {
    alert('Please provide valid seller name, purchase date, and non-negative purchase price.');
    return;
  }

  try {
    if (!currentPurchase) {
      // Insert
      const { error } = await supabase
        .from('purchases')
        .insert({
          vehicle_id: currentVehicleId,
          seller_name,
          seller_phone,
          purchase_date,
          purchase_price,
          payment_method,
          notes
        });

      if (error) {
        alert('Error saving purchase info: ' + error.message);
        return;
      }
    } else {
      // Update
      const { error } = await supabase
        .from('purchases')
        .update({
          seller_name,
          seller_phone,
          purchase_date,
          purchase_price,
          payment_method,
          notes
        })
        .eq('id', currentPurchase.id);

      if (error) {
        alert('Error updating purchase info: ' + error.message);
        return;
      }
    }

    closePurchaseModal();
    loadPurchaseData();

  } catch (err) {
    console.error('Error handling purchase submit:', err);
  }
}

/* ==========================================================================
   3. EXPENSES MANAGEMENT
   ========================================================================== */
async function loadExpensesData() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('vehicle_id', currentVehicleId)
    .order('expense_date', { ascending: false });

  currentExpenses = expenses || [];
  renderExpensesView();
  updateFinancialSummary();
}

function renderExpensesView() {
  const listEl = document.getElementById('expensesTableBody');
  const emptyEl = document.getElementById('expensesEmptyState');
  const totalEl = document.getElementById('expensesTotalCounter');

  const totalExpense = currentExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  if (totalEl) totalEl.textContent = `PKR ${totalExpense.toLocaleString('en-PK')}`;

  if (!listEl) return;

  if (currentExpenses.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = currentExpenses.map(exp => `
    <tr>
      <td>
        <span class="stock-tag" style="text-transform: capitalize; background: #FEF3C7; color: #D97706;">
          ${exp.expense_type}
        </span>
      </td>
      <td>
        <span style="font-weight: 700; color: var(--admin-text-main);">
          PKR ${Number(exp.amount).toLocaleString('en-PK')}
        </span>
      </td>
      <td>${new Date(exp.expense_date).toLocaleDateString()}</td>
      <td>${exp.description || '<span style="color: var(--admin-text-muted);">No description</span>'}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="action-btn-icon delete" title="Delete Expense" onclick="deleteExpense('${exp.id}')">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function openAddExpenseModal() {
  document.getElementById('expenseForm').reset();
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseModal').classList.add('open');
}

function closeExpenseModal() {
  document.getElementById('expenseModal').classList.remove('open');
}

async function handleExpenseFormSubmit(e) {
  e.preventDefault();
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const expense_type = document.getElementById('expenseType').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const expense_date = document.getElementById('expenseDate').value;
  const description = document.getElementById('expenseDescription').value.trim();

  if (isNaN(amount) || amount < 0 || !expense_date) {
    alert('Please enter a valid non-negative amount and date.');
    return;
  }

  try {
    const { error } = await supabase
      .from('expenses')
      .insert({
        vehicle_id: currentVehicleId,
        expense_type,
        amount,
        expense_date,
        description
      });

    if (error) {
      alert('Error adding expense: ' + error.message);
      return;
    }

    closeExpenseModal();
    loadExpensesData();

  } catch (err) {
    console.error('Error adding expense:', err);
  }
}

async function deleteExpense(expenseId) {
  if (!confirm('Are you sure you want to remove this expense record?')) return;
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      alert('Error deleting expense: ' + error.message);
    } else {
      loadExpensesData();
    }
  } catch (err) {
    console.error('Error deleting expense:', err);
  }
}

/* ==========================================================================
   4. SALE & BUYER MANAGEMENT
   ========================================================================== */
async function loadSaleData() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const { data: sale } = await supabase
    .from('sales')
    .select(`
      *,
      customers (
        id,
        name,
        phone,
        email,
        cnic,
        address
      )
    `)
    .eq('vehicle_id', currentVehicleId)
    .maybeSingle();

  currentSale = sale;
  renderSaleView();
  updateFinancialSummary();
}

function renderSaleView() {
  const container = document.getElementById('saleContentArea');
  if (!container) return;

  if (!currentSale) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i data-lucide="tag" class="empty-icon"></i>
        <h3 class="empty-title">Vehicle Not Sold Yet</h3>
        <p style="font-size: 0.88rem; max-width: 440px; margin: 0 auto 1.5rem;">
          This vehicle is currently available in the showroom. Complete the buyer registration and sales contract to mark as sold.
        </p>
        <button type="button" class="btn-primary" onclick="openSaleModal()">
          <i data-lucide="badge-check" style="width: 16px; height: 16px;"></i>
          <span>Record Sale / Mark as Sold</span>
        </button>
      </div>
    `;
  } else {
    const cust = currentSale.customers || {};
    const remaining = Number(currentSale.remaining_amount);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <span class="status-badge sold"><span class="status-dot"></span> Vehicle Sold</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--admin-text-main); margin-top: 0.35rem;">
            Sales & Buyer Agreement
          </h3>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; color: var(--admin-text-muted); text-transform: uppercase; font-weight: 700;">Final Sale Price</div>
          <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #059669;">
            PKR ${Number(currentSale.sale_price).toLocaleString('en-PK')}
          </div>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="spec-item">
          <div class="spec-label">Buyer Name</div>
          <div class="spec-val">
            <a href="customer-detail.html?id=${cust.id}" style="color: #2563EB; text-decoration: none; font-weight: 600;">
              ${cust.name || 'Unknown'} ↗
            </a>
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Buyer Contact</div>
          <div class="spec-val">${cust.phone || 'N/A'}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Buyer CNIC</div>
          <div class="spec-val" style="font-family: var(--font-mono);">${cust.cnic || 'N/A'}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Sale Date</div>
          <div class="spec-val">${new Date(currentSale.sale_date).toLocaleDateString()}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Amount Received</div>
          <div class="spec-val" style="color: #059669;">PKR ${Number(currentSale.amount_received).toLocaleString('en-PK')}</div>
        </div>

        <div class="spec-item">
          <div class="spec-label">Remaining Balance</div>
          <div class="spec-val" style="color: ${remaining > 0 ? '#DC2626' : '#059669'}; font-weight: 700;">
            ${remaining > 0 ? `PKR ${remaining.toLocaleString('en-PK')}` : 'Paid in Full'}
          </div>
        </div>

        <div class="spec-item" style="grid-column: span 3; background: #F8FAFC;">
          <div class="spec-label">Sale Notes & Transfer Remarks</div>
          <div class="spec-val" style="font-weight: 400; font-size: 0.88rem; color: var(--admin-text-secondary); line-height: 1.6;">
            ${currentSale.notes || 'No sales remarks recorded.'}
          </div>
        </div>
      </div>
    `;
  }
  lucide.createIcons();
}

async function preloadCustomers() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, cnic')
    .order('name');

  allCustomersList = customers || [];
  populateCustomerSelect();
}

function populateCustomerSelect() {
  const select = document.getElementById('saleCustomerSelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Existing Buyer --</option>' +
    allCustomersList.map(c => `
      <option value="${c.id}">${c.name} (${c.phone || c.cnic || 'Registered'})</option>
    `).join('');
}

function initSaleCalculator() {
  const salePriceInput = document.getElementById('salePriceInput');
  const amountRecInput = document.getElementById('saleAmountReceived');
  const remainingDisplay = document.getElementById('saleRemainingDisplay');

  const recalculate = () => {
    const salePrice = parseFloat(salePriceInput?.value) || 0;
    const amountRec = parseFloat(amountRecInput?.value) || 0;
    const remaining = Math.max(0, salePrice - amountRec);
    if (remainingDisplay) {
      remainingDisplay.value = `PKR ${remaining.toLocaleString('en-PK')}`;
    }
  };

  if (salePriceInput) salePriceInput.addEventListener('input', recalculate);
  if (amountRecInput) amountRecInput.addEventListener('input', recalculate);
}

function openSaleModal() {
  if (currentVehicle?.status === 'sold') {
    alert('This vehicle is already marked as sold.');
    return;
  }

  const modal = document.getElementById('saleModal');
  if (!modal) return;

  document.getElementById('saleForm').reset();
  document.getElementById('saleDateInput').value = new Date().toISOString().split('T')[0];
  document.getElementById('salePriceInput').value = currentVehicle?.price || '';
  document.getElementById('saleAmountReceived').value = currentVehicle?.price || '';
  document.getElementById('saleRemainingDisplay').value = 'PKR 0';

  populateCustomerSelect();
  modal.classList.add('open');
}

function closeSaleModal() {
  document.getElementById('saleModal').classList.remove('open');
}

async function handleSaleFormSubmit(e) {
  e.preventDefault();
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  let customerId = document.getElementById('saleCustomerSelect').value;
  const isCreatingNew = document.getElementById('checkCreateNewCustomer')?.checked;

  const sale_date = document.getElementById('saleDateInput').value;
  const sale_price = parseFloat(document.getElementById('salePriceInput').value);
  const amount_received = parseFloat(document.getElementById('saleAmountReceived').value) || 0;
  const payment_method = document.getElementById('salePaymentMethod').value;
  const notes = document.getElementById('saleNotes').value.trim();

  if (isNaN(sale_price) || sale_price < 0 || amount_received < 0) {
    alert('Invalid sale price or amount received.');
    return;
  }

  if (amount_received > sale_price) {
    alert('Amount received cannot exceed the total sale price.');
    return;
  }

  const remaining_amount = sale_price - amount_received;

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // If creating a new customer inline
    if (isCreatingNew || !customerId) {
      const newName = document.getElementById('newCustName').value.trim();
      const newPhone = document.getElementById('newCustPhone').value.trim();
      const newCnic = document.getElementById('newCustCnic').value.trim();

      if (!newName) {
        alert('Please select an existing customer or provide the new buyer full name.');
        return;
      }

      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert({
          owner_id: session.user.id,
          name: newName,
          phone: newPhone,
          cnic: newCnic
        })
        .select('id')
        .single();

      if (custErr) {
        alert('Error creating new customer: ' + custErr.message);
        return;
      }
      customerId = newCust.id;
    }

    // 1. Record in sales table
    const { error: saleErr } = await supabase
      .from('sales')
      .insert({
        vehicle_id: currentVehicleId,
        customer_id: customerId,
        sale_date,
        sale_price,
        amount_received,
        remaining_amount,
        payment_method,
        notes
      });

    if (saleErr) {
      alert('Error recording sale: ' + saleErr.message);
      return;
    }

    // 2. Automatically update vehicle status to 'sold'
    await supabase
      .from('vehicles')
      .update({ status: 'sold' })
      .eq('id', currentVehicleId);

    closeSaleModal();
    alert('Sale recorded successfully! Vehicle marked as Sold.');
    loadCompleteVehicleData();

  } catch (err) {
    console.error('Error processing vehicle sale:', err);
  }
}

/* ==========================================================================
   5. FINANCIAL SUMMARY & PROFIT CALCULATION
   ========================================================================= */
function updateFinancialSummary() {
  const purchaseValEl = document.getElementById('finPurchaseVal');
  const expensesValEl = document.getElementById('finExpensesVal');
  const totalCostValEl = document.getElementById('finTotalCostVal');
  const saleValEl = document.getElementById('finSaleVal');
  const profitValEl = document.getElementById('finProfitVal');
  const finCardProfit = document.getElementById('finCardProfit');
  const profitStatusBanner = document.getElementById('finProfitStatusBanner');

  const purchasePrice = currentPurchase ? Number(currentPurchase.purchase_price) : 0;
  const totalExpenses = currentExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalCost = purchasePrice + totalExpenses;

  if (purchaseValEl) purchaseValEl.textContent = `PKR ${purchasePrice.toLocaleString('en-PK')}`;
  if (expensesValEl) expensesValEl.textContent = `PKR ${totalExpenses.toLocaleString('en-PK')}`;
  if (totalCostValEl) totalCostValEl.textContent = `PKR ${totalCost.toLocaleString('en-PK')}`;

  if (!currentSale) {
    if (saleValEl) saleValEl.textContent = 'Not Sold';
    if (profitValEl) profitValEl.textContent = 'Unrealized';
    if (finCardProfit) {
      finCardProfit.className = 'fin-card';
    }
    if (profitStatusBanner) {
      profitStatusBanner.style.display = 'block';
      profitStatusBanner.className = 'alert-banner';
      profitStatusBanner.style.background = '#FFFBEB';
      profitStatusBanner.style.border = '1px solid #FDE68A';
      profitStatusBanner.style.color = '#B45309';
      profitStatusBanner.innerHTML = `
        <i data-lucide="info" style="width: 18px; height: 18px;"></i>
        <span><strong>Vehicle Not Sold Yet:</strong> Total invested acquisition and reconditioning cost stands at <strong>PKR ${totalCost.toLocaleString('en-PK')}</strong>. Profit will be realized upon sale.</span>
      `;
    }
  } else {
    const salePrice = Number(currentSale.sale_price);
    const netProfit = salePrice - totalCost;

    if (saleValEl) saleValEl.textContent = `PKR ${salePrice.toLocaleString('en-PK')}`;
    if (profitValEl) profitValEl.textContent = `PKR ${netProfit.toLocaleString('en-PK')}`;

    if (finCardProfit) {
      finCardProfit.className = `fin-card ${netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`;
    }

    if (profitStatusBanner) {
      profitStatusBanner.style.display = 'block';
      profitStatusBanner.className = 'alert-banner';
      profitStatusBanner.style.background = netProfit >= 0 ? '#ECFDF5' : '#FEF2F2';
      profitStatusBanner.style.border = netProfit >= 0 ? '1px solid #A7F3D0' : '1px solid #FECACA';
      profitStatusBanner.style.color = netProfit >= 0 ? '#065F46' : '#991B1B';
      profitStatusBanner.innerHTML = `
        <i data-lucide="${netProfit >= 0 ? 'trending-up' : 'trending-down'}" style="width: 18px; height: 18px;"></i>
        <span><strong>Realized Dealership Margin:</strong> ${netProfit >= 0 ? 'Profitable Sale' : 'Loss Recorded'} — Net Profit of <strong>PKR ${netProfit.toLocaleString('en-PK')}</strong>.</span>
      `;
    }
  }

  lucide.createIcons();
}

/* ==========================================================================
   6. PRIVATE VEHICLE DOCUMENTS (STORAGE BUCKET vehicle-documents)
   ========================================================================== */
function initDocumentDropzone() {
  const dropzone = document.getElementById('docDropzone');
  const fileInput = document.getElementById('docFileInput');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadVehicleDocument(e.target.files[0]);
      fileInput.value = '';
    }
  });
}

async function uploadVehicleDocument(file) {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const docType = document.getElementById('docTypeSelect')?.value || 'inspection';
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${currentVehicleId}/${Date.now()}_${cleanName}`;

  try {
    // 1. Upload to private vehicle-documents bucket
    const { data: uploadData, error: uploadErr } = await supabase
      .storage
      .from('vehicle-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadErr) {
      alert('Error uploading private document: ' + uploadErr.message);
      return;
    }

    // 2. Insert record in vehicle_documents table
    const { error: dbErr } = await supabase
      .from('vehicle_documents')
      .insert({
        vehicle_id: currentVehicleId,
        document_type: docType,
        file_path: storagePath
      });

    if (dbErr) {
      alert('Document uploaded but failed to save index: ' + dbErr.message);
    } else {
      alert('Document securely uploaded to dealership vault.');
      loadDocumentsData();
    }

  } catch (err) {
    console.error('Error handling doc upload:', err);
  }
}

async function loadDocumentsData() {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  const { data: docs } = await supabase
    .from('vehicle_documents')
    .select('*')
    .eq('vehicle_id', currentVehicleId)
    .order('created_at', { ascending: false });

  currentDocuments = docs || [];
  renderDocumentsView();
}

function renderDocumentsView() {
  const listEl = document.getElementById('documentsListTableBody');
  const emptyEl = document.getElementById('documentsEmptyState');

  if (!listEl) return;

  if (currentDocuments.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = currentDocuments.map(doc => {
    const filename = doc.file_path.split('/').pop().split('_').slice(1).join('_') || doc.file_path;

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="file-text" style="width: 18px; height: 18px; color: #2563EB;"></i>
            <span style="font-weight: 600; color: var(--admin-text-main);">${filename}</span>
          </div>
        </td>
        <td>
          <span class="stock-tag" style="text-transform: capitalize;">
            ${doc.document_type.replace('_', ' ')}
          </span>
        </td>
        <td>${new Date(doc.created_at).toLocaleDateString()}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-secondary btn-sm" onclick="downloadSecureDocument('${doc.file_path}')">
              <i data-lucide="download" style="width: 14px; height: 14px;"></i>
              <span>Secure View / Download</span>
            </button>
            <button type="button" class="action-btn-icon delete" title="Delete Document" onclick="deleteDocument('${doc.id}', '${doc.file_path}')">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

async function downloadSecureDocument(filePath) {
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  try {
    // Generate short-lived signed URL (valid for 120 seconds)
    const { data, error } = await supabase
      .storage
      .from('vehicle-documents')
      .createSignedUrl(filePath, 120);

    if (error || !data?.signedUrl) {
      alert('Error creating signed download link: ' + (error ? error.message : ''));
      return;
    }

    // Open signed URL in new secure tab
    window.open(data.signedUrl, '_blank');

  } catch (err) {
    console.error('Error retrieving signed document URL:', err);
  }
}

async function deleteDocument(docId, filePath) {
  if (!confirm('Are you sure you want to delete this document from the secure vault?')) return;
  const supabase = window.getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Delete storage object
    await supabase.storage.from('vehicle-documents').remove([filePath]);

    // 2. Delete database index record
    const { error } = await supabase
      .from('vehicle_documents')
      .delete()
      .eq('id', docId);

    if (error) {
      alert('Error deleting document: ' + error.message);
    } else {
      loadDocumentsData();
    }
  } catch (err) {
    console.error('Error deleting document:', err);
  }
}

// Global functions for inline HTML calls
window.switchGalleryImage = switchGalleryImage;
window.handleDetailStatusChange = handleDetailStatusChange;
window.openPurchaseModal = openPurchaseModal;
window.closePurchaseModal = closePurchaseModal;
window.handlePurchaseFormSubmit = handlePurchaseFormSubmit;
window.openAddExpenseModal = openAddExpenseModal;
window.closeExpenseModal = closeExpenseModal;
window.handleExpenseFormSubmit = handleExpenseFormSubmit;
window.deleteExpense = deleteExpense;
window.openSaleModal = openSaleModal;
window.closeSaleModal = closeSaleModal;
window.handleSaleFormSubmit = handleSaleFormSubmit;
window.downloadSecureDocument = downloadSecureDocument;
window.deleteDocument = deleteDocument;

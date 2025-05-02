 // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        
        // User accounts storage
        let users = JSON.parse(localStorage.getItem('gsmKoyaUsers')) || {};
        let currentUser = null;
        
        // Customer data storage (per user)
        let customers = {};
        let currentCustomer = null;
        
        // DOM Elements
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        // Event Listeners
        loginBtn.addEventListener('click', login);
        signupBtn.addEventListener('click', signup);
        
        // Authentication functions
        function showLogin() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('signupForm').style.display = 'none';
        }
        
        function showSignup() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'block';
        }
        
        function login() {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            if (!username || !password) {
                alert('تکایە ناوی بەکارهێنەر و تێپەڕەوشە بنووسە');
                return;
            }
            
            if (users[username] && users[username].password === password) {
                currentUser = username;
                loadUserData();
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('appContent').style.display = 'block';
                
                // Set username and avatar
                document.getElementById('usernameDisplay').textContent = username;
                document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
                
                // Force show customers tab content
                switchTab('customers');
            } else {
                alert('ناوی بەکارهێنەر یان تێپەڕەوشە هەڵەیە');
            }
        }
        
        function signup() {
            const username = document.getElementById('signupUsername').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
            
            if (!username || !password) {
                alert('تکایە ناوی بەکارهێنەر و تێپەڕەوشە بنووسە');
                return;
            }
            
            if (password.length < 6) {
                alert('تێپەڕەوشە پێویستە کەمتر نەبێت لە ٦ پیت');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('تێپەڕەوشەکان ناگونجێن');
                return;
            }
            
            if (users[username]) {
                alert('ئەم ناوە پێشتر هەیە');
                return;
            }
            
            users[username] = { password: password };
            localStorage.setItem('gsmKoyaUsers', JSON.stringify(users));
            
            alert('هەژمارەکەت بە سەرکەوتوویی دروستکرا');
            showLogin();
        }
        
        function logout() {
            // Clear current user data
            currentUser = null;
            currentCustomer = null;
            
            // Switch views
            document.getElementById('appContent').style.display = 'none';
            document.getElementById('authContainer').style.display = 'flex';
            
            // Clear login form
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            
            // Show login form
            showLogin();
        }
        
        // User data management
        function loadUserData() {
            const userData = JSON.parse(localStorage.getItem(`gsmKoyaData_${currentUser}`)) || {};
            customers = userData.customers || {};
            updateCustomerList();
        }
        
        function saveUserData() {
            const userData = { customers };
            localStorage.setItem(`gsmKoyaData_${currentUser}`, JSON.stringify(userData));
        }
        
        // Customer management functions
        function switchTab(tabName) {
            // Update active tab in sidebar
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            if (tabName === 'customers') {
                document.querySelector('.nav-menu li:nth-child(1) a').classList.add('active');
            } else {
                document.querySelector('.nav-menu li:nth-child(2) a').classList.add('active');
            }
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab content
            if (tabName === 'customers') {
                document.getElementById('customersTab').classList.add('active');
                document.getElementById('salesFormContainer').classList.add('d-none');
                updateCustomerList();
            } else if (tabName === 'newCustomer') {
                document.getElementById('newCustomerTab').classList.add('active');
                document.getElementById('salesFormContainer').classList.add('d-none');
            }
        }

        document.getElementById('customerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const customerId = Date.now().toString();
            const customerName = document.getElementById('customerName').value.trim();
            const customerPhone = document.getElementById('customerPhone').value.trim();
            
            if (!customerName) {
                alert('تکایە ناوی کڕیار بنووسە');
                return;
            }
            
            const customer = {
                name: customerName,
                phone: customerPhone || 'نەدیاریکراو',
                type: document.getElementById('customerType').value,
                sales: [],
                createdAt: new Date().toISOString()
            };
            
            customers[customerId] = customer;
            saveUserData();
            updateCustomerList();
            this.reset();
            switchTab('customers');
        });

        function filterCustomers() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const customerItems = document.querySelectorAll('.customer-item');
            
            customerItems.forEach(item => {
                const customerName = item.querySelector('.customer-name').textContent.toLowerCase();
                const customerPhone = item.querySelector('.customer-phone').textContent.toLowerCase();
                
                if (customerName.includes(searchTerm) || customerPhone.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        function clearSearch() {
            document.getElementById('searchInput').value = '';
            filterCustomers();
        }

        function backToCustomers() {
            document.getElementById('salesFormContainer').classList.add('d-none');
            switchTab('customers');
        }

        function showCustomerSales(customerId) {
            currentCustomer = customerId;
            const customer = customers[customerId];
            
            document.getElementById('currentCustomerName').textContent = `کاڵاکانی ${customer.name}`;
            
            const customerInfo = document.getElementById('customerInfo');
            customerInfo.innerHTML = `
                <div class="form-row">
                    <div class="form-col">
                        <p><strong>ژمارەی مۆبایل:</strong> ${customer.phone}</p>
                    </div>
                    <div class="form-col">
                        <p><strong>جۆری کڕیار:</strong> ${getCustomerTypeName(customer.type)}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-col">
                        <p><strong>ژمارەی کاڵاکان:</strong> ${customer.sales.length}</p>
                    </div>
                    <div class="form-col">
                        <p><strong>یەکەم کاڵا:</strong> ${customer.sales.length > 0 ? customer.sales[0].date : 'هیچ کاڵایەک نییە'}</p>
                    </div>
                </div>
            `;
            
            document.getElementById('salesFormContainer').classList.remove('d-none');
            document.getElementById('customersTab').classList.remove('active');
            document.getElementById('newCustomerTab').classList.remove('active');
            
            updateSalesTable();
        }

        function getCustomerTypeName(type) {
            switch(type) {
                case 'vip': return '<span class="badge badge-success">VIP</span>';
                case 'wholesale': return '<span class="badge badge-warning">گشتی</span>';
                default: return '<span class="badge badge-primary">ئاسایی</span>';
            }
        }

        document.getElementById('salesForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const itemType = document.getElementById('itemType').value.trim();
            if (!itemType) {
                alert('تکایە جۆری کاڵا بنووسە');
                return;
            }
            
            const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
            const price = parseFloat(document.getElementById('itemPrice').value) || 0;
            const totalPrice = (quantity * price).toFixed(2);
            
            const sale = {
                item: itemType,
                price: price.toFixed(2),
                quantity: quantity,
                total: totalPrice,
                category: document.getElementById('itemCategory').value,
                date: new Date().toLocaleString('en-US', {
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                timestamp: Date.now()
            };
            
            customers[currentCustomer].sales.push(sale);
            saveUserData();
            updateSalesTable();
            this.reset();
            document.getElementById('itemPrice').value = 0;
            document.getElementById('itemQuantity').value = 1;
        });

        function updateCustomerList() {
            const customerList = document.getElementById('customerList');
            customerList.innerHTML = '';
            
            const sortedCustomers = Object.entries(customers).sort((a, b) => {
                return new Date(b[1].createdAt) - new Date(a[1].createdAt);
            });
            
            if (sortedCustomers.length === 0) {
                customerList.innerHTML = '<li class="text-center py-4">هیچ کڕیارێک تۆمارنەکراوە</li>';
                return;
            }
            
            for (const [id, customer] of sortedCustomers) {
                const totalSales = customer.sales.reduce((sum, sale) => sum + parseFloat(sale.total || sale.price), 0);
                const customerElement = document.createElement('li');
                customerElement.className = 'customer-item';
                customerElement.innerHTML = `
                    <div class="customer-avatar">${customer.name.charAt(0).toUpperCase()}</div>
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-phone">${customer.phone}</div>
                        <div>${getCustomerTypeName(customer.type)}</div>
                    </div>
                    <div class="customer-stats">
                        <div class="sales-count">${customer.sales.length} کاڵا</div>
                        <div class="total-amount">${totalSales.toFixed(2)} دینار</div>
                    </div>
                `;
                customerElement.addEventListener('click', () => showCustomerSales(id));
                customerList.appendChild(customerElement);
            }
        }

        function updateSalesTable() {
            const tableBody = document.getElementById('salesData');
            const customer = customers[currentCustomer];
            
            if (customer.sales.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">هیچ کاڵایەک تۆمارنەکراوە</td></tr>';
                document.getElementById('totalAmount').textContent = '0.00';
                return;
            }
            
            tableBody.innerHTML = '';
            let totalAmount = 0;
            
            customer.sales.sort((a, b) => b.timestamp - a.timestamp).forEach(sale => {
                totalAmount += parseFloat(sale.total);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.item}</td>
                    <td>${sale.price}</td>
                    <td>${sale.quantity}</td>
                    <td>${sale.total}</td>
                    <td>${sale.category}</td>
                    <td>${sale.date}</td>
                    <td>
                        <button onclick="deleteSale('${sale.timestamp}')" class="btn btn-danger btn-sm">سڕینەوە</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
        }

        function deleteSale(timestamp) {
            if (!confirm('دڵنیای لە سڕینەوەی ئەم کاڵایە؟')) return;
            
            const customer = customers[currentCustomer];
            customer.sales = customer.sales.filter(sale => sale.timestamp != timestamp);
            saveUserData();
            updateSalesTable();
        }

        function confirmDeleteAllCustomers() {
            if (!confirm('دڵنیای لە سڕینەوەی هەموو کڕیاران؟ ئەم کارە ناتوانرێت بیگەڕێنیتەوە!')) return;
            
            customers = {};
            saveUserData();
            updateCustomerList();
            alert('هەموو کڕیاران سڕایەوە');
        }

        function generateCustomerPDF() {
            const customer = customers[currentCustomer];
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text(`کاڵاکانی ${customer.name}`, 105, 15, null, null, 'center');
            
            // Add customer info
            doc.setFontSize(12);
            doc.text(`ژمارەی مۆبایل: ${customer.phone}`, 14, 30);
            doc.text(`جۆری کڕیار: ${getCustomerTypeText(customer.type)}`, 14, 40);
            
            // Add sales table header
            doc.setFontSize(14);
            doc.text('کاڵا', 20, 60);
            doc.text('نرخ', 60, 60);
            doc.text('ژمارە', 90, 60);
            doc.text('کۆی نرخ', 120, 60);
            doc.text('بەروار', 160, 60);
            
            // Add sales data
            let y = 70;
            doc.setFontSize(12);
            customer.sales.forEach(sale => {
                doc.text(sale.item, 20, y);
                doc.text(sale.price, 60, y);
                doc.text(sale.quantity.toString(), 90, y);
                doc.text(sale.total, 120, y);
                doc.text(sale.date, 160, y);
                y += 10;
            });
            
            // Add total
            doc.setFontSize(14);
            const total = customer.sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
            doc.text(`کۆی گشتی: ${total.toFixed(2)} دینار`, 14, y + 20);
            
            // Save the PDF
            doc.save(`کاڵاکانی_${customer.name}.pdf`);
        }

        function getCustomerTypeText(type) {
            switch(type) {
                case 'vip': return 'VIP';
                case 'wholesale': return 'گشتی';
                default: return 'ئاسایی';
            }
        }

        function exportCustomerData() {
            const customer = customers[currentCustomer];
            const dataStr = JSON.stringify(customer, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `کڕیاری_${customer.name}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }

        function importCustomerData() {
            document.getElementById('fileInput').click();
        }

        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    customers[currentCustomer] = importedData;
                    saveUserData();
                    updateSalesTable();
                    alert('داتاکە بە سەرکەوتوویی هێنرایەوە');
                } catch (error) {
                    alert('هەڵە لە خوێندنەوەی فایل: ' + error.message);
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset file input
        });

        // Initialize the app
        showLogin();
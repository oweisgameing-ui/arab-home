// ملف js/location-fields.js
// نظام إدارة الخانات الإضافية للمحافظات والمدن الجديدة

class LocationFieldsManager {
    constructor() {
        this.initElements();
        this.initEvents();
    }

    initElements() {
        // عناصر المحافظة
        this.cityOriginal = document.getElementById('city');
        this.governorateFields = document.getElementById('governorateFields');
        this.governorateArea = document.getElementById('governorateArea');
        this.governorateStreet = document.getElementById('governorateStreet');
        
        // عناصر المدينة الجديدة
        this.cityNewOriginal = document.getElementById('cityNew');
        this.cityNewFields = document.getElementById('cityNewFields');
        this.cityNewDistrict = document.getElementById('cityNewDistrict');
        this.cityNewNeighborhood = document.getElementById('cityNewNeighborhood');
        
        // عناصر التحكم في واجهة المدينة الجديدة
        this.cityNewSelect = document.getElementById('cityNewSelect');
        this.cityNewBtn = document.getElementById('cityNewBtn');
        this.cityNewBtnText = document.getElementById('cityNewBtnText');
        this.cityNewDropdown = document.getElementById('cityNewDropdown');
        this.cityNewGrid = document.getElementById('cityNewGrid');
        this.cityNewSearch = document.getElementById('cityNewSearch');
        
        // عناصر المحافظة الأصلية (للتوافق)
        this.citySelect = document.getElementById('citySelect');
        this.cityBtn = document.getElementById('cityBtn');
        this.cityBtnText = document.getElementById('cityBtnText');
        this.cityDropdown = document.getElementById('cityDropdown');
        this.cityGrid = document.getElementById('cityGrid');
        this.citySearch = document.getElementById('citySearch');
    }

    initEvents() {
        // عند اختيار محافظة
        if (this.cityOriginal) {
            this.cityOriginal.addEventListener('change', () => this.onGovernorateChange());
        }

        // عند اختيار مدينة جديدة
        if (this.cityNewOriginal) {
            this.cityNewOriginal.addEventListener('change', () => this.onNewCityChange());
        }

        // فتح/إغلاق قائمة المدن الجديدة
        if (this.cityNewBtn) {
            this.cityNewBtn.addEventListener('click', (e) => this.toggleNewCityDropdown(e));
        }

        // البحث في المدن الجديدة
        if (this.cityNewSearch) {
            this.cityNewSearch.addEventListener('input', () => this.filterNewCities());
        }

        // إغلاق قائمة المدن الجديدة عند النقر خارجها
        document.addEventListener('click', (e) => this.closeDropdowns(e));

        // تهيئة المدن الجديدة عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', () => {
            this.populateNewCities();
            this.setupTabNavigation();
        });
    }

    onGovernorateChange() {
        const selectedCity = this.cityOriginal.value;
        
        // إظهار/إخفاء حقول المحافظة
        if (selectedCity) {
            this.governorateFields?.classList.add('show');
            // تعطيل المدينة الجديدة عند اختيار محافظة
            if (this.cityNewOriginal) {
                this.cityNewOriginal.value = '';
                this.cityNewBtnText.textContent = 'اختر مدينة جديدة';
                this.cityNewFields?.classList.remove('show');
            }
        } else {
            this.governorateFields?.classList.remove('show');
        }
    }

    onNewCityChange() {
        const selectedNewCity = this.cityNewOriginal.value;
        
        // إظهار/إخفاء حقول المدينة الجديدة
        if (selectedNewCity) {
            this.cityNewFields?.classList.add('show');
            // تعطيل المحافظة عند اختيار مدينة جديدة
            if (this.cityOriginal) {
                this.cityOriginal.value = '';
                this.cityBtnText.textContent = 'اختر المحافظة';
                this.governorateFields?.classList.remove('show');
            }
        } else {
            this.cityNewFields?.classList.remove('show');
        }
    }

    toggleNewCityDropdown(e) {
        e.stopPropagation();
        if (this.cityNewDropdown) {
            this.cityNewDropdown.classList.toggle('open');
            if (this.cityNewDropdown.classList.contains('open')) {
                this.cityNewSearch?.focus();
            }
        }
    }

    filterNewCities() {
        if (!this.cityNewGrid || !this.cityNewSearch) return;
        
        const q = this.cityNewSearch.value.trim().toLowerCase();
        this.cityNewGrid.querySelectorAll('.city-item').forEach(it => {
            const txt = it.textContent.trim().toLowerCase();
            it.style.display = txt.includes(q) ? '' : 'none';
        });
    }

    closeDropdowns(e) {
        // إغلاق قائمة المدن الجديدة
        if (this.cityNewSelect && !this.cityNewSelect.contains(e.target) && 
            this.cityNewDropdown?.classList.contains('open')) {
            this.cityNewDropdown.classList.remove('open');
        }
        
        // إغلاق قائمة المحافظات الأصلية (للتوافق)
        if (this.citySelect && !this.citySelect.contains(e.target) && 
            this.cityDropdown?.classList.contains('open')) {
            this.cityDropdown.classList.remove('open');
        }
    }

    populateNewCities() {
        if (!this.cityNewGrid || !this.cityNewOriginal) return;
        
        this.cityNewGrid.innerHTML = '';
        Array.from(this.cityNewOriginal.options).forEach(opt => {
            if (opt.value) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'city-item';
                btn.textContent = opt.textContent;
                btn.dataset.value = opt.value;
                
                if (opt.selected) btn.classList.add('active');
                
                btn.addEventListener('click', () => {
                    this.cityNewOriginal.value = btn.dataset.value;
                    this.cityNewOriginal.dispatchEvent(new Event('change'));
                    this.cityNewBtnText.textContent = btn.textContent;
                    this.cityNewDropdown.classList.remove('open');
                    
                    // تحديث العناصر النشطة
                    this.cityNewGrid.querySelectorAll('.city-item').forEach(ci => ci.classList.remove('active'));
                    btn.classList.add('active');
                });
                
                this.cityNewGrid.appendChild(btn);
            }
        });
    }

    setupTabNavigation() {
        // السماح بالتنقل باستخدام Tab في القوائم
        const setupTabNavigationForGrid = (grid) => {
            if (!grid) return;
            
            const items = grid.querySelectorAll('.city-item');
            items.forEach((item, index) => {
                item.setAttribute('tabindex', '0');
                
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const nextIndex = (index + 1) % items.length;
                        items[nextIndex].focus();
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prevIndex = (index - 1 + items.length) % items.length;
                        items[prevIndex].focus();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.cityNewDropdown?.classList.remove('open');
                        this.cityDropdown?.classList.remove('open');
                    }
                });
            });
        };

        setupTabNavigationForGrid(this.cityNewGrid);
        setupTabNavigationForGrid(this.cityGrid);
    }

    getLocationData() {
        return {
            governorate: this.cityOriginal?.value || '',
            governorateArea: this.governorateArea?.value || '',
            governorateStreet: this.governorateStreet?.value || '',
            newCity: this.cityNewOriginal?.value || '',
            newCityDistrict: this.cityNewDistrict?.value || '',
            newCityNeighborhood: this.cityNewNeighborhood?.value || ''
        };
    }

    clearLocationData() {
        // مسح حقول المحافظة
        if (this.cityOriginal) this.cityOriginal.value = '';
        if (this.cityBtnText) this.cityBtnText.textContent = 'اختر المحافظة';
        if (this.governorateFields) this.governorateFields.classList.remove('show');
        if (this.governorateArea) this.governorateArea.value = '';
        if (this.governorateStreet) this.governorateStreet.value = '';
        
        // مسح حقول المدينة الجديدة
        if (this.cityNewOriginal) this.cityNewOriginal.value = '';
        if (this.cityNewBtnText) this.cityNewBtnText.textContent = 'اختر مدينة جديدة';
        if (this.cityNewFields) this.cityNewFields.classList.remove('show');
        if (this.cityNewDistrict) this.cityNewDistrict.value = '';
        if (this.cityNewNeighborhood) this.cityNewNeighborhood.value = '';
        
        // تحديث الأزرار
        if (this.cityNewGrid) {
            this.cityNewGrid.querySelectorAll('.city-item').forEach(ci => ci.classList.remove('active'));
        }
        if (this.cityGrid) {
            this.cityGrid.querySelectorAll('.city-item').forEach(ci => ci.classList.remove('active'));
        }
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.locationFieldsManager = new LocationFieldsManager();
});
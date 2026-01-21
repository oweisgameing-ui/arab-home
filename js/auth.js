// js/auth.js - النسخة النهائية المصححة
const SimpleAuthSystem = {
    currentUser: null,
    supabaseClient: null,
    isInitialized: false,
    
    // تهيئة النظام - تحميل بيانات من localStorage فقط (بدون الحاجة لـ Supabase)
    async initialize() {
        try {
            console.log('🚀 تهيئة نظام المصادقة...');
            
            // تحميل المستخدم من التخزين المحلي أولاً (لا يحتاج Supabase)
            this.loadUserFromStorage();
            
            // محاولة إعداد Supabase إذا كانت متاحة (لكن اختياري)
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                const SUPABASE_URL = 'https://hvwkpoybdnwnqfwksxio.supabase.co';
                const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2d2twb3liZG53bnFmd2tzeGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyMzcsImV4cCI6MjA4NDM0MDIzN30.FqL6u0-GMfmA-1oaeRXdYlWH6rLqhifnUukuCDZMUMg';
                try {
                    this.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                    console.log('✅ تم إنشاء عميل Supabase بنجاح');
                } catch (error) {
                    console.warn('⚠️ خطأ في إنشاء عميل Supabase:', error.message);
                }
            }
            
            // تحديث واجهة المستخدم
            this.updateUI();
            
            this.isInitialized = true;
            console.log('✅ تمت تهيئة نظام المصادقة بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة النظام:', error);
            return false;
        }
    },
    
    // تسجيل حساب جديد
        async register(userData) {
            try {
                if (!this.supabaseClient) {
                    await this.initialize();
                }
                
                console.log('📝 محاولة تسجيل:', userData.email);
                
                // محاولة التحقق في Supabase
                if (this.supabaseClient) {
                    try {
                        // 1. التحقق من عدم وجود البريد مسبقاً
                        const { data: existing, error: checkError } = await this.supabaseClient
                            .from('users')
                            .select('id')
                            .eq('email', userData.email)
                            .maybeSingle();
                        
                        if (checkError) {
                            console.error('❌ خطأ في التحقق من البريد:', checkError);
                        } else if (existing) {
                            return {
                                success: false,
                                error: 'البريد الإلكتروني مسجل بالفعل'
                            };
                        }
                        
                        // 3. تحضير بيانات المستخدم
                        const userProfile = {
                            email: userData.email,
                            name: userData.name,
                            mobile: userData.mobile,
                            password: userData.password,
                            role: userData.role || 'مالك',
                            email_confirmed: true,
                            created_at: new Date().toISOString(),
                            status: 'active'
                        };
                        
                        // 4. إضافة بيانات إضافية حسب الصفة
                        if (userData.role === 'وسيط') {
                            if (userData.mediator_type) {
                                userProfile.mediator_type = userData.mediator_type;
                            }
                            
                            if (userData.mediator_type === 'شركة' && userData.company_name) {
                                userProfile.company_name = userData.company_name;
                                if (userData.company_logo) {
                                    userProfile.company_logo = userData.company_logo;
                                }
                            }
                        }
                        
                        if (userData.role === 'مطور' || userData.role === 'شركة') {
                            if (userData.company_name) {
                                userProfile.company_name = userData.company_name;
                            }
                            
                            if (userData.role === 'مطور' && userData.company_address) {
                                userProfile.company_address = userData.company_address;
                            }
                        }
                        
                        // 5. حفظ في قاعدة البيانات
                        console.log('💾 حفظ المستخدم في قاعدة البيانات...');
                        
                        const { data: newUser, error: insertError } = await this.supabaseClient
                            .from('users')
                            .insert([userProfile])
                            .select()
                            .single();
                        
                        if (insertError) {
                            console.warn('⚠️ خطأ في قاعدة البيانات، سيتم الحفظ محلياً:', insertError);
                        } else if (newUser) {
                            // 6. تسجيل الدخول تلقائياً
                            this.currentUser = newUser;
                            localStorage.setItem('arabHomeUser', JSON.stringify(newUser));
                            this.updateUI();
                            
                            console.log('✅ تم إنشاء الحساب بنجاح:', newUser.email);
                            
                            return {
                                success: true,
                                user: newUser,
                                message: 'تم إنشاء الحساب بنجاح!'
                            };
                        }
                    } catch (supabaseError) {
                        console.warn('⚠️ خطأ Supabase في التسجيل:', supabaseError.message);
                        // المتابعة مع التسجيل المحلي
                    }
                }
                
                // التسجيل المحلي (بدون Supabase) - للتطوير والاختبار
                console.log('ℹ️ استخدام التسجيل المحلي');
                
                // تحضير بيانات المستخدم
                const userProfile = {
                    id: 'local_' + Date.now(),
                    email: userData.email,
                    name: userData.name,
                    mobile: userData.mobile,
                    password: userData.password,
                    role: userData.role || 'مالك',
                    email_confirmed: true,
                    created_at: new Date().toISOString(),
                    status: 'active'
                };
                
                // إضافة بيانات إضافية
                if (userData.role === 'وسيط' && userData.mediator_type) {
                    userProfile.mediator_type = userData.mediator_type;
                    if (userData.mediator_type === 'شركة' && userData.company_name) {
                        userProfile.company_name = userData.company_name;
                    }
                }
                
                if ((userData.role === 'مطور' || userData.role === 'شركة') && userData.company_name) {
                    userProfile.company_name = userData.company_name;
                }
                
                // حفظ المستخدم
                this.currentUser = userProfile;
                localStorage.setItem('arabHomeUser', JSON.stringify(userProfile));
                this.updateUI();
                
                console.log('✅ تم إنشاء الحساب بنجاح (محلي):', userProfile.email);
                
                return {
                    success: true,
                    user: userProfile,
                    message: 'تم إنشاء الحساب بنجاح!'
                };
                
            } catch (error) {
                console.error('❌ خطأ في التسجيل:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },
    
    // تسجيل الدخول
    async login(email, password) {
        try {
            // التأكد من تهيئة Supabase
            if (!this.supabaseClient) {
                await this.initialize();
            }
            
            console.log('🔑 محاولة تسجيل دخول:', email);
            
            // إذا كان Supabase متاحاً، البحث في قاعدة البيانات
            if (this.supabaseClient) {
                try {
                    // 1. البحث عن المستخدم في قاعدة البيانات
                    const { data: user, error } = await this.supabaseClient
                        .from('users')
                        .select('*')
                        .eq('email', email)
                        .eq('status', 'active')
                        .maybeSingle();
                    
                    if (error) {
                        console.error('❌ خطأ في البحث:', error);
                        throw new Error('خطأ في النظام');
                    }
                    
                    if (!user) {
                        throw new Error('البريد الإلكتروني غير مسجل');
                    }
                    
                    // 2. التحقق من كلمة المرور
                    if (user.password !== password) {
                        throw new Error('كلمة المرور غير صحيحة');
                    }
                    
                    // 3. تحديث وقت الدخول الأخير
                    await this.supabaseClient
                        .from('users')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', user.id);
                    
                    // 4. تسجيل الدخول
                    this.currentUser = user;
                    localStorage.setItem('arabHomeUser', JSON.stringify(user));
                    this.updateUI();
                    
                    console.log('✅ تم تسجيل الدخول بنجاح:', user.email);
                    
                    return {
                        success: true,
                        user: user
                    };
                } catch (supabaseError) {
                    console.warn('⚠️ خطأ Supabase في تسجيل الدخول:', supabaseError.message);
                    // المتابعة مع المصادقة المحلية
                }
            }
            
            // المصادقة المحلية (بدون Supabase) - للتطوير والاختبار
            console.log('ℹ️ استخدام المصادقة المحلية');
            
            const saved = localStorage.getItem('arabHomeUser');
            if (saved) {
                const user = JSON.parse(saved);
                if (user.email === email && user.password === password) {
                    this.currentUser = user;
                    this.updateUI();
                    console.log('✅ تم تسجيل الدخول بنجاح (محلي):', user.email);
                    return {
                        success: true,
                        user: user
                    };
                }
            }
            
            // إذا لم نجد المستخدم محلياً أيضاً
            throw new Error('بيانات تسجيل الدخول غير صحيحة');
            
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        localStorage.removeItem('arabHomeUser');
        this.updateUI();
        console.log('✅ تم تسجيل الخروج');
        return true;
    },
    
    // تحميل المستخدم من التخزين المحلي
    loadUserFromStorage() {
        try {
            const saved = localStorage.getItem('arabHomeUser');
            if (saved) {
                this.currentUser = JSON.parse(saved);
                console.log('👤 تم تحميل المستخدم من التخزين:', this.currentUser.email);
            }
        } catch (e) {
            console.warn('⚠️ خطأ في تحميل بيانات المستخدم:', e);
        }
    },
    
    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // تحديث واجهة المستخدم
    updateUI() {
        try {
            const welcome = document.getElementById('userWelcome');
            const loginBtn = document.getElementById('loginHeaderBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (this.currentUser) {
                if (welcome) {
                    welcome.textContent = `مرحباً، ${this.currentUser.name || this.currentUser.email.split('@')[0]}!`;
                }
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'block';
                console.log('🔄 تم تحديث واجهة المستخدم: مسجل دخول');
            } else {
                if (welcome) welcome.textContent = 'مرحباً بك في ARAB HOME';
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                console.log('🔄 تم تحديث واجهة المستخدم: غير مسجل');
            }
        } catch (error) {
            console.warn('⚠️ خطأ في تحديث واجهة المستخدم:', error);
        }
    },
    
    // عرض نافذة تسجيل الدخول
    showLoginModal() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.classList.add('active');
        }
    },
    
    // حفظ بيانات المستخدم
    saveUserData(userData) {
        try {
            localStorage.setItem('arabHomeUser', JSON.stringify(userData));
            this.currentUser = userData;
            this.updateUI();
        } catch (e) {
            console.warn('⚠️ خطأ في حفظ بيانات المستخدم:', e);
        }
    },
    
    // تحميل بيانات المستخدم
    loadUserData() {
        return this.currentUser;
    },
    
    // دالة بديلة لتهيئة النظام (للتوافق مع الاستدعاءات القديمة)
    initializeAuth() {
        return this.initialize();
    },
    
    // الحصول على بيانات المستخدم الحالي
    getUserData() {
        return this.currentUser;
    }
};

// تعيين كائن النظام العام
window.authSystem = SimpleAuthSystem;
// js/session-init.js - تهيئة الجلسة تلقائياً عند فتح أي صفحة
(function() {
    'use strict';
    
    // ننتظر تحميل ملف auth.js فقط (بدون الحاجة لـ Supabase)
    function initializeSession() {
        // التحقق من تحميل authSystem فقط
        if (typeof window.authSystem !== 'undefined' && window.authSystem.initialize) {
            console.log('✅ تم تحميل authSystem بنجاح');
            
            // تهيئة نظام المصادقة (تحميل بيانات من localStorage)
            Promise.resolve(window.authSystem.initialize()).then(function(result) {
                // تحميل بيانات المستخدم من localStorage مباشرة للتأكد
                if (!window.authSystem.currentUser) {
                    window.authSystem.loadUserFromStorage();
                }
                
                // تحديث واجهة المستخدم
                if (window.authSystem.updateUI) {
                    window.authSystem.updateUI();
                }
                
                // تسجيل في console
                if (window.authSystem.isLoggedIn()) {
                    console.log('✅ تم تحميل جلسة المستخدم: ' + window.authSystem.currentUser.email);
                } else {
                    console.log('👤 لا توجد جلسة نشطة');
                }
                
                // تشغيل أي دوال تعتمد على تهيئة النظام
                if (window.onSessionInitialized && typeof window.onSessionInitialized === 'function') {
                    window.onSessionInitialized();
                }
            }).catch(function(error) {
                console.warn('⚠️ خطأ في تهيئة الجلسة:', error);
                // حتى مع وجود خطأ، حاول تحميل بيانات المستخدم من localStorage
                if (window.authSystem.loadUserFromStorage) {
                    window.authSystem.loadUserFromStorage();
                }
                if (window.authSystem.updateUI) {
                    window.authSystem.updateUI();
                }
            });
        } else {
            // إعادة محاولة إذا لم يتم تحميل auth.js بعد
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeSession);
            } else {
                // إعادة محاولة بعد 100 ميلي ثانية
                setTimeout(initializeSession, 100);
            }
        }
    }
    
    // بدء التهيئة فوراً عند تحميل النص
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSession);
    } else {
        initializeSession();
    }
})();

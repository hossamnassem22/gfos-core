# دليل المعمارية المؤسسية - GFOS-Core

## المبادئ الأساسية
1. **Clean Architecture:** الـ Domain لا يعتمد على أي طبقة أخرى.
2. **Modular Monolith:** كل موديول (Auth, Billing) هو "صندوق أسود" يسجل نفسه في `ModuleRegistry`.
3. **Decoupling:** التواصل بين الموديولات يتم فقط عبر `EventBus`.
4. **Resilience:** كل اتصال خارجي (DB/API) مغلف بـ `CircuitBreaker`.

## بروتوكول الإضافة
- لإضافة موديول: قم بإنشاء مجلد في `src/modules/` والتزم بـ `ModuleDefinition`.
- لإضافة تبعية: لا تستخدم `new Class()`، استخدم `Container.resolve()`.

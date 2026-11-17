# V Storefront
واجهة متجر V عربية RTL، تُحمّل الإعدادات والمنتجات من خدمة V Admin عبر `ADMIN_API_URL`.

## تشغيل
`npm install && npm run build && npm start`

## الربط
عيّن `ADMIN_API_URL` إلى عنوان خدمة الإدارة في Render. واجهة المتجر لا تحتوي أسرار الإدارة؛ القراءة تتم من API العام.

## حالة الميزات
هذه نقطة انطلاق عملية للواجهة الرئيسية والكتالوج المتصل. السلة والدفع والحسابات والشحن والطلبات وبقية وحدات المتجر تُنفّذ تدريجياً ولا تُعتبر مكتملة في هذا الإصدار.


## Account security configuration

Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the V-Storefront Render service to the public Cloudflare Turnstile site key. The matching private `TURNSTILE_SECRET_KEY` belongs only in V-Admin Render environment variables. Never expose the secret key in the storefront or GitHub.

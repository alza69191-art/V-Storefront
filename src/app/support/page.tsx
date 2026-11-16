import AccountSupport from "../AccountSupport";
import StoreNav from "../StoreNav";
export const dynamic="force-dynamic";
async function getConfig(){try{const r=await fetch((process.env.ADMIN_API_URL||"https://v-admin-api.onrender.com")+"/api/public/config",{cache:"no-store"});return r.ok?await r.json():{};}catch{return {};}}
export default async function SupportPage(){const c=await getConfig();const style:any={"--primary":c.primary||"#5424d8","--secondary":c.secondary||"#1767e8","--page":c.background||"#f7f8fc","--ink":c.text||"#15182b"};return <main className="store storeFrame" style={style}><StoreNav config={c} active="support"/><section className="storeContent subPage"><section className="aboutStore"><small>مركز المساعدة</small><h1>الدعم الفني والشكاوى</h1><p>سجّل الدخول أو أنشئ حساباً لإرسال رسالة ومتابعة ردود فريق الدعم.</p><AccountSupport apiBase={process.env.ADMIN_API_URL||"https://v-admin-api.onrender.com"} initialOpen={true}/></section></section></main>;}

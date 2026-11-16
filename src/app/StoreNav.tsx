"use client";
import AccountSupport from "./AccountSupport";
type Props={config:any;active:string};
const links=[["home","/","الرئيسية"],["products","/products","المنتجات"],["about","/about","من نحن"],["contact","/contact","تواصل معنا"],["support","/support","الدعم الفني"]];
export default function StoreNav({config:c,active}:Props){return <aside className="storeSidebar"><a className="storeBrand" href="/">{c.logoUrl?<img src={c.logoUrl} alt="شعار المتجر"/>:<span className="storeLogo">{c.logoText||"V"}</span>}<span><b>{c.storeName||"V Commerce"}</b><small>المتجر الإلكتروني</small></span></a><nav className="storeSideLinks">{links.map(([id,href,label])=><a key={id} href={href} className={active===id?"selected":""}>{label}</a>)}</nav><div className="storeSideBottom"><AccountSupport apiBase={process.env.ADMIN_API_URL||"https://v-admin-api.onrender.com"}/><small>© {new Date().getFullYear()} {c.storeName||"V Commerce"}</small></div></aside>}

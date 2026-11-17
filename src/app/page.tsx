import MarketplaceHome from "./MarketplaceHome";
export const dynamic="force-dynamic";
async function getConfig(){try{const r=await fetch((process.env.ADMIN_API_URL||"https://v-admin-api.onrender.com")+"/api/public/config",{cache:"no-store"});return r.ok?await r.json():{};}catch{return {};}}
export default async function Home(){const c=await getConfig();return <MarketplaceHome config={c}/>;}

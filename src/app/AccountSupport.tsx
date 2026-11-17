"use client";
import {useCallback,useEffect,useRef,useState} from "react";
type Ticket={id:number;subject:string;status:string;messages:{id:number;sender_type:string;body:string;created_at:string}[]};
type CustomerOrder={id:number;order_number:string;status:string;currency:string;total:number;created_at:string;items:{id:number;title_snapshot:string;quantity:number;unit_price:number}[]};
declare global { interface Window { turnstile?: {render:(el:HTMLElement,opts:any)=>string;reset:(id?:string)=>void}; } }
function Turnstile({onToken}:{onToken:(token:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 const callback=useRef(onToken);callback.current=onToken;
 useEffect(()=>{
  const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if(!siteKey||!ref.current)return;
  let widget:string|undefined;let cancelled=false;
  const render=()=>{if(cancelled||!window.turnstile||!ref.current||widget)return;widget=window.turnstile.render(ref.current,{sitekey:siteKey,callback:(token:string)=>callback.current(token),"expired-callback":()=>callback.current(""),"error-callback":()=>callback.current("")});};
  if(window.turnstile)render();
  else{let script=document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');if(!script){script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;script.defer=true;script.dataset.turnstile="true";document.head.appendChild(script);}script.addEventListener("load",render);}
  return()=>{cancelled=true;if(widget&&window.turnstile)window.turnstile.reset(widget);};
 },[]);
 return <div ref={ref} style={{margin:"12px 0",minHeight:65}}/>;
}
export default function AccountSupport({apiBase,initialOpen=false}:{apiBase:string;initialOpen?:boolean}){
 const [user,setUser]=useState<any>(null),[open,setOpen]=useState(initialOpen),[mode,setMode]=useState<"login"|"register"|"verify">("login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[code,setCode]=useState(""),[accountType,setAccountType]=useState("buyer"),[error,setError]=useState(""),[tickets,setTickets]=useState<Ticket[]>([]),[orders,setOrders]=useState<CustomerOrder[]>([]),[unread,setUnread]=useState(0),[subject,setSubject]=useState(""),[body,setBody]=useState(""),[active,setActive]=useState<number|null>(null),[reply,setReply]=useState(""),[turnstileToken,setTurnstileToken]=useState(""),[resendTurnstileToken,setResendTurnstileToken]=useState(""),[username,setUsername]=useState(""),[bio,setBio]=useState(""),[skills,setSkills]=useState("");
 const base=apiBase.replace(/\/$/,"");
 const onTurnstileToken=useCallback((token:string)=>setTurnstileToken(token),[]);
 const onResendTurnstileToken=useCallback((token:string)=>setResendTurnstileToken(token),[]);
 const resetTurnstile=()=>{window.turnstile?.reset();setTurnstileToken("");setResendTurnstileToken("");};
 async function refresh(){
  try{
   const r=await fetch(base+"/api/customer/auth",{credentials:"include",cache:"no-store"});const x=await r.json();setUser(x.user);
   if(x.user){setAccountType(x.user.account_type||x.user.accountType||"buyer");setUsername(x.user.username||"");setBio(x.user.bio||"");setSkills(Array.isArray(x.user.skills)?x.user.skills.join("، "):"");const [n,o]=await Promise.all([fetch(base+"/api/support/notifications",{credentials:"include"}),fetch(base+"/api/orders",{credentials:"include"})]);if(n.ok)setUnread((await n.json()).count||0);if(o.ok)setOrders(await o.json());if(open){const t=await fetch(base+"/api/support",{credentials:"include"});if(t.ok){setTickets(await t.json());setUnread(0);}}}
   else{setTickets([]);setOrders([]);setUnread(0);}
  }catch{}
 }
 useEffect(()=>{const login=()=>{setMode("login");setOpen(true);};const register=()=>{setMode("register");setOpen(true);};document.addEventListener("vcommerce:open-account",login);document.addEventListener("vcommerce:open-register",register);refresh();const timer=setInterval(refresh,30000);return()=>{clearInterval(timer);document.removeEventListener("vcommerce:open-account",login);document.removeEventListener("vcommerce:open-register",register);};},[open]);
 async function auth(e:React.FormEvent){
  e.preventDefault();setError("");
  const r=await fetch(base+"/api/customer/auth",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:mode,name,email,password,accountType,turnstileToken})});
  const x=await r.json().catch(()=>({}));
  resetTurnstile();
  if(!r.ok){setError(x.error||"تعذر تسجيل الدخول");return;}
  if(x.requiresVerification){setMode("verify");setPassword("");setError("أرسلنا رمز التأكيد إلى بريدك. أدخله لإكمال إنشاء الحساب.");return;}
  setUser(x.user);setPassword("");setOpen(true);await refresh();
 }
 async function verify(e:React.FormEvent){
  e.preventDefault();setError("");
  const r=await fetch(base+"/api/customer/auth/verify",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code,turnstileToken})});
  const x=await r.json().catch(()=>({}));
  setTurnstileToken("");
  if(!r.ok){setError(x.error||"تعذر تأكيد البريد");return;}
  setUser(x.user);setMode("login");setCode("");setOpen(true);await refresh();
 }
 async function saveProfile(e:React.FormEvent){
  e.preventDefault();setError("");
  const r=await fetch(base+"/api/customer/profile",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,bio,skills:skills.split(/[،,]/).map(x=>x.trim()).filter(Boolean),accountType:accountType||user.account_type||user.accountType||"buyer"})});
  const x=await r.json().catch(()=>({}));
  if(!r.ok){setError(x.error||"تعذر حفظ الملف الشخصي");return;}
  setUser(x.user);setError("تم حفظ الملف الشخصي.");
 }
 async function logout(){await fetch(base+"/api/customer/auth",{method:"DELETE",credentials:"include"});setUser(null);setTickets([]);setOrders([]);setUnread(0);setMode("login");}
 async function createTicket(e:React.FormEvent){e.preventDefault();const r=await fetch(base+"/api/support",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject,body})});if(r.ok){setSubject("");setBody("");await refresh();setError("");}else setError("تعذر إرسال الرسالة؛ أعد تسجيل الدخول.");}
 async function sendReply(e:React.FormEvent){e.preventDefault();if(!active||!reply.trim())return;const r=await fetch(base+"/api/support",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({ticketId:active,body:reply})});if(r.ok){setReply("");await refresh();}else setError("تعذر إرسال الرد");}
 return <><div className="accountActions"><button className="accountButton" onClick={()=>{setOpen(!open);setError("");}}>{user?user.name:"حسابي"}</button><button className="bellButton" aria-label="إشعارات الدعم" onClick={()=>{setOpen(true);setError("");}}><span>♢</span>{unread>0&&<i>{unread}</i>}</button></div>
 {open&&<div className="accountBackdrop" onClick={()=>setOpen(false)}><section className="accountPanel" onClick={e=>e.stopPropagation()}><button className="closeAccount" onClick={()=>setOpen(false)}>×</button>
 {!user?(mode==="verify"?<><h2>تأكيد البريد الإلكتروني</h2><p>أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى {email}.</p><form onSubmit={verify}><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="رمز التأكيد" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} required/><Turnstile onToken={onTurnstileToken}/><button className="accountSubmit">تأكيد البريد وإكمال التسجيل</button></form><Turnstile onToken={onResendTurnstileToken}/><button className="switchAuth" onClick={async()=>{setError("");const r=await fetch(base+"/api/customer/auth/resend",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,turnstileToken:resendTurnstileToken})});const x=await r.json().catch(()=>({}));resetTurnstile();setError(x.message||x.error||"تعذر إرسال الرمز.");}} >إعادة إرسال رمز التأكيد</button><button className="switchAuth" onClick={()=>{setMode("register");setError("");}}>العودة إلى التسجيل</button></>:<><h2>{mode==="login"?"تسجيل الدخول":"إنشاء حساب جديد"}</h2><p>أنشئ حساباً للمشتري أو المستقل، ويمكنك تفعيل الدورين لاحقاً.</p><form onSubmit={auth}>{mode==="register"&&<><input placeholder="الاسم الكامل" value={name} onChange={e=>setName(e.target.value)} required/><select value={accountType} onChange={e=>setAccountType(e.target.value)}><option value="buyer">مشتري خدمات / صاحب مشاريع</option><option value="freelancer">مستقل / منفذ مشاريع</option><option value="both">مشتري ومستقل معاً</option><option value="company">شركة / جهة توظيف</option></select></>}<input type="email" autoComplete="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" autoComplete={mode==="login"?"current-password":"new-password"} placeholder="كلمة المرور (10 أحرف على الأقل)" value={password} onChange={e=>setPassword(e.target.value)} minLength={mode==="register"?10:1} maxLength={128} required/><Turnstile onToken={onTurnstileToken}/><button className="accountSubmit">{mode==="login"?"دخول":"إنشاء الحساب وإرسال رمز التأكيد"}</button></form><button className="switchAuth" onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"ليس لديك حساب؟ إنشاء حساب":"هل لديك حساب بالفعل؟ تسجيل الدخول"}</button></>)
 :<><h2>مرحباً، {user.name}</h2><p>{user.email} · {user.account_type==="both"?"مشتري ومستقل":user.account_type==="freelancer"?"مستقل":user.account_type==="company"?"شركة / جهة توظيف":"مشتري"}</p><button className="switchAuth" onClick={logout}>تسجيل الخروج</button><h3>إعداد الملف الشخصي</h3><form onSubmit={saveProfile}><select value={accountType||user.account_type||user.accountType||"buyer"} onChange={e=>setAccountType(e.target.value)}><option value="buyer">مشتري خدمات / صاحب مشاريع</option><option value="freelancer">مستقل / منفذ مشاريع</option><option value="both">مشتري ومستقل معاً</option><option value="company">شركة / جهة توظيف</option></select><input placeholder="اسم المستخدم (مثال: ahmad_design)" value={username} onChange={e=>setUsername(e.target.value)}/><textarea placeholder="نبذة تعريفية عنك وخبراتك" value={bio} onChange={e=>setBio(e.target.value)}/><input placeholder="المهارات مفصولة بفواصل" value={skills} onChange={e=>setSkills(e.target.value)}/><button className="accountSubmit">حفظ الملف الشخصي</button></form><h3>طلباتي ({orders.length})</h3>{orders.length?orders.map(o=><article className="customerTicket" key={o.id}><b>#{o.order_number}</b><span> · {({pending:"بانتظار التأكيد",confirmed:"تم التأكيد",processing:"قيد التجهيز",shipped:"تم الشحن",completed:"مكتمل",cancelled:"ملغي"} as any)[o.status]||o.status}</span><p>{Number(o.total).toFixed(2)} {o.currency} · {new Date(o.created_at).toLocaleDateString("ar")}</p><small>{o.items.map(i=>i.title_snapshot+" × "+i.quantity).join("، ")}</small></article>):<small>لا توجد طلبات سابقة.</small>}<h3>مركز الدعم والشكاوى</h3><form onSubmit={createTicket}><input placeholder="موضوع الرسالة" value={subject} onChange={e=>setSubject(e.target.value)} required/><textarea placeholder="اكتب رسالتك أو شكواك..." value={body} onChange={e=>setBody(e.target.value)} required/><button className="accountSubmit">إرسال إلى الدعم</button></form><h3>رسائلي والردود</h3>{tickets.map(t=><article className="customerTicket" key={t.id}><button className="ticketTitle" onClick={()=>setActive(active===t.id?null:t.id)}>{t.subject} · {t.status==="answered"?"تم الرد":t.status==="closed"?"مغلقة":"قيد المتابعة"}</button>{active===t.id&&<><div className="ticketMessages">{t.messages.map(m=><p key={m.id} className={m.sender_type==="admin"?"fromSupport":"fromCustomer"}><b>{m.sender_type==="admin"?"الدعم":"أنت"}:</b> {m.body}</p>)}</div><form onSubmit={sendReply}><textarea placeholder="اكتب ردك..." value={reply} onChange={e=>setReply(e.target.value)}/><button className="accountSubmit">إرسال الرد</button></form></>}</article>)}{tickets.length===0&&<small>لا توجد محادثات بعد.</small>}</>}
 {error&&<p className="accountError">{error}</p>}</section></div>}</>;
}
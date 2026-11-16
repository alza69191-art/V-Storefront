"use client";
import {useEffect,useState} from "react";
type Ticket={id:number;subject:string;status:string;messages:{id:number;sender_type:string;body:string;created_at:string}[]};
export default function AccountSupport({apiBase}:{apiBase:string}){const [user,setUser]=useState<any>(null),[open,setOpen]=useState(false),[mode,setMode]=useState<"login"|"register">("login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[tickets,setTickets]=useState<Ticket[]>([]),[unread,setUnread]=useState(0),[subject,setSubject]=useState(""),[body,setBody]=useState(""),[active,setActive]=useState<number|null>(null),[reply,setReply]=useState("");
const base=apiBase.replace(/\/$/,"");
async function refresh(){try{const r=await fetch(base+"/api/customer/auth",{credentials:"include"});const x=await r.json();setUser(x.user);if(x.user){const n=await fetch(base+"/api/support/notifications",{credentials:"include"});if(n.ok)setUnread((await n.json()).count||0);if(open){const t=await fetch(base+"/api/support",{credentials:"include"});if(t.ok){setTickets(await t.json());setUnread(0);}}}}catch{}}
useEffect(()=>{refresh();const timer=setInterval(refresh,30000);return()=>clearInterval(timer);},[open]);

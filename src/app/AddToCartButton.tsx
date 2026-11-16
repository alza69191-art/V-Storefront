"use client";
type Product={id:number;title:string;price:number;currency:string;stock:number};
export default function AddToCartButton({product}:{product:Product}){
 return <button className="addToCart" disabled={product.stock<1} onClick={()=>window.dispatchEvent(new CustomEvent("v-commerce:add",{detail:product}))}>{product.stock>0?"أضف إلى السلة":"غير متوفر"}</button>;
}
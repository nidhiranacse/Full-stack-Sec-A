const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export function getToken(){return localStorage.getItem('booknest_token');}
export function getUser(){try{return JSON.parse(localStorage.getItem('booknest_user')||'null')}catch{return null}}
export function logout(){localStorage.removeItem('booknest_token');localStorage.removeItem('booknest_user');window.location.href='/login';}
export async function api(path, options={}) {
 const headers={'Content-Type':'application/json',...(options.headers||{})};
 const token=getToken();if(token)headers.Authorization=`Bearer ${token}`;
 const response=await fetch(`${BASE}${path}`,{...options,headers});
 let body={};try{body=await response.json()}catch{}
 if(response.status===401){logout();throw new Error(body?.error?.message||'Please log in again.')}
 if(!response.ok)throw new Error(body?.error?.message||'Request failed.');
 return body;
}

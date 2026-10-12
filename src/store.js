const DB='private-circle-alpha';const KEY='state';let dbPromise;
function db(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return dbPromise;}
export async function load(){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('data','readonly');const q=t.objectStore('data').get(KEY);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);});}
export async function save(value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('data','readwrite');t.objectStore('data').put(value,KEY);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
export function initial(){return {version:1,profile:null,identity:null,circles:[],events:[],contacts:[],settings:{theme:'system',wifiPhotos:false},draft:{text:'',links:[],circleId:'',images:[]}};}

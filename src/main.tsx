import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

if('serviceWorker' in navigator)window.addEventListener('load',async()=>{
  let hadController=Boolean(navigator.serviceWorker.controller),reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloading){reloading=true;window.location.reload()}hadController=true});
  try{
    const registration=await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'});
    const update=()=>registration.update().catch(error=>console.warn('App update check failed',error));
    registration.waiting?.postMessage({type:'SKIP_WAITING'});
    registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'})})});
    window.addEventListener('online',update);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')update()});
    await update();
  }catch(error){console.warn('Notification service worker could not be registered',error)}
});

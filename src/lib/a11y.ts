import { useEffect } from 'react';

const selector='button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';

export const useDialogFocusManager = () => useEffect(()=>{
  let active:HTMLElement|null=null,restore:HTMLElement|null=null;
  const sync=()=>{const dialogs=Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')),next=dialogs[dialogs.length-1]||null;if(next===active)return;if(active&&!next)restore?.focus();if(next){restore=document.activeElement instanceof HTMLElement?document.activeElement:null;active=next;queueMicrotask(()=>{if(active&&!active.contains(document.activeElement))(active.querySelector<HTMLElement>('[autofocus]')||active.querySelector<HTMLElement>(selector))?.focus()})}else active=null};
  const trap=(event:KeyboardEvent)=>{if(event.key!=='Tab'||!active)return;const focusable=Array.from(active.querySelectorAll<HTMLElement>(selector)).filter(element=>element.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('keydown',trap);sync();return()=>{observer.disconnect();document.removeEventListener('keydown',trap)};
},[]);

import { useCallback,useEffect,useRef,useState } from 'react';
import type { MutableRefObject } from 'react';
import type { User } from 'firebase/auth';
import type { FocusToolState } from '../types';
import { getLocalModifiedAt,setLocalModifiedAt,normalizeState } from '../repositories/localProgressRepository';

export type CloudSyncStatus='local'|'connecting'|'syncing'|'saved'|'offline'|'error';
export interface CloudAccount { uid:string; displayName:string; email:string; photoURL?:string }
export interface CloudSyncController { account:CloudAccount|null; status:CloudSyncStatus; error:string; lastSyncedAt?:number; queueSave:(state:FocusToolState)=>void; signIn:()=>Promise<void>; signOut:()=>Promise<void> }

const deviceKey='focus-tool:device-id';
let firebasePromise:Promise<Awaited<ReturnType<typeof loadFirebaseModules>>>|undefined;
const loadFirebaseModules=async()=>{const [core,auth,database]=await Promise.all([import('./firebase'),import('firebase/auth'),import('firebase/firestore')]);return {...core,...auth,...database}};
const firebase=()=>firebasePromise??=loadFirebaseModules();
const getDeviceId=()=>{let id=localStorage.getItem(deviceKey);if(!id){id=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(deviceKey,id)}return id};
const cleanState=(state:FocusToolState):FocusToolState=>JSON.parse(JSON.stringify(state));
const hasMeaningfulLocalData=(state:FocusToolState)=>Boolean(state.profile.name||state.tasks.length||state.groups.length||state.expenses.length||state.focusSessions.length||state.pointEvents.length||Object.keys(state.checkIns).length||Object.keys(state.periodTracking.days).length||state.periodTracking.markers.length);
const accountFrom=(user:User):CloudAccount=>({uid:user.uid,displayName:user.displayName||'Google user',email:user.email||'',photoURL:user.photoURL||undefined});
const friendlyError=(error:unknown)=>{const code=typeof error==='object'&&error&&'code' in error?String((error as {code?:string}).code):'';if(code.includes('unauthorized-domain'))return 'This website must be added to Firebase Authentication → Authorized domains.';if(code.includes('popup-closed'))return 'Google sign-in was closed before it finished.';if(code.includes('permission-denied'))return 'Cloud access is blocked. Check the Firestore security rules.';if(!navigator.onLine)return 'You are offline. Changes remain safely stored on this device.';return 'Cloud sync is not ready yet. Check Firebase Authentication and Firestore settings.'};

export function useCloudSync(latestState:MutableRefObject<FocusToolState>,applyRemote:(state:FocusToolState)=>void):CloudSyncController{
  const [account,setAccount]=useState<CloudAccount|null>(null),[status,setStatus]=useState<CloudSyncStatus>('local'),[error,setError]=useState(''),[lastSyncedAt,setLastSyncedAt]=useState<number>();
  const userRef=useRef<User|null>(null),readyRef=useRef(false),pendingRef=useRef<{state:FocusToolState;changedAt:number}|null>(null),timerRef=useRef<number|undefined>(undefined);
  const deviceId=useRef(getDeviceId()).current;

  const uploadNow=useCallback(async()=>{
    const user=userRef.current,pending=pendingRef.current;if(!user||!readyRef.current||!pending)return;
    if(!navigator.onLine){setStatus('offline');return}
    setStatus('syncing');setError('');
    try{const sdk=await firebase();await sdk.setDoc(sdk.doc(sdk.firestore,'users',user.uid),{state:cleanState(pending.state),updatedAt:sdk.serverTimestamp(),updatedAtMs:pending.changedAt,deviceId});if(pendingRef.current===pending)pendingRef.current=null;setLastSyncedAt(pending.changedAt);setStatus('saved')}
    catch(reason){setStatus(navigator.onLine?'error':'offline');setError(friendlyError(reason))}
  },[deviceId]);

  const queueSave=useCallback((state:FocusToolState)=>{const changedAt=Date.now();setLocalModifiedAt(changedAt);pendingRef.current={state,changedAt};if(timerRef.current)window.clearTimeout(timerRef.current);timerRef.current=window.setTimeout(()=>void uploadNow(),650)},[uploadNow]);

  useEffect(()=>{
    let cancelled=false,unsubscribeDocument=()=>{},unsubscribeAuth=()=>{};
    void firebase().then(async sdk=>{
      await sdk.authPersistenceReady;
      await sdk.getRedirectResult(sdk.firebaseAuth).catch(reason=>{if(!cancelled){setError(friendlyError(reason));setStatus('error')}});
      if(cancelled)return;
      unsubscribeAuth=sdk.onAuthStateChanged(sdk.firebaseAuth,user=>{
        unsubscribeDocument();userRef.current=user;readyRef.current=false;setAccount(user?accountFrom(user):null);setError('');
        if(!user){setStatus('local');return}
        setStatus(navigator.onLine?'connecting':'offline');
        void (async()=>{
          const reference=sdk.doc(sdk.firestore,'users',user.uid);
          try{
            const snapshot=await sdk.getDoc(reference);if(cancelled)return;
            const cloud=snapshot.exists()?snapshot.data():undefined,cloudUpdatedAt=Number(cloud?.updatedAtMs)||0,localUpdatedAt=getLocalModifiedAt();
            const shouldUseCloud=Boolean(cloud?.state)&&(localUpdatedAt>0?cloudUpdatedAt>=localUpdatedAt:!hasMeaningfulLocalData(latestState.current));
            if(shouldUseCloud){const remote=normalizeState(cloud?.state);setLocalModifiedAt(cloudUpdatedAt);latestState.current=remote;applyRemote(remote);setLastSyncedAt(cloudUpdatedAt)}
            else{const changedAt=Math.max(localUpdatedAt,Date.now());setLocalModifiedAt(changedAt);pendingRef.current={state:latestState.current,changedAt}}
            readyRef.current=true;
            unsubscribeDocument=sdk.onSnapshot(reference,{includeMetadataChanges:true},remoteSnapshot=>{
              if(!remoteSnapshot.exists())return;const data=remoteSnapshot.data(),remoteAt=Number(data.updatedAtMs)||0;
              if(remoteSnapshot.metadata.hasPendingWrites){setStatus('syncing');return}
              setLastSyncedAt(remoteAt||Date.now());setStatus('saved');
              if(data.deviceId!==deviceId&&data.state&&remoteAt>getLocalModifiedAt()){const remote=normalizeState(data.state);setLocalModifiedAt(remoteAt);latestState.current=remote;applyRemote(remote)}
            },reason=>{setStatus(navigator.onLine?'error':'offline');setError(friendlyError(reason))});
            if(pendingRef.current)await uploadNow();else setStatus('saved');
          }catch(reason){if(!cancelled){readyRef.current=true;setStatus(navigator.onLine?'error':'offline');setError(friendlyError(reason))}}
        })();
      });
    }).catch(reason=>{if(!cancelled){setStatus('error');setError(friendlyError(reason))}});
    const online=()=>{if(userRef.current){setStatus('connecting');void uploadNow()}},offline=()=>{if(userRef.current)setStatus('offline')};
    window.addEventListener('online',online);window.addEventListener('offline',offline);
    return()=>{cancelled=true;unsubscribeAuth();unsubscribeDocument();window.removeEventListener('online',online);window.removeEventListener('offline',offline);if(timerRef.current)window.clearTimeout(timerRef.current)};
  },[applyRemote,deviceId,latestState,uploadNow]);

  const connect=useCallback(async()=>{setStatus('connecting');setError('');try{const sdk=await firebase();await sdk.authPersistenceReady;const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await sdk.signInWithPopup(sdk.firebaseAuth,provider)}catch(reason){const code=typeof reason==='object'&&reason&&'code' in reason?String((reason as {code?:string}).code):'';if(code.includes('popup-blocked')){const sdk=await firebase();await sdk.signInWithRedirect(sdk.firebaseAuth,new sdk.GoogleAuthProvider())}else{setStatus('error');setError(friendlyError(reason))}}},[]);
  const disconnect=useCallback(async()=>{const sdk=await firebase();await sdk.signOut(sdk.firebaseAuth);setAccount(null);setStatus('local');setError('')},[]);
  return {account,status,error,lastSyncedAt,queueSave,signIn:connect,signOut:disconnect};
}

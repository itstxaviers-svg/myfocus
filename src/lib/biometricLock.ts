const storageKey='focus-tool:biometric-credential';

type BiometricRecord={credentialId:string};

const randomBytes=(length:number)=>crypto.getRandomValues(new Uint8Array(length));
const toBase64Url=(value:ArrayBuffer)=>{let binary='';for(const byte of new Uint8Array(value))binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const fromBase64Url=(value:string)=>{const base64=value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'='),binary=atob(base64),bytes=new Uint8Array(binary.length);for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);return bytes};
const readRecord=():BiometricRecord|null=>{try{const parsed=JSON.parse(localStorage.getItem(storageKey)||'null');return typeof parsed?.credentialId==='string'&&parsed.credentialId?parsed:null}catch{return null}};

export const hasBiometricUnlock=()=>Boolean(readRecord());
export const clearBiometricUnlock=()=>{try{localStorage.removeItem(storageKey)}catch{/* The PIN fallback still works. */}};

export const biometricUnlockAvailable=async()=>{
  if(!window.isSecureContext||!('PublicKeyCredential' in window)||typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable!=='function')return false;
  try{return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()}catch{return false}
};

export const enableBiometricUnlock=async()=>{
  if(!await biometricUnlockAvailable())throw new Error('Face ID is not available in this browser.');
  const credential=await navigator.credentials.create({publicKey:{challenge:randomBytes(32),rp:{name:'Focus Tool'},user:{id:randomBytes(16),name:'focus-tool-owner',displayName:'Focus Tool owner'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'discouraged',requireResidentKey:false,userVerification:'required'},timeout:60000,attestation:'none'}}) as PublicKeyCredential|null;
  if(!credential)throw new Error('Face ID setup was not completed.');
  localStorage.setItem(storageKey,JSON.stringify({credentialId:toBase64Url(credential.rawId)} satisfies BiometricRecord));
};

export const authenticateWithBiometrics=async()=>{
  const record=readRecord();if(!record||!await biometricUnlockAvailable())return false;
  const credential=await navigator.credentials.get({publicKey:{challenge:randomBytes(32),allowCredentials:[{type:'public-key',id:fromBase64Url(record.credentialId),transports:['internal']}],userVerification:'required',timeout:60000}});
  return credential instanceof PublicKeyCredential;
};

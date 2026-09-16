import { useState } from 'react';
import { Coins, Plus, ReceiptText, Save, Sparkles, Trash2, UserPlus, UsersRound, WalletCards, X } from 'lucide-react';
import { assets } from '../assets/manifest';
import { localDateKey, uid } from '../lib/dates';
import { childCount, childIncome, formatMoney, groupIncome, paymentCount, totalIncome } from '../lib/groups';
import type { Child, Group, IncomeCurrency } from '../types';

type ChildTarget = { groupId:string };
type PaymentTarget = { groupId:string; childId:string; childName:string };

export function GroupsPage({groups,currency,onGroups,onCurrency}:{groups:Group[];currency:IncomeCurrency;onGroups:(groups:Group[])=>void;onCurrency:(currency:IncomeCurrency)=>void}) {
  const [groupOpen,setGroupOpen] = useState(false);
  const [childTarget,setChildTarget] = useState<ChildTarget|null>(null);
  const [paymentTarget,setPaymentTarget] = useState<PaymentTarget|null>(null);
  const income=totalIncome(groups), children=childCount(groups), payments=paymentCount(groups);

  const addGroup=(name:string,description:string)=>{onGroups([...groups,{id:uid(),name,description:description||undefined,children:[],createdAt:Date.now()}]);setGroupOpen(false)};
  const addChild=(draft:Omit<Child,'id'|'payments'|'createdAt'>)=>{if(!childTarget)return;onGroups(groups.map(group=>group.id===childTarget.groupId?{...group,children:[...group.children,{...draft,id:uid(),payments:[],createdAt:Date.now()}]}:group));setChildTarget(null)};
  const addPayment=(amount:number,paidAt:string,note:string)=>{if(!paymentTarget)return;onGroups(groups.map(group=>group.id===paymentTarget.groupId?{...group,children:group.children.map(child=>child.id===paymentTarget.childId?{...child,payments:[...child.payments,{id:uid(),amount,paidAt,note:note||undefined,createdAt:Date.now()}]}:child)}:group));setPaymentTarget(null)};
  const removeGroup=(group:Group)=>{if(window.confirm(`Delete “${group.name}” and all its child records?`))onGroups(groups.filter(item=>item.id!==group.id))};
  const removeChild=(groupId:string,child:Child)=>{if(window.confirm(`Delete ${child.name} and all payment records?`))onGroups(groups.map(group=>group.id===groupId?{...group,children:group.children.filter(item=>item.id!==child.id)}:group))};
  const removePayment=(groupId:string,childId:string,paymentId:string)=>{if(window.confirm('Delete this payment?'))onGroups(groups.map(group=>group.id===groupId?{...group,children:group.children.map(child=>child.id===childId?{...child,payments:child.payments.filter(payment=>payment.id!==paymentId)}:child)}:group))};

  return <section className="groups-page">
    <div className="groups-hero">
      <img src={assets.rewards.crystal} alt=""/>
      <div className="groups-intro"><small>GROUPS & PAYMENTS</small><h1>Learning groups</h1><p>Keep every child and payment together in one magical place.</p></div>
      <label className="currency-picker"><span>Currency</span><select value={currency} onChange={event=>onCurrency(event.target.value as IncomeCurrency)}><option value="RUB">RUB · ₽</option><option value="USD">USD · $</option><option value="EUR">EUR · €</option><option value="GBP">GBP · £</option></select></label>
      <div className="income-total"><Coins size={24}/><span>Total income</span><strong>{formatMoney(income,currency)}</strong></div>
      <div className="income-stat"><UsersRound size={20}/><strong>{groups.length}</strong><span>{groups.length===1?'group':'groups'}</span></div>
      <div className="income-stat"><UserPlus size={20}/><strong>{children}</strong><span>{children===1?'child':'children'}</span></div>
      <div className="income-stat"><ReceiptText size={20}/><strong>{payments}</strong><span>{payments===1?'payment':'payments'}</span></div>
    </div>

    <div className="groups-toolbar"><div><small>YOUR CLASSES</small><h2>Groups and children</h2></div><button className="primary" onClick={()=>setGroupOpen(true)}><Plus size={18}/> New group</button></div>

    {groups.length===0?<div className="groups-empty panel"><img src={assets.mascots.emptyCalendar} alt=""/><h2>Create your first group</h2><p>Add a class, then build its child list and record payments.</p><button className="primary" onClick={()=>setGroupOpen(true)}><Sparkles size={18}/> Create group</button></div>:<div className="groups-grid">{groups.map(group=><article className="group-card" key={group.id}>
      <header className="group-card-head"><div className="group-badge"><UsersRound size={24}/></div><div><h2>{group.name}</h2><p>{group.description||`${group.children.length} ${group.children.length===1?'child':'children'}`}</p></div><div className="group-income"><span>Group income</span><strong>{formatMoney(groupIncome(group),currency)}</strong></div><button className="icon small" aria-label={`Delete ${group.name}`} onClick={()=>removeGroup(group)}><Trash2 size={15}/></button></header>
      <div className="group-actions"><span>{group.children.length} {group.children.length===1?'child':'children'}</span><button className="secondary compact" onClick={()=>setChildTarget({groupId:group.id})}><UserPlus size={15}/> Add child</button></div>
      {group.children.length===0?<div className="children-empty"><span>☆</span><p>No children yet</p></div>:<div className="children-list">{group.children.map(child=><article className="child-card" key={child.id}>
        <div className="child-main"><span className="child-avatar">{child.name.slice(0,1).toUpperCase()}</span><div className="child-copy"><strong>{child.name}</strong><span>{[child.guardian,child.contact].filter(Boolean).join(' · ')||'Child information'}</span>{child.notes&&<small>{child.notes}</small>}</div><div className="child-paid"><span>Paid</span><strong>{formatMoney(childIncome(child),currency)}</strong></div></div>
        <div className="child-actions"><button className="secondary compact" onClick={()=>setPaymentTarget({groupId:group.id,childId:child.id,childName:child.name})}><WalletCards size={15}/> Add payment</button><button className="icon small" aria-label={`Delete ${child.name}`} onClick={()=>removeChild(group.id,child)}><Trash2 size={14}/></button></div>
        {child.payments.length>0&&<details className="payment-history"><summary>{child.payments.length} {child.payments.length===1?'payment':'payments'} · View history</summary><div>{[...child.payments].sort((a,b)=>b.paidAt.localeCompare(a.paidAt)).map(payment=><div className="payment-row" key={payment.id}><span><b>{new Date(`${payment.paidAt}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</b>{payment.note&&<small>{payment.note}</small>}</span><strong>{formatMoney(payment.amount,currency)}</strong><button aria-label="Delete payment" onClick={()=>removePayment(group.id,child.id,payment.id)}><X size={14}/></button></div>)}</div></details>}
      </article>)}</div>}
    </article>)}</div>}

    {groupOpen&&<GroupModal onClose={()=>setGroupOpen(false)} onSave={addGroup}/>} 
    {childTarget&&<ChildModal onClose={()=>setChildTarget(null)} onSave={addChild}/>} 
    {paymentTarget&&<PaymentModal childName={paymentTarget.childName} onClose={()=>setPaymentTarget(null)} onSave={addPayment}/>} 
  </section>;
}

function GroupModal({onClose,onSave}:{onClose:()=>void;onSave:(name:string,description:string)=>void}) {
  const [name,setName]=useState(''),[description,setDescription]=useState('');
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal group-form" onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();if(name.trim())onSave(name.trim(),description.trim())}}><div className="modal-head"><h2>New group</h2><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><label>Group name<input autoFocus required maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder="e.g. Little Stars"/></label><label>Description<input maxLength={160} value={description} onChange={event=>setDescription(event.target.value)} placeholder="Schedule, level, or a short note"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary"><Save size={16}/> Create group</button></div></form></div>;
}

function ChildModal({onClose,onSave}:{onClose:()=>void;onSave:(child:Omit<Child,'id'|'payments'|'createdAt'>)=>void}) {
  const [name,setName]=useState(''),[guardian,setGuardian]=useState(''),[contact,setContact]=useState(''),[notes,setNotes]=useState('');
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal child-form" onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();if(name.trim())onSave({name:name.trim(),guardian:guardian.trim()||undefined,contact:contact.trim()||undefined,notes:notes.trim()||undefined})}}><div className="modal-head"><h2>Add child</h2><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><label>Child name<input autoFocus required maxLength={100} value={name} onChange={event=>setName(event.target.value)} placeholder="Full name"/></label><div className="form-grid"><label>Parent or guardian<input maxLength={100} value={guardian} onChange={event=>setGuardian(event.target.value)} placeholder="Name"/></label><label>Contact<input maxLength={100} value={contact} onChange={event=>setContact(event.target.value)} placeholder="Phone or email"/></label></div><label>Notes<textarea maxLength={500} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Important information about the child"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary"><UserPlus size={16}/> Add child</button></div></form></div>;
}

function PaymentModal({childName,onClose,onSave}:{childName:string;onClose:()=>void;onSave:(amount:number,paidAt:string,note:string)=>void}) {
  const [amount,setAmount]=useState(''),[paidAt,setPaidAt]=useState(localDateKey()),[note,setNote]=useState('');
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal payment-form" onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();const value=Number(amount);if(value>0)onSave(value,paidAt,note.trim())}}><div className="modal-head"><div><h2>Add payment</h2><p>{childName}</p></div><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><div className="form-grid"><label>Amount<input autoFocus required type="number" min="0.01" step="0.01" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="0.00"/></label><label>Payment date<input required type="date" value={paidAt} onChange={event=>setPaidAt(event.target.value)}/></label></div><label>Note<input maxLength={160} value={note} onChange={event=>setNote(event.target.value)} placeholder="Month, lesson package, or other detail"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary"><WalletCards size={16}/> Add payment</button></div></form></div>;
}

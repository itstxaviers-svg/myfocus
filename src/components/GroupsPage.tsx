import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Coins, Edit3, Pencil, Plus, ReceiptText, Save, Trash2, UserPlus, UsersRound, WalletCards, X } from 'lucide-react';
import { assets } from '../assets/manifest';
import { localDateKey, uid } from '../lib/dates';
import { childCount, childIncomeForMonth, childPaymentsForMonth, formatMoney, groupIncomeForMonth, paymentCountForMonth, totalIncomeForMonth } from '../lib/groups';
import { shortWeekdayLabels } from '../lib/attendance';
import type { Child, Group, IncomeCurrency, Payment, Weekday } from '../types';

type ChildTarget = { groupId:string };
type PaymentTarget = { groupId:string; childId:string; childName:string; payment?:Payment };
type NewChildDraft = { name:string; notes?:string; paymentAmount?:number };
const currentMonthKey=()=>localDateKey().slice(0,7);
const moveMonth=(key:string,offset:number)=>{const [year,month]=key.split('-').map(Number),date=new Date(year,month-1+offset,1);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`};
const monthTitle=(key:string)=>{const [year,month]=key.split('-').map(Number);return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(year,month-1,1))};
const paymentDateForMonth=(key:string)=>key===currentMonthKey()?localDateKey():`${key}-01`;
const useEscapeClose=(onClose:()=>void)=>useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose]);

export function GroupsPage({groups,currency,onGroups,onCurrency}:{groups:Group[];currency:IncomeCurrency;onGroups:(groups:Group[])=>void;onCurrency:(currency:IncomeCurrency)=>void}) {
  const [groupEditor,setGroupEditor] = useState<{group?:Group}|null>(null);
  const [childTarget,setChildTarget] = useState<ChildTarget|null>(null);
  const [paymentTarget,setPaymentTarget] = useState<PaymentTarget|null>(null);
  const [openGroupId,setOpenGroupId] = useState<string|null>(null);
  const [paymentMonth,setPaymentMonth] = useState(currentMonthKey());
  const income=totalIncomeForMonth(groups,paymentMonth,currency), children=childCount(groups), payments=paymentCountForMonth(groups,paymentMonth,currency);
  const openGroup=groups.find(group=>group.id===openGroupId);

  const saveGroup=(draft:{name:string;description?:string;scheduleWeekdays:Weekday[]})=>{const editing=groupEditor?.group;if(editing)onGroups(groups.map(group=>group.id===editing.id?{...group,...draft}:group));else{const id=uid();onGroups([...groups,{id,...draft,children:[],createdAt:Date.now()}]);setOpenGroupId(id)}setGroupEditor(null)};
  const addChild=(draft:NewChildDraft)=>{if(!childTarget)return;const payment:Payment|undefined=draft.paymentAmount&&draft.paymentAmount>0?{id:uid(),amount:draft.paymentAmount,paidAt:paymentDateForMonth(paymentMonth),currency,createdAt:Date.now()}:undefined;onGroups(groups.map(group=>group.id===childTarget.groupId?{...group,children:[...group.children,{id:uid(),name:draft.name,notes:draft.notes,payments:payment?[payment]:[],createdAt:Date.now()}]}:group));setChildTarget(null)};
  const savePayment=(draft:{amount:number;paidAt:string;note:string})=>{if(!paymentTarget)return;const editing=paymentTarget.payment;onGroups(groups.map(group=>group.id===paymentTarget.groupId?{...group,children:group.children.map(child=>child.id===paymentTarget.childId?{...child,payments:editing?child.payments.map(payment=>payment.id===editing.id?{...payment,...draft,note:draft.note||undefined,updatedAt:Date.now()}:payment):[...child.payments,{id:uid(),...draft,currency,note:draft.note||undefined,createdAt:Date.now()}]}:child)}:group));setPaymentTarget(null)};
  const removeGroup=(group:Group)=>{if(window.confirm(`Delete “${group.name}” and all its child records?`)){onGroups(groups.filter(item=>item.id!==group.id));setOpenGroupId(null)}};
  const removeChild=(groupId:string,child:Child)=>{if(window.confirm(`Delete ${child.name} and all payment records?`))onGroups(groups.map(group=>group.id===groupId?{...group,children:group.children.filter(item=>item.id!==child.id)}:group))};
  const removePayment=(groupId:string,childId:string,paymentId:string)=>{if(window.confirm('Delete this payment?'))onGroups(groups.map(group=>group.id===groupId?{...group,children:group.children.map(child=>child.id===childId?{...child,payments:child.payments.filter(payment=>payment.id!==paymentId)}:child)}:group))};

  return <section className="groups-page">
    <div className="groups-hero">
      <img src={assets.rewards.crystal} alt=""/>
      <div className="groups-intro"><small>GROUPS & PAYMENTS</small><h1>Learning groups</h1><p>Keep every child and payment together in one magical place.</p></div>
      <label className="currency-picker"><span>Currency</span><select value={currency} onChange={event=>onCurrency(event.target.value as IncomeCurrency)}><option value="RUB">RUB · ₽</option><option value="USD">USD · $</option><option value="EUR">EUR · €</option><option value="GBP">GBP · £</option></select><small>New payments use this currency; saved payments keep theirs.</small></label>
      <div className="groups-month month-switcher"><button aria-label="Previous month" onClick={()=>setPaymentMonth(value=>moveMonth(value,-1))}><ChevronLeft size={18}/></button><strong>{monthTitle(paymentMonth)}</strong><button aria-label="Next month" onClick={()=>setPaymentMonth(value=>moveMonth(value,1))}><ChevronRight size={18}/></button></div>
      <div className="income-total"><Coins size={24}/><span>Income in {monthTitle(paymentMonth)} · {currency}</span><strong>{formatMoney(income,currency)}</strong></div>
      <div className="income-stats">
        <div className="income-stat"><UsersRound size={20}/><strong>{groups.length}</strong><span>Groups</span></div>
        <div className="income-stat"><UserPlus size={20}/><strong>{children}</strong><span>Children</span></div>
        <div className="income-stat"><ReceiptText size={20}/><strong>{payments}</strong><span>Payments · {currency}</span></div>
      </div>
    </div>

    <div className="groups-toolbar"><div><small>YOUR CLASSES</small><h2>Groups and children</h2></div><button className="primary" onClick={()=>setGroupEditor({})}><Plus size={18}/> New group</button></div>

    {groups.length===0?<div className="groups-empty panel"><img src={assets.mascots.emptyCalendar} alt=""/><h2>Create your first group</h2><p>Use the New group button above to add a class, then build its child list and record payments.</p></div>:<div className="group-tabs" aria-label="Groups">{groups.map(group=><button className="group-tab" key={group.id} onClick={()=>setOpenGroupId(group.id)}><span className="group-badge"><UsersRound size={22}/></span><span className="group-tab-copy"><strong>{group.name}</strong><small>{group.scheduleWeekdays.length?group.scheduleWeekdays.map(day=>shortWeekdayLabels[day]).join(' · '):'Schedule not set'}</small><em>{group.children.length} {group.children.length===1?'child':'children'} · {formatMoney(groupIncomeForMonth(group,paymentMonth,currency),currency)} in {monthTitle(paymentMonth)}</em></span><ChevronRight size={20}/></button>)}</div>}

    {openGroup&&!groupEditor&&!childTarget&&!paymentTarget&&<GroupDetailsModal group={openGroup} currency={currency} monthKey={paymentMonth} onClose={()=>setOpenGroupId(null)} onEdit={()=>setGroupEditor({group:openGroup})} onDelete={()=>removeGroup(openGroup)} onAddChild={()=>setChildTarget({groupId:openGroup.id})} onAddPayment={(child)=>setPaymentTarget({groupId:openGroup.id,childId:child.id,childName:child.name})} onEditPayment={(child,payment)=>setPaymentTarget({groupId:openGroup.id,childId:child.id,childName:child.name,payment})} onDeleteChild={(child)=>removeChild(openGroup.id,child)} onDeletePayment={(childId,paymentId)=>removePayment(openGroup.id,childId,paymentId)}/>}
    {groupEditor&&<GroupModal group={groupEditor.group} onClose={()=>setGroupEditor(null)} onSave={saveGroup}/>}
    {childTarget&&<ChildModal monthKey={paymentMonth} onClose={()=>setChildTarget(null)} onSave={addChild}/>}
    {paymentTarget&&<PaymentModal childName={paymentTarget.childName} monthKey={paymentMonth} currency={currency} payment={paymentTarget.payment} onClose={()=>setPaymentTarget(null)} onSave={savePayment}/>}
  </section>;
}

function GroupDetailsModal({group,currency,monthKey,onClose,onEdit,onDelete,onAddChild,onAddPayment,onEditPayment,onDeleteChild,onDeletePayment}:{group:Group;currency:IncomeCurrency;monthKey:string;onClose:()=>void;onEdit:()=>void;onDelete:()=>void;onAddChild:()=>void;onAddPayment:(child:Child)=>void;onEditPayment:(child:Child,payment:Payment)=>void;onDeleteChild:(child:Child)=>void;onDeletePayment:(childId:string,paymentId:string)=>void}) {
  useEscapeClose(onClose);
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal group-details-modal" role="dialog" aria-modal="true" aria-label={`${group.name} details`} onMouseDown={event=>event.stopPropagation()}>
    <div className="modal-head"><div><small>GROUP DETAILS</small><h2>{group.name}</h2><p>{group.scheduleWeekdays.length?group.scheduleWeekdays.map(day=>shortWeekdayLabels[day]).join(' · '):'Schedule not set'}</p></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
    <div className="group-detail-summary"><span><small>Children</small><strong>{group.children.length}</strong></span><span><small>Paid in {monthTitle(monthKey)} · {currency}</small><strong>{formatMoney(groupIncomeForMonth(group,monthKey,currency),currency)}</strong></span></div>
    <div className="group-detail-actions"><button className="secondary" onClick={onEdit}><Edit3 size={16}/> Edit group</button><button className="primary" onClick={onAddChild}><UserPlus size={16}/> Add child</button><button className="icon" aria-label={`Delete ${group.name}`} onClick={onDelete}><Trash2 size={16}/></button></div>
    {group.description&&<p className="group-detail-description">{group.description}</p>}
    {group.children.length===0?<div className="children-empty"><span>☆</span><p>No children yet</p></div>:<div className="children-list">{group.children.map(child=>{const monthPayments=childPaymentsForMonth(child,monthKey,currency);return <article className="child-card" key={child.id}>
      <div className="child-main"><span className="child-avatar">{child.name.slice(0,1).toUpperCase()}</span><div className="child-copy"><strong>{child.name}</strong><span>{child.notes||'No notes'}</span></div><div className="child-paid"><span>{monthTitle(monthKey)} · {currency}</span><strong>{formatMoney(childIncomeForMonth(child,monthKey,currency),currency)}</strong></div></div>
      <div className="child-actions"><button className="secondary compact" onClick={()=>onAddPayment(child)}><WalletCards size={15}/> Add payment</button><button className="icon small" aria-label={`Delete ${child.name}`} onClick={()=>onDeleteChild(child)}><Trash2 size={14}/></button></div>
      {monthPayments.length>0&&<details className="payment-history"><summary>{monthPayments.length} {monthPayments.length===1?'payment':'payments'} · Total {formatMoney(childIncomeForMonth(child,monthKey,currency),currency)}</summary><div>{[...monthPayments].sort((a,b)=>b.paidAt.localeCompare(a.paidAt)).map(payment=><div className="payment-row" key={payment.id}><span><b>{new Date(`${payment.paidAt}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</b>{payment.note&&<small>{payment.note}</small>}</span><strong>{formatMoney(payment.amount,payment.currency)}</strong><button aria-label="Edit payment" onClick={()=>onEditPayment(child,payment)}><Pencil size={14}/></button><button aria-label="Delete payment" onClick={()=>onDeletePayment(child.id,payment.id)}><X size={14}/></button></div>)}</div></details>}
    </article>})}</div>}
  </section></div>;
}

function GroupModal({group,onClose,onSave}:{group?:Group;onClose:()=>void;onSave:(draft:{name:string;description?:string;scheduleWeekdays:Weekday[]})=>void}) {
  useEscapeClose(onClose);
  const [name,setName]=useState(group?.name||''),[description,setDescription]=useState(group?.description||''),[days,setDays]=useState<Weekday[]>(group?.scheduleWeekdays||[]);
  const toggle=(day:Weekday)=>setDays(current=>current.includes(day)?current.filter(item=>item!==day):[...current,day].sort());
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal group-form" role="dialog" aria-modal="true" aria-label={group?'Edit group':'New group'} onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();if(name.trim()&&days.length)onSave({name:name.trim(),description:description.trim()||undefined,scheduleWeekdays:days})}}><div className="modal-head"><h2>{group?'Edit group':'New group'}</h2><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><label>Group name<input autoFocus required maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder="e.g. Little Stars"/></label><label>Description<input maxLength={160} value={description} onChange={event=>setDescription(event.target.value)} placeholder="Level, time, or a short note"/></label><fieldset className="weekday-picker"><legend>Class days</legend><div>{([1,2,3,4,5,6,7] as Weekday[]).map(day=><button key={day} type="button" className={days.includes(day)?'selected':''} onClick={()=>toggle(day)}>{shortWeekdayLabels[day]}</button>)}</div><small>Choose at least one weekly class day.</small></fieldset><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!name.trim()||days.length===0}><Save size={16}/> {group?'Save group':'Create group'}</button></div></form></div>;
}

function ChildModal({monthKey,onClose,onSave}:{monthKey:string;onClose:()=>void;onSave:(child:NewChildDraft)=>void}) {
  useEscapeClose(onClose);
  const [name,setName]=useState(''),[amount,setAmount]=useState(''),[notes,setNotes]=useState('');
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal child-form compact-data-form" role="dialog" aria-modal="true" aria-label="Add child" onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();if(name.trim())onSave({name:name.trim(),notes:notes.trim()||undefined,paymentAmount:amount?Number(amount):undefined})}}><div className="modal-head"><h2>Add child</h2><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><label>Name<input autoFocus required maxLength={100} value={name} onChange={event=>setName(event.target.value)} placeholder="Child's name"/></label><label>Payment amount <small>{monthTitle(monthKey)}</small><input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="0"/></label><label>Notes<textarea maxLength={500} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Optional note"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary"><UserPlus size={16}/> Add child</button></div></form></div>;
}

function PaymentModal({childName,monthKey,currency,payment,onClose,onSave}:{childName:string;monthKey:string;currency:IncomeCurrency;payment?:Payment;onClose:()=>void;onSave:(draft:{amount:number;paidAt:string;note:string})=>void}) {
  useEscapeClose(onClose);
  const [amount,setAmount]=useState(payment?String(payment.amount):''),[paidAt,setPaidAt]=useState(payment?.paidAt||paymentDateForMonth(monthKey)),[note,setNote]=useState(payment?.note||'');
  const lastDay=new Date(Number(monthKey.slice(0,4)),Number(monthKey.slice(5,7)),0).getDate(),maxDate=`${monthKey}-${String(lastDay).padStart(2,'0')}`;
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal payment-form compact-data-form" role="dialog" aria-modal="true" aria-label={payment?'Edit payment':'Add payment'} onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();const value=Number(amount);if(value>0)onSave({amount:value,paidAt,note:note.trim()})}}><div className="modal-head"><div><h2>{payment?'Edit payment':'Add payment'}</h2><p>{monthTitle(monthKey)} · {payment?.currency||currency}</p></div><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><div className="form-person"><span>Name</span><strong>{childName}</strong></div><label>Payment amount<input autoFocus required type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="0"/></label><label>Payment date<input required type="date" min={`${monthKey}-01`} max={maxDate} value={paidAt} onChange={event=>setPaidAt(event.target.value)}/></label><label>Notes<textarea maxLength={160} value={note} onChange={event=>setNote(event.target.value)} placeholder="Optional note"/></label><p className="form-hint">Additional payments are added to this child’s monthly total automatically.</p><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary"><WalletCards size={16}/> {payment?'Save changes':'Add payment'}</button></div></form></div>;
}

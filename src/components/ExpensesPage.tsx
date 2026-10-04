import { useEffect,useState } from 'react';
import { ChevronLeft,ChevronRight,CircleDollarSign,HandCoins,Pencil,Plus,ReceiptText,Save,Trash2,WalletCards,X } from 'lucide-react';
import { assets } from '../assets/manifest';
import { localDateKey,uid } from '../lib/dates';
import { expensesForMonth,totalExpensesForMonth } from '../lib/expenses';
import { formatMoney,totalIncomeForMonth } from '../lib/groups';
import type { Expense,Group,IncomeCurrency } from '../types';

const currentMonthKey=()=>localDateKey().slice(0,7);
const moveMonth=(key:string,offset:number)=>{const [year,month]=key.split('-').map(Number),date=new Date(year,month-1+offset,1);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`};
const monthTitle=(key:string)=>{const [year,month]=key.split('-').map(Number);return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(year,month-1,1))};
const expenseDateForMonth=(key:string)=>key===currentMonthKey()?localDateKey():`${key}-01`;
const useEscapeClose=(onClose:()=>void)=>useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose]);

export function ExpensesPage({groups,expenses,currency,onExpenses}:{groups:Group[];expenses:Expense[];currency:IncomeCurrency;onExpenses:(expenses:Expense[])=>void}) {
  const [monthKey,setMonthKey]=useState(currentMonthKey());
  const [editor,setEditor]=useState<Expense|null|undefined>(undefined);
  const income=totalIncomeForMonth(groups,monthKey,currency),monthExpenses=expensesForMonth(expenses,monthKey,currency),spent=totalExpensesForMonth(expenses,monthKey,currency),remaining=income-spent;
  const saveExpense=(draft:{amount:number;note:string})=>{const now=Date.now();if(editor){onExpenses(expenses.map(expense=>expense.id===editor.id?{...expense,...draft,updatedAt:now}:expense))}else{onExpenses([...expenses,{id:uid(),...draft,spentAt:expenseDateForMonth(monthKey),currency,createdAt:now}])}setEditor(undefined)};
  const removeExpense=(expense:Expense)=>{if(window.confirm(`Delete “${expense.note}”?`))onExpenses(expenses.filter(item=>item.id!==expense.id))};

  return <section className="expenses-page">
    <div className="expenses-hero">
      <img src={assets.rewards.crystal} alt=""/>
      <div className="expenses-intro"><small>PERSONAL MONEY</small><h1>Monthly expenses</h1><p>Record what you spent and see what remains from your group income.</p></div>
      <div className="expenses-month month-switcher"><button aria-label="Previous month" onClick={()=>setMonthKey(value=>moveMonth(value,-1))}><ChevronLeft size={18}/></button><strong>{monthTitle(monthKey)}</strong><button aria-label="Next month" onClick={()=>setMonthKey(value=>moveMonth(value,1))}><ChevronRight size={18}/></button></div>
      <div className="expense-balance-grid"><div className="money-summary income"><HandCoins size={24}/><span>Income · {currency}</span><strong>{formatMoney(income,currency)}</strong></div><div className="money-summary spent"><ReceiptText size={24}/><span>Expenses · {currency}</span><strong>{formatMoney(spent,currency)}</strong></div><div className={`money-summary remaining ${remaining<0?'negative':''}`}><WalletCards size={24}/><span>Money left · {currency}</span><strong>{formatMoney(remaining,currency)}</strong></div></div>
    </div>

    <div className="expenses-toolbar"><div><small>SPENDING IN {monthTitle(monthKey).toUpperCase()}</small><h2>Where the money went</h2></div><button className="primary" onClick={()=>setEditor(null)}><Plus size={18}/> Add expense</button></div>

    {monthExpenses.length===0?<div className="expenses-empty panel"><CircleDollarSign size={48}/><h2>No expenses yet</h2><p>Add an amount and a short note when you spend money.</p></div>:<div className="expense-list">{[...monthExpenses].sort((a,b)=>b.createdAt-a.createdAt).map(expense=><article className="expense-card" key={expense.id}><span className="expense-icon"><ReceiptText size={21}/></span><div><strong>{expense.note}</strong><small>{monthTitle(expense.spentAt.slice(0,7))}</small></div><b>{formatMoney(expense.amount,expense.currency)}</b><button className="icon small" aria-label={`Edit ${expense.note}`} onClick={()=>setEditor(expense)}><Pencil size={14}/></button><button className="icon small" aria-label={`Delete ${expense.note}`} onClick={()=>removeExpense(expense)}><Trash2 size={14}/></button></article>)}</div>}

    {editor!==undefined&&<ExpenseModal monthKey={monthKey} currency={currency} expense={editor||undefined} onClose={()=>setEditor(undefined)} onSave={saveExpense}/>}
  </section>;
}

function ExpenseModal({monthKey,currency,expense,onClose,onSave}:{monthKey:string;currency:IncomeCurrency;expense?:Expense;onClose:()=>void;onSave:(draft:{amount:number;note:string})=>void}) {
  useEscapeClose(onClose);
  const [amount,setAmount]=useState(expense?String(expense.amount):''),[note,setNote]=useState(expense?.note||'');
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal expense-form compact-data-form" role="dialog" aria-modal="true" aria-label={expense?'Edit expense':'Add expense'} onMouseDown={event=>event.stopPropagation()} onSubmit={event=>{event.preventDefault();const value=Number(amount),cleanNote=note.trim();if(value>0&&cleanNote)onSave({amount:value,note:cleanNote})}}><div className="modal-head"><div><h2>{expense?'Edit expense':'Add expense'}</h2><p>{monthTitle(monthKey)} · {expense?.currency||currency}</p></div><button type="button" className="icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><label>Expense amount<input autoFocus required type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="0"/></label><label>Where did it go?<textarea required maxLength={160} value={note} onChange={event=>setNote(event.target.value)} placeholder="e.g. Books, transport, supplies"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!amount||Number(amount)<=0||!note.trim()}><Save size={16}/> {expense?'Save changes':'Add expense'}</button></div></form></div>;
}

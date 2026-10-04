import type { Expense, IncomeCurrency } from '../types';

export const expensesForMonth = (expenses:Expense[],monthKey:string,currency?:IncomeCurrency) => expenses.filter(expense=>expense.spentAt.startsWith(`${monthKey}-`)&&(!currency||expense.currency===currency));
export const totalExpensesForMonth = (expenses:Expense[],monthKey:string,currency?:IncomeCurrency) => expensesForMonth(expenses,monthKey,currency).reduce((sum,expense)=>sum+expense.amount,0);
export const remainingForMonth = (income:number,expenses:Expense[],monthKey:string,currency?:IncomeCurrency) => income-totalExpensesForMonth(expenses,monthKey,currency);

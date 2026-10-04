import { describe,expect,it } from 'vitest';
import type { Expense } from '../types';
import { expensesForMonth,remainingForMonth,totalExpensesForMonth } from './expenses';

const expenses:Expense[]=[
  {id:'1',amount:1200,spentAt:'2026-10-04',currency:'RUB',note:'Books',createdAt:1},
  {id:'2',amount:300,spentAt:'2026-10-05',currency:'RUB',note:'Taxi',createdAt:2},
  {id:'3',amount:10,spentAt:'2026-10-06',currency:'USD',note:'App',createdAt:3},
  {id:'4',amount:500,spentAt:'2026-09-30',currency:'RUB',note:'Paper',createdAt:4}
];

describe('monthly expenses',()=>{
  it('filters entries by month and currency',()=>expect(expensesForMonth(expenses,'2026-10','RUB').map(item=>item.id)).toEqual(['1','2']));
  it('totals expenses in one currency',()=>expect(totalExpensesForMonth(expenses,'2026-10','RUB')).toBe(1500));
  it('calculates the remaining income',()=>expect(remainingForMonth(5000,expenses,'2026-10','RUB')).toBe(3500));
});

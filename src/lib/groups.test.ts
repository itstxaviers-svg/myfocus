import { describe, expect, it } from 'vitest';
import type { Group } from '../types';
import { childCount, childIncome, childIncomeForMonth, childPaymentsForMonth, formatMoney, groupIncome, groupIncomeForMonth, paymentCount, paymentCountForMonth, totalIncome, totalIncomeForMonth } from './groups';

const groups: Group[] = [{
  id:'g1', name:'Stars', scheduleWeekdays:[1,3], createdAt:0,
  children:[
    {id:'c1',name:'Mia',createdAt:0,payments:[{id:'p1',amount:1200,paidAt:'2026-09-01',currency:'RUB',createdAt:0},{id:'p2',amount:800,paidAt:'2026-09-08',currency:'RUB',createdAt:0}]},
    {id:'c2',name:'Leo',createdAt:0,payments:[{id:'p3',amount:1500,paidAt:'2026-09-02',currency:'RUB',createdAt:0}]}
  ]
}];

describe('group income', () => {
  it('sums a child payment history', () => expect(childIncome(groups[0].children[0])).toBe(2000));
  it('sums a group and all groups', () => { expect(groupIncome(groups[0])).toBe(3500); expect(totalIncome(groups)).toBe(3500); });
  it('counts children and payments', () => { expect(childCount(groups)).toBe(2); expect(paymentCount(groups)).toBe(3); });
  it('calculates income and payments for one month', () => {
    expect(childPaymentsForMonth(groups[0].children[0],'2026-09')).toHaveLength(2);
    expect(childIncomeForMonth(groups[0].children[0],'2026-09')).toBe(2000);
    expect(groupIncomeForMonth(groups[0],'2026-09')).toBe(3500);
    expect(totalIncomeForMonth(groups,'2026-09')).toBe(3500);
    expect(paymentCountForMonth(groups,'2026-09')).toBe(3);
    expect(totalIncomeForMonth(groups,'2026-08')).toBe(0);
  });
  it('puts the ruble sign after whole amounts', () => expect(formatMoney(0,'RUB').replace(/\u00a0/g,' ')).toBe('0 ₽'));
  it('keeps currency ledgers separate',()=>{groups[0].children[0].payments.push({id:'usd',amount:20,paidAt:'2026-09-09',currency:'USD',createdAt:0});expect(totalIncomeForMonth(groups,'2026-09','RUB')).toBe(3500);expect(totalIncomeForMonth(groups,'2026-09','USD')).toBe(20);groups[0].children[0].payments.pop()});
});

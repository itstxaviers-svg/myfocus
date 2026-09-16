import { describe, expect, it } from 'vitest';
import type { Group } from '../types';
import { childCount, childIncome, groupIncome, paymentCount, totalIncome } from './groups';

const groups: Group[] = [{
  id:'g1', name:'Stars', scheduleWeekdays:[1,3], createdAt:0,
  children:[
    {id:'c1',name:'Mia',createdAt:0,payments:[{id:'p1',amount:1200,paidAt:'2026-09-01',createdAt:0},{id:'p2',amount:800,paidAt:'2026-09-08',createdAt:0}]},
    {id:'c2',name:'Leo',createdAt:0,payments:[{id:'p3',amount:1500,paidAt:'2026-09-02',createdAt:0}]}
  ]
}];

describe('group income', () => {
  it('sums a child payment history', () => expect(childIncome(groups[0].children[0])).toBe(2000));
  it('sums a group and all groups', () => { expect(groupIncome(groups[0])).toBe(3500); expect(totalIncome(groups)).toBe(3500); });
  it('counts children and payments', () => { expect(childCount(groups)).toBe(2); expect(paymentCount(groups)).toBe(3); });
});

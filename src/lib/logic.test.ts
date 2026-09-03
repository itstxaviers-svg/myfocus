import { describe, expect, it } from 'vitest';
import { defaults } from '../repositories/localProgressRepository';
import { efficiency, focusPoints, taskPoints, totalPoints } from './logic';

describe('points', () => {
  it('maps task priority points', () => { expect(taskPoints('low')).toBe(10); expect(taskPoints('medium')).toBe(15); expect(taskPoints('high')).toBe(20); });
  it('calculates focus points', () => { expect(focusPoints(5)).toBe(3); expect(focusPoints(25)).toBe(15); expect(focusPoints(90)).toBe(54); });
  it('sums ledger points', () => { const s=defaults(); s.pointEvents.push({id:'x',type:'task_completed',points:15,createdAt:0,localDate:'2020-01-01',entityId:'t'}); expect(totalPoints(s)).toBe(15); });
});
describe('efficiency', () => {
  it('is zero for an empty day',()=>expect(efficiency(defaults(),'2099-01-01')).toBe(0));
  it('uses completed scheduled tasks',()=>{const s=defaults();s.tasks.push({id:'t',title:'x',status:'completed',priority:'low',scheduledDate:'2099-01-01',createdAt:0,updatedAt:0,completedAt:new Date('2099-01-01T12:00:00').getTime(),order:0});expect(efficiency(s,'2099-01-01')).toBe(100)});
});

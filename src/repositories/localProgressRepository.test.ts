import { describe,expect,it } from 'vitest';
import { defaults,makeBackup,normalizeState,readBackup } from './localProgressRepository';

describe('local progress migration and backups',()=>{
  it('migrates old payments and reminders without losing data',()=>{const migrated=normalizeState({schemaVersion:1,incomeCurrency:'RUB',groups:[{id:'g',name:'Stars',scheduleWeekdays:[1],createdAt:1,children:[{id:'c',name:'Mia',createdAt:1,payments:[{id:'p',amount:1000,paidAt:'2026-09-01',createdAt:1}]}]}],periodTracking:{days:{},markers:[{id:'m',title:'Ring',date:'2026-09-20',remindDaysBefore:1,createdAt:1}],settings:{}}});expect(migrated.schemaVersion).toBe(2);expect(migrated.groups[0].children[0].payments[0].currency).toBe('RUB');expect(migrated.periodTracking.markers[0].time).toBe('09:00');expect(migrated.periodTracking.markers[0].reminderMinutesBefore).toEqual([1440])});
  it('round-trips a Focus Tool backup',()=>{const state=defaults();state.profile.name='Sophie';const restored=readBackup(makeBackup(state));expect(restored.profile.name).toBe('Sophie');expect(restored.schemaVersion).toBe(2)});
  it('rejects unrelated JSON files',()=>expect(()=>readBackup('{"hello":"world"}')).toThrow('not a Focus Tool backup'));
});

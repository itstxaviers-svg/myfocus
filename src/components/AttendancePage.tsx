import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, ChevronLeft, ChevronRight, ClipboardCheck, Settings2, UsersRound, X } from 'lucide-react';
import { assets } from '../assets/manifest';
import { attendanceRate, childAttendance, lessonDatesForMonth, shortWeekdayLabels } from '../lib/attendance';
import { localDateKey } from '../lib/dates';
import type { AttendanceLedger, Group } from '../types';

const monthKeyNow=()=>localDateKey().slice(0,7);
const moveMonth=(monthKey:string,offset:number)=>{const [year,month]=monthKey.split('-').map(Number),date=new Date(year,month-1+offset,1);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`};
const monthTitle=(monthKey:string)=>{const [year,month]=monthKey.split('-').map(Number);return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(year,month-1,1))};
const dateLabel=(dateKey:string,full=false)=>new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US',full?{weekday:'short',month:'short',day:'numeric'}:{weekday:'short',day:'numeric'});

export function AttendancePage({groups,attendance,onAttendance,onEditGroups}:{groups:Group[];attendance:AttendanceLedger;onAttendance:(attendance:AttendanceLedger)=>void;onEditGroups:()=>void}) {
  const [openGroupId,setOpenGroupId]=useState<string|null>(null);
  const [monthKey,setMonthKey]=useState(monthKeyNow());
  useEffect(()=>{if(openGroupId&&!groups.some(group=>group.id===openGroupId))setOpenGroupId(null)},[groups,openGroupId]);
  const group=groups.find(item=>item.id===openGroupId);
  const dates=useMemo(()=>group?lessonDatesForMonth(monthKey,group.scheduleWeekdays):[],[group,monthKey]);
  const today=localDateKey(),currentMonth=monthKeyNow(),isFinal=monthKey<currentMonth;
  const reportDates=monthKey<currentMonth?dates:monthKey===currentMonth?dates.filter(date=>date<=today):[];
  const rate=group?attendanceRate(attendance,group.id,group.children,reportDates):0;

  const toggle=(date:string,childId:string)=>{if(!group)return;const current=attendance[group.id]?.[date]||[],next=current.includes(childId)?current.filter(id=>id!==childId):[...current,childId];onAttendance({...attendance,[group.id]:{...(attendance[group.id]||{}),[date]:next}})};

  if(groups.length===0)return <section className="attendance-page"><div className="attendance-empty panel"><img src={assets.mascots.emptyCalendar} alt=""/><h1>Create a group first</h1><p>Attendance is generated from each group’s weekly class days.</p><button className="primary" onClick={onEditGroups}><UsersRound size={18}/> Go to groups</button></div></section>;

  return <section className="attendance-page">
    <div className="attendance-toolbar attendance-toolbar-main">
      <div><small>ATTENDANCE</small><h1>Monthly register</h1><p>Class dates are generated automatically from the group schedule.</p></div>
      <div className="month-switcher"><button aria-label="Previous month" onClick={()=>setMonthKey(value=>moveMonth(value,-1))}><ChevronLeft size={18}/></button><strong>{monthTitle(monthKey)}</strong><button aria-label="Next month" onClick={()=>setMonthKey(value=>moveMonth(value,1))}><ChevronRight size={18}/></button></div>
    </div>

    <div className="group-tabs attendance-group-tabs" aria-label="Attendance groups">{groups.map(item=>{const itemDates=lessonDatesForMonth(monthKey,item.scheduleWeekdays);return <button className="group-tab" key={item.id} onClick={()=>setOpenGroupId(item.id)}><span className="group-badge"><CalendarCheck2 size={22}/></span><span className="group-tab-copy"><strong>{item.name}</strong><small>{item.scheduleWeekdays.length?item.scheduleWeekdays.map(day=>shortWeekdayLabels[day]).join(' · '):'Schedule not set'}</small><em>{item.children.length} {item.children.length===1?'child':'children'} · {itemDates.length} class dates</em></span><ChevronRight size={20}/></button>})}</div>

    {group&&<div className="modal-backdrop" onMouseDown={()=>setOpenGroupId(null)}><section className="modal attendance-details-modal" onMouseDown={event=>event.stopPropagation()}><div className="modal-head"><div><small>ATTENDANCE</small><h2>{group.name}</h2><p>{monthTitle(monthKey)} · {group.scheduleWeekdays.length?group.scheduleWeekdays.map(day=>shortWeekdayLabels[day]).join(' · '):'Schedule not set'}</p></div><button className="icon" onClick={()=>setOpenGroupId(null)} aria-label="Close"><X size={18}/></button></div>
      {group.scheduleWeekdays.length===0?<div className="attendance-empty"><Settings2 size={38}/><h2>Add class days</h2><p>Edit {group.name} and choose the weekdays when this group meets.</p><button className="primary" onClick={onEditGroups}>Edit group schedule</button></div>:group.children.length===0?<div className="attendance-empty"><UsersRound size={42}/><h2>No children in this group</h2><p>Add children to {group.name} before marking attendance.</p><button className="primary" onClick={onEditGroups}>Manage groups</button></div>:<>
        <div className="attendance-summary">
          <div className="attendance-group"><img src={assets.rewards.achievement} alt=""/><span><small>SELECTED GROUP</small><strong>{group.name}</strong><em>{group.scheduleWeekdays.map(day=>shortWeekdayLabels[day]).join(' · ')}</em></span></div>
          <div><CalendarCheck2 size={21}/><strong>{dates.length}</strong><span>class dates</span></div>
          <div><UsersRound size={21}/><strong>{group.children.length}</strong><span>children</span></div>
          <div><ClipboardCheck size={21}/><strong>{rate}%</strong><span>{isFinal?'final attendance':'attendance so far'}</span></div>
        </div>
        <div className="attendance-register panel"><div className="register-heading"><div><small>CLASS REGISTER</small><h2>{monthTitle(monthKey)}</h2></div><span>Tap a box to mark a child present</span></div><div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Child</th>{dates.map(date=><th key={date} className={date>today?'future':''}><span>{dateLabel(date).split(' ')[0]}</span><strong>{Number(date.slice(-2))}</strong></th>)}</tr></thead><tbody>{group.children.map(child=><tr key={child.id}><th><span className="attendance-name"><span className="attendance-avatar">{child.name.slice(0,1).toUpperCase()}</span><span>{child.name}<small>Student</small></span></span></th>{dates.map(date=>{const checked=attendance[group.id]?.[date]?.includes(child.id)||false;return <td key={date} className={date>today?'future':''}><label className="attendance-check"><input type="checkbox" checked={checked} disabled={date>today} onChange={()=>toggle(date,child.id)} aria-label={`${child.name} attended ${dateLabel(date,true)}`}/><span>✓</span></label></td>})}</tr>)}</tbody></table></div></div>
        {reportDates.length>0&&<div className="attendance-report panel"><div className="report-head"><div><small>{isFinal?'FINAL MONTHLY REPORT':'LIVE MONTHLY REPORT'}</small><h2>{group.name} · {monthTitle(monthKey)}</h2></div><div className="report-rate"><span>Group rate</span><strong>{rate}%</strong></div></div><div className="report-list">{group.children.map(child=>{const result=childAttendance(attendance,group.id,child,reportDates);return <article key={child.id}><span className="attendance-avatar">{child.name.slice(0,1).toUpperCase()}</span><div><strong>{child.name}</strong><span>{result.attended.length} of {reportDates.length} classes attended</span></div><b>{result.rate}%</b><p>{result.missed.length?<><strong>Missed:</strong> {result.missed.map(date=>dateLabel(date,true)).join(', ')}</>:'No absences recorded.'}</p></article>})}</div></div>}
      </>}
    </section></div>}
  </section>;
}

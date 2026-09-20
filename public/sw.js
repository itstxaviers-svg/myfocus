self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    const existing=windows[0];
    if(existing)return existing.focus();
    return clients.openWindow('./');
  }));
});

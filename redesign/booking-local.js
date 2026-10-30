(()=>{
  const form=document.querySelector('#booking-request');
  if(!form)return;
  const query=new URLSearchParams(location.search);
  const set=(name,value)=>{const field=form.elements.namedItem(name);if(field&&value)field.value=value};
  set('checkin',query.get('checkin')||query.get('from'));
  set('checkout',query.get('checkout')||query.get('to'));
  set('guests',query.get('guests'));
  let message='';
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const start=form.elements.checkin.value;
    const end=form.elements.checkout.value;
    if(start&&end&&end<=start){form.elements.checkout.setCustomValidity('Дата выезда должна быть позже даты заезда.');form.elements.checkout.reportValidity();return}
    form.elements.checkout.setCustomValidity('');
    if(!form.reportValidity())return;
    const values=Object.fromEntries(new FormData(form).entries());
    if(values.consent!=='on')return;
    const request={...values,consentTimestamp:new Date().toISOString()};
    message=[`Запрос на проживание «Дивеевский паломник»`,`Заезд: ${request.checkin}`,`Выезд: ${request.checkout}`,`Гостей: ${request.guests}`,`Комната: ${request.room}`,`Имя: ${request.name}`,`Телефон: ${request.phone}`,request.comment?`Пожелания: ${request.comment}`:'',`Согласие отмечено: ${request.consentTimestamp}`].filter(Boolean).join('\n');
    document.querySelector('#booking-result').hidden=false;
    document.querySelector('#booking-result').scrollIntoView({behavior:'smooth',block:'start'});
  });
  document.querySelector('#copy-request')?.addEventListener('click',async event=>{
    try{await navigator.clipboard.writeText(message);event.currentTarget.textContent='Скопировано'}
    catch{event.currentTarget.textContent='Разрешите копирование в браузере'}
  });
})();

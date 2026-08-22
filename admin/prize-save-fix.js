(()=>{
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function toast(text,kind='success'){
    let box=document.querySelector('#saveToast');
    if(!box){box=document.createElement('div');box.id='saveToast';box.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;max-width:420px;padding:14px 16px;border-radius:14px;font-weight:800;box-shadow:0 14px 35px rgba(0,0,0,.4)';document.body.appendChild(box)}
    box.style.background=kind==='error'?'#431522':'#123523';
    box.style.color=kind==='error'?'#ffe1e7':'#d8ffe5';
    box.style.border=kind==='error'?'1px solid #934056':'1px solid #3e8b5e';
    box.innerHTML=esc(text);
    clearTimeout(box._timer);box._timer=setTimeout(()=>box.remove(),6000);
  }
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('.saveGroup');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    const group=btn.closest('[data-game]');
    if(!group)return toast('Could not find this game section. Refresh and try again.','error');
    const rows=[...group.querySelectorAll('[data-prize]')];
    if(!rows.length)return toast('There are no prize rows to save.','error');
    const original=btn.textContent;btn.disabled=true;btn.textContent='Saving…';
    try{
      const sb=ZB.supa();
      const payload=rows.map((row,index)=>{
        const cap=row.querySelector('.pcap')?.value.trim()??'';
        const name=row.querySelector('.pname')?.value.trim()??'';
        if(!name)throw new Error(`Prize ${index+1} needs a name.`);
        return {
          id:row.dataset.prize,
          game_id:group.dataset.game,
          name,
          weight:Number(row.querySelector('.pweight')?.value)||0,
          is_active:row.querySelector('.pactive')?.value==='true',
          is_no_win:row.querySelector('.pnowin')?.value==='true',
          inventory_limit:cap===''?null:Number(cap),
          sort_order:index
        };
      });
      const {error}=await sb.from('prizes').upsert(payload,{onConflict:'id'});
      if(error)throw error;
      const ids=payload.map(x=>x.id);
      const {data,error:verifyError}=await sb.from('prizes').select('id,name,weight,is_active,is_no_win,inventory_limit').in('id',ids);
      if(verifyError)throw verifyError;
      if((data||[]).length!==payload.length)throw new Error('The save could not be verified. Please try again.');
      toast(`Saved ${payload.length} prize settings successfully. ✓`,'success');
      btn.textContent='Saved ✓';
      setTimeout(()=>{btn.textContent=original;btn.disabled=false},1800);
    }catch(err){
      console.error('Prize save failed',err);
      toast(`Prize settings were NOT saved: ${err?.message||'Unknown error'}`,'error');
      btn.textContent='Save failed';
      setTimeout(()=>{btn.textContent=original;btn.disabled=false},2500);
    }
  },true);
})();

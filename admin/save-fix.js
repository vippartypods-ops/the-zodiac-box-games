window.addEventListener('load',()=>{
 const sb=ZB.supa();
 const show=(text,kind='success')=>{const msg=document.querySelector('#message');if(!msg)return;msg.innerHTML=`<div class="${kind}">${ZB.esc(text)}</div>`;setTimeout(()=>{if(msg)msg.innerHTML=''},5000)};
 document.addEventListener('click',async e=>{
   const btn=e.target.closest('.saveGroup');
   if(!btn)return;
   e.preventDefault();
   e.stopPropagation();
   e.stopImmediatePropagation();
   const group=btn.closest('[data-game]');
   if(!group)return;
   const rows=[...group.querySelectorAll('[data-prize]')].map(row=>{
     const cap=row.querySelector('.pcap')?.value.trim()??'';
     return {
       id:row.dataset.prize,
       name:row.querySelector('.pname')?.value.trim()||'',
       weight:Number(row.querySelector('.pweight')?.value||0),
       is_active:row.querySelector('.pactive')?.value==='true',
       is_no_win:row.querySelector('.pnowin')?.value==='true',
       inventory_limit:cap===''?null:Number(cap)
     };
   });
   if(rows.some(r=>!r.name)){show('Every prize/outcome needs a name before saving.','error');return;}
   btn.disabled=true;
   const original=btn.textContent;
   btn.textContent='Saving…';
   try{
     const {data,error}=await sb.rpc('admin_save_prizes',{p_game_id:group.dataset.game,p_rows:rows});
     if(error)throw error;
     show(`Saved ${data?.saved??rows.length} prize settings successfully.`);
     setTimeout(()=>location.reload(),700);
   }catch(err){
     show(err.message||'Prize settings could not be saved.','error');
     btn.disabled=false;
     btn.textContent=original;
   }
 },true);
});
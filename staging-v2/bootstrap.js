window.addEventListener('beforeunload',e=>{
 if(active||(saveError&&state.index>0)||savedVersion<saveVersion){e.preventDefault();e.returnValue='';}
});
Object.defineProperty(window,'drawingPro',{value:Object.freeze({
 version:'2.0.0',
 getState:()=>structuredClone({...state,dpr:DPR,width:W,height:H,active:!!active,saving:savedVersion<saveVersion})
})});
init();

function updateUI() {
 document.documentElement.style.setProperty('--color', state.color);
 $('#color-value').textContent = state.color.toUpperCase();
 $('#current-chip').title = colorName(state.color) + ' · edit color';
 $$('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===state.color)));
 $$('.tool-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===state.tool)));
 $('#size-slider').value = state.size;
 $('#size-slider').style.setProperty('--fill', ((state.size-1)/49*100)+'%');
 $('#size-slider').setAttribute('aria-valuetext', state.size+' pixels');
 $('#size-output').value = state.size+' px';
 $('#opacity-slider').value = state.opacity;
 $('#opacity-slider').style.setProperty('--fill', state.opacity+'%');
 $('#opacity-output').value = state.opacity+'%';
 $('#opacity-slider').disabled = ['eraser','eyedropper'].includes(state.tool);
 const preview = $('#size-preview');
 preview.style.width = state.size+'px'; preview.style.height = state.size+'px';
 preview.innerHTML = tipSVG(state.tool);
 $('#preview-caption').textContent = state.size+' px';
 $('#status-tool').textContent = tools.find(t=>t.id===state.tool)?.name || 'Round brush';
 $('#dimensions').textContent = W+' × '+H;
 $('#undo-button').disabled = state.index<=state.floor;
 $('#redo-button').disabled = state.index>=state.ops.length;
 $('#document-name').title = state.name;
 updateCursor();
}

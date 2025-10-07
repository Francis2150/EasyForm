// --- Action buttons ---
  const actionRow = document.createElement('div');
  actionRow.style.textAlign = 'right';
  actionRow.style.marginBottom = '10px';

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️ Edit';
  editBtn.style.background = '#ffc107';
  editBtn.style.color = '#000';
  editBtn.style.border = 'none';
  editBtn.style.padding = '6px 12px';
  editBtn.style.borderRadius = '4px';
  editBtn.style.cursor = 'pointer';
  editBtn.style.marginRight = '10px';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️ Delete';
  deleteBtn.style.background = '#dc3545';
  deleteBtn.style.color = '#fff';
  deleteBtn.style.border = 'none';
  deleteBtn.style.padding = '6px 12px';
  deleteBtn.style.borderRadius = '4px';
  deleteBtn.style.cursor = 'pointer';

  actionRow.appendChild(editBtn);
  actionRow.appendChild(deleteBtn);
  companyDiv.appendChild(actionRow);
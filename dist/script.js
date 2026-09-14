document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    const dialog = document.querySelector('.lightbox');
    dialog.querySelector('img').src = item.dataset.src;
    dialog.showModal();
  });
});
document.querySelector('.lightbox .close').addEventListener('click', () => document.querySelector('.lightbox').close());
document.querySelector('.lightbox').addEventListener('click', (event) => {
  if (event.target.classList.contains('lightbox')) event.currentTarget.close();
});

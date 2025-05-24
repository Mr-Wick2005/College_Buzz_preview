// function showModal(id) {
//     document.getElementById(id).style.display = 'flex';
//   }

//   function hideModal(id) {
//     document.getElementById(id).style.display = 'none';
//   }

//   function closeModal(event) {
//     if (event.target.classList.contains('modal')) {
//       event.target.style.display = 'none';
//     }
//   }

//   // Close on ESC key
//   document.addEventListener('keydown', function(e) {
//     if (e.key === "Escape") {
//       document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
//     }
//   });
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
  }

  function hideModal(id) {
    document.getElementById(id).style.display = 'none';
  }

  function closeModal(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  }

  // Optional: Close with ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
  });
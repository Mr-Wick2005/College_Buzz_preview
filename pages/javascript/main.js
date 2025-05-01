let posters = [];
let currentPage = 1;
const postersPerPage = 15;
const posterContainer = document.getElementById("posterContainer");
const paginationContainer = document.getElementById("paginationControls");
const showingCount = document.getElementById("showingCount");

// Toggle mobile menu
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("active");
}

// Open modal to show poster details
function openModal(index) {
  const poster = posters[index];
  if (!poster) return;
  document.getElementById('posterModal').style.display = 'flex';
  document.getElementById('modalImg').src = poster.image;

  const infoText = poster.title + (poster.description ? ": " + poster.description : "");
  document.getElementById('posterInfo').innerHTML = convertLinks(infoText);
}
function convertLinks(text) {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" style="color: #007BFF; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${url}</a>`);
}



// Close modal


window.onclick = function(event) {
  const modal = document.getElementById('posterModal');
  if (event.target === modal) {
    closeModal();
  }
}

// Render posters with pagination
function renderPosters() {
  posterContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * postersPerPage;
  const endIndex = Math.min(startIndex + postersPerPage, posters.length);
  const currentPosters = posters.slice(startIndex, endIndex);

  currentPosters.forEach((poster, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => openModal(startIndex + index);

    const cardTop = document.createElement("div");
    cardTop.className = "card-top";
    const img = document.createElement("img");
    img.src = poster.image;
    img.alt = poster.title;
    cardTop.appendChild(img);

    const cardBottom = document.createElement("div");
    cardBottom.className = "card-bottom";
    cardBottom.textContent = poster.title;

    card.appendChild(cardTop);
    card.appendChild(cardBottom);
    posterContainer.appendChild(card);
  });

  // Showing count
  showingCount.textContent = posters.length > 0
    ? `Showing ${startIndex + 1}–${endIndex} of ${posters.length}`
    : `Showing 0–0 of 0`;

  renderPagination();
}

// Pagination buttons
function renderPagination() {
  const totalPages = Math.ceil(posters.length / postersPerPage);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderPosters();
    };
    paginationContainer.appendChild(btn);
  }
}

// Fetch posters from backend and update posters array
async function fetchPosters() {
  try {
    const response = await fetch('http://localhost:5000/get-posters');
    const data = await response.json();
    if (data.success && Array.isArray(data.posters)) {
      posters = data.posters.map(p => ({
        title: p.title,
        description: p.description || '',
        image: `http://localhost:5000/get-posters/${p.imageUrl}`,
        category: p.category,
      }));
      currentPage = 1;
      renderPosters();
    } else {
      console.error('Invalid data format from server');
    }
  } catch (error) {
    console.error('Error fetching posters:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPosters();
});




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

function closeModal() {
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
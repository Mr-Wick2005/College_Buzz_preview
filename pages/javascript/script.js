const posters = [];
let currentPage = 1;
const postersPerPage = 15;

function resetData() {
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminPic');

  const defaultName = 'Admin';
  const defaultPic = 'https://via.placeholder.com/32';

  // Set values and also SAVE them
  document.getElementById('adminName').value = defaultName;
  document.getElementById('profilePic').src = defaultPic;
  localStorage.setItem('adminName', defaultName);
  localStorage.setItem('adminPic', defaultPic);

  alert('Profile reset to default!');
}


const adminNameInput = document.getElementById('adminName');
const profilePicInput = document.getElementById('profilePicInput');
const profilePic = document.getElementById('profilePic');
let isEditing = false;

window.addEventListener('DOMContentLoaded', async () => {
  const savedName = localStorage.getItem('adminName');
  const savedPic = localStorage.getItem('adminPic');

  if (savedName) adminNameInput.value = savedName;
  if (savedPic) profilePic.src = savedPic;

  // Fetch posters from backend
  try {
    const response = await fetch('http://localhost:5000/get-posters');
    const data = await response.json();
    if (data.success && Array.isArray(data.posters)) {
      posters.length = 0;
      data.posters.forEach(p => {
        const imageUrl = `http://localhost:5000/get-posters/${p.imageUrl}`;
        console.log("Loaded poster image URL:", imageUrl);
        posters.push({
          title: p.title,
          description: p.description || '',
          image: imageUrl,
          category: p.category,
        });
      });
      currentPage = 1;
      renderPosters();
    }
  } catch (error) {
    console.error('Error fetching posters:', error);
  }
});

function toggleEdit() {
  isEditing = !isEditing;
  adminNameInput.readOnly = !isEditing;

  if (!isEditing) {
    const newName = adminNameInput.value;
    localStorage.setItem('adminName', newName); // Save to localStorage
  } else {
    adminNameInput.focus();
  }
}

profilePicInput.addEventListener('change', function () {
  const file = profilePicInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgData = e.target.result;
      profilePic.src = imgData;
      localStorage.setItem('adminPic', imgData); // Save to localStorage
    };
    reader.readAsDataURL(file);
  }
});

function openModal() {
  document.getElementById('posterModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('posterModal').style.display = 'none';
  document.getElementById('posterTitleInput').value = '';
  document.getElementById('posterDeetsInput').value = '';
  document.getElementById('posterImageInput').value = '';
  document.getElementById('posterCategoryInput').selectedIndex = 0;
}

function toggleSettings() {
  const dropdown = document.getElementById('settingsDropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

let pendingPosterData = null;
let pendingPosterFile = null;

function addPoster() {
  const title = document.getElementById('posterTitleInput').value.trim();
  const description = document.getElementById('posterDeetsInput').value.trim();
  const fileInput = document.getElementById('posterImageInput');
  const file = fileInput.files[0];
  const category = document.getElementById('posterCategoryInput').value;

  if (!title || !description || !file || !category) {
    alert("Please provide title, category, description, and an image.");
    return;
  }

  pendingPosterData = { title, description, category };
  pendingPosterFile = file;
  openConfirmationModal();
}

async function confirmUpload() {
  if (pendingPosterData && pendingPosterFile) {
    const formData = new FormData();
    formData.append('title', pendingPosterData.title);
    formData.append('category', pendingPosterData.category);
    formData.append('description', pendingPosterData.description);  
    formData.append('poster', pendingPosterFile);

    try {
      const response = await fetch('http://localhost:5000/upload-poster', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        alert('Poster uploaded successfully!');
        // Add poster to local posters array with image URL from server
        const imageUrl = `http://localhost:5000/get-posters/${result.filename || ''}`;
        console.log("Image URL for new poster:", imageUrl);
        posters.unshift({
          title: pendingPosterData.title,
          description: pendingPosterData.description,
          image: imageUrl,
          category: pendingPosterData.category,
        });
        console.log("Added poster with image URL:", imageUrl);
        currentPage = 1;
        renderPosters();
        closeConfirmationModal();
        closeModal();
        pendingPosterData = null;
        pendingPosterFile = null;
      } else {
        alert('Failed to upload poster: ' + result.message);
      }
    } catch (error) {
      alert('Error uploading poster: ' + error.message);
    }
  }
}

function openConfirmationModal() {
  document.getElementById('confirmationModal').style.display = 'flex';
}

function closeConfirmationModal() {
  document.getElementById('confirmationModal').style.display = 'none';
}

function renderPosters() {
  const container = document.getElementById('posterGrid');

  if (!container) {
    console.error('Error: posterGrid element not found!');
    return; // Exit the function if the element doesn't exist
  }

  container.innerHTML = '';

  const startIndex = (currentPage - 1) * postersPerPage;
  const endIndex = Math.min(startIndex + postersPerPage, posters.length);
  const currentPosters = posters.slice(startIndex, endIndex);

  currentPosters.forEach((poster, index) => {
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.setAttribute('data-title', poster.title.toLowerCase());

    card.innerHTML = `
  <div class="options" onclick="toggleDropdown(this)">⋮</div>
  <div class="dropdown">
    <button onclick="deletePoster(${startIndex + index})">Delete</button>
  </div>
  <img src="${poster.image}" alt="${poster.title}" onclick="previewPoster(${startIndex + index})" style="cursor: pointer;" />
  <div style="margin-top: 5px; font-size: 0.9rem; font-weight: bold;">${poster.title}</div>
`;

    container.appendChild(card);
  });

  const countText = posters.length > 0
    ? `Showing ${startIndex + 1}–${endIndex} of ${posters.length}`
    : `Showing 0–0 of 0`;
  document.getElementById('showingCount').textContent = countText;

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(posters.length / postersPerPage);
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => {
      currentPage = i;
      renderPosters();
    };
    pagination.appendChild(btn);
  }
  const img = document.querySelector('img');
  img.width = 448;  // Set the width to 448px
  img.height = 75;  // Set the height to 75px

}

function deletePoster(index) {
  posters.splice(index, 1);
  if ((currentPage - 1) * postersPerPage >= posters.length) {
    currentPage = Math.max(1, currentPage - 1);
  }
  renderPosters();
}

function toggleDropdown(el) {
  const dropdown = el.nextElementSibling;
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function filterPosters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.poster-card').forEach(card => {
    const title = card.getAttribute('data-title');
    card.style.display = title.includes(searchTerm) ? 'block' : 'none';
  });
}

function previewPoster(index) {
  const { image, title, description } = posters[index];
  document.getElementById('previewImage').src = image;
  document.getElementById('previewTitle').textContent = title;
  document.getElementById('previewDescription').innerHTML = convertLinks(description);
  document.getElementById('previewModal').style.display = 'flex';
}
function convertLinks(text) {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" style="color: #007BFF;">${url}</a>`);
}

function closePreviewModal() {
  document.getElementById('previewModal').style.display = 'none';
}

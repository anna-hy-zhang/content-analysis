// js variables
const profileContainer = document.querySelector('.profile-template');
const repoContainer = document.querySelector('.repo-container');
const typebox = document.querySelector('.typebox');
let username = null;


// functions
async function getProfileData() {
  clear(profileContainer);
  const username = typebox.value;
  const url = `https://api.github.com/users/${username}`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({ active: true, type: 404 });
  }
  if (response.status === 403) {
    return setError({ active: true, type: 403 });
  }
  const result = await response.json();
  console.log('result', result);
}

function clear(obj) {
  while (obj.firstChild) {
    obj.removeChild(obj.firstChild);
  }
}

async function getRepoData() {
  // clear();
  // const username = typebox.value;
  const url = `https://api.github.com/users/${username}/repos?per_page=100`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({ active: true, type: 404 });
  }
  if (response.status === 403) {
    return setError({ active: true, type: 403 });
  }
  const allRepos = await response.json();
  console.log('allRepos', allRepos);
  allRepos.forEach((currRepo) => {
    const repoName = document.createElement('span');
    repoName.classList.add('repo-name');
    const repoFork = document.createElement('span');
    repoFork.classList.add('repo-fork');
    repoName.innerHTML = currRepo.name;
    repoFork.innerHTML = currRepo.forks;
    repoContainer.appendChild(repoName);
    repoContainer.appendChild(repoFork);
  })

}

// function setProfileData() {

// }

// function setRepoData() {

// }


// event listeners
typebox.addEventListener('keydown', (event) => {
  if (event.code === 'Enter') {
    username = typebox.value;
    window.location.href = `user-profile.html?search=${username}`;
    getProfileData();
    getRepoData();
  }
})



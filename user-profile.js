// js variables
const profilePage = document.querySelector('.profile-page');
const userProfileContainerEl = document.querySelector('.user-profile-container');
const infoContainerEl = document.querySelector('.info-container');
const statsContainerEl = document.querySelector('.stats-container');
const reposContainerEl = document.querySelector('.repos-container');
const repoCardTemplate = document.querySelector('.repo-card-template')
const eventTypeChartEl = document.getElementById('event-type-chart');
const eventLocationChartEl = document.getElementById('event-location-chart');
const receivedEventChartEl = document.getElementById('received-event-chart');
const eventTypeChartLegendEl = document.querySelector('.event-type-chart-legend');
const eventLocationChartLegendEl = document.querySelector('.event-location-chart-legend');
const receivedEventChartLegendEl = document.querySelector('.received-event-chart-legend');
const receivedEventChartContainer = document.querySelector('.received-event-chart-container');
const eventTypeChartContainer = document.querySelector('.event-type-chart-container');
const eventLocationChartContainer = document.querySelector('.event-location-chart-container');



const sortButton = document.querySelector('.sort-button');
const optionsContainer = document.querySelector('.options-container');
let sortOption = 'last-updated';

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const profileName = params.search;

let profileData = null;
let repoData = null;
let eventData = null;
let receivedEventData = null;
let eventTypeData = {};
let sortedEventTypeData = [];
let eventLocationData = {};
let sortedEventLocationData = [];
let recentReceivedEventData = {};
let receivedEventForChart = [];

let eventTypeChart = null;
let eventLocationChart = null;
let receivedEventChart = null;

let delayed;
const etc = document.querySelector('#event-type-chart');



// functions: fetch data 
async function getProfileData() {
  const url = `https://api.github.com/users/${profileName}`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({ active: true, type: 404 });
  }
  if (response.status === 403) {
    return setError({ active: true, type: 403 });
  }
  profileData = await response.json();
  // console.log('profileData', profileData);
}


async function getRepoData() {
  const url = `https://api.github.com/users/${profileName}/repos?per_page=100`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({ active: true, type: 404 });
  }
  if (response.status === 403) {
    return setError({ active: true, type: 403 });
  }
  repoData = await response.json();
  console.log('repoData', repoData);
}


async function getEventData() {
  const url =  `https://api.github.com/users/${profileName}/events?per_page=100`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({active: true, type: 404});
  }
  if (response.status === 403) {
    return setError({active: true, type: 403});
  }
  eventData = await response.json();
  // console.log('eventData', eventData);
}


async function getReceivedEventData() {
  const url = `https://api.github.com/users/${profileName}/received_events?per_page=100`;
  const response = await fetch(url);
  if (response.status === 404) {
    return setError({active: true, type: 404});
  }
  if (response.status === 403) {
    return setError({active: true, type: 403});
  }
  receivedEventData = await response.json();
  console.log('receivedEventData', receivedEventData);
}


async function initApp() {
  await getProfileData();
  await getRepoData();
  await getEventData();
  await getReceivedEventData();

  getEventTypeData();
  getRecentReceivedEventData();
  sortReposByFilter(sortOption); 
  initCharts();
  renderProfilePage(); 
}



// functions: process data
function getEventTypeData() {
  eventData.forEach((currEvent) => {
    if (eventTypeData[currEvent.type] == null) {
      eventTypeData[currEvent.type] = 1;
    } else {
      eventTypeData[currEvent.type]++
    };

    if (eventLocationData[currEvent.repo.id] == null) {
      eventLocationData[currEvent.repo.id] = {
        name: currEvent.repo.name,
        eventCount: 1
      };
    } else {
      eventLocationData[currEvent.repo.id].eventCount++
    };
  })
  
  for (const event in eventTypeData) {
    sortedEventTypeData.push([event, eventTypeData[event]]);
  }
  sortedEventTypeData.sort((a,b) => b[1] - a[1]);
  
  for (const event in eventLocationData) {
    sortedEventLocationData.push([eventLocationData[event].name, eventLocationData[event].eventCount]);
  }
  sortedEventLocationData.sort((a,b) => b[1] - a[1]);

  // console.log('eventTypeData', eventTypeData);
  // console.log('sortedEventTypeData', sortedEventTypeData); 
  // console.log('eventLocationData', eventLocationData);
  // console.log('sortedEventLocationData', sortedEventLocationData); 
}


function getRecentReceivedEventData() {
  let startDate = null;

  receivedEventData.forEach((currEvent) => {
    const currDateStr = new Date(currEvent.created_at);
    const currDate = currDateStr.getDate();
    const currMonth = currDateStr.getMonth() + 1;
    const currYear = currDateStr.getFullYear();
    if (startDate == null) {
      startDate = currDate;
    }
    if (recentReceivedEventData[currYear + "-" + currMonth + "-" + currDate] == null) {
      recentReceivedEventData[currYear + "-" + currMonth + "-" + currDate] = 1;
    } else recentReceivedEventData[currYear + "-" + currMonth + "-" + currDate]++;
  });

  for (const event in recentReceivedEventData) {
    receivedEventForChart.push([event, recentReceivedEventData[event]]);
  }

  console.log('recentReceivedEventData', recentReceivedEventData);
  console.log('receivedEventForChart', receivedEventForChart);

}


function starCount() {
  if (repoData == null) {
    return 0;
  }
  let starCount = 0;
  repoData.forEach((currRepo => {
    starCount += currRepo.stargazers_count;
  }));
  return starCount;
}



// functions: render
function renderProfilePage() {
  renderAvatar();
  renderInfo();
  renderStats();
  renderRepo();
}


function renderAvatar() {
  // js selectors
  const avatar = userProfileContainerEl.querySelector('.avatar');
  const username = userProfileContainerEl.querySelector('.username');
  const login = userProfileContainerEl.querySelector('.login');
  // redner avatar section
  avatar.src = profileData.avatar_url;
  username.innerText = `${profileData.name}`;
  login.innerText = `@ ${profileData.login}`;
  login.href = profileData.html_url;
}


function renderInfo() {
  for (let i = 0; i < infoContainerEl.children.length; i++) {
    const infoItem = infoContainerEl.children[i];
    if (profileData[infoItem.classList[0]]) {
      infoItem.querySelector('span').innerHTML = profileData[infoItem.classList[0]];
    } else infoItem.classList.add('hidden');
  }
}


function renderStats() {
  const repoNum = statsContainerEl.querySelector('.repo');
  const starNum = statsContainerEl.querySelector('.star');
  const followerNum = statsContainerEl.querySelector('.follower');
  const followingNum = statsContainerEl.querySelector('.following');
  repoNum.querySelector('span').innerHTML = repoData.length;
  starNum.querySelector('span').innerHTML = starCount();
  followerNum.querySelector('span').innerHTML = profileData.followers;
  followingNum.querySelector('span').innerHTML = profileData.following; 
}


function renderRepo() {
  clear(reposContainerEl);

  let repoNum = repoData.length;
  if (repoData.length > 6) {
    repoNum = 6;
  }
  for (let i = 0; i < repoNum; i++) {
    const repoCard = document.importNode(repoCardTemplate.content, true);
    let name = repoCard.querySelector('.name');
    let description = repoCard.querySelector('.description');
    let starNum = repoCard.querySelector('.star-num').querySelector('span');
    let forkNum = repoCard.querySelector('.fork-num').querySelector('span');
    let language = repoCard.querySelector('.language').querySelector('span');
    name.innerText = repoData[i].name;
    name.setAttribute('data-repo-url', repoData[i].html_url);
    description.innerText = repoData[i].description;
    starNum.innerText = repoData[i].stargazers_count;
    forkNum.innerText = repoData[i].forks_count;
    language.innerText = repoData[i].language;
    reposContainerEl.appendChild(repoCard);
  }
  // render filter menu
  console.log('sortOption', sortOption);
  document.getElementById(`${sortOption}`).checked = true;
}

function sortReposByFilter(filter) {
  sortOption = filter;
  console.log('filter333', filter)
  if (filter === 'last-updated') {
    repoData.sort((a,b) => {
      const aTime = new Date(a.updated_at);
      const bTime = new Date(b.updated_at);
      return bTime.getTime() - aTime.getTime();
    });
  } else if (filter === 'stars-count') {
    repoData.sort((a,b) => {
      return b.stargazers_count - a.stargazers_count});
  } else if (filter === 'forks-count') {
    repoData.sort((a,b) => {
      return b.forks_count - a.forks_count});
  }
  console.log('sortOption', sortOption, 'repoData', repoData);
}

sortButton.addEventListener('click', () => {
  optionsContainer.classList.toggle('active');
});
optionsContainer.addEventListener('click', (event) => {
  if (event.target.tagName.toLowerCase() === 'input') {
    sortReposByFilter(event.target.id);
    renderRepo();
  }
});


function clear(obj) {
  while (obj.firstChild) {
    obj.removeChild(obj.firstChild);
  }
}


// function: create charts
function initCharts() {
  
  function createLegend(item, i) {
    const legend = document.createElement('div');
    const legendLabel = document.createElement('span');
    const legendText = document.createElement('span');
    legend.classList.add('legend-container');
    legendLabel.classList.add('legend-label');
    legendLabel.style.backgroundColor = item.backgroundColor;
    legendLabel.style.borderColor = item.borderColor;
    legendText.classList.add('legend-font');
    legendText.innerHTML = item.label;
    legend.appendChild(legendLabel);
    legend.appendChild(legendText);
    return legend;
  };
     

  // action type chart
  const eventTypeItemFormat = [
    {
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(244, 241, 220, 1)'
    },
    {
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(244, 241, 220, 1)'
    },
    {
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(244, 241, 220, 1)'
    },
    {
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(244, 241, 220, 1)'
    },
    {
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgba(244, 241, 220, 1)'
    },
  ];

  /* fake data */ 
  // sortedEventTypeData = [
  //   ['IssueCommentEvent', 30],
  //   ['IssuesEvent', 20],
  //   ['PushEvent', 10],
  //   ['PullRequestsEvent', 5],
  //   ['PullRequestReviewEvent', 2]
  // ];
  
  const eventTypeItems = sortedEventTypeData.map((event, i) => {
    if (event == null || i >= 5) {
      return null;
    }
    return {
      ...eventTypeItemFormat[i],
      label: event[0],
      value: event[1]
    }
  }).filter(event => event != null);

  eventTypeItems.forEach((item, i) => {
    const legendEl = createLegend(item, i);
    eventTypeChartLegendEl.appendChild(legendEl);
  });

  console.log('1', 'style', etc.style.width, 'computed', getComputedStyle(etc).width);
  eventTypeChart = new Chart(eventTypeChartEl, {
    type: 'doughnut',
    data: {
      labels: eventTypeItems.map(item => item.label),
      datasets: [{
        data: eventTypeItems.map(item => item.value),
        backgroundColor: eventTypeItems.map(item => item.backgroundColor),
        borderColor: eventTypeItems.map(item => item.borderColor),
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        }
      } 
    }
  });
  console.log('2', 'style', etc.style.width, 'computed', getComputedStyle(etc).width);
  

  const eventLocationItemFormat = [
    {
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)'
    },
    {
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)'
    },
    {
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(255, 206, 86, 1)'
    },
    {
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)'
    },
    {
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgba(153, 102, 255, 1)'
    },
  ];

  /* fake data */
  // sortedEventLocationData = [
  //   ['json data information pool repo repo repo', 65],
  //   ['json data information pool repo repo repo', 45],
  //   ['json data information pool repo repo repo', 30],
  //   ['json data information pool repo repo repo', 12],
  //   ['json data information pool repo repo repo', 6]
  // ];
  

  const eventLocationItems = sortedEventLocationData.map((event, i) => {
    if (event == null || event[0] == null || i >= 5) {
      return null;
    }
    return {
      ...eventLocationItemFormat[i],
      label: event[0],
      value: event[1]
    };
  }).filter(event => event != null);

  
  eventLocationItems.forEach((item, i) => {
    const legendEl = createLegend(item, i);
    eventLocationChartLegendEl.appendChild(legendEl);
  });

 
  eventLocationChart = new Chart(eventLocationChartEl, {
    type: 'bar',
    data: {
      datasets: [{
        data: eventLocationItems.map((item, i) => {
          return { x: `${i+1}`, y: `${item.value}` };
        }),
        backgroundColor:
        eventLocationItems.map(item => item.backgroundColor),
        borderColor: 
        eventLocationItems.map(item => item.borderColor),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            color: '#666',
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#555'
          },  
          ticks: {
            color: '#999'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      },
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
    }
  });
  

 
  /* received events chart */


  /* fake data */
  // receivedEventForChart = [
  //   ['2021-07-30', 65],
  //   ['2021-07-31', 40],
  //   ['2021-08-01', 30],
  //   ['2021-08-02', 20],
  //   ['2021-08-03', 35],
  // ];


  
  const receivedEventItems = receivedEventForChart.map((event, i) => {
    if (event == null || i >= 5) {
      return null;
    }
    return {
      x: event[0],
      y: event[1]
    }
  }).filter(event => event != null);
  console.log('receivedEventItems', receivedEventItems);
  
  receivedEventChart = new Chart(receivedEventChartEl, {
    type: 'line',
    data: {
      datasets: [{
        data: receivedEventItems.reverse(),
        fill: true,
        backgroundColor: 'rgb(75, 192, 192, 0.3)',
        borderColor: 'rgb(40, 200, 160)',
        tension: 0.3,
        borderDash: [5, 5],
        pointStyle: 'circle',
        pointRadius: 10,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      scales: {
        x: {
          ticks: {
            color: '#999'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(val, index) {
              // Hide the label of every 2nd dataset
              return index % 2 === 0 ? this.getLabelForValue(val) : '';
            },
            color: '#999'
          },
          grid: {
            color: '#555'
          }
        }
      },
       tooltip: {
        usePointStyle: true,
      },
      animations: {
        y: {
          easing: 'easeInOutElastic',
          from: (ctx) => {
            if (ctx.type === 'data') {
              if (ctx.mode === 'default' && !ctx.dropped) {
                ctx.dropped = true;
                return 0;
              }
            }
          }
        }
      },
    }
  } );

}


function reportWindowSize() {
  console.log('window.size', window.innerWidth)
  if (window.innerWidth > 1100) {
    receivedEventChartContainer.style.width = '100%';
    eventTypeChartContainer.style.width = '18vw';
    eventTypeChartContainer.style.height = '40vh';
    eventLocationChartContainer.style.width = '25vw';
    eventLocationChartContainer.style.height = '40vh';
  } 
  if (window.innerWidth <= 1100) {
    receivedEventChartContainer.style.width = '100%';
    eventTypeChartContainer.style.width = '25vw';
    eventLocationChartContainer.style.width = '35vw';
    eventLocationChartContainer.style.height = '40vh';
  } 
  if (window.innerWidth <= 800) {
    receivedEventChartContainer.style.width = '100%';
    eventTypeChartContainer.style.width = '100%';
    eventLocationChartContainer.style.width = '100%';
  }
}



// event listeners
initApp();
reposContainerEl.addEventListener('click', (event) => {
  console.log('event.target', event.target.parentNode);
  const url = event.target.parentNode.querySelector('.name').getAttribute('data-repo-url');
  console.log('url', url);
  window.location.href = `${url}`;
});

window.addEventListener('resize', reportWindowSize);
reportWindowSize();
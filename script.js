const yearGenderCounts = {};

function extractYear(dateValue) {
  if (!dateValue) return null;
  if (typeof dateValue === "string") {
    const match = dateValue.match(/\b(18|19|20)\d{2}\b/);
    return match ? match[0] : null;
  }
  return null;
}

async function loadData() {
  const response = await fetch('./Artworks.json');
  const data = await response.json();

  for (let i = 0; i < data.length; i++) {
    let gender = data[i].Gender;
    if (Array.isArray(gender)) gender = gender[0];
    if (typeof gender !== "string") continue;

    gender = gender.toLowerCase();
    const year = extractYear(data[i].Date);
    if (!year || (gender !== "male" && gender !== "female")) continue;

    if (!yearGenderCounts[year]) yearGenderCounts[year] = { male: 0, female: 0 };
    yearGenderCounts[year][gender]++;
  }

  createChart();
}

function createChart() {
  const years = Object.keys(yearGenderCounts).sort((a, b) => a - b);
  const maleData = years.map(y => yearGenderCounts[y].male);
  const femaleData = years.map(y => yearGenderCounts[y].female);

  const ctx = document.getElementById('myChart').getContext('2d');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          borderWidth: 2,
          borderColor: '#1f77b4',
          backgroundColor: 'rgba(31,119,180,0.15)',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Female',
          data: femaleData,
          borderWidth: 2,
          borderColor: '#e377c2',
          backgroundColor: 'rgba(227,119,194,0.15)',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Painting domination in Artworks Over Time'
        },
        legend: {
          position: 'top',
          onClick: function (e, legendItem, legend) {
            const chart = legend.chart;
            const index = legendItem.datasetIndex;

            // v4-safe toggle
            const currentlyVisible = chart.isDatasetVisible(index);
            chart.setDatasetVisibility(index, !currentlyVisible);
            chart.update();

            // Show/hide text blocks
            const maleVisible = chart.isDatasetVisible(0);
            const femaleVisible = chart.isDatasetVisible(1);

            document.getElementById('summary').style.display =
              maleVisible && femaleVisible ? 'block' : 'none';
            document.getElementById('maleInfo').style.display =
              maleVisible && !femaleVisible ? 'block' : 'none';
            document.getElementById('femaleInfo').style.display =
              femaleVisible && !maleVisible ? 'block' : 'none';
          }
        },
        tooltip: {
          callbacks: {
            title: context => `Year: ${context[0].label}`,
            label: context => `${context.dataset.label}: ${context.raw} artworks`
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        x: {
          title: { display: true, text: 'Year' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Number of Artworks' }
        }
      }
    }
  });
}

loadData();

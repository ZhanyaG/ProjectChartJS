// Object to store counts of male and female artists per year
const yearGenderCounts = {};

function extractYear(dateValue) {
  if (!dateValue) return null;
  if (typeof dateValue === "string") {
    //Extracting a 4-digit year (18xx, 19xx, 20xx) from a date string, 
    // because it has too many different year notations, such as c. 1980; 1905-1908; etc .
    const match = dateValue.match(/\b(18|19|20)\d{2}\b/);
    return match ? match[0] : null;
  }
  return null;
}

async function loadData() {
  const response = await fetch('./Artworks.json');
  const data = await response.json();

  // If statement saying that if gender is an array, use the first element
  //Since it also has different arrays such as female, male, male, female, female, etc
  for (let i = 0; i < data.length; i++) {
    let gender = data[i].Gender;
    if (Array.isArray(gender)) gender = gender[0];
    if (typeof gender !== "string") continue;

    // Skips entries without valid year or gender
    gender = gender.toLowerCase();
    const year = extractYear(data[i].Date);
    if (!year || (gender !== "male" && gender !== "female")) continue;
//counts gender
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

            // Custom legend click for to toggle dataset visibility
            const currentlyVisible = chart.isDatasetVisible(index);
            chart.setDatasetVisibility(index, !currentlyVisible);
            chart.update();

            // Show/hide text blocks for female and male peak data info
            const maleVisible = chart.isDatasetVisible(0);
            const femaleVisible = chart.isDatasetVisible(1);

           // If male dataset is visible AND female dataset is hidden, show male info.
           // Otherwise, hide it.
            document.getElementById('summary').style.display =
              maleVisible && femaleVisible ? 'block' : 'none';
            document.getElementById('maleInfo').style.display =
              maleVisible && !femaleVisible ? 'block' : 'none';
              
              //Shows only if female line is visible and male line is hidden.
              // Otherwise, hides it.
            document.getElementById('femaleInfo').style.display =
              femaleVisible && !maleVisible ? 'block' : 'none';
          }
        },
         // Shows year and count of artworks on hover
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

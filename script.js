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

    // 🔹 Normalize gender
    if (Array.isArray(gender)) {
      gender = gender[0];
    }

    if (typeof gender === "string") {
      gender = gender.toLowerCase();
    } else {
      continue;
    }

    const year = extractYear(data[i].Date);

    if (!year) continue;
    if (gender !== "male" && gender !== "female") continue;

    if (!yearGenderCounts[year]) {
      yearGenderCounts[year] = { male: 0, female: 0 };
    }

    if (gender === "male") yearGenderCounts[year].male++;
    if (gender === "female") yearGenderCounts[year].female++;
  }

  console.log("yearGenderCounts:", yearGenderCounts);
  createChart();
}

function createChart() {
  const years = Object.keys(yearGenderCounts).sort((a, b) => a - b);

  const maleData = years.map(y => yearGenderCounts[y].male);
  const femaleData = years.map(y => yearGenderCounts[y].female);

  const ctx = document.getElementById('myChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          borderWidth: 2
        },
        {
          label: 'Female',
          data: femaleData,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Gender Mentions in Artworks Over Time'
        }
      }
    }
  });
}

loadData();

const requestsElement =
  document.getElementById("requests");

const threatsElement =
  document.getElementById("threats");

const criticalElement =
  document.getElementById("critical");

const ipsElement =
  document.getElementById("ips");

const severityElement =
  document.getElementById("severity");

const threatTypesElement =
  document.getElementById("threat-types");

const threatFeedElement =
  document.getElementById("threat-feed");

const eventsElement =
  document.getElementById("events");

const connectionElement =
  document.getElementById("connection");


function formatTime(timestamp) {
  return new Date(timestamp)
    .toLocaleTimeString();
}


function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}


/*
 * Overview
 */
async function loadOverview() {
  try {
    const response =
      await fetch("./api/overview");

    const data =
      await response.json();

    requestsElement.textContent =
      data.requests;

    threatsElement.textContent =
      data.threats;

    criticalElement.textContent =
      data.criticalThreats;

    ipsElement.textContent =
      data.uniqueIPs;

    severityElement.innerHTML = `
      <div class="severity-row">
        <span>Critical</span>
        <strong>${data.criticalThreats}</strong>
      </div>

      <div class="severity-row">
        <span>High</span>
        <strong>${data.highThreats}</strong>
      </div>

      <div class="severity-row">
        <span>Medium</span>
        <strong>${data.mediumThreats}</strong>
      </div>

      <div class="severity-row">
        <span>Low</span>
        <strong>${data.lowThreats}</strong>
      </div>
    `;

  } catch (error) {
    console.error(
      "Failed to load overview:",
      error
    );
  }
}


/*
 * Threat types
 */
async function loadThreats() {
  try {
    const response =
      await fetch("./api/threats");

    const data =
      await response.json();

    const counts = {};

    for (const threat of data.threats) {
      counts[threat.type] =
        (counts[threat.type] || 0) + 1;
    }

    const entries =
      Object.entries(counts);

    if (entries.length === 0) {
      threatTypesElement.innerHTML =
        `<p class="empty">No threats detected.</p>`;

      return;
    }

    threatTypesElement.innerHTML =
      entries
        .map(
          ([type, count]) => `
            <div class="severity-row">
              <span>${escapeHtml(type)}</span>
              <strong>${count}</strong>
            </div>
          `
        )
        .join("");

  } catch (error) {
    console.error(
      "Failed to load threats:",
      error
    );
  }
}


/*
 * Recent requests
 */
async function loadEvents() {
  try {
    const response =
      await fetch("./api/events");

    const data =
      await response.json();

    eventsElement.innerHTML =
      data.events
        .slice(0, 50)
        .map(
          (event) => `
            <tr>
              <td>
                ${formatTime(event.timestamp)}
              </td>

              <td>
                <span class="method">
                  ${escapeHtml(event.method)}
                </span>
              </td>

              <td>
                ${escapeHtml(event.path)}
              </td>

              <td>
                <span class="status-code status-${Math.floor(event.statusCode / 100)}xx">
                  ${event.statusCode}
                </span>
              </td>

              <td>
                ${escapeHtml(event.ip)}
              </td>
            </tr>
          `
        )
        .join("");

  } catch (error) {
    console.error(
      "Failed to load events:",
      error
    );
  }
}

/*
 * Add a threat to live feed
 */
function addThreatToFeed(threat) {
  const element = document.createElement("div");
  element.className = "threat-item";
  element.innerHTML = `
    <div class="threat-main">
      <div>
        <strong>
          ${escapeHtml(threat.type)}
        </strong>
        <span class="severity-badge severity-${threat.severity.toLowerCase()}">
          ${escapeHtml(threat.severity)}
        </span>
      </div>
      <div class="threat-details">
        ${escapeHtml(threat.details)}
      </div>
    </div>
    <div class="threat-meta">
      <span>
        ${escapeHtml(threat.ip)}
      </span>
      <span>
        ${formatTime(threat.timestamp)}
      </span>
    </div>
  `;

  const emptyMessage =
    threatFeedElement.querySelector(".empty");

  if (emptyMessage) {
    emptyMessage.remove();
  }

  threatFeedElement.prepend(element);
  /*
   * Keep only latest 20 items.
   */
  while (
    threatFeedElement.children.length > 20
  ) {
    threatFeedElement.lastElementChild.remove();
  }
}


/*
 * Live SSE connection
 */
function connectThreatStream() {

  const source = new EventSource(
      "./api/threats/stream"
    );

  source.onopen = () => {
    connectionElement.textContent = "Live";
  };

  source.addEventListener("initial", (event) => {
    const data = JSON.parse(event.data);
    /*
    * Add existing threats to the live feed.
    */
    if (Array.isArray(data.threats)) {
      for (const threat of data.threats) {
        addThreatToFeed(threat);
      }
    }
  });


  source.addEventListener("threat", (event) => {
    const threat = JSON.parse(event.data);
    addThreatToFeed(threat);
    loadOverview();
    loadThreats();
  });

  source.onerror = () => {
    connectionElement.textContent = "Reconnecting...";
  };
}


/*
 * Initial load
 */
async function initialize() {
  await loadOverview();
  await loadThreats();
  await loadEvents();
  connectThreatStream();
}


/*
 * Refresh request activity.
 */
setInterval(loadOverview, 2000);

setInterval(loadEvents, 2000);

initialize();
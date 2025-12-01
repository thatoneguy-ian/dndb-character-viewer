// public/background.js

// Allow clicking the extension icon to open the Side Panel directly
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_CHARACTER") {
    fetchCharacter(request.characterId).then(sendResponse);
    return true; 
  }
});

async function fetchCharacter(characterId) {
  try {
    const cookie = await chrome.cookies.get({ url: "https://www.dndbeyond.com", name: "CobaltSession" });
    if (!cookie) return { success: false, error: "Please log in to D&D Beyond." };

    const response = await fetch(`https://character-service.dndbeyond.com/character/v5/character/${characterId}`, {
      headers: { "Authorization": `Bearer ${cookie.value}` }
    });
    
    if (!response.ok) return { success: false, error: `API Error: ${response.status}` };
    const json = await response.json();
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
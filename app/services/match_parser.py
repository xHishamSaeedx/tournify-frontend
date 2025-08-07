import requests
from bs4 import BeautifulSoup

def parse_match(url: str):
    res = requests.get(url)
    soup = BeautifulSoup(res.text, 'lxml')

    player_rows = soup.select("table tbody tr")
    players = []

    for row in player_rows:
        cols = row.find_all("td")
        if len(cols) < 5:
            continue

        name = cols[0].get_text(strip=True)
        kills = int(cols[1].get_text(strip=True))
        acs = int(cols[4].get_text(strip=True))  # Adjust if needed

        players.append({
            "player_id": name,
            "kills": kills,
            "acs": acs
        })

    players.sort(key=lambda x: (-x["kills"], -x["acs"]))

    for i, p in enumerate(players):
        p["position"] = i + 1

    return players 
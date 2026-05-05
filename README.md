# FocusMC keep-alive bot

Bot Minecraft do utrzymywania serwera online. Dziala na Node.js i Mineflayer.

## Railway

1. Wejdz na Railway i wybierz `New Project`.
2. Wybierz `Deploy from GitHub repo`.
3. Wybierz repozytorium `tomal23451243-design/bot`.
4. W zakladce `Variables` dodaj:

```text
MC_HOST=focusmc.aternos.me
MC_PORT=25565
MC_VERSION=1.21.1
MC_USERNAME=FocusBot123
MC_LOGIN_COMMAND=/login Haslo123!
RECONNECT_DELAY_MS=15000
OFFLINE_DELAY_MS=60000
MOVE_INTERVAL_MS=10000
```

5. Railway sam uruchomi `npm start`.

## Lokalny start

```bash
npm install
npm start
```

## Konfiguracja

- `MC_USERNAME` musi byc nazwa konta/bota na serwerze.
- `MC_LOGIN_COMMAND` to komenda wpisywana po kazdym wejsciu na serwer.
- `RECONNECT_DELAY_MS` ustawia opoznienie przed ponownym wejsciem po wyrzuceniu.
- `OFFLINE_DELAY_MS` ustawia, jak dlugo bot czeka, gdy serwer jest offline.
- `MOVE_INTERVAL_MS` ustawia, jak czesto bot ma sie poruszac.

Jesli w logach widzisz losowy nick typu `KeepAlive_3835`, to znaczy, ze `MC_USERNAME` nie zostal ustawiony w Railway.
Jesli widzisz `Server is offline or not accepting pings yet`, serwer Aternos musi byc najpierw wlaczony z panelu Aternos.

Uwaga: niektore serwery zabraniaja botow/AFK w regulaminie. Uzywaj tego tylko na swoim serwerze albo tam, gdzie masz zgode.

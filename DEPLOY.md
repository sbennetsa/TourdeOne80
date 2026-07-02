# Deploy Tour de ONE80 with Cloudflare Tunnel

## Local Production Server

### Step 1: Start the production server

```powershell
.\prod.ps1
```

This will:
- Build production Docker image
- Install dependencies
- Bundle with Vite
- Start `serve` on `http://localhost:3000`
- Auto-restart on crash

### Step 2: Install Cloudflare Tunnel CLI

Download and install `cloudflared`:
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

Or via Chocolatey (Windows):
```powershell
choco install cloudflare-warp
```

### Step 3: Authenticate

```powershell
cloudflared login
```

This opens a browser to authenticate with your Cloudflare account.

### Step 4: Create a tunnel

```powershell
cloudflared tunnel create tour-one80
```

Save the credentials file (you'll need it).

### Step 5: Point domain to tunnel

Option A: Use a Cloudflare-registered domain
```powershell
cloudflared tunnel route dns tour-one80 leaderboard.yourdomain.com
```

Option B: Use a free Cloudflare tunnel domain
```powershell
cloudflared tunnel route dns tour-one80 tour-one80.cfargotunnel.com
```

### Step 6: Run the tunnel

```powershell
cloudflared tunnel run --url http://localhost:3000 tour-one80
```

Now your app is live at:
- **Custom domain:** `https://leaderboard.yourdomain.com`
- **Tunnel subdomain:** `https://tour-one80.cfargotunnel.com`

---

## Configuration

### Environment

Production uses these defaults from `src/config.ts`:
- **Data source:** Google Sheets (live CSV export)
- **Sync interval:** 60 seconds
- **Port:** 3000

### Updating the app

When you update code:
```powershell
git pull
.\prod.ps1  # Rebuilds and restarts
```

### Monitoring

Check Docker logs:
```powershell
docker logs -f tour-deone80-app-1
```

---

## Cloudflare Tunnel Benefits

✅ No port forwarding needed
✅ HTTPS automatically
✅ Behind Cloudflare firewall
✅ Accessible from anywhere
✅ Free tier available

---

## Troubleshooting

**"Connection refused"**
- Make sure `.\prod.ps1` is running on port 3000
- Check: http://localhost:3000

**"Tunnel not responding"**
- Restart tunnel: `cloudflared tunnel run --url http://localhost:3000 tour-one80`
- Check Cloudflare dashboard for tunnel status

**"Sheet data not loading"**
- Check browser console (F12) for CORS errors
- Verify Google Sheet URLs in `src/config.ts`
- Ensure sheets are published as CSV

---

## Architecture

```
Your Machine
    ↓
Docker Container (port 3000)
    ↓
Cloudflare Tunnel
    ↓
HTTPS Public URL
    ↓
Users anywhere
```

The tunnel encrypts all traffic and manages SSL certificates automatically.

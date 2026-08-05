# 🛡️ Real-Time Network Traffic Setup Guide

## Current Status: ✅ Simulation Mode (Running)

The dashboard is currently running in **Simulation Mode** with realistic traffic based on real-world attack patterns (72% benign, 28% attacks).

---

## Option 1: Keep Simulation Mode (Default - No Setup Needed)

The dashboard works out of the box with realistic simulated traffic. This is perfect for:
- ✅ Demos & presentations
- ✅ Development & testing
- ✅ Training & education

No additional setup required.

---

## Option 2: Connect to REAL Network Traffic

### Step 1: Install Python Dependencies
```bash
pip install scapy websockets
```

### Step 2: Find Your Network Interface
```bash
# Linux
ip link show

# macOS
ifconfig

# Windows
ipconfig
```
Common interfaces: `eth0`, `wlan0`, `en0`, `enp3s0`

### Step 3: Run the Backend (as root)
```bash
sudo python backend/real_backend.py eth0 8765
```

You should see:
```
============================================================
  🛡️  IDS Dashboard — Real Network Backend
============================================================
  WebSocket: ws://0.0.0.0:8765
  Interface: eth0

[✓] Server running on ws://0.0.0.0:8765
[*] Capturing on interface: eth0
```

### Step 4: Connect the Dashboard
```bash
# Create .env file in project root
echo "VITE_WS_URL=ws://localhost:8765" > .env

# Restart the dev server
npm run dev
```

### Step 5: Verify
The dashboard will show:
```
Connection: 🔵 Simulation Mode      → Changes to → 🔵 Real Backend
Real Backend: ⚠️ Not Connected      → Changes to → ✅ Connected
```

---

## Architecture Diagram

```
┌─────────────────────────┐     WebSocket      ┌──────────────────────┐
│  REAL NETWORK TRAFFIC   │────(ws://:8765)────▶│  React Dashboard    │
│  (Your actual network)  │◀───────────────────│  (Browser)          │
│                         │     JSON flows     │                     │
│  Python Backend:        │                    │  - Live Stream      │
│  - scapy packet capture │                    │  - ML Features      │
│  - Real feature extract │                    │  - Detection Log    │
│  - AI classification    │                    │  - Block Status     │
└─────────────────────────┘                    └──────────────────────┘
         │                                              ▲
         │ If no backend available                       │
         ▼                                              │
┌─────────────────────────┐                             │
│  SIMULATION ENGINE      │────(auto-fallback)──────────┘
│  (Built into browser)   │
│  - Realistic patterns   │
│  - CICIDS-like traffic  │
│  - 72% benign/28% attack│
└─────────────────────────┘
```

---

## Feature Comparison

| Feature | Simulation Mode | Real Backend |
|---------|----------------|--------------|
| **Real Traffic** | ❌ Simulated | ✅ Your actual network |
| **Setup Required** | ❌ None | ✅ Python + scapy |
| **Root Access** | ❌ No | ✅ Yes (for packet capture) |
| **Attack Types** | ✅ All 7 types | ✅ Based on real traffic |
| **Live Update Rate** | ~1.6 flows/sec | ~10+ flows/sec |
| **Data Accuracy** | Realistic patterns | Real network data |
| **Privacy** | ✅ No real data leaves | ⚠️ Captures your traffic |

---

## Troubleshooting

### Backend won't start
```bash
# Permission denied - need root for packet capture
sudo python backend/real_backend.py eth0 8765

# Interface not found
# List available interfaces:
ip link show    # Linux
ifconfig        # macOS
```

### Dashboard shows "Not Connected"
```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" http://localhost:8765
```

### No traffic showing
Check your interface has traffic:
```bash
# Monitor packets
sudo tcpdump -i eth0 -c 10
```

---

## ⚡ Quick Start (Real Mode)
```bash
pip install scapy websockets
sudo python backend/real_backend.py eth0 8765
echo "VITE_WS_URL=ws://localhost:8765" > .env
npm run dev
```

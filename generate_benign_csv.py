import csv
import random
from datetime import datetime, timedelta

# Realistic benign traffic profiles (Standard Enterprise / Web Architecture)
benign_profiles = [
    {
        "traffic_type": "Standard HTTPS Web Browsing",
        "protocol": "HTTPS",
        "dst_port": 443,
        "bytes_range": (3500, 125000),
        "packets_range": (20, 320),
        "duration_range": (80, 1200),
        "desc": "Encrypted TLS 1.3 web application browsing session over port 443"
    },
    {
        "traffic_type": "Secure REST API Microservice Call",
        "protocol": "HTTPS",
        "dst_port": 8443,
        "bytes_range": (1200, 45000),
        "packets_range": (10, 110),
        "duration_range": (45, 600),
        "desc": "JSON REST payload synchronization between frontend and backend services"
    },
    {
        "traffic_type": "Internal Database PostgreSQL Query",
        "protocol": "TCP",
        "dst_port": 5432,
        "bytes_range": (2500, 280000),
        "packets_range": (15, 450),
        "duration_range": (20, 450),
        "desc": "Authenticated internal relational DB query transaction over LAN"
    },
    {
        "traffic_type": "MySQL Database Connection Pool",
        "protocol": "TCP",
        "dst_port": 3306,
        "bytes_range": (2100, 195000),
        "packets_range": (12, 380),
        "duration_range": (25, 400),
        "desc": "Connection keep-alive & structured data exchange with MySQL cluster"
    },
    {
        "traffic_type": "Routine DNS Name Resolution",
        "protocol": "UDP",
        "dst_port": 53,
        "bytes_range": (180, 850),
        "packets_range": (2, 8),
        "duration_range": (8, 65),
        "desc": "Standard recursive domain name lookup to internal resolver"
    },
    {
        "traffic_type": "Secure SSH Administrator Session",
        "protocol": "SSH",
        "dst_port": 22,
        "bytes_range": (8500, 340000),
        "packets_range": (45, 920),
        "duration_range": (500, 9500),
        "desc": "Key-based encrypted administrative terminal session"
    },
    {
        "traffic_type": "Corporate NTP Time Sync",
        "protocol": "UDP",
        "dst_port": 123,
        "bytes_range": (96, 240),
        "packets_range": (2, 4),
        "duration_range": (5, 40),
        "desc": "Network Time Protocol stratum sync packet exchange"
    },
    {
        "traffic_type": "Internal SMTP Mail Relay",
        "protocol": "TCP",
        "dst_port": 587,
        "bytes_range": (4200, 98000),
        "packets_range": (18, 190),
        "duration_range": (120, 1800),
        "desc": "TLS-wrapped enterprise notification email submission"
    },
    {
        "traffic_type": "Static CDN Asset Retrieval (CSS/JS/Images)",
        "protocol": "HTTPS",
        "dst_port": 443,
        "bytes_range": (18000, 850000),
        "packets_range": (35, 1200),
        "duration_range": (60, 950),
        "desc": "Parallel HTTP/2 asset fetching from verified CDN edge node"
    },
    {
        "traffic_type": "WebSocket Live State Feed",
        "protocol": "WSS",
        "dst_port": 443,
        "bytes_range": (600, 18000),
        "packets_range": (8, 60),
        "duration_range": (300, 5000),
        "desc": "Bi-directional real-time telemetry stream over secure WebSocket"
    }
]

# Internal and verified trusted corporate endpoints
internal_clients = [
    "192.168.1.101", "192.168.1.102", "192.168.1.105", "192.168.1.110", "192.168.1.120",
    "192.168.1.145", "192.168.1.150", "192.168.1.175", "192.168.1.200", "192.168.1.215",
    "10.0.1.10", "10.0.1.25", "10.0.1.50", "10.0.1.75", "10.0.1.100", "10.0.2.15",
    "172.16.10.5", "172.16.10.12", "172.16.10.30", "172.16.20.45"
]

internal_servers = [
    "192.168.1.10", "192.168.1.20", "192.168.1.50", "10.0.0.5", "10.0.0.12",
    "10.0.0.25", "10.0.0.50", "172.16.0.10", "172.16.0.22", "172.16.0.45"
]

trusted_external_services = [
    "142.250.190.46",  # Google Cloud CDN
    "151.101.1.140",   # Fastly CDN
    "104.16.132.229",  # Cloudflare Edge
    "13.107.42.16",    # Microsoft Azure Service
    "52.95.110.1",     # AWS us-east-1 Gateway
    "1.1.1.1",         # Cloudflare DNS
    "8.8.8.8",         # Google Public DNS
    "185.199.108.153"  # GitHub CDN
]

start_time = datetime(2026, 10, 2, 9, 0, 0)
current_time = start_time

records = []
total_records = 125  # Minimum 100 required, generating 125 clean records

for i in range(total_records):
    current_time += timedelta(seconds=random.randint(2, 28))
    profile = random.choice(benign_profiles)
    
    # Randomly select client and destination
    src_ip = random.choice(internal_clients)
    if profile["dst_port"] in [53, 123] or "CDN" in profile["traffic_type"] or "Browsing" in profile["traffic_type"]:
        dst_ip = random.choice(trusted_external_services)
    else:
        dst_ip = random.choice(internal_servers)
        
    src_port = random.randint(32768, 65535)
    dst_port = profile["dst_port"]
    protocol = profile["protocol"]
    
    confidence = round(random.uniform(98.80, 99.95), 2)
    bytes_sent = random.randint(*profile["bytes_range"])
    packets = random.randint(*profile["packets_range"])
    duration = random.randint(*profile["duration_range"])
    
    records.append({
        "record_id": f"BENIGN-{1001 + i}",
        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
        "source_ip": src_ip,
        "source_port": src_port,
        "destination_ip": dst_ip,
        "destination_port": dst_port,
        "protocol": protocol,
        "attack_category": "BENIGN",
        "attack_type": profile["traffic_type"],
        "severity": "NORMAL",
        "confidence_score": f"{confidence}%",
        "action_taken": "ALLOWED",
        "bytes_transferred": bytes_sent,
        "packet_count": packets,
        "duration_ms": duration,
        "signature_description": profile["desc"]
    })

fieldnames = [
    "record_id",
    "timestamp",
    "source_ip",
    "source_port",
    "destination_ip",
    "destination_port",
    "protocol",
    "attack_category",
    "attack_type",
    "severity",
    "confidence_score",
    "action_taken",
    "bytes_transferred",
    "packet_count",
    "duration_ms",
    "signature_description"
]

# Write to public/sample_datasets/
output_path_1 = "public/sample_datasets/benign_normal_traffic_dataset.csv"
with open(output_path_1, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

# Write to root directory
output_path_2 = "benign_normal_traffic_100_records.csv"
with open(output_path_2, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

print(f"Generated {len(records)} 100% clean/benign records (0 attacks):")
print(f"1. {output_path_1}")
print(f"2. {output_path_2}")

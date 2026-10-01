import csv
import random
from datetime import datetime, timedelta

# Attack configurations and patterns
attack_profiles = [
    {
        "category": "DDoS",
        "attack_types": ["DDoS SYN Flood", "DDoS UDP Flood", "DDoS HTTP GET Flood", "DDoS DNS Amplification", "DDoS ICMP Flood"],
        "protocols": ["TCP", "UDP", "TCP", "UDP", "ICMP"],
        "dst_ports": [80, 443, 53, 8080],
        "severity": "CRITICAL",
        "action": "BLOCKED",
        "confidence_range": (97.5, 99.9),
        "bytes_range": (1500000, 9500000),
        "packets_range": (12000, 85000),
        "duration_range": (500, 3000)
    },
    {
        "category": "DoS",
        "attack_types": ["DoS Slowloris", "DoS Hulk", "DoS GoldenEye", "DoS TCP Reset", "DoS Ping of Death"],
        "protocols": ["TCP", "TCP", "TCP", "TCP", "ICMP"],
        "dst_ports": [80, 443, 8080, 8443],
        "severity": "HIGH",
        "action": "BLOCKED",
        "confidence_range": (94.0, 98.8),
        "bytes_range": (450000, 2200000),
        "packets_range": (3500, 18000),
        "duration_range": (1000, 6000)
    },
    {
        "category": "Port Scan",
        "attack_types": ["Port Scan SYN Stealth", "Port Scan FIN Sweep", "Port Scan XMAS Tree", "Port Scan TCP Connect Sweep", "Port Scan UDP Null"],
        "protocols": ["TCP", "TCP", "TCP", "TCP", "UDP"],
        "dst_ports": [21, 22, 23, 25, 80, 110, 135, 139, 443, 445, 1433, 3306, 3389, 5432, 8080],
        "severity": "MEDIUM",
        "action": "BLOCKED",
        "confidence_range": (92.0, 97.5),
        "bytes_range": (25000, 180000),
        "packets_range": (300, 2200),
        "duration_range": (150, 1200)
    },
    {
        "category": "Web Attack",
        "attack_types": ["Web Attack SQL Injection (SQLi)", "Web Attack Cross-Site Scripting (XSS)", "Web Attack Command Injection", "Web Attack Directory Traversal", "Web Attack File Inclusion (LFI/RFI)"],
        "protocols": ["HTTP", "HTTPS", "HTTP", "HTTPS", "HTTP"],
        "dst_ports": [80, 443, 8080, 3000],
        "severity": "CRITICAL",
        "action": "BLOCKED",
        "confidence_range": (96.0, 99.8),
        "bytes_range": (4500, 65000),
        "packets_range": (15, 350),
        "duration_range": (80, 900)
    },
    {
        "category": "Zero-Day Threat",
        "attack_types": ["0-Day Polymorphic Shellcode Injection", "0-Day Unpatched Kernel RCE Exploit", "0-Day Zero-Click Memory Corruption", "0-Day Deserialization Exploit Vector", "0-Day Evasive Multi-Stage Heuristic Anomaly"],
        "protocols": ["TCP", "HTTPS", "TCP", "UDP", "TCP"],
        "dst_ports": [443, 8443, 9001, 445, 22],
        "severity": "CRITICAL",
        "action": "BLOCKED",
        "confidence_range": (98.0, 99.9),
        "bytes_range": (120000, 1850000),
        "packets_range": (800, 12500),
        "duration_range": (300, 2500)
    },
    {
        "category": "Unauthorized Links",
        "attack_types": ["Unauthorized Link C2 Beaconing", "Unauthorized Link Malicious Phishing Redirect", "Unauthorized Link Reverse Proxy Tunneling", "Unauthorized Link Rogue DNS Callback", "Unauthorized Link Stolen Token Exfiltration URL"],
        "protocols": ["HTTPS", "HTTP", "DNS", "HTTPS", "HTTP"],
        "dst_ports": [443, 80, 53, 8080, 8888],
        "severity": "HIGH",
        "action": "BLOCKED",
        "confidence_range": (95.0, 99.4),
        "bytes_range": (8500, 145000),
        "packets_range": (45, 850),
        "duration_range": (120, 1500)
    },
    {
        "category": "BENIGN",
        "attack_types": ["Normal HTTPS Web Browsing", "Legitimate API REST Request", "Normal Database Sync Query", "Routine DNS Query Lookup", "Secure SSH Admin Session"],
        "protocols": ["HTTPS", "HTTPS", "TCP", "DNS", "SSH"],
        "dst_ports": [443, 8443, 5432, 53, 22],
        "severity": "LOW",
        "action": "ALLOWED",
        "confidence_range": (98.5, 99.9),
        "bytes_range": (1500, 48000),
        "packets_range": (12, 180),
        "duration_range": (50, 600)
    }
]

# Attacker external IP pools and internal target subnet
external_ips = [
    "185.220.101.45", "45.33.32.156", "91.121.87.34", "5.188.62.28", "194.87.31.54",
    "212.129.38.224", "80.82.77.139", "185.220.101.99", "103.251.167.20", "198.51.100.42",
    "203.0.113.195", "185.190.140.33", "194.26.29.112", "45.154.255.88", "193.142.146.35",
    "176.119.25.18", "185.156.73.52", "195.123.245.8", "77.247.108.162", "109.248.206.51",
    "185.174.136.21", "45.140.19.12", "193.32.162.77", "185.244.30.15", "91.240.118.231"
]

internal_ips = [
    "192.168.1.10", "192.168.1.15", "192.168.1.20", "192.168.1.50", "192.168.1.100",
    "10.0.0.5", "10.0.0.12", "10.0.0.25", "10.0.0.50", "10.0.0.100",
    "172.16.0.10", "172.16.0.22", "172.16.0.45"
]

start_time = datetime(2026, 9, 15, 8, 30, 0)

records = []
total_records_to_generate = 130  # Generates 130 records (min 100 required)

# Distribution weights across all categories:
# DDoS: ~22, DoS: ~20, Port Scan: ~20, Web Attack: ~22, Zero-Day: ~20, Unauthorized Links: ~20, Benign: ~6
category_pool = (
    ["DDoS"] * 22 +
    ["DoS"] * 20 +
    ["Port Scan"] * 20 +
    ["Web Attack"] * 22 +
    ["Zero-Day Threat"] * 20 +
    ["Unauthorized Links"] * 20 +
    ["BENIGN"] * 6
)
random.shuffle(category_pool)

current_time = start_time
for i, cat_name in enumerate(category_pool):
    profile = next(p for p in attack_profiles if p["category"] == cat_name)
    
    current_time += timedelta(seconds=random.randint(4, 45))
    src_ip = random.choice(external_ips) if cat_name != "BENIGN" else random.choice(internal_ips)
    dst_ip = random.choice(internal_ips) if cat_name != "BENIGN" else random.choice(external_ips)
    src_port = random.randint(1024, 65535)
    dst_port = random.choice(profile["dst_ports"])
    protocol = random.choice(profile["protocols"])
    attack_name = random.choice(profile["attack_types"])
    
    conf = round(random.uniform(*profile["confidence_range"]), 2)
    bytes_sent = random.randint(*profile["bytes_range"])
    packets = random.randint(*profile["packets_range"])
    duration = random.randint(*profile["duration_range"])
    
    # Payload / Signature description
    payload_desc = ""
    if cat_name == "DDoS":
        payload_desc = f"High-volume flood vector with {packets} pkts/s targeting port {dst_port}"
    elif cat_name == "DoS":
        payload_desc = f"Resource exhaustion probe exhausting thread pools on port {dst_port}"
    elif cat_name == "Port Scan":
        payload_desc = f"Sequential port sweep reconnaissance across range {dst_port}-{dst_port+15}"
    elif cat_name == "Web Attack":
        payload_desc = f"Exploit pattern detected in HTTP header/URI payload targeting web endpoint"
    elif cat_name == "Zero-Day Threat":
        payload_desc = f"Unknown polymorphic exploit signature with zero-day heuristic match rate {conf}%"
    elif cat_name == "Unauthorized Links":
        payload_desc = f"Outbound unauthorized link connection attempt to untrusted domain / C2"
    else:
        payload_desc = "Verified legitimate user network flow conforming to security baseline"
    
    records.append({
        "record_id": f"REC-{1001 + i}",
        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
        "source_ip": src_ip,
        "source_port": src_port,
        "destination_ip": dst_ip,
        "destination_port": dst_port,
        "protocol": protocol,
        "attack_category": cat_name,
        "attack_type": attack_name,
        "severity": profile["severity"],
        "confidence_score": f"{conf}%",
        "action_taken": profile["action"],
        "bytes_transferred": bytes_sent,
        "packet_count": packets,
        "duration_ms": duration,
        "signature_description": payload_desc
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
output_path_1 = "public/sample_datasets/all_attacks_comprehensive_dataset.csv"
with open(output_path_1, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

# Write to root for convenient direct access
output_path_2 = "all_attacks_dataset_100_records.csv"
with open(output_path_2, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)

print(f"Successfully generated {len(records)} records in:")
print(f"1. {output_path_1}")
print(f"2. {output_path_2}")

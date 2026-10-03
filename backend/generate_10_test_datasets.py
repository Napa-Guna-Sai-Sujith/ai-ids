import csv
import random
from datetime import datetime, timedelta
import os

os.makedirs("public/sample_datasets", exist_ok=True)

# Common fields
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

external_ips = [
    "185.220.101.45", "45.33.32.156", "91.121.87.34", "5.188.62.28", "194.87.31.54",
    "212.129.38.224", "80.82.77.139", "185.220.101.99", "103.251.167.20", "198.51.100.42",
    "203.0.113.195", "185.190.140.33", "194.26.29.112", "45.154.255.88", "193.142.146.35"
]

internal_ips = [
    "192.168.1.10", "192.168.1.15", "192.168.1.20", "192.168.1.50", "192.168.1.100",
    "10.0.0.5", "10.0.0.12", "10.0.0.25", "10.0.0.50", "10.0.0.100",
    "172.16.0.10", "172.16.0.22", "172.16.0.45"
]

def generate_csv(filename, category, attack_names, protocols, dst_ports, severity, action, count, conf_range, bytes_range, pkts_range, desc_template):
    records = []
    start_time = datetime(2026, 10, 1, 8, 0, 0)
    curr_time = start_time
    
    for i in range(count):
        curr_time += timedelta(seconds=random.randint(2, 20))
        src_ip = random.choice(external_ips) if category != "BENIGN" else random.choice(internal_ips)
        dst_ip = random.choice(internal_ips) if category != "BENIGN" else random.choice(external_ips)
        src_port = random.randint(1024, 65535)
        dst_port = random.choice(dst_ports)
        proto = random.choice(protocols)
        atk_name = random.choice(attack_names)
        conf = round(random.uniform(*conf_range), 2)
        bytes_t = random.randint(*bytes_range)
        pkts = random.randint(*pkts_range)
        dur = random.randint(50, 4000)
        
        desc = desc_template.format(port=dst_port, pkts=pkts, conf=conf, atk=atk_name)
        
        records.append({
            "record_id": f"{category[:4].upper()}-{1001 + i}",
            "timestamp": curr_time.strftime("%Y-%m-%d %H:%M:%S"),
            "source_ip": src_ip,
            "source_port": src_port,
            "destination_ip": dst_ip,
            "destination_port": dst_port,
            "protocol": proto,
            "attack_category": category,
            "attack_type": atk_name,
            "severity": severity,
            "confidence_score": f"{conf}%",
            "action_taken": action,
            "bytes_transferred": bytes_t,
            "packet_count": pkts,
            "duration_ms": dur,
            "signature_description": desc
        })
        
    path1 = f"public/sample_datasets/{filename}"
    with open(path1, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {count} records in {path1}")

# 1. Zero-Day Threat Dataset
generate_csv(
    "zero_day_threat_dataset.csv",
    "Zero-Day Threat",
    ["0-Day Polymorphic Shellcode", "0-Day Unpatched Kernel RCE", "0-Day Zero-Click Memory Corruption", "0-Day Deserialization Exploit Vector"],
    ["TCP", "HTTPS", "TCP", "UDP"],
    [443, 8443, 9001, 445, 22],
    "CRITICAL",
    "BLOCKED",
    120,
    (98.1, 99.9),
    (120000, 1850000),
    (800, 12500),
    "Polymorphic zero-day heuristic match rate {conf}% targeting port {port}"
)

# 2. Unauthorized Links Dataset
generate_csv(
    "unauthorized_links_dataset.csv",
    "Unauthorized Links",
    ["Unauthorized Link C2 Beaconing", "Unauthorized Link Malicious Phishing Redirect", "Unauthorized Link Reverse Proxy Tunneling", "Unauthorized Link Rogue DNS Callback"],
    ["HTTPS", "HTTP", "DNS", "HTTPS"],
    [443, 80, 53, 8080, 8888],
    "HIGH",
    "BLOCKED",
    120,
    (95.5, 99.4),
    (8500, 145000),
    (45, 850),
    "Unauthorized outbound link / C2 telemetry to untrusted endpoint on port {port}"
)

# 3. CICIDS2017 Sample Subset
generate_csv(
    "cicids2017_sample_subset.csv",
    "CICIDS2017 Benchmark",
    ["CICIDS2017 DDoS LOIC Flood", "CICIDS2017 DoS Slowloris", "CICIDS2017 PortScan Sweep", "CICIDS2017 WebAttack SQLi", "CICIDS2017 Infiltration Probe", "CICIDS2017 Heartbleed Vector"],
    ["TCP", "UDP", "HTTP", "HTTPS"],
    [80, 443, 22, 53, 8080],
    "CRITICAL",
    "BLOCKED",
    150,
    (98.5, 99.9),
    (50000, 4500000),
    (100, 35000),
    "CICIDS2017 flow benchmark vector: {atk} (Port {port})"
)

# 4. NSL-KDD Sample Subset
generate_csv(
    "nsl_kdd_sample_subset.csv",
    "NSL-KDD Benchmark",
    ["NSL-KDD Nepture SYN Flood", "NSL-KDD Smurf Broadcast", "NSL-KDD Satan Port Probe", "NSL-KDD IPSweep", "NSL-KDD Warezclient Buffer Overflow", "NSL-KDD Guess Password Probe"],
    ["TCP", "ICMP", "UDP", "TCP"],
    [21, 22, 23, 25, 80, 443],
    "HIGH",
    "BLOCKED",
    150,
    (97.8, 99.8),
    (15000, 2800000),
    (50, 18000),
    "NSL-KDD standard benchmark attack signature: {atk}"
)

# 5. DDoS Extended Dataset (>100 records)
generate_csv(
    "ddos_attack_dataset.csv",
    "DDoS",
    ["DDoS SYN Flood", "DDoS UDP Flood", "DDoS HTTP GET Flood", "DDoS DNS Amplification", "DDoS ICMP Flood"],
    ["TCP", "UDP", "TCP", "UDP", "ICMP"],
    [80, 443, 53, 8080],
    "CRITICAL",
    "BLOCKED",
    120,
    (98.0, 99.9),
    (1500000, 9500000),
    (12000, 85000),
    "High-volume DDoS flood vector with {pkts} pkts/s targeting port {port}"
)

# 6. DoS Extended Dataset (>100 records)
generate_csv(
    "dos_attack_dataset.csv",
    "DoS",
    ["DoS Slowloris", "DoS Hulk", "DoS GoldenEye", "DoS TCP Reset", "DoS Ping of Death"],
    ["TCP", "TCP", "TCP", "TCP", "ICMP"],
    [80, 443, 8080, 8443],
    "HIGH",
    "BLOCKED",
    120,
    (95.0, 99.1),
    (450000, 2200000),
    (3500, 18000),
    "Resource exhaustion DoS probe exhausting thread pools on port {port}"
)

# 7. Port Scan Extended Dataset (>100 records)
generate_csv(
    "port_scan_dataset.csv",
    "Port Scan",
    ["Port Scan SYN Stealth", "Port Scan FIN Sweep", "Port Scan XMAS Tree", "Port Scan TCP Connect Sweep", "Port Scan UDP Null"],
    ["TCP", "TCP", "TCP", "TCP", "UDP"],
    [21, 22, 23, 25, 80, 110, 135, 139, 443, 445, 1433, 3306, 3389, 5432, 8080],
    "MEDIUM",
    "BLOCKED",
    120,
    (93.5, 98.2),
    (25000, 180000),
    (300, 2200),
    "Sequential port sweep reconnaissance across range {port}-{port}+15"
)

# 8. Web Attack Extended Dataset (>100 records)
generate_csv(
    "web_attack_dataset.csv",
    "Web Attack",
    ["Web Attack SQL Injection (SQLi)", "Web Attack Cross-Site Scripting (XSS)", "Web Attack Command Injection", "Web Attack Directory Traversal", "Web Attack File Inclusion (LFI/RFI)"],
    ["HTTP", "HTTPS", "HTTP", "HTTPS", "HTTP"],
    [80, 443, 8080, 3000],
    "CRITICAL",
    "BLOCKED",
    120,
    (96.5, 99.9),
    (4500, 65000),
    (15, 350),
    "Exploit pattern detected in HTTP header/URI payload targeting web endpoint on port {port}"
)

print("All 10 test dataset files generated successfully!")

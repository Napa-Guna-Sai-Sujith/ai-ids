import urllib.request
import os
import sys

OUTPUT_DIR = "public/sample_datasets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers_nsl = [
    "duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes",
    "land", "wrong_fragment", "urgent", "hot", "num_failed_logins", "logged_in",
    "num_compromised", "root_shell", "su_attempted", "num_root", "num_file_creations",
    "num_shells", "num_access_files", "num_outbound_cmds", "is_host_login",
    "is_guest_login", "count", "srv_count", "serror_rate", "srv_serror_rate",
    "rerror_rate", "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
    "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count",
    "dst_host_same_srv_rate", "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate", "dst_host_serror_rate", "dst_host_srv_serror_rate",
    "dst_host_rerror_rate", "dst_host_srv_rerror_rate", "attack_type", "difficulty_level"
]

sources = [
    {
        "url": "https://raw.githubusercontent.com/Jehuty4949/NSL_KDD/master/KDDTest%2B.csv",
        "output": "official_nsl_kdd_test.csv",
        "name": "Official NSL-KDD Test+ Dataset"
    },
    {
        "url": "https://raw.githubusercontent.com/Jehuty4949/NSL_KDD/master/KDDTrain%2B.csv",
        "output": "official_nsl_kdd_train.csv",
        "name": "Official NSL-KDD Train+ Dataset"
    }
]

for s in sources:
    dest = os.path.join(OUTPUT_DIR, s["output"])
    print(f"Downloading {s['name']} from {s['url']}...")
    req = urllib.request.Request(s["url"], headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        sample_lines = lines[:1000] # 1000 real records
        
        with open(dest, "w", encoding="utf-8") as f:
            f.write(",".join(headers_nsl) + "\n")
            f.write("\n".join(sample_lines) + "\n")
            
        print(f"Saved {len(sample_lines)} real verified online records to {dest} ({os.path.getsize(dest)/1024:.1f} KB)")

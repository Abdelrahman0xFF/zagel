/**
 * Zagel — Public Landing Page & Interactive Showcase Client Script
 */

// Code snippets database
const SNIPPETS = {
  send: {
    curl: `curl -X POST http://localhost:7860/api/messages/send \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "phone": "1234567890",
    "message": "Hello from Zagel REST API!"
  }'`,
    javascript: `import fetch from 'node-fetch';

const response = await fetch('http://localhost:7860/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    phone: '1234567890',
    message: 'Hello from Zagel REST API!'
  })
});

const data = await response.json();
console.log(data);`,
    python: `import requests

url = "http://localhost:7860/api/messages/send"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}
payload = {
    "phone": "1234567890",
    "message": "Hello from Zagel REST API!"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    go: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	payload, _ := json.Marshal(map[string]string{
		"phone":   "1234567890",
		"message": "Hello from Zagel REST API!",
	})

	req, _ := http.NewRequest("POST", "http://localhost:7860/api/messages/send", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "YOUR_API_KEY")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("Status:", resp.Status)
}`
  },
  media: {
    curl: `curl -X POST http://localhost:7860/api/messages/send-media \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "phone": "1234567890",
    "mediaUrl": "https://example.com/invoice.pdf",
    "mediaType": "document",
    "caption": "Your Monthly Invoice #1042",
    "fileName": "invoice-1042.pdf"
  }'`,
    javascript: `const response = await fetch('http://localhost:7860/api/messages/send-media', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    phone: '1234567890',
    mediaUrl: 'https://example.com/invoice.pdf',
    mediaType: 'document',
    caption: 'Your Monthly Invoice #1042',
    fileName: 'invoice-1042.pdf'
  })
});
const result = await response.json();`,
    python: `import requests

response = requests.post(
    "http://localhost:7860/api/messages/send-media",
    headers={"x-api-key": "YOUR_API_KEY"},
    json={
        "phone": "1234567890",
        "mediaUrl": "https://example.com/invoice.pdf",
        "mediaType": "document",
        "caption": "Your Monthly Invoice #1042",
        "fileName": "invoice-1042.pdf"
    }
)
print(response.json())`,
    go: `// Send PDF or image document
payload, _ := json.Marshal(map[string]interface{}{
    "phone":     "1234567890",
    "mediaUrl":  "https://example.com/invoice.pdf",
    "mediaType": "document",
    "caption":   "Your Monthly Invoice #1042",
    "fileName":  "invoice-1042.pdf",
})`
  },
  otpSend: {
    curl: `curl -X POST http://localhost:7860/api/otp/send \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "phone": "1234567890",
    "expiresInSeconds": 300
  }'`,
    javascript: `const response = await fetch('http://localhost:7860/api/otp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    phone: '1234567890',
    expiresInSeconds: 300
  })
});
const result = await response.json();
// Returns: { success: true, message: "OTP sent successfully", expiresIn: 300 }`,
    python: `import requests

response = requests.post(
    "http://localhost:7860/api/otp/send",
    headers={"x-api-key": "YOUR_API_KEY"},
    json={"phone": "1234567890", "expiresInSeconds": 300}
)
print(response.json())`,
    go: `payload, _ := json.Marshal(map[string]interface{}{
    "phone":            "1234567890",
    "expiresInSeconds": 300,
})`
  },
  otpVerify: {
    curl: `curl -X POST http://localhost:7860/api/otp/verify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "phone": "1234567890",
    "code": "482910"
  }'`,
    javascript: `const response = await fetch('http://localhost:7860/api/otp/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    phone: '1234567890',
    code: '482910'
  })
});
const result = await response.json();
// Returns: { success: true, verified: true }`,
    python: `import requests

response = requests.post(
    "http://localhost:7860/api/otp/verify",
    headers={"x-api-key": "YOUR_API_KEY"},
    json={"phone": "1234567890", "code": "482910"}
)
print(response.json())`,
    go: `payload, _ := json.Marshal(map[string]string{
    "phone": "1234567890",
    "code":  "482910",
})`
  }
};

const DEPLOY_DATA = {
  vps: {
    title: "Deploy on Virtual Private Server (VPS / Linux Host)",
    desc: "Host on any Linux VPS or virtual machine with persistent local disk storage and automatic process management.",
    cmd: `# 1. Clone your forked repository onto your VPS
git clone https://github.com/YOUR_USERNAME/zagel.git
cd zagel && npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your secure ADMIN_API_KEY and PORT

# 3. Start with process manager (PM2) for 24/7 background persistence
npm install -g pm2
pm2 start src/server.js --name zagel
pm2 startup && pm2 save`
  },
  docker: {
    title: "Run with Docker Container (Self-Hosted)",
    desc: "Deploy an isolated, lightweight container on any Linux server, home lab, or container host with volume mounting.",
    cmd: `docker run -d \\
  --name zagel \\
  -p 7860:7860 \\
  -e ADMIN_API_KEY="your-secure-master-key-here" \\
  -v $(pwd)/zagel-data:/app/data \\
  --restart unless-stopped \\
  zagel`
  },
  paas: {
    title: "Deploy on Managed Cloud Container Platform (PaaS)",
    desc: "Deploy to any cloud container service using git-push integration and container blueprints with zero manual server management.",
    cmd: `# 1. Connect your forked GitHub repository in your cloud container dashboard
# 2. Select Container / Docker deployment mode
# 3. Configure Port: 7860
# 4. Add Secret: ADMIN_API_KEY=your-secure-master-key
# 5. (Optional) Provide MONGODB_URI for database-backed persistence`
  },
  local: {
    title: "Run on Local Workstation (Development)",
    desc: "Quickly spin up Zagel on your local development machine with Node.js 20+ and hot reloading.",
    cmd: `git clone https://github.com/YOUR_USERNAME/zagel.git
cd zagel
npm install
cp .env.example .env
# Edit .env with your desired ADMIN_API_KEY
npm run dev
# Open http://localhost:7860/dashboard`
  }
};

let currentLang = 'curl';
let currentEndpoint = 'send';

function updateCodePreview() {
  const codeEl = document.getElementById('code-display');
  if (!codeEl) return;
  const snippet = SNIPPETS[currentEndpoint]?.[currentLang] || '// Code snippet not found';
  codeEl.textContent = snippet;
}

// Live Gateway Telemetry Heartbeat
async function checkGatewayHealth() {
  const beacon = document.getElementById('hero-status-beacon');
  const statusText = document.getElementById('hero-status-text');
  const latencyText = document.getElementById('hero-latency');
  const uptimeText = document.getElementById('hero-uptime');

  if (!beacon || !statusText) return;

  const startTime = performance.now();
  try {
    const res = await fetch('/api/health');
    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      beacon.className = 'status-beacon online';
      statusText.textContent = 'Operational';

      if (latencyText) {
        latencyText.textContent = `${latency}ms`;
      }

      if (uptimeText && typeof data.uptime === 'number') {
        const hours = Math.floor(data.uptime / 3600);
        const mins = Math.floor((data.uptime % 3600) / 60);
        const secs = Math.floor(data.uptime % 60);
        uptimeText.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`;
      }
    } else {
      beacon.className = 'status-beacon offline';
      statusText.textContent = 'Degraded';
    }
  } catch {
    beacon.className = 'status-beacon offline';
    statusText.textContent = 'Standby';
    if (latencyText) latencyText.textContent = 'Offline';
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Code snippet controls
  const langTabs = document.querySelectorAll('.term-tab');
  langTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      langTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentLang = tab.dataset.lang;
      updateCodePreview();
    });
  });

  const epTabs = document.querySelectorAll('.ep-tab');
  epTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      epTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentEndpoint = tab.dataset.ep;
      updateCodePreview();
    });
  });

  // Copy code button
  const copyBtn = document.getElementById('btn-copy-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const codeEl = document.getElementById('code-display');
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        const copyLabel = copyBtn.querySelector('.copy-label');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy Code';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  }

  // Copy deploy command button
  const copyDeployBtn = document.getElementById('btn-copy-deploy');
  if (copyDeployBtn) {
    copyDeployBtn.addEventListener('click', async () => {
      const deployEl = document.getElementById('deploy-code');
      if (!deployEl) return;
      try {
        await navigator.clipboard.writeText(deployEl.textContent);
        const copyLabel = copyDeployBtn.querySelector('.copy-deploy-label');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy Command';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  }

  // Deploy target tab switcher
  const deployNavBtns = document.querySelectorAll('.deploy-nav-btn');
  const deployTitle = document.getElementById('deploy-title');
  const deployDesc = document.getElementById('deploy-desc');
  const deployCode = document.getElementById('deploy-code');

  deployNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      deployNavBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      const data = DEPLOY_DATA[target];
      if (data) {
        if (deployTitle) deployTitle.textContent = data.title;
        if (deployDesc) deployDesc.textContent = data.desc;
        if (deployCode) deployCode.textContent = data.cmd;
      }
    });
  });

  // Initial telemetry ping
  checkGatewayHealth();
  setInterval(checkGatewayHealth, 30000);

  // Initial code render
  updateCodePreview();
});

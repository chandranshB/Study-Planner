# Accessing Study Planner on Mobile

Follow these steps to use the app on your phone or tablet while it's running on your laptop.

## 1. Start the Server
Ensure both the backend and frontend are running on your laptop.

**Backend:**
Open a terminal and run:
```cmd
python app.py
```

**Frontend:**
Open another terminal and run:
```cmd
npm start
```

## 2. Find Your Laptop's IP Address
You need your laptop's Local IP address to connect from other devices.

1.  Open a new terminal (Command Prompt or PowerShell).
2.  Type the following command and press Enter:
    ```cmd
    ipconfig
    ```
3.  Look for **"IPv4 Address"** under your active connection (usually "Wi-Fi" or "Ethernet").
    - It will look something like `192.168.1.5` or `10.0.0.12`.

## 3. Connect from Mobile
1.  Connect your mobile device to the **same Wi-Fi network** as your laptop.
2.  Open a browser (Chrome, Safari, etc.) on your mobile device.
3.  Type the following URL, replacing `YOUR_IP_ADDRESS` with the IPv4 address you found in Step 2:
    ```
    http://YOUR_IP_ADDRESS:3000
    ```
    Example: `http://192.168.1.5:3000`

## Troubleshooting
-   **Firewall:** If it doesn't connect, your Windows Firewall might be blocking the connection. You may need to allow Node.js and Python through the firewall.
-   **Same Network:** Double-check that both devices are on the exact same Wi-Fi network.

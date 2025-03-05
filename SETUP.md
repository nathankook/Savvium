# **Savvium Project - Initial Setup**

## **1. Install Required Software**
Make sure to install the following:
    - **[Node.js](https://nodejs.org/en)**
    - **[Python](https://www.python.org/downloads/)**
    - **Python Virtual Environment**
        `pip install virutalenv`
    - Download **Expo Go App** on Android or iOS (unless using emulator)

## **2. Setup the frontend (React Native + React Native Web)**
- Inside the SavviumClient folder, run this command:
    `npx install`
- To start the app:
    - Mobile: 
        `npx expo start`
        - scan the QR code generated with phone camera and open in Expo Go
    - Web: 
        `npx expo start --web`

## **3. Setup the backend (Flask)**
- Inside the SavviumServer folder, create and activate the virtual environment:
    `python3 -m venv venv`
- **macOS/Linux (zsh/bash):**  
    ```sh
    source venv/bin/activate
    ```
- **Windows (PowerShell):**  
    ```powershell
    venv\Scripts\Activate.ps1
    ```
- Install Flask in the virtual environment and any other packages:
    `pip install flask flask-cors`
- To run the server:
    `python app.py`
        



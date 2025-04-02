# **Savvium Project - Initial Setup**

## **1. Install Required Software**
Make sure to install the following:
- **[Node.js](https://nodejs.org/en)**
- **[Python](https://www.python.org/downloads/)**
- **Python Virtual Environment:**  
    ```sh
    pip install virtualenv
    ```
- Download **Expo Go App** on Android or iOS (unless using emulator)

## **2. Setup the frontend (React Native + React Native Web)**
- Inside the SavviumClient folder, run this command:
    ```sh
    npx install
    ```
- To start the app:
    - Mobile: 
        ```sh
        npx expo start
        ```
        - scan the QR code generated with phone camera and open in Expo Go
    - Web: 
        ```sh
        npx expo start --web
        ```

## **3. Setup the backend (Flask)**
- Inside the SavviumServer folder, create and activate the virtual environment:
    ```sh
    python3 -m venv venv
    ```
- **macOS/Linux (zsh/bash):**  
    ```sh
    source venv/bin/activate
    ```
- **Windows (PowerShell):**  
    ```powershell
    venv\Scripts\Activate.ps1
    ```
- Install Flask in the virtual environment and any other packages:
    ```sh
    pip install flask flask-cors flask-sqlalchemy
    ```
- To run the server:
    ```sh
    python app.py
    ``` 

## **4. Starting the application**
- Open two separate windows, one for the SavviumClient and one for the SavviumServer

- Start in the SavviumServer window, and run in the terminal:

    - **macOS/Linux (zsh/bash):**  
        ```sh
        source venv/bin/activate
        ```
    - **Windows (PowerShell):**  
        ```powershell
        venv\Scripts\Activate.ps1
        ```

    - Then to start the server, run:
        ```sh
        python app.py
        ```

- Then go in the SavviumClient window, and run in the terminal:
    ```sh
    npx expo start
    ```


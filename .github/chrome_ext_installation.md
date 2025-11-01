# How to Install en-git chrome extension from GitHub

Follow these steps to get the code, build the extension, and load it into your Chrome browser.

## 1. Get the Code

You have three main options to get the code. Choose one.

### Option A: Download ZIP (Simple)
1.  Visit the **en-git** repository page.
2.  Click the **Code** button (green) on the top right.
3.  Select **Download ZIP**.
4.  Extract the ZIP file (this will create a folder like `en-git-main`).

### Option B: Clone the Repository (Recommended)
1.  Open your terminal.
2.  Run the following git command (replace with the actual repository URL):
    ```bash
    git clone [https://github.com/USER/en-git.git](https://github.com/USER/en-git.git)
    ```
3.  This creates a folder named `en-git`.

### Option C: Fork & Clone (For contributing)
1.  On the GitHub repository page, click **Fork** in the top-right corner.
2.  Once forked, follow the steps in **Option B**, but use the URL from *your* forked repository.

---


https://github.com/user-attachments/assets/5b7671fb-66d7-4a6b-a500-5be843937238


## 2. Build the Extension

### Prerequisites
* Google Chrome browser installed
* Node.js and npm installed
* Git installed (for Options B and C)

### Build Steps
1.  Open your terminal and navigate into the project folder you just downloaded or cloned (e.g., `en-git-main` or `en-git`).
    * `cd path/to/en-git-main`
2.  Navigate into the `client` directory.
    * `cd client`
3.  Install the required packages.
    * `npm install`
4.  Run the build script to create the extension files.
    * `npm run build:extension`

This command will build the necessary files and output appropriately.

---

## 3. Load the Extension in Chrome

1.  Open Chrome and go to `chrome://extensions/`
2.  Enable **Developer mode** (using the toggle in the top-right).
3.  Click **Load unpacked**.
4.  Navigate to your project folder, then into `client`, and select the **`dist`** folder (`en-git-main/client/dist`).
5.  The en-git extension should now appear in your Chrome toolbar.

---

## 4. Updating the Extension

If you pull new code from the repository or make local changes to the source :

1.  In your terminal, navigate back to the `client` directory (`en-git/client`).
2.  Run the build script again.
    * `npm run build:extension`
3.  Return to `chrome://extensions/` in your browser.
4.  Click the **Reload** button (a small circular arrow) on the en-git extension’s card.

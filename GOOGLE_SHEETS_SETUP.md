# Google Sheets Contact Form Setup

## 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Adverse — Contact Submissions"
3. Add these column headers in Row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| timestamp | name | email | phone | Reason | message |

Column names must match the form field `name` attributes exactly (`Reason` is capitalized).

---

## 2. Add the Apps Script

1. In your sheet, go to **Extensions → Apps Script**
2. Delete any boilerplate code
3. Paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.parameter;

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone || "",
    data.Reason,
    data.message
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Save the script (Ctrl+S / Cmd+S)

---

## 3. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → select **Web app**
3. Set:
   - **Description:** Contact form handler
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Authorize the app when prompted (click through the "unsafe" warning — it's your own script)
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## 4. Set the Environment Variable

### Local development

In `.env.local`:

```
VITE_GOOGLE_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Netlify production

1. Go to your Netlify site → **Site configuration → Environment variables**
2. Add:
   - Key: `VITE_GOOGLE_SHEET_URL`
   - Value: your Apps Script URL from step 3
3. Trigger a redeploy

---

## 5. Test It

1. Run `npm run dev` locally
2. Go to the Contact page
3. Fill out the form and submit
4. Check your Google Sheet — a new row should appear

---

## Updating the Deployment

If you edit the Apps Script later:

1. Open Apps Script from the sheet (Extensions → Apps Script)
2. Make your changes
3. **Deploy → Manage deployments → Edit (pencil icon) → Version: New version → Deploy**

You must create a new version for changes to take effect. The URL stays the same.

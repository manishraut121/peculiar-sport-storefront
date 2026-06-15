# Test OneCurve online (GitHub Codespaces)

This runs the whole store — shop + admin — in GitHub's cloud and gives you a
public link your partner can open in any browser. No installs, nothing on your
Mac required.

## Start it (you, the owner)

1. Go to the repo on GitHub → green **Code** button → **Codespaces** tab →
   **Create codespace on `platform-phase-1`** (or `main` once merged).
2. Wait ~3–5 minutes. It auto-installs the database, loads the catalog, and
   starts both servers. You'll see "✅ Servers starting" in the terminal.
3. Open the **Ports** tab (bottom panel). You should see ports **8000**
   (Storefront) and **9000** (Admin + API). For each, right-click →
   **Port Visibility → Public**. (The setup tries to do this automatically;
   set them manually if they still show "Private".)
4. Click the 🌐 globe icon next to **port 8000** to open the shop.

## Share with your partner

Copy the **port 8000** URL — it looks like:

```
https://<your-codespace>-8000.app.github.dev
```

Send that to your partner. They can browse, search, add to cart and complete
a test checkout **like a real customer** — no GitHub account needed once the
port is Public.

- Shop / storefront → the **8000** URL
- Admin (manage products, prices, images, orders) → the **9000** URL + `/app`
  - login: `admin@onecurve.in` / `onecurve123` (change it in admin → Settings)

## Notes

- The link works while the Codespace is **running**. It auto-suspends after
  ~30 min idle; reopen the Codespace to resume (same URL).
- Free GitHub plans include a monthly Codespaces allowance — plenty for
  testing. Stop the Codespace when done to save hours.
- **Payments:** checkout currently completes via the built-in payment method
  so your partner can place a full test order. To enable real Razorpay
  (UPI/cards/net-banking), add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to
  `platform/apps/backend/.env` — the integration is already wired and waiting.
- This is a **test** environment with the seeded catalog; orders placed here
  are not real.

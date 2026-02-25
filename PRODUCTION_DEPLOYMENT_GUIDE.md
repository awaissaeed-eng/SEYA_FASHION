# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ✅ Pre-Deployment Checklist (COMPLETED)

- ✅ Backend .env updated to production mode
- ✅ Frontend .env updated with live API URL
- ✅ Frontend production build created
- ✅ All files ready in `frontend/dist/` folder

---

## 📦 STEP 1: Upload Frontend to Hostinger

### Files to Upload:
Upload ALL files from `frontend/dist/` to your Hostinger `public_html` folder:

```
frontend/dist/
├── index.html          → Upload to public_html/
├── sw.js              → Upload to public_html/
├── vite.svg           → Upload to public_html/
└── assets/            → Upload entire folder to public_html/assets/
    └── (all JS/CSS/image files)
```

### Upload Steps:
1. Login to Hostinger control panel
2. Go to File Manager
3. Navigate to `public_html` folder
4. **DELETE all old files** (backup first if needed)
5. **Upload** all files from `frontend/dist/`
6. **Upload** `.htaccess` file from project root

### Important:
- ✅ `sw.js` must be in ROOT of public_html (not in assets folder)
- ✅ `.htaccess` must be in ROOT of public_html
- ✅ All files from `assets/` folder must be in `public_html/assets/`

---

## 🔧 STEP 2: Deploy Backend to Hostinger

### Option A: If Backend is Already on Hostinger
1. Upload updated files:
   - `backend/.env` (with production settings)
   - `backend/server.js` (with updated CORS)
   - `backend/controllers/cartController.js` (cookie-based cart)
   - `frontend/src/pages/user/cart.jsx` (updated cart page)

2. Restart Node.js application:
   ```bash
   # SSH into Hostinger
   cd /path/to/backend
   pm2 restart all
   # OR
   npm start
   ```

### Option B: If Backend is NOT Deployed Yet
1. Upload entire `backend/` folder to Hostinger
2. SSH into Hostinger
3. Navigate to backend folder
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   # Using PM2 (recommended)
   pm2 start ecosystem.config.js
   pm2 save
   
   # OR using npm
   npm start
   ```

---

## 🌐 STEP 3: Verify Backend is Running

Test your backend API:
```
https://palevioletred-mallard-931043.hostingersite.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SEYA Fashion Backend API",
  "environment": "production",
  "timestamp": "2026-02-08T..."
}
```

If you get an error:
- Check if Node.js process is running
- Check Hostinger error logs
- Verify environment variables are set

---

## 🧪 STEP 4: Test Your Live Website

### Test Checklist:

1. **Homepage**
   - [ ] Visit `https://seyafashion.com.pk`
   - [ ] Check if page loads correctly
   - [ ] Verify hero section displays

2. **Shop Page**
   - [ ] Navigate to shop page
   - [ ] Check if products load
   - [ ] Verify images display

3. **Cart Functionality**
   - [ ] Add product to cart from shop page
   - [ ] Check if cart icon updates in header
   - [ ] Navigate to cart page
   - [ ] Verify product appears immediately (no reload needed)
   - [ ] Test quantity update
   - [ ] Test remove item

4. **Product Details**
   - [ ] Click on a product
   - [ ] Check if product details load
   - [ ] Test add to cart from detail page

5. **Checkout**
   - [ ] Go to checkout page
   - [ ] Verify cart items display
   - [ ] Test form validation

6. **Browser Console**
   - [ ] Open browser console (F12)
   - [ ] Check for NO errors
   - [ ] Verify API calls go to `palevioletred-mallard-931043.hostingersite.com`
   - [ ] NO `localhost:5000` errors

---

## 🔍 STEP 5: Troubleshooting

### Issue: "Failed to load resource" errors
**Solution:** Backend is not running. SSH into Hostinger and start it.

### Issue: CORS errors
**Solution:** 
1. Check backend `.env` has correct `CLIENT_URL`
2. Restart backend server
3. Clear browser cache

### Issue: Cart not working
**Solution:**
1. Check browser console for errors
2. Verify cookies are enabled
3. Test API endpoint directly: `https://palevioletred-mallard-931043.hostingersite.com/api/cart`

### Issue: Service Worker error
**Solution:**
1. Verify `sw.js` is in root of public_html
2. Check `.htaccess` has service worker MIME type configuration
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Images not loading
**Solution:**
1. Check Cloudinary URLs in database
2. Verify internet connection
3. Check browser console for 404 errors

---

## 📝 STEP 6: Post-Deployment

### Clear Caches:
1. **Browser Cache:** Press `Ctrl + Shift + R` (hard refresh)
2. **Cloudflare Cache** (if using): Purge cache in Cloudflare dashboard
3. **Service Worker:** May need to unregister old service worker

### Monitor:
1. Check Hostinger error logs
2. Monitor MongoDB Atlas for database connections
3. Test on different devices/browsers

### Backup:
1. Keep a backup of working `.env` files
2. Document any custom configurations
3. Save database backup

---

## 🎯 Quick Commands Reference

### Build Frontend:
```bash
cd frontend
npm run build
```

### Start Backend (Production):
```bash
cd backend
npm start
```

### Restart Backend (PM2):
```bash
pm2 restart all
pm2 logs
```

### Check Backend Status:
```bash
pm2 status
# OR
ps aux | grep node
```

---

## 📞 Support Checklist

If something goes wrong:
1. ✅ Check backend is running
2. ✅ Check API health endpoint
3. ✅ Check browser console for errors
4. ✅ Verify `.env` files are correct
5. ✅ Clear all caches
6. ✅ Check Hostinger error logs

---

## ✨ Your Website is Ready!

Once deployed, your website will be live at:
- **Main Site:** https://seyafashion.com.pk
- **Backend API:** https://palevioletred-mallard-931043.hostingersite.com/api

**Features Working:**
- ✅ Cookie-based cart (no login required)
- ✅ Real-time cart updates
- ✅ Product browsing and search
- ✅ Checkout process
- ✅ Admin panel (JWT authentication)
- ✅ Order management
- ✅ Cloudinary image hosting

---

## 🔄 Future Updates

When you need to update the website:

### For Frontend Changes:
1. Make changes in `frontend/src/`
2. Update `frontend/.env` to production URL
3. Run `npm run build`
4. Upload new `dist/` files to Hostinger

### For Backend Changes:
1. Make changes in `backend/`
2. Upload changed files to Hostinger
3. Restart backend server

### For Database Changes:
1. Update models in `backend/models/`
2. Run migration scripts if needed
3. Restart backend server

---

**Good luck with your deployment! 🚀**

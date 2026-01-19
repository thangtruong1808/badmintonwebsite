# Migration Guide - Project Structure Reorganization

This document explains the changes made to reorganize the project structure.

## What Changed

The project has been reorganized to separate frontend and backend into their own folders for better maintainability:

### Before:
```
chibibadminton/
├── src/              # Frontend source
├── backend/          # Backend source
├── package.json      # Frontend package.json
└── ...
```

### After:
```
chibibadminton/
├── frontend/         # All frontend code
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/          # All backend code
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json      # Root orchestrator
└── ...
```

## Changes Made

### 1. Frontend Folder Structure
- ✅ All frontend source code moved to `frontend/src/`
- ✅ All frontend configuration files moved to `frontend/`
- ✅ Frontend `package.json` moved to `frontend/package.json`
- ✅ Public assets moved to `frontend/public/`

### 2. Root Package.json
- ✅ New root `package.json` created to orchestrate both frontend and backend
- ✅ Uses `concurrently` to run both servers together
- ✅ Scripts available to run frontend/backend individually or together

### 3. Configuration Updates
- ✅ `.gitignore` updated to handle both frontend and backend
- ✅ All paths and imports remain the same (no code changes needed)
- ✅ Design, layout, and features unchanged

## Next Steps

### 1. Install Dependencies

**Install root dependencies:**
```bash
npm install
```

**Install frontend dependencies:**
```bash
cd frontend
npm install
```

**Install backend dependencies:**
```bash
cd backend
npm install
```

Or use the convenience script:
```bash
npm run install:all
```

### 2. Move Node Modules (Optional)

If you have existing `node_modules` in the root:
- You can delete the root `node_modules` folder
- It will be recreated when you install frontend dependencies in `frontend/`
- Backend has its own `node_modules` in `backend/`

### 3. Update Your Development Workflow

**Start both servers:**
```bash
npm run dev
```

**Start individually:**
```bash
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

### 4. IDE/Editor Settings

Your IDE should automatically recognize the new structure. However, if you use VS Code:

- The workspace will detect TypeScript configs in both `frontend/` and `backend/`
- ESLint will work from `frontend/eslint.config.js`
- No additional configuration needed

### 5. Clean Up (Optional)

After verifying everything works, you can optionally:

1. Delete old files from root (if still present):
   - `src/` folder (if not auto-deleted)
   - `public/` folder (if not auto-deleted)
   - Old config files in root (if duplicates exist)

2. Verify no broken imports:
   - All imports use relative paths, so they should still work
   - Check if any absolute imports need updating

## Verification Checklist

- [ ] Frontend dependencies installed in `frontend/`
- [ ] Backend dependencies installed in `backend/`
- [ ] Root dependencies installed (concurrently)
- [ ] Frontend runs: `npm run dev:frontend`
- [ ] Backend runs: `npm run dev:backend`
- [ ] Both run together: `npm run dev`
- [ ] No broken imports or errors
- [ ] All pages render correctly
- [ ] Features work as before

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Make sure you've installed dependencies in the correct directories:
- `frontend/node_modules` for frontend
- `backend/node_modules` for backend

### Issue: Port already in use
**Solution:** Check if old processes are running. Kill them or change ports in config files.

### Issue: Concurrently not found
**Solution:** Run `npm install` in the root directory to install `concurrently`.

### Issue: Old node_modules conflicts
**Solution:** Delete root `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

## Benefits of New Structure

1. **Separation of Concerns**: Frontend and backend are clearly separated
2. **Easier Maintenance**: Each part has its own dependencies and configs
3. **Better Scalability**: Easy to deploy frontend and backend separately
4. **Team Collaboration**: Different teams can work on frontend/backend independently
5. **Cleaner Root**: Root directory is cleaner with only orchestration files

## Notes

- ✅ **No code changes**: All your React components, pages, and features remain exactly the same
- ✅ **No design changes**: All layouts, styles, and UI remain unchanged
- ✅ **Imports work**: All relative imports still work because paths are relative within each folder
- ✅ **Backward compatible**: You can still run frontend/backend individually

## Support

If you encounter any issues:
1. Check that all dependencies are installed
2. Verify paths in config files
3. Check console for specific error messages
4. Refer to `README.md` for setup instructions

# Proposed API Refactoring & Enhancements Plan

This document outlines the planned backend API endpoints and the corresponding frontend updates required to support new features like invite code previewing, storage statistics, recent files list, and space thumbnail customizations.

---

## 1. Invite Code Preview
Currently, there is no endpoint to retrieve space details from an invite code before joining.

### Backend Changes
* **New Endpoint**: `GET /api/spaces/invites/codes/{code}/preview`
* **Response**: Returns a DTO containing the public details of the space (ID, Name, Description, Thumbnail, Category, Member Count) without joining the user.
* **Schema**:
  ```json
  {
    "spaceId": "uuid",
    "name": "Space Name",
    "description": "Space Description",
    "thumbnail": "image_url_or_null",
    "category": "Technology",
    "memberCount": 12
  }
  ```

### Frontend Integration
* **Update `ApiInviteRepository.js`**:
  Update `getByCode(code)` to fetch from the new preview endpoint:
  ```javascript
  async getByCode(code) {
      const data = await httpClient.get(`/spaces/invites/codes/${code}/preview`);
      return InviteMapper.fromApi({
          id: code,
          code: code,
          space: data
      });
  }
  ```

---

## 2. Recent Files
A dashboard section to showcase recently uploaded or modified files across the space.

### Backend Changes
* **New Endpoint**: `GET /api/spaces/{id}/storage/recent`
* **Parameters**: `Limit` (query, integer, default: 5)
* **Response**: Lists the most recent file items uploaded to the space.
* **Schema**: `FileItemResponseDto[]`

### Frontend Integration
* **Update `ApiFileRepository.js`**:
  Add `getRecent(spaceId, limit)` method:
  ```javascript
  async getRecent(spaceId, limit = 5) {
      const data = await httpClient.get(`/spaces/${spaceId}/storage/recent?Limit=${limit}`);
      return FileMapper.fromApiList(data);
  }
  ```
* **UI Work**:
  Add a "Recent Files" widget or tab inside `FilesModal.jsx` or the space dashboard view showing thumbnails, file names, and upload times.

---

## 3. Storage Statistics (Total Files & Size)
Provide space admins and members with feedback on the storage utilization of the space.

### Backend Changes
* **Update Endpoints**: `GET /api/spaces/{id}` (Space Details) and/or `GET /api/spaces/{id}/storage/root`
* **New Fields**: Add `totalFiles` (integer) and `totalSize` (long, in bytes) to the response payload.
* **Schema Upgrade**:
  ```json
  {
    "id": "uuid",
    "name": "Space Name",
    "...": "...",
    "storageStats": {
      "totalFiles": 142,
      "totalSize": 104857600
    }
  }
  ```

### Frontend Integration
* **Update `SpaceMapper` / `FileMapper`**:
  Parse the storage stats in the data mappers.
* **UI Work**:
  Add a storage utilization progress bar or text info in Space Settings or the Files panel (e.g. *"100 MB used across 142 files"*).

---

## 4. Space Thumbnail Offset & Positioning
Allow users to adjust the alignment/cropping offset of large banner-style thumbnails.

### Backend Changes
* **Update Database Schema**: Add position coordinates (`thumbnailX`, `thumbnailY`, or `thumbnailPosition` string e.g. `"center top"`, `"50% 20%"`) to the Space entity.
* **Update Endpoints**:
  * Include `thumbnailPosition` in `SpaceResponseDto` for `/api/spaces/{id}`.
  * Allow updating it via `PUT /api/spaces/{id}` (Update Space) or a dedicated positioning endpoint.

### Frontend Integration
* **Update Space Entity (`src/domain/entities/Space.js`)**:
  Include `thumbnailPosition` property.
* **Update UI Styling**:
  In space header components, apply the position dynamically to the CSS `background-position` property:
  ```jsx
  style={{
      backgroundImage: `url(${getSpaceThumbnailUrl(space.thumbnail)})`,
      backgroundPosition: space.thumbnailPosition || 'center'
  }}
  ```

---

## 5. Rich Color / Gradient Color Support for Space Customizations
Currently, the database stores a single `ThumbnailColor` string, but web interfaces are customized with vibrant CSS gradients.

### Proposed Backend Upgrades
* **Dto & Validation Change**: Enable the `ThumbnailColor` input to accept either standard Hex color codes or structured linear gradient properties (e.g., as JSON blocks or raw CSS gradient strings).
* **Endpoints**: Enhance `POST /api/spaces` and `PATCH /api/spaces/{id}/thumbnail` to support parsing multi-color stop strings (e.g., `linear-gradient(...)`) without triggering invalid data validation errors.

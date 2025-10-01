# Notifications System

## Overview
The notifications system provides real-time notifications to users for various events like report status changes, new reports, and system updates.

## Components

### NotificationsService
Located in `notifications.service.ts`, this service provides:
- **Push Notifications**: Create new notifications for users
- **List Notifications**: Get user's notification history
- **Mark as Read**: Mark individual notifications as read
- **Mark All as Read**: Mark all user notifications as read

### NotificationsController
Located in `notifications.controller.ts`, provides REST API endpoints:
- `GET /notifications` - Get user's notifications
- `PATCH /notifications/:id/read` - Mark specific notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read

## API Endpoints

### Get User Notifications
```http
GET /notifications
Authorization: Bearer <jwt_token>
```

Response:
```json
[
  {
    "id": 1,
    "userId": 123,
    "type": "report.new",
    "title": "Новая жалоба #5",
    "body": "User reported another user for inappropriate behavior",
    "readAt": null,
    "createdAt": "2025-08-31T06:30:00.000Z"
  }
]
```

### Mark Notification as Read
```http
PATCH /notifications/1/read
Authorization: Bearer <jwt_token>
```

### Mark All Notifications as Read
```http
PATCH /notifications/read-all
Authorization: Bearer <jwt_token>
```

## Notification Types

### Report Notifications
- `report.new` - New report created
- `report.status` - Report status updated

### System Notifications
- `system.update` - System maintenance or updates
- `system.announcement` - Important announcements

## Integration with Reports System

The notifications system is integrated with the reports system to automatically notify:
- **Admins/Creators** when new reports are created
- **Reporters** when their report status changes
- **Users** about system-wide announcements

## Database Schema
The system uses the `Notification` model with:
- `id`: Unique identifier
- `userId`: User who receives the notification
- `type`: Notification type (e.g., "report.new", "system.update")
- `title`: Notification title
- `body`: Optional notification body
- `readAt`: Timestamp when notification was read (null if unread)
- `createdAt`: Timestamp when notification was created

## Usage Examples

### Creating a Notification
```typescript
// In a service
await this.notificationsService.push(userId, {
  type: 'report.status',
  title: 'Report Status Updated',
  body: 'Your report has been resolved'
});
```

### Getting User Notifications
```typescript
// In a controller
const notifications = await this.notificationsService.list(userId);
```

## Security
- All endpoints require JWT authentication
- Users can only access their own notifications
- Notifications are automatically filtered by user ID


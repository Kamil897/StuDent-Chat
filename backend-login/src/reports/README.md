# Auto-Moderation System

## Overview
The auto-moderation system automatically analyzes report content for toxic language and assigns appropriate priority levels and flags.

## Components

### ModerationService
Located in `moderation.service.ts`, this service provides:
- **Toxicity Scoring**: Analyzes text for harmful language
- **Priority Assignment**: Assigns priority levels (low, normal, high, critical)
- **Auto-Flagging**: Automatically flags reports that need immediate attention

### Features

#### Toxicity Detection
- Scans for predefined bad words in multiple languages (English and Russian)
- Calculates toxicity score from 0 to 1
- Thresholds:
  - 0-0.32: Normal priority, not flagged
  - 0.33-0.65: High priority, flagged
  - 0.66+: Critical priority, flagged

#### Bad Words List
Currently includes:
- English: fuck, shit, bitch
- Russian: сука, бляд, хер, мраз, долбо, идиот, тупой

#### Auto-Moderation Flow
1. User submits a report
2. `ModerationService.score()` analyzes the reason text
3. Report is created with:
   - `toxicityScore`: Calculated toxicity (0-1)
   - `priority`: Assigned priority level
   - `autoFlagged`: Boolean flag for high toxicity
   - `status`: Set to "in_review" if flagged, otherwise "pending"
4. **Notifications** are automatically sent to all admins/creators
5. When report status changes, **reporter gets notified**
6. **Karma points** are awarded for resolved reports
7. **Admin KPI** is updated with response time and rating

## API Endpoints

### Create Report
```http
POST /reports
{
  "targetId": 123,  // optional
  "reason": "This user is being toxic"
}
```

### Get Reports by Priority
```http
GET /reports/priority/{priority}
```
Where `{priority}` is: `low`, `normal`, `high`, or `critical`

### Get Reports by Status
```http
GET /reports/status/{status}
```
Where `{status}` is: `pending`, `in_review`, `resolved`, or `rejected`

### Assign Report to Admin
```http
PATCH /reports/{id}/assign
{
  "adminId": 456
}
```

### Update Report Status
```http
PATCH /reports/{id}/status
{
  "status": "resolved"
}
```

## Database Schema
The system uses the updated `Report` model with:
- `toxicityScore`: Float (0-1)
- `priority`: Enum (low, normal, high, critical)
- `autoFlagged`: Boolean
- `assignedAdminId`: Optional admin assignment
- `firstResponseAt`: Timestamp for admin response
- `resolvedAt`: Timestamp for resolution

## Gamification & KPI Features

### Karma Points System
- Users earn **5 karma points** for each resolved report they submit
- Karma points are stored in the `User.karmaPoints` field
- Encourages users to submit quality reports

### Admin KPI Tracking
- **Handled Count**: Number of reports processed by admin
- **Average Response Time**: Time from report creation to first admin response
- **Rating**: Calculated based on response speed (0-10 scale)
- Formula: `rating = max(0, 10 - avgResponseTimeSeconds / 60)`

### Admin Performance Metrics
- KPI data is automatically updated when reports are processed
- Admins can track their performance over time
- System encourages faster response times

## Future Enhancements
- Machine learning-based toxicity detection
- Context-aware analysis
- Customizable bad words lists per language
- Sentiment analysis integration
- Pattern recognition for repeated offenders
- Advanced KPI analytics and leaderboards
- Gamification badges and achievements

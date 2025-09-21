# Agency Roles Documentation

## Overview
Two new roles have been created for agency access to the Activity Management system:

## 🏢 Agency Role
**Complete access to Activity Management and Dashboard**

### Access Level: Full Control
- **Email**: `agency@li-council.com`
- **Password**: `Agency@123`
- **Description**: Complete access to Activity Management and Dashboard

### Permissions:

#### Dashboard
- ✅ View Dashboard

#### Activity Management - Promoters
- ✅ View Promoters
- ✅ Create Promoters
- ✅ Edit Promoters
- ✅ Delete Promoters
- ✅ Assign Promoters

#### Activity Management - Activity Recces
- ✅ View Activity Recces
- ✅ Create Activity Recces
- ✅ Edit Activity Recces
- ✅ Delete Activity Recces
- ✅ Approve Activity Recces

#### Activity Management - Feedback
- ✅ View Feedback
- ✅ Create Feedback
- ✅ Edit Feedback
- ✅ Delete Feedback
- ✅ Respond to Feedback

#### Activity Management - Route Plans
- ✅ View Route Plans
- ✅ Create Route Plans
- ✅ Edit Route Plans
- ✅ Delete Route Plans
- ✅ Import Route Plans
- ✅ Export Route Plans

#### Reports & Analytics
- ✅ View Analytics
- ✅ Export Analytics
- ✅ View Reports
- ✅ Create Reports
- ✅ Export Reports

---

## 👁️ Agency View Role
**View and export access to Activity Management and Dashboard**

### Access Level: Read-Only + Export
- **Email**: `agency.view@li-council.com`
- **Password**: `AgencyView@123`
- **Description**: View and export access to Activity Management and Dashboard

### Permissions:

#### Dashboard
- ✅ View Dashboard

#### Activity Management - Promoters
- ✅ View Promoters
- ❌ Create Promoters
- ❌ Edit Promoters
- ❌ Delete Promoters
- ❌ Assign Promoters

#### Activity Management - Activity Recces
- ✅ View Activity Recces
- ❌ Create Activity Recces
- ❌ Edit Activity Recces
- ❌ Delete Activity Recces
- ❌ Approve Activity Recces

#### Activity Management - Feedback
- ✅ View Feedback
- ❌ Create Feedback
- ❌ Edit Feedback
- ❌ Delete Feedback
- ❌ Respond to Feedback

#### Activity Management - Route Plans
- ✅ View Route Plans
- ❌ Create Route Plans
- ❌ Edit Route Plans
- ❌ Delete Route Plans
- ❌ Import Route Plans
- ✅ Export Route Plans

#### Reports & Analytics
- ✅ View Analytics
- ✅ Export Analytics
- ✅ View Reports
- ❌ Create Reports
- ✅ Export Reports

---

## 🔑 Key Differences

| Feature | Agency | Agency View |
|---------|--------|-------------|
| **Dashboard Access** | ✅ Full | ✅ View Only |
| **Promoter Management** | ✅ Full CRUD + Assign | ✅ View Only |
| **Activity Management** | ✅ Full CRUD + Approve | ✅ View Only |
| **Feedback Management** | ✅ Full CRUD + Respond | ✅ View Only |
| **Route Plan Management** | ✅ Full CRUD + Import | ✅ View + Export |
| **Reports & Analytics** | ✅ Full Access | ✅ View + Export |

---

## 🎯 Use Cases

### Agency Role
- **Full activity operations**
- **Managing promoters and their activities**
- **Approving/rejecting activity submissions**
- **Complete data management**
- **Creating and managing reports**

### Agency View Role
- **Monitoring activity progress**
- **Viewing promoter performance**
- **Exporting data for analysis**
- **Read-only oversight**
- **Data consumption without modification**

---

## 🔧 Technical Implementation

### Database Changes
- New roles created in `roles` table
- Permissions assigned via `role_permissions` table
- Users created with appropriate role assignments

### Files Modified
- `database/seeders/RolePermissionSeeder.php` - Added role definitions and permissions
- `database/seeders/AdminUserSeeder.php` - Added test users for the roles

### Menu Access
Both roles have access to the Activity Management section in the sidebar:
- **Promoters**
- **Promoter Activity** 
- **User Feedback**

### Security
- Agency View role is completely restricted from any create/edit/delete operations
- All modification permissions are explicitly excluded
- Export capabilities are maintained for data analysis needs

---

## 🚀 Getting Started

1. **Login with Agency credentials**: `agency@li-council.com` / `Agency@123`
2. **Login with Agency View credentials**: `agency.view@li-council.com` / `AgencyView@123`
3. **Navigate to Activity Management** section in the sidebar
4. **Test the different permission levels** between the two roles

---

## 📊 Verification
Run the verification script to confirm proper setup:
```bash
php test_agency_roles.php
```

This script will verify:
- ✅ Users exist with correct roles
- ✅ Permissions are properly assigned
- ✅ Access levels are correctly configured

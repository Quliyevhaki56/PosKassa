export const checkPermission = (user, permission) => {
	if (!user || !user.permissions) {
		return false;
	}

	try {
		const permissions = typeof user.permissions === 'string'
			? JSON.parse(user.permissions)
			: user.permissions;

		return permissions[permission] === true;
	} catch (error) {
		console.error('Error parsing permissions:', error);
		return false;
	}
};

export const hasAnyPermission = (user, permissionsList) => {
	return permissionsList.some(permission => checkPermission(user, permission));
};

export const hasAllPermissions = (user, permissionsList) => {
	return permissionsList.every(permission => checkPermission(user, permission));
};

export const PERMISSIONS = {
	CAN_CHECKOUT: 'can_checkout',
	CAN_OPEN_POS: 'can_open_pos',
	CAN_EDIT_ORDER: 'can_edit_order',
	CAN_CREATE_ORDER: 'can_create_order',
	CAN_DELETE_ORDER: 'can_delete_order',
	CAN_MANAGE_USERS: 'can_manage_users',
	CAN_VIEW_REPORTS: 'can_view_reports',
	CAN_MANAGE_TABLES: 'can_manage_tables',
	CAN_APPLY_DISCOUNT: 'can_apply_discount',
	CAN_ACCESS_SETTINGS: 'can_access_settings',
	CAN_MANAGE_WAREHOUSE: 'can_manage_warehouse',
};

/**
 * Default store policy values kept in each region's `metadata`. The storefront
 * renders shipping/returns pages and structured data from these keys, and
 * merchants can change them in Settings → Regions → Metadata.
 */
export type RegionStorePolicies = {
    return_window_days: number;
    free_returns: boolean;
    shipping_rate: number;
    handling_days_min: number;
    handling_days_max: number;
    transit_days_min: number;
    transit_days_max: number;
};

const BASE_POLICIES = {
    return_window_days: 30,
    shipping_rate: 0,
    handling_days_min: 1,
    handling_days_max: 2,
};

export const DEFAULT_REGION_STORE_POLICIES: Record<string, RegionStorePolicies> = {
    us: { ...BASE_POLICIES, free_returns: false, transit_days_min: 3, transit_days_max: 5 },
    de: { ...BASE_POLICIES, free_returns: false, transit_days_min: 4, transit_days_max: 7 },
    gb: { ...BASE_POLICIES, free_returns: false, transit_days_min: 3, transit_days_max: 6 },
    dk: { ...BASE_POLICIES, free_returns: true, transit_days_min: 2, transit_days_max: 4 },
};

export const getDefaultRegionStorePolicies = (countryCodes: string[]) =>
    countryCodes
        .map((code) => DEFAULT_REGION_STORE_POLICIES[code.toLowerCase()])
        .find(Boolean);

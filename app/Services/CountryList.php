<?php

namespace App\Services;

class CountryList
{
    /**
     * Restricted Jurisdictions (Sanctioned / Regulatory Excluded)
     */
    public const RESTRICTED_COUNTRIES = [
        'Sudan',
        'Congo, Democratic Republic of the',
        'Dem. Rep. of the Congo',
        'DR Congo',
        'Iran',
        'Mali',
        'Myanmar',
        'Burma',
        'North Korea',
        'Korea, Democratic People\'s Republic of',
        'South Sudan',
        'Syria',
        'Syrian Arab Republic',
        'Yemen',
        'Afghanistan',
        'Belarus',
        'Central African Republic',
        'Cuba',
        'Haiti',
        'Iraq',
        'Russia',
        'Russian Federation',
        'Somalia',
        'Venezuela',
        'Zimbabwe',
    ];

    /**
     * Check if a country is allowed
     */
    public static function isAllowed(?string $country): bool
    {
        if (! $country) {
            return false;
        }

        $countryLower = strtolower(trim($country));
        foreach (self::RESTRICTED_COUNTRIES as $restricted) {
            if (strtolower($restricted) === $countryLower || str_contains($countryLower, strtolower($restricted))) {
                return false;
            }
        }

        return true;
    }
}

"use client";

import { CitySelector } from "./CitySelector";

interface City {
    name: string;
    nameBn: string;
    slug: string;
    isPopular: boolean;
}

interface CitySelectorWrapperProps {
    cities: City[];
}

export function CitySelectorWrapper({ cities }: CitySelectorWrapperProps) {
    return <CitySelector cities={cities} title="Find Hotels in Your City" showDetect={true} />;
}

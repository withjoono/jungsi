import { REGIONS, type RegionId } from "./types";

interface RegionSelectorProps {
  selectedRegion: RegionId;
  onRegionChange: (region: RegionId) => void;
}

export function RegionSelector({
  selectedRegion,
  onRegionChange,
}: RegionSelectorProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🗺️</span>
        <h2 className="text-lg font-semibold text-gray-800">지역 선택</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => onRegionChange(region.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedRegion === region.id
                ? "bg-orange-500 text-white shadow-md"
                : "border border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500"
            } `}
          >
            {region.name}
          </button>
        ))}
      </div>
    </div>
  );
}

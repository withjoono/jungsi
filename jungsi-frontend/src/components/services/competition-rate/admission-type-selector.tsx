import {
  SPECIAL_ADMISSION_CATEGORIES,
  type AdmissionType,
  type SpecialAdmissionCategory,
} from "./types";

interface AdmissionTypeSelectorProps {
  selectedType: AdmissionType;
  selectedCategories: SpecialAdmissionCategory[];
  onTypeChange: (type: AdmissionType) => void;
  onCategoryChange: (categories: SpecialAdmissionCategory[]) => void;
}

const ADMISSION_TYPES: { id: AdmissionType; name: string }[] = [
  { id: "전체", name: "전체" },
  { id: "일반", name: "일반전형" },
  { id: "특별", name: "특별전형" },
];

export function AdmissionTypeSelector({
  selectedType,
  selectedCategories,
  onTypeChange,
  onCategoryChange,
}: AdmissionTypeSelectorProps) {
  const handleTypeChange = (type: AdmissionType) => {
    onTypeChange(type);
    if (type !== "특별") {
      onCategoryChange([]);
    }
  };

  const handleCategoryToggle = (category: SpecialAdmissionCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === SPECIAL_ADMISSION_CATEGORIES.length) {
      onCategoryChange([]);
    } else {
      onCategoryChange([...SPECIAL_ADMISSION_CATEGORIES]);
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h2 className="text-lg font-semibold text-gray-800">전형유형</h2>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {ADMISSION_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedType === type.id
                ? "bg-indigo-500 text-white shadow-md"
                : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-500"
            } `}
          >
            {type.name}
          </button>
        ))}
      </div>

      {selectedType === "특별" && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700">
              특별전형 세부 카테고리
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-indigo-600 underline hover:text-indigo-800"
            >
              {selectedCategories.length === SPECIAL_ADMISSION_CATEGORIES.length
                ? "전체 해제"
                : "전체 선택"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_ADMISSION_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? "bg-indigo-500 text-white"
                    : "border border-gray-300 bg-white text-gray-600 hover:border-indigo-400"
                } `}
              >
                {category}
              </button>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="mt-2 text-xs text-indigo-600">
              * 카테고리 미선택 시 모든 특별전형이 표시됩니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';

export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  suggestions,
  loading,
  placeholder,
  label,
  icon: Icon,
  required,
  disabled,
  className,
  renderSuggestion,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center">
            {Icon && <Icon className="h-4 w-4 mr-2 text-primary-500" />}
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && !disabled && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                {renderSuggestion ? renderSuggestion(suggestion) : suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

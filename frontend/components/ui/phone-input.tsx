"use client"

import React, { useState, ChangeEvent, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
  { code: "+55", country: "Brasil", flag: "🇧🇷", placeholder: "(11) 99988-7766", minLength: 10, maxLength: 11 },
  { code: "+1", country: "EUA", flag: "🇺🇸", placeholder: "(555) 123-4567", minLength: 10, maxLength: 10 },
  { code: "+595", country: "Paraguai", flag: "🇵🇾", placeholder: "09XX XXX XXX", minLength: 9, maxLength: 10 },
  { code: "+598", country: "Uruguai", flag: "🇺🇾", placeholder: "09X XXX XXX", minLength: 9, maxLength: 9 },
  { code: "+351", country: "Portugal", flag: "🇵🇹", placeholder: "9XX XXX XXX", minLength: 9, maxLength: 9 },
  { code: "+34", country: "Espanha", flag: "🇪🇸", placeholder: "6XX XXX XXX", minLength: 9, maxLength: 9 },
];

interface PhoneInputProps {
  value: string; // Armazena apenas os números, sem DDI
  onChange: (value: string, isValid: boolean) => void; // Retorna os números e se é válido
  defaultCountryCode?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string; // Permitir className customizado
}

const formatPhoneNumber = (value: string, countryCode: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (countryCode === "+55") {
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  if (countryCode === "+1") {
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
  if (countryCode === "+34" || countryCode === "+351" || countryCode === "+595" || countryCode === "+598") {
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
  }

  return numbers; // Formato padrão para outros países
};

const validatePhoneNumberLength = (value: string, countryCode: string): boolean => {
  const numbers = value.replace(/\D/g, "");
  const countryInfo = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!countryInfo || !countryInfo.minLength) {
    return true; // Sem regra de minLength, considera válido por padrão
  }
  return numbers.length >= countryInfo.minLength && numbers.length <= countryInfo.maxLength;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  defaultCountryCode = "+55",
  disabled,
  required,
  id,
  className
}) => {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [formattedValue, setFormattedValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const newFormatted = formatPhoneNumber(value, countryCode);
    setFormattedValue(newFormatted);
    setIsValid(validatePhoneNumberLength(value, countryCode));
  }, [value, countryCode]);

  const handlePhoneInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const countryInfo = COUNTRY_CODES.find(c => c.code === countryCode);
    const maxLength = countryInfo?.maxLength || 15;

    if (rawValue.length <= maxLength) {
        const newFormattedValue = formatPhoneNumber(rawValue, countryCode);
        setFormattedValue(newFormattedValue);
        const currentIsValid = validatePhoneNumberLength(rawValue, countryCode);
        setIsValid(currentIsValid);
        onChange(rawValue, currentIsValid);
    }
  };

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const currentIsValid = validatePhoneNumberLength("", newCode);
    setFormattedValue("");
    setIsValid(currentIsValid);
    onChange("", currentIsValid);
  };

  const selectedCountryInfo = useMemo(() => {
      return COUNTRY_CODES.find(c => c.code === countryCode);
  }, [countryCode]);

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={countryCode}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="DDI">
            {selectedCountryInfo?.flag} {countryCode}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center">
                <span className="mr-2 text-lg">{country.flag}</span>
                <span>{country.code}</span>
                <span className="ml-2 text-xs text-muted-foreground">({country.country})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        placeholder={selectedCountryInfo?.placeholder || "Número de telefone"}
        value={formattedValue}
        onChange={handlePhoneInputChange}
        disabled={disabled}
        required={required}
        className={cn(
            "flex-1",
            (!isValid && value) || (required && !value) ? "border-red-500 focus-visible:ring-red-500" : ""
        )}
        maxLength={selectedCountryInfo?.maxLength ? selectedCountryInfo.maxLength + 4 : 20}
      />
    </div>
  );
}; 
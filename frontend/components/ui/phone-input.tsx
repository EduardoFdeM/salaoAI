"use client"

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+55", country: "Brasil", flag: "🇧🇷", placeholder: "(11) 99988-7766", maxLength: 15 },
  { code: "+1", country: "EUA", flag: "🇺🇸", placeholder: "(555) 123-4567", maxLength: 14 },
  { code: "+595", country: "Paraguai", flag: "🇵🇾", placeholder: "09XX XXX XXX", maxLength: 13 }, // Ajustar placeholder/maxlength conforme formato local
  { code: "+598", country: "Uruguai", flag: "🇺🇾", placeholder: "09X XXX XXX", maxLength: 12 }, // Ajustar placeholder/maxlength conforme formato local
  { code: "+351", country: "Portugal", flag: "🇵🇹", placeholder: "9XX XXX XXX", maxLength: 12 }, // Ajustar placeholder/maxlength conforme formato local
  { code: "+34", country: "Espanha", flag: "🇪🇸", placeholder: "6XX XXX XXX", maxLength: 12 }, // Ajustar placeholder/maxlength conforme formato local
];

interface PhoneInputProps {
  value: string; // Armazena apenas os números, sem DDI
  onChange: (value: string) => void; // Retorna apenas os números
  defaultCountryCode?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const formatPhoneNumber = (value: string, country: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (country === "+55") {
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  if (country === "+1") {
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
  if (country === "+34" || country === "+351" || country === "+595" || country === "+598") {
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
  }

  return numbers; // Formato padrão para outros países
};

const getMaxLengthForCountry = (countryCode: string): number => {
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  return country?.maxLength || 15; // Default max length
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  value, 
  onChange, 
  defaultCountryCode = "+55", 
  disabled, 
  required, 
  id 
}) => {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [formattedValue, setFormattedValue] = useState("");

  useEffect(() => {
    // Atualiza a formatação quando o valor ou o país muda
    setFormattedValue(formatPhoneNumber(value, countryCode));
  }, [value, countryCode]);

  const handlePhoneInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const maxLength = getMaxLengthForCountry(countryCode);
    
    if (rawValue.length <= maxLength - (countryCode === "+55" ? 4 : countryCode === "+1" ? 3 : 0) ) { // Ajuste baseado nos caracteres de formatação
        const newFormattedValue = formatPhoneNumber(rawValue, countryCode);
        setFormattedValue(newFormattedValue);
        onChange(rawValue); // Chama o onChange com apenas os números
    }
  };

  const selectedCountryInfo = COUNTRY_CODES.find(c => c.code === countryCode);

  return (
    <div className="flex gap-2">
      <Select
        value={countryCode}
        onValueChange={(newCode) => {
            setCountryCode(newCode);
            // Limpa o valor ao mudar de país para evitar formatação incorreta
            setFormattedValue("");
            onChange("");
        }}
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
        type="tel" // Use type="tel" para semântica e teclados mobile
        placeholder={selectedCountryInfo?.placeholder || "Número de telefone"}
        value={formattedValue}
        onChange={handlePhoneInputChange}
        disabled={disabled}
        required={required}
        className="flex-1"
        maxLength={selectedCountryInfo?.maxLength || 15} // Limita o tamanho do input formatado
      />
    </div>
  );
}; 
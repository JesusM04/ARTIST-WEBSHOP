"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./button"

interface PasswordRequirementsProps {
  password: string
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const requirements = [
    {
      text: "14 caracteres o más",
      test: (pass: string) => pass.length >= 14
    },
    {
      text: "Al menos una mayúscula",
      test: (pass: string) => /[A-Z]/.test(pass)
    },
    {
      text: "Al menos una minúscula",
      test: (pass: string) => /[a-z]/.test(pass)
    },
    {
      text: "Al menos un número",
      test: (pass: string) => /[0-9]/.test(pass)
    },
    {
      text: "Al menos un símbolo",
      test: (pass: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass)
    }
  ]

  const passedRequirements = requirements.filter(req => req.test(password)).length
  const totalRequirements = requirements.length
  const progress = (passedRequirements / totalRequirements) * 100

  return (
    <div className="space-y-2 text-sm">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700" style={{ width: '100px' }}>
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{passedRequirements}/{totalRequirements} requisitos</span>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>

      {isExpanded && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.test(password) ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={req.test(password) ? "text-green-700" : "text-gray-600"}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
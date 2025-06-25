import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RoleSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label>Tipo de cuenta</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div>
          <RadioGroupItem
            value="client"
            id="client"
            className="peer sr-only"
          />
          <Label
            htmlFor="client"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span className="text-xl mb-1">👤</span>
            Cliente
          </Label>
        </div>
        <div>
          <RadioGroupItem
            value="artist"
            id="artist"
            className="peer sr-only"
          />
          <Label
            htmlFor="artist"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span className="text-xl mb-1">🎨</span>
            Artista
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
} 
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onDateChange: (start: Date | undefined, end: Date | undefined) => void
  className?: string
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  className,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return format(date, "PPP", { locale: es })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "Selecciona fechas"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: startDate, to: endDate }}
          onSelect={(range) => {
            onDateChange(range?.from, range?.to)
            if (range?.from && range?.to) {
              setIsOpen(false)
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DateRangePicker

"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex gap-4 justify-center">
      <div className="flex flex-col items-center">
        <div className="bg-gold-soft text-jetblack text-2xl font-display font-bold rounded-md w-16 h-16 flex items-center justify-center">
          {timeLeft.days}
        </div>
        <span className="text-sm mt-1 text-offwhite/70 font-body">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-gold-soft text-jetblack text-2xl font-display font-bold rounded-md w-16 h-16 flex items-center justify-center">
          {timeLeft.hours}
        </div>
        <span className="text-sm mt-1 text-offwhite/70 font-body">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-gold-soft text-jetblack text-2xl font-display font-bold rounded-md w-16 h-16 flex items-center justify-center">
          {timeLeft.minutes}
        </div>
        <span className="text-sm mt-1 text-offwhite/70 font-body">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-gold-soft text-jetblack text-2xl font-display font-bold rounded-md w-16 h-16 flex items-center justify-center">
          {timeLeft.seconds}
        </div>
        <span className="text-sm mt-1 text-offwhite/70 font-body">Seconds</span>
      </div>
    </div>
  )
}

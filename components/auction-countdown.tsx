"use client"

import { useState, useEffect } from "react"

interface AuctionCountdownProps {
  endTime: Date | string | any
}

export function AuctionCountdown({ endTime }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    // Safety check if endTime is not provided
    if (!endTime) {
      setIsEnded(true)
      return
    }

    const calculateTimeLeft = () => {
      let endDate: Date

      try {
        // Handle Firestore timestamp
        if (endTime?.toDate && typeof endTime.toDate === "function") {
          endDate = endTime.toDate()
        }
        // Handle string date
        else if (typeof endTime === "string") {
          endDate = new Date(endTime)
        }
        // Handle if it's already a Date object
        else if (endTime instanceof Date) {
          endDate = endTime
        }
        // Default fallback
        else {
          console.error("Invalid endTime format:", endTime)
          setIsEnded(true)
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        const difference = endDate.getTime() - new Date().getTime()

        if (difference <= 0) {
          setIsEnded(true)
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      } catch (err) {
        console.error("Error calculating time left:", err)
        setIsEnded(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      // Check if ended
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer)
        setIsEnded(true)
      }
    }, 1000)

    // Cleanup
    return () => clearInterval(timer)
  }, [endTime])

  if (isEnded) {
    return <div className="text-red-500 font-semibold">Auction Ended</div>
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div>
        <div className="text-xl font-bold text-gold">{timeLeft.days}</div>
        <div className="text-xs text-offwhite/70">Days</div>
      </div>
      <div>
        <div className="text-xl font-bold text-gold">{timeLeft.hours}</div>
        <div className="text-xs text-offwhite/70">Hours</div>
      </div>
      <div>
        <div className="text-xl font-bold text-gold">{timeLeft.minutes}</div>
        <div className="text-xs text-offwhite/70">Mins</div>
      </div>
      <div>
        <div className="text-xl font-bold text-gold">{timeLeft.seconds}</div>
        <div className="text-xs text-offwhite/70">Secs</div>
      </div>
    </div>
  )
}

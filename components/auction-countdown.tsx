"use client"

import { useState, useEffect } from "react"

interface AuctionCountdownProps {
  endTime: Date | string
}

export function AuctionCountdown({ endTime }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [isEnded, setIsEnded] = useState(false)
  const [isEndingSoon, setIsEndingSoon] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimeDate = new Date(endTime)
      const difference = endTimeDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsEnded(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      // Check if ending within 24 hours
      setIsEndingSoon(difference < 24 * 60 * 60 * 1000)

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (isEnded) {
    return <p className="font-mono text-gray-500">Auction Ended</p>
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0")

  return (
    <div className={`font-mono font-bold ${isEndingSoon ? "text-red-500" : "text-amber-600"}`}>
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
    </div>
  )
}

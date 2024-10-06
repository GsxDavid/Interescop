"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"

interface Choice {
  time: number
  options: string[]
}

export default function Component() {
  const [currentChoice, setCurrentChoice] = useState<Choice | null>(null)
  const [timeLeft, setTimeLeft] = useState(100)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Simulated choices - in a real app, this would come from an API or a more complex data structure
  const choices: Choice[] = [
    { time: 5, options: ["Ir a la izquierda", "Ir a la derecha"] },
    { time: 15, options: ["Abrir la puerta", "Huir"] },
  ]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', checkTime)
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', checkTime)
      }
    }
  }, [])

  useEffect(() => {
    if (currentChoice) {
      startTimer()
    } else {
      stopTimer()
    }
    return stopTimer
  }, [currentChoice])

  const checkTime = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime)
      const choice = choices.find(c => c.time === currentTime)
      if (choice && !currentChoice) {
        setCurrentChoice(choice)
        setTimeLeft(100)
      }
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          stopTimer()
          setCurrentChoice(null)
          return 0
        }
        return prev - 1
      })
    }, 100)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleChoice = (option: string) => {
    console.log(`Usuario eligió: ${option}`)
    // Aquí puedes agregar la lógica para cambiar el video basado en la elección
    setCurrentChoice(null)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      
      {currentChoice && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-black bg-opacity-50">
          <div className="w-full bg-white rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-100 ease-linear" 
              style={{ width: `${timeLeft}%` }}
            ></div>
          </div>
          <div className="flex justify-center space-x-4">
            {currentChoice.options.map((option, index) => (
              <Button key={index} onClick={() => handleChoice(option)} variant="secondary">
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'


interface Choice {
  time: number
  options: string[]
}

function App() {
  const [currentChoice, setCurrentChoice] = useState<Choice | null>(null)
  const [timeLeft, setTimeLeft] = useState(100)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const choices: Choice[] = [
    { time: 5, options: ["Choice 1", "Choice 2"] },
    { time: 30, options: ["Choice 3", "Choice 4"] },
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
      setIsVisible(true)
      setTimeLeft(100)
      setSelectedOption(null)
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
      }
    }
  }

  const startTimer = () => {
    stopTimer() // Asegurarse de que no haya temporizadores activos
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          stopTimer()
          hideChoices()
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

  const hideChoices = () => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentChoice(null)
      setSelectedOption(null)
    }, 500) // Esperar a que termine la transición de ocultamiento
  }

  const handleChoice = (option: string) => {

    const remaining = Number(timerRef.current) * 100;
    

    setSelectedOption(option)
    console.log(`Usuario eligió: ${option}`)
    // Aquí puedes agregar la lógica para cambiar el video basado en la elección
    setTimeout(hideChoices, remaining) // Ocultar las opciones después de 2 segundos
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
      
      <div 
        className={`absolute bottom-0 left-0 w-full p-4 bg-slate-900 bg-opacity-50 transition-all duration-500 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
      >
        <div className="w-full h-2 mb-4 bg-gray-50 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-primary h-full rounded-l-full transition-all duration-100 ease-linear" 
              style={{ width: `${(100 - timeLeft) / 2}%` }}
            ></div>
            <div 
              className="bg-primary h-full rounded-r-full transition-all duration-100 ease-linear" 
              style={{ width: `${(100 - timeLeft) / 2}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          {currentChoice?.options.map((option, index) => (
            <Button 
              key={index} 
              onClick={() => handleChoice(option)} 
              variant="link"
              tabIndex={-1}
              className={`w-1/2 text-2xl font-questrial text-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-300 ${
                selectedOption && selectedOption !== option ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
              disabled={!!selectedOption}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

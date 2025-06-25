import { useEffect, useRef, useState } from 'react'

export function useAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const handleScroll = (e: Event) => {
    const element = e.target as HTMLDivElement
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    const scrollPosition = Math.abs(scrollHeight - scrollTop - clientHeight)
    const isCloseToBottom = scrollPosition < 100 // 100px del fondo

    setIsNearBottom(isCloseToBottom)
    setShouldAutoScroll(isCloseToBottom)
  }

  const scrollToBottom = () => {
    if (scrollRef.current && shouldAutoScroll) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return {
    scrollRef,
    scrollToBottom,
    isNearBottom,
    shouldAutoScroll
  }
} 
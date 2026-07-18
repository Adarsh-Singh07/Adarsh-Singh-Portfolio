import { useState, useEffect } from 'react';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ReadingState {
  progress: number; // 0 to 100
  activeHeadingId: string;
  activeHeadingIndex: number;
  scrollDirection: 'up' | 'down';
  isScrolling: boolean;
  timeRemainingStr: string;
  finishTimeStr: string;
  headings: TOCItem[];
  scrollY: number;
  isFocusMode: boolean;
}

type Listener = (state: ReadingState) => void;

class ReadingStore {
  private state: ReadingState = {
    progress: 0,
    activeHeadingId: '',
    activeHeadingIndex: -1,
    scrollDirection: 'down',
    isScrolling: false,
    timeRemainingStr: '',
    finishTimeStr: '',
    headings: [],
    scrollY: 0,
    isFocusMode: false
  };
  private listeners: Set<Listener> = new Set();
  
  private lastScrollY: number = 0;
  private scrollTimeout: any = null;
  private rafId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private wordCount: number = 0;
  private readingSpeedWPM: number = 200; // Average words per minute

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setState(newState: Partial<ReadingState>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  toggleFocusMode = () => {
    this.setState({ isFocusMode: !this.state.isFocusMode });
  }

  setFocusMode = (isFocusMode: boolean) => {
    this.setState({ isFocusMode });
  }

  getState() {
    return this.state;
  }

  initialize(headings: TOCItem[], textContent: string) {
    this.wordCount = textContent.trim().split(/\s+/).length;
    this.setState({ headings });
    
    if (this.observer) {
      this.observer.disconnect();
    }

    // Set up scroll spy
    this.observer = new IntersectionObserver(
      (entries) => {
        let currentActive = this.state.activeHeadingId;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentActive = entry.target.id;
          }
        });
        
        if (currentActive !== this.state.activeHeadingId) {
          const index = this.state.headings.findIndex(h => h.id === currentActive);
          this.setState({ activeHeadingId: currentActive, activeHeadingIndex: index });
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    const elements = document.querySelectorAll('.markdown-content h2, .markdown-content h3');
    elements.forEach((elem) => this.observer!.observe(elem));

    this.updateScroll();
  }

  updateScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
    
    const scrollDirection = scrollY > this.lastScrollY ? 'down' : 'up';
    
    // Time remaining based on words remaining and current progress
    const wordsRemaining = this.wordCount * (1 - (progress / 100));
    const minutesRemaining = Math.max(0, Math.ceil(wordsRemaining / this.readingSpeedWPM));
    
    const finishDate = new Date();
    finishDate.setMinutes(finishDate.getMinutes() + minutesRemaining);
    const finishTimeStr = finishDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    this.setState({
      scrollY,
      progress,
      scrollDirection,
      isScrolling: true,
      timeRemainingStr: minutesRemaining > 0 ? `~${minutesRemaining} min remaining` : 'Almost done',
      finishTimeStr: `Finish around ${finishTimeStr}`
    });

    this.lastScrollY = scrollY;

    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.setState({ isScrolling: false });
    }, 150);
  };

  handleScroll = () => {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.updateScroll();
        this.rafId = null;
      });
    }
  };

  cleanup() {
    if (this.observer) this.observer.disconnect();
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

export const readingStore = new ReadingStore();

export function useReadingState() {
  const [state, setState] = useState(readingStore.getState());

  useEffect(() => {
    const unsubscribe = readingStore.subscribe(setState);
    return () => { unsubscribe(); };
  }, []);

  return state;
}

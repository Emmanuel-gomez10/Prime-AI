import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, ChevronLeft, ChevronRight, RotateCcw, Plus } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
}

export const FlashcardsView = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('prime_flashcards');
    if (saved) {
      setDecks(JSON.parse(saved));
    } else {
      // Load mock data if none exists
      const mockDecks: Deck[] = [
        {
          id: '1',
          title: 'Cellular Biology Basics',
          cards: [
            { id: '1-1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria' },
            { id: '1-2', front: 'What organelle is responsible for protein synthesis?', back: 'Ribosome' },
            { id: '1-3', front: 'What is the process of cell division called?', back: 'Mitosis' }
          ]
        },
        {
          id: '2',
          title: 'World History: WW2',
          cards: [
            { id: '2-1', front: 'In what year did World War II end?', back: '1945' },
            { id: '2-2', front: 'What was the code name for the Battle of Normandy?', back: 'Operation Overlord' }
          ]
        }
      ];
      setDecks(mockDecks);
      localStorage.setItem('prime_flashcards', JSON.stringify(mockDecks));
    }
  }, []);

  const openDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (activeDeck && currentIndex < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col h-full overflow-hidden">
      
      {!activeDeck ? (
        // Deck Selection View
        <>
          <div className="mb-8 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-primary-text mb-2 tracking-tight">Flashcards</h2>
              <p className="text-secondary-text text-[15px]">Review your AI-generated study decks.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-text rounded-lg font-medium transition-colors text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Plus className="w-4 h-4" />
              New Deck
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map(deck => (
                <div 
                  key={deck.id}
                  onClick={() => openDeck(deck)}
                  className="p-6 rounded-[24px] border border-divider bg-surface hover:border-divider hover:bg-card-hover transition-all cursor-pointer group shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-text mb-2">{deck.title}</h3>
                  <p className="text-secondary-text text-sm">{deck.cards.length} cards</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Study View
        <div className="flex-1 flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full relative">
          
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between mb-8 shrink-0">
            <button 
              onClick={() => setActiveDeck(null)}
              className="text-secondary-text hover:text-primary-text flex items-center gap-2 transition-colors font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Decks
            </button>
            <h3 className="text-primary-text font-bold">{activeDeck.title}</h3>
            <span className="text-secondary-text text-sm font-medium">{currentIndex + 1} / {activeDeck.cards.length}</span>
          </div>

          {/* Flashcard */}
          <div className="w-full aspect-[3/2] sm:aspect-[2/1] perspective-1000 mt-16 mb-12">
            <motion.div 
              className="w-full h-full relative preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-surface border-2 border-divider rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center group hover:border-white/20 transition-colors">
                <p className="text-2xl sm:text-3xl text-primary-text font-medium leading-relaxed">
                  {activeDeck.cards[currentIndex].front}
                </p>
                <div className="absolute bottom-6 text-primary-text/30 text-xs font-medium uppercase tracking-widest flex items-center gap-2 group-hover:text-secondary-text transition-colors">
                  <RotateCcw className="w-3 h-3" /> Click to flip
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-primary/10 border-2 border-primary/30 rounded-[32px] shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center p-8 sm:p-12 text-center [transform:rotateY(180deg)]">
                <p className="text-2xl sm:text-3xl text-primary-text font-bold leading-relaxed">
                  {activeDeck.cards[currentIndex].back}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-card-hover text-primary-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card-hover transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextCard}
              disabled={currentIndex === activeDeck.cards.length - 1}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-card-hover text-primary-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card-hover transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md h-1.5 bg-card-hover rounded-full mt-12 overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / activeDeck.cards.length) * 100}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>

        </div>
      )}

    </div>
  );
};

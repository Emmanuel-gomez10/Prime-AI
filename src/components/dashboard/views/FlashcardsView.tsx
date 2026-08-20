import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, ChevronLeft, ChevronRight, RotateCcw, Plus, Sparkles, X, Loader2, Trash2, Clock } from 'lucide-react';
import { primeEngine } from '../../../lib/primeAiEngine';
import { processFileClientSide } from '../../../lib/documentProcessor';
import { useAuth } from '../../../contexts/AuthContext';
import { dbService } from '../../../services/db/databaseService';
import { useFeatureUsage } from '../../../hooks/useFeatureUsage';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  confidence?: 'easy' | 'medium' | 'hard';
}

interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export const FlashcardsView = () => {
  const { user } = useAuth();
  const usage = useFeatureUsage('flashcards');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  // Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'ai' | 'manual'>('ai');
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [aiTopicOrNotes, setAiTopicOrNotes] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual creation cards draft
  const [manualCards, setManualCards] = useState<Array<{ front: string; back: string }>>([
    { front: '', back: '' }
  ]);

  useEffect(() => {
    const loadFlashcards = async () => {
      if (user?.id) {
        const dbCards = await dbService.fetchFlashcards(user.id);
        if (dbCards && dbCards.length > 0) {
          // Group flat flashcards by deck_title
          const grouped: Record<string, Flashcard[]> = {};
          dbCards.forEach((card) => {
            const title = card.deck_title || 'General Deck';
            if (!grouped[title]) grouped[title] = [];
            grouped[title].push({
              id: card.id,
              front: card.front,
              back: card.back,
            });
          });

          const formattedDecks: Deck[] = Object.keys(grouped).map((title, idx) => ({
            id: `db_deck_${idx}`,
            title,
            cards: grouped[title],
            createdAt: Date.now(),
          }));

          setDecks(formattedDecks);
          return;
        }
      }

      const saved = localStorage.getItem('prime_flashcard_decks_v2');
      if (saved) {
        try {
          setDecks(JSON.parse(saved));
          return;
        } catch (e) {
          console.error("Failed to parse saved flashcard decks:", e);
        }
      }
    };

    loadFlashcards();
  }, [user?.id]);

  const saveDecks = (updatedDecks: Deck[]) => {
    setDecks(updatedDecks);
    localStorage.setItem('prime_flashcard_decks_v2', JSON.stringify(updatedDecks));
  };

  const openDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const deleteDeck = (deckId: string) => {
    const updated = decks.filter(d => d.id !== deckId);
    saveDecks(updated);
    if (activeDeck?.id === deckId) {
      setActiveDeck(null);
    }
  };

  const markCardRating = (rating: 'easy' | 'medium' | 'hard') => {
    if (!activeDeck) return;
    
    // Update card rating inside active deck
    const updatedCards = [...activeDeck.cards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      confidence: rating
    };

    const updatedDeck = { ...activeDeck, cards: updatedCards };
    setActiveDeck(updatedDeck);

    // Save decks
    const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    saveDecks(updatedDecks);

    // Move to next card
    if (currentIndex < updatedDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
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

  // AI Flashcard Generation handler
  const handleAIGenerate = async () => {
    if (usage.isExhausted) {
      setLimitError(`Daily limit reached (${usage.limit}/${usage.limit} uses). Resets in ${usage.resetInFormatted || '24 hours'}.`);
      setIsCreateModalOpen(false);
      return;
    }

    if (!newDeckTitle.trim()) {
      alert("Please enter a deck title.");
      return;
    }
    if (!aiTopicOrNotes.trim() && !attachedFile) {
      alert("Please enter study notes or attach a document for AI generation.");
      return;
    }

    setLimitError(null);
    setIsGenerating(true);

    try {
      let documentContent = '';
      if (attachedFile) {
        const processed = await processFileClientSide(attachedFile);
        documentContent = processed.content;
      }

      const prompt = `Generate EXACTLY ${cardCount} active-recall study flashcards for topic/deck: "${newDeckTitle}".
User Notes/Prompt: ${aiTopicOrNotes}
${documentContent ? `Attached Document Text:\n${documentContent.slice(0, 4000)}` : ''}

Output ONLY a raw JSON array of objects with the following schema:
[
  {
    "front": "Question or prompt for active recall",
    "back": "Clear, concise answer or explanation"
  }
]`;

      const { stream } = await primeEngine.generateStream({
        mode: 'flashcards',
        userPrompt: prompt,
      });

      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk;
      }

      let parsedCards: Array<{ front: string; back: string }> = [];
      try {
        const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedCards = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse flashcard JSON:", e);
      }

      if (!parsedCards || parsedCards.length === 0) {
        throw new Error("Unable to parse flashcards from AI response.");
      }

      const newDeck: Deck = {
        id: Date.now().toString(),
        title: newDeckTitle,
        cards: parsedCards.map((c, i) => ({ id: `${Date.now()}-${i}`, front: c.front, back: c.back })),
        createdAt: Date.now(),
      };

      if (user?.id) {
        parsedCards.forEach((c) => {
          dbService.saveFlashcard(user.id, {
            deck_title: newDeckTitle,
            front: c.front,
            back: c.back,
          });
        });
      }

      const updatedDecks = [newDeck, ...decks];
      saveDecks(updatedDecks);
      setIsCreateModalOpen(false);
      resetModalState();
      openDeck(newDeck);
      usage.refetch();
    } catch (err: any) {
      console.error("Flashcards generation failed:", err);
      setLimitError(err?.message || 'Failed to generate flashcards.');
      usage.refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = () => {
    if (!newDeckTitle.trim()) {
      alert("Please enter a deck title.");
      return;
    }
    const validCards = manualCards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      alert("Please add at least one complete flashcard (front & back).");
      return;
    }

    const newDeck: Deck = {
      id: Date.now().toString(),
      title: newDeckTitle,
      cards: validCards.map((c, i) => ({ id: `${Date.now()}-${i}`, front: c.front, back: c.back })),
      createdAt: Date.now(),
    };

    if (user?.id) {
      validCards.forEach((c) => {
        dbService.saveFlashcard(user.id, {
          deck_title: newDeckTitle,
          front: c.front,
          back: c.back,
        });
      });
    }

    const updatedDecks = [newDeck, ...decks];
    saveDecks(updatedDecks);
    setIsCreateModalOpen(false);
    resetModalState();
    openDeck(newDeck);
  };

  const resetModalState = () => {
    setNewDeckTitle('');
    setAiTopicOrNotes('');
    setAttachedFile(null);
    setManualCards([{ front: '', back: '' }]);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col h-full overflow-hidden">
      
      {!activeDeck ? (
        // Deck Selection View
        <>
          <div className="mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight flex items-center gap-2">
                  <BookMarked className="w-6 h-6 text-purple-400" /> Flashcard Generator & Decks
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  usage.remaining === 0 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : usage.remaining === 1 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {usage.remaining} / {usage.limit} uses remaining (24h)
                </span>
              </div>
              <p className="text-secondary-text text-[14px] mt-1">Generate active recall flashcards automatically or create custom study decks.</p>
            </div>
            <button 
              onClick={() => {
                if (usage.isExhausted) {
                  setLimitError(`Daily limit reached (${usage.limit}/${usage.limit} uses). Resets in ${usage.resetInFormatted || '24 hours'}.`);
                  return;
                }
                setLimitError(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-primary hover:from-purple-500 hover:to-primary/90 text-primary-text rounded-xl font-semibold transition-all text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Deck
            </button>
          </div>

          {limitError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center gap-3">
              <Clock className="w-5 h-5 text-red-400 shrink-0" />
              <span>{limitError}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
            {decks.length === 0 ? (
              <div className="text-center py-16 border border-divider rounded-[24px] bg-white/[0.01]">
                <BookMarked className="w-12 h-12 text-primary-text/10 mx-auto mb-3" />
                <p className="text-secondary-text font-medium text-sm">No flashcard decks created yet. Click "Create Deck" above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {decks.map(deck => (
                  <div 
                    key={deck.id}
                    onClick={() => openDeck(deck)}
                    className="p-5 rounded-[24px] border border-divider bg-surface hover:border-purple-500/40 hover:bg-card-hover transition-all cursor-pointer group shadow-lg flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                          <BookMarked className="w-5 h-5" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDeck(deck.id);
                          }}
                          className="text-secondary-text hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-primary-text mb-1 line-clamp-1">{deck.title}</h3>
                      <p className="text-secondary-text text-xs">{deck.cards.length} flashcards</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-divider/50 text-xs font-semibold text-purple-400">
                      <span>Start Study Session</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Flashcard Study View
        <div className="flex-1 flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full relative pb-12">
          
          <div className="w-full flex items-center justify-between mb-4 shrink-0">
            <button 
              onClick={() => setActiveDeck(null)}
              className="text-secondary-text hover:text-primary-text flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm bg-surface px-3 py-1.5 rounded-xl border border-divider"
            >
              <ChevronLeft className="w-4 h-4" /> Decks List
            </button>
            <h3 className="text-primary-text font-bold text-base sm:text-lg truncate max-w-[200px] sm:max-w-xs">{activeDeck.title}</h3>
            <span className="text-purple-400 text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              {currentIndex + 1} / {activeDeck.cards.length}
            </span>
          </div>

          {/* Flashcard 3D Container */}
          <div className="w-full aspect-[3/2] sm:aspect-[2/1] perspective-1000 my-4">
            <motion.div 
              className="w-full h-full relative preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden bg-surface border-2 border-divider rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-6 sm:p-10 text-center group hover:border-purple-500/40 transition-colors">
                <span className="absolute top-5 left-6 text-[11px] font-bold text-secondary-text uppercase tracking-widest">Question</span>
                <p className="text-xl sm:text-2xl text-primary-text font-medium leading-relaxed">
                  {activeDeck.cards[currentIndex]?.front}
                </p>
                <div className="absolute bottom-5 text-primary-text/40 text-xs font-medium uppercase tracking-widest flex items-center gap-1.5 group-hover:text-purple-400 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Tap to reveal answer
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-950/60 to-surface border-2 border-purple-500/40 rounded-[32px] shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col items-center justify-center p-6 sm:p-10 text-center [transform:rotateY(180deg)]">
                <span className="absolute top-5 left-6 text-[11px] font-bold text-purple-400 uppercase tracking-widest">Answer</span>
                <p className="text-xl sm:text-2xl text-primary-text font-bold leading-relaxed">
                  {activeDeck.cards[currentIndex]?.back}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Self-Rating Confidence Buttons */}
          <div className="w-full flex items-center justify-center gap-3 my-3">
            <button 
              onClick={() => markCardRating('hard')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-all"
            >
              😓 Hard
            </button>
            <button 
              onClick={() => markCardRating('medium')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold text-xs transition-all"
            >
              🤔 Medium
            </button>
            <button 
              onClick={() => markCardRating('easy')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all"
            >
              🎉 Easy
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-surface border border-divider text-primary-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card-hover transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextCard}
              disabled={currentIndex === activeDeck.cards.length - 1}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-surface border border-divider text-primary-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card-hover transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-surface border border-divider rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between border-b border-divider pb-4 mb-5">
                <h3 className="text-lg font-bold text-primary-text flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Create New Flashcard Deck
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-secondary-text hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-background p-1 border border-divider mb-5">
                <button
                  onClick={() => setCreateMode('ai')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    createMode === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Generator
                </button>
                <button
                  onClick={() => setCreateMode('manual')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    createMode === 'manual' ? 'bg-purple-600 text-white shadow-sm' : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Manual Cards
                </button>
              </div>

              {/* Deck Title Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Deck Title</label>
                <input 
                  type="text" 
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry Reactions"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider outline-none text-primary-text text-sm focus:border-purple-500"
                />
              </div>

              {createMode === 'ai' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Study Topic or Notes</label>
                    <textarea 
                      value={aiTopicOrNotes}
                      onChange={(e) => setAiTopicOrNotes(e.target.value)}
                      placeholder="Paste your lecture notes or enter a topic (e.g. Photosynthesis phases)..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-divider outline-none text-primary-text text-sm focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Attach File (Optional PDF/DOCX)</label>
                    <input 
                      type="file" 
                      onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.docx,.txt"
                      className="w-full text-xs text-secondary-text file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">Number of Cards ({cardCount})</label>
                    <input 
                      type="range" 
                      min={3} 
                      max={15} 
                      value={cardCount}
                      onChange={(e) => setCardCount(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-primary hover:from-purple-500 hover:to-primary/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    <span>{isGenerating ? 'Generating Cards...' : 'Generate Flashcards'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                    {manualCards.map((card, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-background border border-divider space-y-2">
                        <input 
                          type="text"
                          value={card.front}
                          onChange={(e) => {
                            const updated = [...manualCards];
                            updated[idx].front = e.target.value;
                            setManualCards(updated);
                          }}
                          placeholder={`Front (Question ${idx + 1})`}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-divider text-xs text-primary-text outline-none"
                        />
                        <input 
                          type="text"
                          value={card.back}
                          onChange={(e) => {
                            const updated = [...manualCards];
                            updated[idx].back = e.target.value;
                            setManualCards(updated);
                          }}
                          placeholder={`Back (Answer ${idx + 1})`}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-divider text-xs text-primary-text outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setManualCards([...manualCards, { front: '', back: '' }])}
                    className="w-full py-2 rounded-xl bg-background border border-divider text-xs text-secondary-text hover:text-primary-text font-medium"
                  >
                    + Add Another Card
                  </button>

                  <button
                    onClick={handleManualSave}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
                  >
                    Save Flashcard Deck
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


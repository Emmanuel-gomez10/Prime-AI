import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Search, Edit3 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { dbService } from '../../../services/db/databaseService';

interface Note {
  id: string;
  title: string;
  lastEdited: string;
  content: {
    heading: string;
    body: string[];
  }[];
}

export const NotesView = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      if (user?.id) {
        const dbNotes = await dbService.fetchNotes(user.id);
        if (dbNotes && dbNotes.length > 0) {
          const formatted: Note[] = dbNotes.map((n) => {
            let parsedContent = [];
            try {
              parsedContent = typeof n.content === 'string' ? JSON.parse(n.content) : n.content;
              if (!Array.isArray(parsedContent)) {
                parsedContent = [{ heading: 'Content', body: [n.content] }];
              }
            } catch {
              parsedContent = [{ heading: 'Content', body: [n.content] }];
            }

            return {
              id: n.id,
              title: n.title,
              lastEdited: new Date(n.updated_at || n.created_at).toLocaleDateString(),
              content: parsedContent,
            };
          });

          setNotes(formatted);
          if (formatted.length > 0) setActiveNote(formatted[0]);
          return;
        }
      }

      const saved = localStorage.getItem('prime_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) setActiveNote(parsed[0]);
      } else {
        const mockNotes: Note[] = [
          {
            id: '1',
            title: 'Cellular Biology: Mitochondria',
            lastEdited: 'Today, 2:30 PM',
            content: [
              {
                heading: 'Overview',
                body: ['Mitochondria are membrane-bound cell organelles (mitochondrion, singular) that generate most of the chemical energy needed to power the cell\'s biochemical reactions.']
              },
              {
                heading: 'Structure',
                body: [
                  'Outer Membrane: Contains porins, making it relatively permeable.',
                  'Inner Membrane: Highly folded into cristae to increase surface area.',
                  'Matrix: The central space containing enzymes, mitochondrial DNA, and ribosomes.'
                ]
              },
              {
                heading: 'Key Functions',
                body: [
                  'ATP Production (Oxidative Phosphorylation)',
                  'Regulation of cellular metabolism',
                  'Apoptosis (programmed cell death)'
                ]
              }
            ]
          },
          {
            id: '2',
            title: 'Introduction to Quantum Mechanics',
            lastEdited: 'Yesterday, 11:15 AM',
            content: [
              {
                heading: 'Core Concepts',
                body: ['Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.']
              },
              {
                heading: 'Wave-Particle Duality',
                body: ['Every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts "particle" or "wave" to fully describe the behavior of quantum-scale objects.']
              }
            ]
          }
        ];
        setNotes(mockNotes);
        if (mockNotes.length > 0) setActiveNote(mockNotes[0]);
        localStorage.setItem('prime_notes', JSON.stringify(mockNotes));
      }
    };

    loadNotes();
  }, [user]);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* Sidebar: List of Notes */}
      <div className="w-full md:w-80 shrink-0 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-hidden">
        <div className="p-5 border-b border-divider">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-text tracking-tight">My Notes</h2>
            <button className="w-8 h-8 rounded-full bg-card-hover hover:bg-card-hover text-primary-text flex items-center justify-center transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="w-full bg-card-hover border border-divider rounded-xl py-2 pl-9 pr-4 text-sm text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                activeNote?.id === note.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-card-hover border border-transparent'
              }`}
            >
              <h3 className={`font-semibold mb-1 truncate ${activeNote?.id === note.id ? 'text-primary' : 'text-primary-text'}`}>
                {note.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-secondary-text font-medium">
                <FileText className="w-3 h-3" />
                {note.lastEdited}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Note Viewer */}
      <div className="flex-1 flex flex-col h-full bg-surface rounded-[24px] border border-divider overflow-hidden relative">
        {activeNote ? (
          <>
            <div className="shrink-0 p-6 md:p-8 border-b border-divider flex items-start justify-between bg-surface/95 backdrop-blur-xl sticky top-0 z-10">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-text mb-2">{activeNote.title}</h1>
                <p className="text-secondary-text text-sm font-medium">Last edited {activeNote.lastEdited}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-lg bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-lg bg-card-hover hover:bg-card-hover text-secondary-text hover:text-primary-text transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-10 text-primary-text">
              <div className="max-w-3xl space-y-10">
                {activeNote.content.map((section, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <h2 className="text-xl font-bold text-primary-text mb-4 flex items-center gap-3">
                      <div className="w-2 h-6 rounded-full bg-primary" />
                      {section.heading}
                    </h2>
                    <ul className="space-y-3 pl-5">
                      {section.body.map((para, pIdx) => (
                        <li key={pIdx} className="leading-relaxed text-[15px] relative">
                          <span className="absolute -left-5 top-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />
                          {para}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-card-hover flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary-text/20" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-2">No note selected</h3>
            <p className="text-secondary-text">Select a note from the sidebar to start reviewing.</p>
          </div>
        )}
      </div>

    </div>
  );
};
